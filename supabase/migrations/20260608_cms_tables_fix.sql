-- ============================================================
-- TABLES CMS — PEL (version corrigée, à exécuter dans Supabase SQL Editor)
-- ============================================================

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

-- Actualités (categorie en texte libre, pas de FK)
CREATE TABLE IF NOT EXISTS actualites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  categorie TEXT,
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
  categorie TEXT DEFAULT 'Textes fondateurs',
  url TEXT,
  version TEXT,
  ordre INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
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

-- ============================================================
-- POLITIQUES RLS — autoriser lecture publique + écriture service role
-- ============================================================

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bureau_membres ENABLE ROW LEVEL SECURITY;
ALTER TABLE actualites ENABLE ROW LEVEL SECURITY;
ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ressources ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE chiffres_cles ENABLE ROW LEVEL SECURITY;
ALTER TABLE anciens_presidents ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour toutes ces tables
CREATE POLICY "lecture publique site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "lecture publique bureau_membres" ON bureau_membres FOR SELECT USING (true);
CREATE POLICY "lecture publique actualites" ON actualites FOR SELECT USING (true);
CREATE POLICY "lecture publique evenements" ON evenements FOR SELECT USING (true);
CREATE POLICY "lecture publique ressources" ON ressources FOR SELECT USING (true);
CREATE POLICY "lecture publique presentation_timeline" ON presentation_timeline FOR SELECT USING (true);
CREATE POLICY "lecture publique chiffres_cles" ON chiffres_cles FOR SELECT USING (true);
CREATE POLICY "lecture publique anciens_presidents" ON anciens_presidents FOR SELECT USING (true);

-- ============================================================
-- DONNÉES INITIALES
-- ============================================================

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
  ('Textes débattus', '15', 3);
