-- Create enum type for user roles
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');

-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'USER';

-- Create admin users policy
CREATE POLICY "Admins can update any user"
    ON users FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM users WHERE role = 'ADMIN'
    ));

-- Create admin weeks policy (remplace l'ancienne politique basée sur les emails)
DROP POLICY IF EXISTS "Only admins can create/update weeks" ON weeks;

CREATE POLICY "Only admins can create/update weeks"
    ON weeks FOR ALL
    USING (auth.uid() IN (
        SELECT id FROM users WHERE role = 'ADMIN'
    ));

-- Create admin cakes policy
CREATE POLICY "Admins can manage all cakes"
    ON cakes FOR ALL
    USING (auth.uid() IN (
        SELECT id FROM users WHERE role = 'ADMIN'
    ));

-- Create admin ratings policy
CREATE POLICY "Admins can manage all ratings"
    ON ratings FOR ALL
    USING (auth.uid() IN (
        SELECT id FROM users WHERE role = 'ADMIN'
    ));

-- Update the existing function to include role
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        CASE
            WHEN NEW.email LIKE '%@admin.com' THEN 'ADMIN'::user_role
            ELSE 'USER'::user_role
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user(); 