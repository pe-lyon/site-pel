CREATE TABLE IF NOT EXISTS dissolution_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  groupe_id uuid NOT NULL REFERENCES political_groups(id) ON DELETE CASCADE,
  demandeur_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  motif text,
  statut text NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuvee', 'refusee')),
  traite_par uuid REFERENCES profiles(id),
  traite_le timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE dissolution_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Présidents peuvent soumettre" ON dissolution_requests
  FOR INSERT TO authenticated
  WITH CHECK (demandeur_id = auth.uid() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'president_groupe'
  ));

CREATE POLICY "Admins et président séance peuvent lire" ON dissolution_requests
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'president_seance')
  ) OR demandeur_id = auth.uid());

CREATE POLICY "Admins peuvent mettre à jour" ON dissolution_requests
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'president_seance')
  ));
