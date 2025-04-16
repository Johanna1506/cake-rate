-- Ajouter la colonne avatar_url à la table users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Mettre à jour la fonction handle_new_auth_user pour inclure avatar_url
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;

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
        NULL, -- avatar_url par défaut
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user(); 