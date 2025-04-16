-- Supprimer l'ancienne version de la fonction
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;

-- Créer la fonction mise à jour
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si l'utilisateur existe déjà dans la table users
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        -- Insérer le nouvel utilisateur avec le rôle par défaut
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
                NEW.raw_user_meta_data->>'name',
                (NEW.raw_user_meta_data->>'data'::jsonb)->>'name',
                NEW.email
            ),
            CASE
                WHEN NEW.email LIKE '%@admin.com' THEN 'ADMIN'::user_role
                ELSE 'USER'::user_role
            END,
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user(); 