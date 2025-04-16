-- Désactiver temporairement RLS pour la table users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Admins can update any user" ON users;

-- Recréer les politiques de base
CREATE POLICY "Enable read access for all users"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users only"
    ON users FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for users based on id"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Réactiver RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Mettre à jour la fonction handle_new_auth_user
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;

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
        NEW.email,
        'USER'::user_role,
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user(); 