-- Ajouter le champ show_scores à la table weeks
ALTER TABLE weeks
ADD COLUMN IF NOT EXISTS show_scores BOOLEAN DEFAULT false;

-- Mettre à jour les semaines existantes pour qu'elles n'affichent pas les scores par défaut
UPDATE weeks
SET show_scores = false
WHERE show_scores IS NULL;