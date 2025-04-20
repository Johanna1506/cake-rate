-- Add description column to weeks table if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.weeks
    ADD COLUMN description TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;