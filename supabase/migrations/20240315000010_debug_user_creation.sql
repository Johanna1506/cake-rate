-- Supprimer l'ancienne version de la fonction
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;

-- Créer la fonction mise à jour avec des logs
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
    user_role_value user_role;
BEGIN
    -- Log des métadonnées reçues
    RAISE NOTICE 'New user created with ID: %', NEW.id;
    RAISE NOTICE 'Raw user meta data: %', NEW.raw_user_meta_data;
    
    -- Vérifier si l'utilisateur existe déjà dans la table users
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        -- Déterminer le nom de l'utilisateur
        user_name := COALESCE(
            NEW.raw_user_meta_data->>'name',
            (NEW.raw_user_meta_data->>'data'::jsonb)->>'name',
            NEW.email
        );
        
        -- Déterminer le rôle
        IF NEW.email LIKE '%@admin.com' THEN
            user_role_value := 'ADMIN'::user_role;
        ELSE
            user_role_value := 'USER'::user_role;
        END IF;
        
        RAISE NOTICE 'Inserting user with name: %, role: %', user_name, user_role_value;
        
        -- Insérer le nouvel utilisateur avec le rôle par défaut
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
                user_name,
                user_role_value,
                NOW()
            );
            
            RAISE NOTICE 'User successfully inserted';
        EXCEPTION WHEN OTHERS THEN
            RAISE EXCEPTION 'Error inserting user: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'User already exists in public.users table';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user(); 