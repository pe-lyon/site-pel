-- =========================================================
-- RÉFORME DU SYSTÈME DE PROPOSITIONS DE LOI
-- Parlement des Étudiants de Lyon
-- =========================================================

-- 1. Mise à jour de la table bills
-- Nouveaux statuts : deposee → recevable → inscrit_ordre_du_jour → en_debat → soumis_au_vote → adopte/rejete/renvoyé
-- On élargit la contrainte CHECK en renommant les anciennes valeurs

ALTER TABLE bills
  ADD COLUMN IF NOT EXISTS recevabilite text CHECK (recevabilite IN ('en_attente', 'recevable', 'irrecevable')) DEFAULT 'en_attente',
  ADD COLUMN IF NOT EXISTS motif_irrecevabilite text,
  ADD COLUMN IF NOT EXISTS recevabilite_par uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS recevabilite_le timestamptz,
  ADD COLUMN IF NOT EXISTS procedure_urgence boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS urgence_demandee_par uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS urgence_le timestamptz,
  ADD COLUMN IF NOT EXISTS inscrit_odj_le timestamptz,
  ADD COLUMN IF NOT EXISTS debat_ouvert_le timestamptz,
  ADD COLUMN IF NOT EXISTS debat_clos_le timestamptz;

-- Mise à jour du type de la colonne status pour accepter les nouveaux statuts
-- On supprime l'ancienne contrainte et on en crée une nouvelle
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_status_check;
ALTER TABLE bills ADD CONSTRAINT bills_status_check
  CHECK (status IN ('deposee','recevable','irrecevable','inscrit_ordre_du_jour','en_debat','soumis_au_vote','adoptee','rejetee','renvoyee','archivee'));

-- 2. Table amendements
CREATE TABLE IF NOT EXISTS amendements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  auteur_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  numero text NOT NULL,
  titre text NOT NULL,
  texte text NOT NULL,
  article_vise text,
  statut text NOT NULL DEFAULT 'depose' CHECK (statut IN ('depose','recevable','irrecevable','adopte','rejete')),
  traite_par uuid REFERENCES profiles(id),
  traite_le timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE amendements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifiés peuvent lire les amendements" ON amendements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Parlementaires peuvent soumettre un amendement" ON amendements
  FOR INSERT TO authenticated
  WITH CHECK (auteur_id = auth.uid());

CREATE POLICY "Président séance peut mettre à jour" ON amendements
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'president_seance'
  ));

-- 3. Table liste_orateurs (par séance/débat sur un texte)
CREATE TABLE IF NOT EXISTS liste_orateurs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  orateur_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  a_parle boolean NOT NULL DEFAULT false,
  duree_secondes integer,
  inscrit_le timestamptz NOT NULL DEFAULT now(),
  UNIQUE(bill_id, orateur_id)
);

ALTER TABLE liste_orateurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifiés peuvent lire la liste" ON liste_orateurs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Parlementaires peuvent s'inscrire" ON liste_orateurs
  FOR INSERT TO authenticated
  WITH CHECK (orateur_id = auth.uid());

CREATE POLICY "Président séance peut gérer" ON liste_orateurs
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'president_seance'
  ));

CREATE POLICY "Parlementaires peuvent se désinscrire" ON liste_orateurs
  FOR DELETE TO authenticated
  USING (orateur_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'president_seance'
  ));

-- 4. Table temps_parole (suivi du temps par groupe)
CREATE TABLE IF NOT EXISTS temps_parole (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  groupe_id uuid NOT NULL REFERENCES political_groups(id) ON DELETE CASCADE,
  temps_utilise_secondes integer NOT NULL DEFAULT 0,
  temps_alloue_secondes integer NOT NULL DEFAULT 300,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(bill_id, groupe_id)
);

ALTER TABLE temps_parole ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifiés peuvent lire temps_parole" ON temps_parole
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Président séance peut gérer temps_parole" ON temps_parole
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'president_seance'
  ));

-- 5. Table motions_procedure
CREATE TABLE IF NOT EXISTS motions_procedure (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  auteur_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('renvoi','cloture_debats','suspension_seance','rappel_reglement')),
  motif text,
  statut text NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente','acceptee','refusee')),
  traite_par uuid REFERENCES profiles(id),
  traite_le timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE motions_procedure ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifiés peuvent lire motions" ON motions_procedure
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Parlementaires peuvent soumettre une motion" ON motions_procedure
  FOR INSERT TO authenticated
  WITH CHECK (auteur_id = auth.uid());

CREATE POLICY "Président séance peut traiter motions" ON motions_procedure
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'president_seance'
  ));

-- 6. Table seances (suspension + compte rendu)
CREATE TABLE IF NOT EXISTS seances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  ouverte_par uuid NOT NULL REFERENCES profiles(id),
  ouverte_le timestamptz NOT NULL DEFAULT now(),
  suspendue_le timestamptz,
  reprise_le timestamptz,
  close_le timestamptz,
  statut text NOT NULL DEFAULT 'ouverte' CHECK (statut IN ('ouverte','suspendue','close')),
  compte_rendu_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE seances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifiés peuvent lire séances" ON seances
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Président séance peut gérer séances" ON seances
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'president_seance'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'president_seance'
  ));

-- 7. Index utiles
CREATE INDEX IF NOT EXISTS idx_amendements_bill ON amendements(bill_id);
CREATE INDEX IF NOT EXISTS idx_orateurs_bill ON liste_orateurs(bill_id);
CREATE INDEX IF NOT EXISTS idx_motions_bill ON motions_procedure(bill_id);
CREATE INDEX IF NOT EXISTS idx_bills_recevabilite ON bills(recevabilite);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
