-- Paramètres du site
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membres du bureau
CREATE TABLE IF NOT EXISTS bureau_membres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  role TEXT NOT NULL,
  photo_url TEXT,
  email TEXT,
  linkedin_url TEXT,
  ordre INT DEFAULT 0,
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anciens présidents
CREATE TABLE IF NOT EXISTS anciens_presidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  annee_debut INT,
  annee_fin INT,
  ordre INT DEFAULT 0
);

-- Catégories d'actualités
CREATE TABLE IF NOT EXISTS actualites_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  couleur TEXT DEFAULT '#04439a'
);

-- Actualités
CREATE TABLE IF NOT EXISTS actualites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  categorie_id UUID REFERENCES actualites_categories(id),
  auteur TEXT,
  contenu JSONB,
  extrait TEXT,
  statut TEXT DEFAULT 'brouillon',
  publie_le TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agenda
CREATE TABLE IF NOT EXISTS evenements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL,
  date DATE NOT NULL,
  heure TIME,
  lieu TEXT,
  type TEXT DEFAULT 'evenement',
  description TEXT,
  lien_externe TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ressources / Documents
CREATE TABLE IF NOT EXISTS ressources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL,
  description TEXT,
  categorie TEXT DEFAULT 'textes-fondateurs',
  fichier_url TEXT NOT NULL,
  date_version DATE,
  ordre INT DEFAULT 0,
  public BOOLEAN DEFAULT TRUE
);

-- Timeline présentation
CREATE TABLE IF NOT EXISTS presentation_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  annee INT NOT NULL,
  texte TEXT NOT NULL,
  ordre INT DEFAULT 0
);

-- Chiffres clés accueil
CREATE TABLE IF NOT EXISTS chiffres_cles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  valeur TEXT NOT NULL,
  ordre INT DEFAULT 0
);

-- Ordre du jour séance
CREATE TABLE IF NOT EXISTS ordre_du_jour (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seance_id UUID REFERENCES seances(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  texte_complet TEXT,
  statut TEXT DEFAULT 'a_debattre',
  public BOOLEAN DEFAULT FALSE,
  ordre INT DEFAULT 0
);

-- Amendements
CREATE TABLE IF NOT EXISTS amendements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ordre_du_jour_id UUID REFERENCES ordre_du_jour(id) ON DELETE CASCADE,
  groupe_id UUID,
  auteur_id UUID,
  texte TEXT NOT NULL,
  statut TEXT DEFAULT 'soumis',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages internes groupe
CREATE TABLE IF NOT EXISTS messages_groupe (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  groupe_id UUID NOT NULL,
  auteur_id UUID NOT NULL,
  contenu TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Données de démo
INSERT INTO site_settings (key, value) VALUES
  ('nom_site', 'Parlement des Étudiants de Lyon'),
  ('description', 'Le Parlement des Étudiants de Lyon est une institution parlementaire étudiante indépendante.'),
  ('email_contact', 'communication.pelyon@gmail.com'),
  ('instagram', 'https://instagram.com/pel_lyon'),
  ('linkedin', 'https://linkedin.com/company/pel-lyon'),
  ('hero_titre', 'PARLEMENT DES ÉTUDIANTS DE LYON'),
  ('hero_sous_titre', 'L''institution parlementaire étudiante de référence à Lyon'),
  ('pel_bref_texte', 'Le Parlement des Étudiants de Lyon est une simulation parlementaire universitaire fondée sur les principes de la démocratie représentative. Il réunit des étudiants de toutes disciplines pour débattre, voter et légiférer sur des propositions de loi.')
ON CONFLICT (key) DO NOTHING;

INSERT INTO chiffres_cles (label, valeur, ordre) VALUES
  ('Parlementaires', '24', 0),
  ('Groupes politiques', '6', 1),
  ('Séances par mandat', '8', 2),
  ('Textes débattus', '15', 3)
ON CONFLICT DO NOTHING;

INSERT INTO actualites_categories (nom, slug, couleur) VALUES
  ('Séance plénière', 'seance-pleniere', '#04439a'),
  ('Vie du PEL', 'vie-du-pel', '#b21d0b'),
  ('Partenariats', 'partenariats', '#059669')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO bureau_membres (prenom, nom, role, ordre) VALUES
  ('Marie', 'Dupont', 'Présidente du Parlement', 0),
  ('Thomas', 'Martin', 'Vice-Président en charge des séances', 1),
  ('Léa', 'Bernard', 'Secrétaire Générale', 2)
ON CONFLICT DO NOTHING;

INSERT INTO evenements (titre, date, heure, lieu, type, description) VALUES
  ('Séance plénière — Printemps 2026', '2026-06-15', '14:00', 'Amphi Lacassagne, Université Lyon 3', 'seance', 'Séance plénière du second semestre 2026. Débat et vote sur 3 propositions de loi.'),
  ('Réunion des présidents de groupe', '2026-06-20', '18:00', 'Salle de réunion B201', 'reunion', 'Réunion de coordination des présidents de groupe en préparation de la prochaine séance.'),
  ('Cérémonie de remise des mandats', '2026-07-01', '17:00', 'Grand amphithéâtre', 'ceremonie', 'Remise des mandats aux nouveaux parlementaires élus pour le mandat 2026-2027.')
ON CONFLICT DO NOTHING;
