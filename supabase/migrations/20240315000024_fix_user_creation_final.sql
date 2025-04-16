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
DECLARE
    user_name text;
    meta_data jsonb;
BEGIN
    -- Vérifier et extraire les métadonnées
    meta_data := NEW.raw_user_meta_data;
    
    -- Extraire le nom avec plusieurs niveaux de fallback
    IF meta_data IS NOT NULL THEN
        IF meta_data->>'name' IS NOT NULL THEN
            user_name := meta_data->>'name';
        ELSIF meta_data->>'data' IS NOT NULL AND (meta_data->>'data')::jsonb->>'name' IS NOT NULL THEN
            user_name := (meta_data->>'data')::jsonb->>'name';
        ELSE
            user_name := NEW.email;
        END IF;
    ELSE
        user_name := NEW.email;
    END IF;

    -- Insérer le nouvel utilisateur
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
        user_name,
        CASE
            WHEN NEW.email LIKE '%@admin.com' THEN 'ADMIN'::user_role
            ELSE 'USER'::user_role
        END,
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_auth_user: %', SQLERRM;
        RAISE LOG 'User data: id=%, email=%, meta_data=%', NEW.id, NEW.email, NEW.raw_user_meta_data;
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Mettre à jour les politiques RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Politiques pour users
CREATE POLICY "Users can view all users"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON users FOR INSERT
    WITH CHECK (true); 