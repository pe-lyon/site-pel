-- ============================================================
-- PARLEMENT DES ÉTUDIANTS DE LYON — Schéma Supabase complet
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE : political_groups (groupes politiques)
-- ============================================================
CREATE TABLE IF NOT EXISTS political_groups (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  color       TEXT NOT NULL DEFAULT '#3B82F6',
  logo_url    TEXT,
  president_id UUID, -- sera mis à jour après la création des profils
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE : profiles (étend auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT NOT NULL,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  birth_date  DATE,
  role        TEXT NOT NULL DEFAULT 'parlementaire'
                CHECK (role IN ('president_seance', 'president_groupe', 'parlementaire', 'ministre')),
  group_id    UUID REFERENCES political_groups(id) ON DELETE SET NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- FK différée : president_id sur political_groups
ALTER TABLE political_groups
  ADD CONSTRAINT fk_group_president
  FOREIGN KEY (president_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- ============================================================
-- TABLE : bills (propositions de loi)
-- ============================================================
CREATE TABLE IF NOT EXISTS bills (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number      TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  description TEXT,
  full_text   TEXT,
  author_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status      TEXT NOT NULL DEFAULT 'deposee'
                CHECK (status IN ('deposee','en_discussion','soumise_au_vote','adoptee','rejetee','archivee')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE : vote_sessions (scrutins)
-- ============================================================
CREATE TABLE IF NOT EXISTS vote_sessions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id          UUID REFERENCES bills(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  opened_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  opened_at        TIMESTAMPTZ DEFAULT NOW(),
  closed_at        TIMESTAMPTZ,
  duration_minutes INT,
  status           TEXT NOT NULL DEFAULT 'ouvert'
                     CHECK (status IN ('ouvert','ferme')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE : votes
-- ============================================================
CREATE TABLE IF NOT EXISTS votes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  UUID REFERENCES vote_sessions(id) ON DELETE CASCADE NOT NULL,
  voter_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vote_value  TEXT NOT NULL CHECK (vote_value IN ('pour','contre','abstention')),
  is_proxy    BOOLEAN DEFAULT FALSE,
  proxy_for   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, voter_id)
);

-- ============================================================
-- TABLE : proxies (procurations)
-- ============================================================
CREATE TABLE IF NOT EXISTS proxies (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  absent_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  holder_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(absent_id),
  UNIQUE(holder_id),
  CHECK (absent_id != holder_id)
);

-- ============================================================
-- TABLE : audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   TEXT,
  details     JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS : updated_at automatique
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_groups_updated_at
  BEFORE UPDATE ON political_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_bills_updated_at
  BEFORE UPDATE ON bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER : créer un profil automatiquement à l'inscription
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Nouveau'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Parlementaire'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'parlementaire')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- INDEXES pour les performances
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_group    ON profiles(group_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role     ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_bills_status      ON bills(status);
CREATE INDEX IF NOT EXISTS idx_votes_session     ON votes(session_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter       ON votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor       ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_created     ON audit_logs(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE political_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills             ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE proxies           ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs        ENABLE ROW LEVEL SECURITY;

-- Helper : rôle de l'utilisateur connecté
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ---- PROFILES ----
CREATE POLICY "Tout utilisateur authentifié peut lire les profils"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Chacun peut modifier son propre profil"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Le président de séance peut créer des profils"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (current_user_role() = 'president_seance');

CREATE POLICY "Le président de séance peut supprimer des profils"
  ON profiles FOR DELETE TO authenticated
  USING (current_user_role() = 'president_seance');

-- ---- POLITICAL GROUPS ----
CREATE POLICY "Tout le monde peut lire les groupes"
  ON political_groups FOR SELECT TO authenticated USING (true);

CREATE POLICY "Seul le président de séance peut créer des groupes"
  ON political_groups FOR INSERT TO authenticated
  WITH CHECK (current_user_role() = 'president_seance');

CREATE POLICY "Seul le président de séance peut modifier les groupes"
  ON political_groups FOR UPDATE TO authenticated
  USING (current_user_role() = 'president_seance');

CREATE POLICY "Seul le président de séance peut supprimer les groupes"
  ON political_groups FOR DELETE TO authenticated
  USING (current_user_role() = 'president_seance');

-- ---- BILLS ----
CREATE POLICY "Tout le monde peut lire les propositions"
  ON bills FOR SELECT TO authenticated USING (true);

CREATE POLICY "Seul le président de séance peut créer des propositions"
  ON bills FOR INSERT TO authenticated
  WITH CHECK (current_user_role() = 'president_seance');

CREATE POLICY "Seul le président de séance peut modifier des propositions"
  ON bills FOR UPDATE TO authenticated
  USING (current_user_role() = 'president_seance');

CREATE POLICY "Seul le président de séance peut supprimer des propositions"
  ON bills FOR DELETE TO authenticated
  USING (current_user_role() = 'president_seance');

-- ---- VOTE SESSIONS ----
CREATE POLICY "Tout le monde peut lire les scrutins"
  ON vote_sessions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Seul le président de séance peut gérer les scrutins"
  ON vote_sessions FOR INSERT TO authenticated
  WITH CHECK (current_user_role() = 'president_seance');

CREATE POLICY "Seul le président de séance peut modifier les scrutins"
  ON vote_sessions FOR UPDATE TO authenticated
  USING (current_user_role() = 'president_seance');

-- ---- VOTES ----
-- Les parlementaires peuvent voter (insérer leur propre vote)
CREATE POLICY "Un parlementaire peut voter"
  ON votes FOR INSERT TO authenticated
  WITH CHECK (voter_id = auth.uid());

-- Seul le président voit les votes détaillés
CREATE POLICY "Le président voit tous les votes"
  ON votes FOR SELECT TO authenticated
  USING (current_user_role() = 'president_seance');

-- Chaque parlementaire peut voir son propre vote
CREATE POLICY "Chacun peut voir son propre vote"
  ON votes FOR SELECT TO authenticated
  USING (voter_id = auth.uid());

-- ---- PROXIES ----
CREATE POLICY "Tout le monde peut lire les procurations"
  ON proxies FOR SELECT TO authenticated USING (true);

CREATE POLICY "Seul le président de séance peut gérer les procurations"
  ON proxies FOR INSERT TO authenticated
  WITH CHECK (current_user_role() = 'president_seance');

CREATE POLICY "Seul le président de séance peut modifier les procurations"
  ON proxies FOR UPDATE TO authenticated
  USING (current_user_role() = 'president_seance');

CREATE POLICY "Seul le président de séance peut supprimer les procurations"
  ON proxies FOR DELETE TO authenticated
  USING (current_user_role() = 'president_seance');

-- ---- AUDIT LOGS ----
CREATE POLICY "Seul le président de séance peut lire les logs"
  ON audit_logs FOR SELECT TO authenticated
  USING (current_user_role() = 'president_seance');

CREATE POLICY "Tout utilisateur peut insérer un log"
  ON audit_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- ============================================================
-- REALTIME : activer pour les tables dynamiques
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE political_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE vote_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE proxies;
ALTER PUBLICATION supabase_realtime ADD TABLE bills;
