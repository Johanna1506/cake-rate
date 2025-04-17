-- First, check if the trigger exists
DO $check$
DECLARE
    trigger_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'on_auth_user_created'
    ) INTO trigger_exists;

    IF NOT trigger_exists THEN
        RAISE NOTICE 'Trigger does not exist, creating it...';

        -- Create the function
        CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
        RETURNS TRIGGER AS $func$
        BEGIN
            INSERT INTO public.users (
                id,
                email,
                name,
                role
            )
            VALUES (
                NEW.id,
                NEW.email,
                COALESCE(
                    (NEW.raw_user_meta_data->>'data')::jsonb->>'name',
                    NEW.raw_user_meta_data->>'name',
                    NEW.email
                ),
                'USER'::user_role
            );
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Create the trigger
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
    ELSE
        RAISE NOTICE 'Trigger already exists';
    END IF;
END;
$check$;