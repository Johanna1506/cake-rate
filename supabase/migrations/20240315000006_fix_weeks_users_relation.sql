-- S'assurer que la colonne user_id existe
ALTER TABLE weeks
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Ajouter la contrainte de clé étrangère si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'weeks_user_id_fkey'
    ) THEN
        ALTER TABLE weeks
        ADD CONSTRAINT weeks_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- Mettre à jour les politiques RLS pour prendre en compte la relation
CREATE POLICY "Users can view weeks with their assigned user"
    ON weeks FOR SELECT
    USING (
        auth.uid() = user_id OR
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

-- Mettre à jour la politique existante pour les admins
DROP POLICY IF EXISTS "Only admins can create/update weeks" ON weeks;

CREATE POLICY "Only admins can create/update weeks"
    ON weeks FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    ); 