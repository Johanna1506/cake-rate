-- Forcer la mise à jour du schéma en supprimant et recréant les tables
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.cakes CASCADE;
DROP TABLE IF EXISTS public.weeks CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- S'assurer que le type user_role existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
    END IF;
END $$;

-- Recréer la table users avec toutes les colonnes nécessaires
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'USER',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recréer la table weeks avec la relation vers users
CREATE TABLE public.weeks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    theme TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recréer la table cakes avec les relations vers users et weeks
CREATE TABLE public.cakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    week_id UUID NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_id)
);

-- Recréer la table ratings avec les relations vers cakes et users
CREATE TABLE public.ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cake_id UUID NOT NULL REFERENCES public.cakes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    appearance INTEGER CHECK (appearance BETWEEN 1 AND 5),
    taste INTEGER CHECK (taste BETWEEN 1 AND 5),
    theme_adherence INTEGER CHECK (theme_adherence BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cake_id, user_id)
);

-- Recréer la fonction handle_new_auth_user
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        name,
        role,
        avatar_url,
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
        CASE
            WHEN NEW.email LIKE '%@admin.com' THEN 'ADMIN'::user_role
            ELSE 'USER'::user_role
        END,
        NULL,
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Recréer les politiques RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

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

-- Politiques pour weeks
CREATE POLICY "Users can view all weeks"
    ON weeks FOR SELECT
    USING (true);

CREATE POLICY "Only admins can create/update weeks"
    ON weeks FOR ALL
    USING (auth.uid() IN (
        SELECT id FROM users WHERE role = 'ADMIN'
    ));

-- Politiques pour cakes
CREATE POLICY "Users can view all cakes"
    ON cakes FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own cakes"
    ON cakes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cakes"
    ON cakes FOR UPDATE
    USING (auth.uid() = user_id);

-- Politiques pour ratings
CREATE POLICY "Users can view all ratings"
    ON ratings FOR SELECT
    USING (true);

CREATE POLICY "Users can create ratings for others' cakes"
    ON ratings FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        auth.uid() != (SELECT user_id FROM cakes WHERE id = cake_id)
    );

CREATE POLICY "Users can update their own ratings"
    ON ratings FOR UPDATE
    USING (auth.uid() = user_id); 