-- Add user_id column to weeks table if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.weeks
    ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;