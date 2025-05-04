-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create weeks table
CREATE TABLE public.weeks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    theme TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    show_scores BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seasons table
CREATE TABLE public.seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    participant_count INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cakes table
CREATE TABLE public.cakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    week_id UUID REFERENCES public.weeks(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_id) -- Ensure one cake per user per week
);

-- Create ratings table
CREATE TABLE public.ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cake_id UUID REFERENCES public.cakes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    appearance INTEGER CHECK (appearance BETWEEN 1 AND 5),
    taste INTEGER CHECK (taste BETWEEN 1 AND 5),
    theme_adherence INTEGER CHECK (theme_adherence BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cake_id, user_id) -- Ensure one rating per user per cake
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Grant permissions to service_role
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.weeks TO service_role;
GRANT ALL ON public.seasons TO service_role;
GRANT ALL ON public.cakes TO service_role;
GRANT ALL ON public.ratings TO service_role;
GRANT ALL ON public.user_achievements TO service_role;

-- Users policies
CREATE POLICY "Users can view all users"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Weeks policies
CREATE POLICY "Users can view all weeks"
    ON public.weeks FOR SELECT
    USING (true);

CREATE POLICY "Only admins can create/update weeks"
    ON public.weeks FOR ALL
    USING (auth.uid() IN (
        SELECT id FROM public.users WHERE role = 'ADMIN'
    ));

-- Seasons policies
CREATE POLICY "Users can view all seasons"
    ON public.seasons FOR SELECT
    USING (true);

CREATE POLICY "Only admins can create/update seasons"
    ON public.seasons FOR ALL
    USING (auth.uid() IN (
        SELECT id FROM public.users WHERE role = 'ADMIN'
    ));

-- Cakes policies
CREATE POLICY "Users can view all cakes"
    ON public.cakes FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own cakes"
    ON public.cakes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cakes"
    ON public.cakes FOR UPDATE
    USING (auth.uid() = user_id);

-- Ratings policies
CREATE POLICY "Users can view all ratings"
    ON public.ratings FOR SELECT
    USING (true);

CREATE POLICY "Users can create ratings for others' cakes"
    ON public.ratings FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        auth.uid() != (SELECT user_id FROM public.cakes WHERE id = cake_id)
    );

CREATE POLICY "Users can update their own ratings"
    ON public.ratings FOR UPDATE
    USING (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view all achievements"
    ON public.user_achievements FOR SELECT
    USING (true);

CREATE POLICY "Only admins can create/update achievements"
    ON public.user_achievements FOR ALL
    USING (auth.uid() IN (
        SELECT id FROM public.users WHERE role = 'ADMIN'
    ));

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
DECLARE
    user_name text;
BEGIN
    -- Extract user name from metadata
    user_name := COALESCE(
        (NEW.raw_user_meta_data->>'data')::jsonb->>'name',
        NEW.raw_user_meta_data->>'name',
        NEW.email
    );

    -- Check if user already exists
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        -- Insert the new user
        INSERT INTO public.users (
            id,
            email,
            name,
            created_at
        )
        VALUES (
            NEW.id,
            NEW.email,
            user_name,
            NOW()
        );
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error
        RAISE LOG 'Error in handle_new_auth_user: %', SQLERRM;
        RAISE LOG 'User data: id=%, email=%, meta_data=%', NEW.id, NEW.email, NEW.raw_user_meta_data;
        -- Return NEW to allow auth user creation even if users table insert fails
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to assign season winner
CREATE OR REPLACE FUNCTION public.assign_season_winner(season_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    winner_id UUID;
BEGIN
    -- Calculate average scores for each user in the season
    WITH user_scores AS (
        SELECT
            c.user_id,
            AVG((r.appearance + r.taste + r.theme_adherence) / 3.0) as avg_score,
            COUNT(DISTINCT c.id) as cake_count
        FROM public.cakes c
        JOIN public.ratings r ON c.id = r.cake_id
        JOIN public.weeks w ON c.week_id = w.id
        WHERE w.season_id = assign_season_winner.season_id
        GROUP BY c.user_id
        HAVING COUNT(DISTINCT c.id) >= 1  -- At least one cake submitted
    )
    SELECT user_id INTO winner_id
    FROM user_scores
    ORDER BY avg_score DESC, cake_count DESC
    LIMIT 1;

    -- If we found a winner and they don't already have the achievement
    IF winner_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.user_achievements
        WHERE user_id = winner_id
        AND achievement_type = 'season_winner'
        AND season_id = assign_season_winner.season_id
    ) THEN
        -- Insert the achievement
        INSERT INTO public.user_achievements (user_id, achievement_type, season_id)
        VALUES (winner_id, 'season_winner', assign_season_winner.season_id);
    END IF;
END;
$$;

-- Create trigger to automatically assign winner when season is marked as inactive
CREATE OR REPLACE FUNCTION public.handle_season_end()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF OLD.is_active = true AND NEW.is_active = false THEN
        PERFORM public.assign_season_winner(NEW.id);
    END IF;
    RETURN NEW;
END;
$$;

-- Create the triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

CREATE TRIGGER on_season_end
    AFTER UPDATE ON public.seasons
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_season_end();

SELECT * FROM public.users;
SELECT * FROM public.weeks;
SELECT * FROM public.cakes;
SELECT * FROM public.ratings;