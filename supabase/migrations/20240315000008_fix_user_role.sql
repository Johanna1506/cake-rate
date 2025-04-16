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

-- Mettre à jour les utilisateurs existants sans rôle
UPDATE users 
SET role = 'USER'::user_role 
WHERE role IS NULL;

-- Ajouter une contrainte pour s'assurer que role ne peut pas être NULL
ALTER TABLE users 
    ALTER COLUMN role SET NOT NULL; 