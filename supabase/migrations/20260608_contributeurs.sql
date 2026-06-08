-- Nouveaux rôles contributeurs dans le check constraint
-- (si la table profiles a un CHECK sur role, le mettre à jour)
-- Sinon, les nouveaux rôles sont juste des valeurs texte

-- Statut "en_attente_validation" pour actualites et evenements
ALTER TABLE actualites ADD COLUMN IF NOT EXISTS soumis_par UUID REFERENCES profiles(id);
ALTER TABLE actualites ADD COLUMN IF NOT EXISTS valide_par UUID REFERENCES profiles(id);
ALTER TABLE actualites ADD COLUMN IF NOT EXISTS commentaire_admin TEXT;
-- Ajouter 'en_attente_validation' et 'refuse' aux statuts possibles (si enum)
-- Pour une colonne TEXT, rien à faire

ALTER TABLE evenements ADD COLUMN IF NOT EXISTS soumis_par UUID REFERENCES profiles(id);
ALTER TABLE evenements ADD COLUMN IF NOT EXISTS valide_par UUID REFERENCES profiles(id);
ALTER TABLE evenements ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'publie';
ALTER TABLE evenements ADD COLUMN IF NOT EXISTS commentaire_admin TEXT;

-- Politique RLS : les contributeurs peuvent insérer leurs propres contenus
-- (à adapter selon la config RLS existante)
