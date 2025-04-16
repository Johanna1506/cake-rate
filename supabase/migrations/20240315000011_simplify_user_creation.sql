-- Supprimer l'ancienne version de la fonction
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;

-- S'assurer que le type user_role existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
    END IF;
END $$;

-- S'assurer que la colonne role existe avec la bonne contrainte
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'USER';

-- Créer la fonction simplifiée
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
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
        NEW.email, -- Utiliser l'email comme nom par défaut
        'USER'::user_role, -- Toujours USER par défaut
        NOW()
    )
    ON CONFLICT (id) DO NOTHING; -- Ignorer si l'utilisateur existe déjà
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user(); 