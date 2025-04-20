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

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

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

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

SELECT * FROM public.users;
SELECT * FROM public.weeks;
SELECT * FROM public.cakes;
SELECT * FROM public.ratings;