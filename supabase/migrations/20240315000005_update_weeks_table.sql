-- Ajouter les champs description et user_id à la table weeks
ALTER TABLE weeks
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

ALTER TABLE weeks
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Mettre à jour les contraintes de vérification pour s'assurer que le thème et la description ne sont pas vides
ALTER TABLE weeks
ADD CONSTRAINT theme_not_empty CHECK (theme <> '');

-- Créer une fonction pour vérifier qu'une semaine active n'a pas de chevauchement avec d'autres semaines actives
CREATE OR REPLACE FUNCTION check_active_weeks_overlap()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = TRUE THEN
        IF EXISTS (
            SELECT 1 FROM weeks
            WHERE id <> NEW.id
            AND is_active = TRUE
            AND (
                (NEW.start_date <= end_date AND NEW.end_date >= start_date)
            )
        ) THEN
            RAISE EXCEPTION 'Les semaines actives ne peuvent pas se chevaucher';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer un déclencheur pour vérifier le chevauchement lors de l'insertion ou de la mise à jour
DROP TRIGGER IF EXISTS check_active_weeks_overlap_trigger ON weeks;

CREATE TRIGGER check_active_weeks_overlap_trigger
BEFORE INSERT OR UPDATE ON weeks
FOR EACH ROW
EXECUTE FUNCTION check_active_weeks_overlap(); 