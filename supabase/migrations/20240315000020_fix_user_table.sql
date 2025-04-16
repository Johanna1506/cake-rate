-- Désactiver temporairement RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les anciennes versions de la fonction et du trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;

-- Supprimer la table users si elle existe
DROP TABLE IF EXISTS public.users CASCADE;

-- Recréer la table users avec une structure simplifiée
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la fonction simplifiée
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
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
        COALESCE(
            (NEW.raw_user_meta_data->>'data')::jsonb->>'name',
            NEW.raw_user_meta_data->>'name',
            NEW.email
        ),
        'USER',
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Réactiver RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Recréer les politiques RLS
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile"
    ON users FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view all users" ON users;
CREATE POLICY "Users can view all users"
    ON users FOR SELECT
    USING (true); 