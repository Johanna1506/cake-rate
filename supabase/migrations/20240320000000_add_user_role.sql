-- Create user role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column to users table if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.users
    ADD COLUMN role public.user_role DEFAULT 'USER';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Update weeks policy to use role instead of email
DROP POLICY IF EXISTS "Only admins can create/update weeks" ON public.weeks;
CREATE POLICY "Only admins can create/update weeks"
    ON public.weeks FOR ALL
    USING (auth.uid() IN (
        SELECT id FROM public.users WHERE role = 'ADMIN'
    ));