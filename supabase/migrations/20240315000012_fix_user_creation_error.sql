-- Supprimer l'ancienne version de la fonction
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;

-- S'assurer que le type user_role existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
    END IF;
END $$;

-- S'assurer que la table users a les bonnes colonnes
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'USER';

-- Créer la fonction simplifiée avec logs
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_error_message TEXT;
BEGIN
    BEGIN
        -- Insérer directement le nouvel utilisateur
        INSERT INTO public.users (
            id,
            email,
            name,
            role,
            created_at
        )
        VALUES (
            NEW.id,
            NEW.email,
            NEW.email,
            'USER'::user_role,
            NOW()
        );
        
        RAISE NOTICE 'User successfully created: %', NEW.email;
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
        RAISE EXCEPTION 'Error in handle_new_auth_user: %', v_error_message;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Ajouter une politique pour permettre l'insertion
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile"
    ON users FOR INSERT
    WITH CHECK (true); 