-- Drop existing objects
DROP TRIGGER IF EXISTS on_season_end ON public.seasons;
DROP FUNCTION IF EXISTS public.handle_season_end();
DROP FUNCTION IF EXISTS public.assign_season_winner(UUID);
DROP TABLE IF EXISTS public.user_achievements;

-- Add date_closed column to seasons table
ALTER TABLE public.seasons ADD COLUMN IF NOT EXISTS date_closed TIMESTAMP WITH TIME ZONE;

-- Fix weeks table structure
ALTER TABLE public.weeks DROP COLUMN IF EXISTS theme;
ALTER TABLE public.weeks ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE;
ALTER TABLE public.weeks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.weeks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Create user_achievements table
CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all achievements"
    ON public.user_achievements FOR SELECT
    USING (true);

CREATE POLICY "Only admins can create/update achievements"
    ON public.user_achievements FOR ALL
    USING (auth.uid() IN (
        SELECT id FROM public.users WHERE role = 'ADMIN'
    ));

-- Grant necessary permissions
GRANT SELECT ON public.user_achievements TO anon, authenticated;
GRANT SELECT ON public.users TO anon, authenticated;
GRANT SELECT ON public.seasons TO anon, authenticated;

-- Create indexes
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_type ON public.user_achievements(achievement_type);
CREATE INDEX idx_user_achievements_season_id ON public.user_achievements(season_id);

-- Create function to assign season winner
CREATE OR REPLACE FUNCTION public.assign_season_winner(season_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    winner_id UUID;
    best_taste_id UUID;
    best_appearance_id UUID;
    best_theme_id UUID;
BEGIN
    -- Calculate scores for each user in the season
    WITH user_scores AS (
        SELECT
            c.user_id,
            AVG((r.appearance + r.taste + r.theme_adherence) / 3.0) as avg_score,
            AVG(r.taste) as avg_taste,
            AVG(r.appearance) as avg_appearance,
            AVG(r.theme_adherence) as avg_theme,
            COUNT(DISTINCT c.id) as cake_count
        FROM public.cakes c
        JOIN public.ratings r ON c.id = r.cake_id
        JOIN public.weeks w ON c.week_id = w.id
        WHERE w.season_id = assign_season_winner.season_id
        GROUP BY c.user_id
        HAVING COUNT(DISTINCT c.id) >= 1  -- At least one cake submitted
    )
    SELECT
        user_id INTO winner_id
    FROM user_scores
    ORDER BY avg_score DESC, cake_count DESC
    LIMIT 1;

    -- Get best taste score
    WITH user_scores AS (
        SELECT
            c.user_id,
            AVG(r.taste) as avg_taste,
            COUNT(DISTINCT c.id) as cake_count
        FROM public.cakes c
        JOIN public.ratings r ON c.id = r.cake_id
        JOIN public.weeks w ON c.week_id = w.id
        WHERE w.season_id = assign_season_winner.season_id
        GROUP BY c.user_id
        HAVING COUNT(DISTINCT c.id) >= 1
    )
    SELECT user_id INTO best_taste_id
    FROM user_scores
    ORDER BY avg_taste DESC, cake_count DESC
    LIMIT 1;

    -- Get best appearance score
    WITH user_scores AS (
        SELECT
            c.user_id,
            AVG(r.appearance) as avg_appearance,
            COUNT(DISTINCT c.id) as cake_count
        FROM public.cakes c
        JOIN public.ratings r ON c.id = r.cake_id
        JOIN public.weeks w ON c.week_id = w.id
        WHERE w.season_id = assign_season_winner.season_id
        GROUP BY c.user_id
        HAVING COUNT(DISTINCT c.id) >= 1
    )
    SELECT user_id INTO best_appearance_id
    FROM user_scores
    ORDER BY avg_appearance DESC, cake_count DESC
    LIMIT 1;

    -- Get best theme score
    WITH user_scores AS (
        SELECT
            c.user_id,
            AVG(r.theme_adherence) as avg_theme,
            COUNT(DISTINCT c.id) as cake_count
        FROM public.cakes c
        JOIN public.ratings r ON c.id = r.cake_id
        JOIN public.weeks w ON c.week_id = w.id
        WHERE w.season_id = assign_season_winner.season_id
        GROUP BY c.user_id
        HAVING COUNT(DISTINCT c.id) >= 1
    )
    SELECT user_id INTO best_theme_id
    FROM user_scores
    ORDER BY avg_theme DESC, cake_count DESC
    LIMIT 1;

    -- Insert achievements if they don't already exist
    -- Season winner
    IF winner_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.user_achievements ua
        WHERE ua.user_id = winner_id
        AND ua.achievement_type = 'season_winner'
        AND ua.season_id = assign_season_winner.season_id
    ) THEN
        INSERT INTO public.user_achievements (user_id, achievement_type, season_id)
        VALUES (winner_id, 'season_winner', assign_season_winner.season_id);
    END IF;

    -- Best taste
    IF best_taste_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.user_achievements ua
        WHERE ua.user_id = best_taste_id
        AND ua.achievement_type = 'best_taste'
        AND ua.season_id = assign_season_winner.season_id
    ) THEN
        INSERT INTO public.user_achievements (user_id, achievement_type, season_id)
        VALUES (best_taste_id, 'best_taste', assign_season_winner.season_id);
    END IF;

    -- Best appearance
    IF best_appearance_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.user_achievements ua
        WHERE ua.user_id = best_appearance_id
        AND ua.achievement_type = 'best_appearance'
        AND ua.season_id = assign_season_winner.season_id
    ) THEN
        INSERT INTO public.user_achievements (user_id, achievement_type, season_id)
        VALUES (best_appearance_id, 'best_appearance', assign_season_winner.season_id);
    END IF;

    -- Best theme
    IF best_theme_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.user_achievements ua
        WHERE ua.user_id = best_theme_id
        AND ua.achievement_type = 'best_theme'
        AND ua.season_id = assign_season_winner.season_id
    ) THEN
        INSERT INTO public.user_achievements (user_id, achievement_type, season_id)
        VALUES (best_theme_id, 'best_theme', assign_season_winner.season_id);
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
        -- Update date_closed
        NEW.date_closed = timezone('utc'::text, now());
        -- Assign season winner
        PERFORM public.assign_season_winner(NEW.id);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_season_end
    BEFORE UPDATE ON public.seasons
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_season_end();