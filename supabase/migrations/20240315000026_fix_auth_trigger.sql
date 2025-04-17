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

-- Créer la fonction avec gestion d'erreur améliorée
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    user_name text;
BEGIN
    -- Extraire le nom de l'utilisateur
    user_name := COALESCE(
        (NEW.raw_user_meta_data->>'data')::jsonb->>'name',
        NEW.raw_user_meta_data->>'name',
        NEW.email
    );

    -- Vérifier si l'utilisateur existe déjà
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
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
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur
        RAISE LOG 'Error in handle_new_auth_user: %', SQLERRM;
        RAISE LOG 'User data: id=%, email=%, meta_data=%', NEW.id, NEW.email, NEW.raw_user_meta_data;
        -- Retourner NEW pour permettre la création de l'utilisateur auth même si la création dans users échoue
        RETURN NEW;
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

-- Recréer les politiques
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