-- Add type column to bills
ALTER TABLE bills ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'proposition' CHECK (type IN ('projet_de_loi', 'proposition_de_loi'));

-- Co-signataires table
CREATE TABLE IF NOT EXISTS bill_cosignataires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  signed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(bill_id, user_id)
);

-- RLS
ALTER TABLE bill_cosignataires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read cosignataires" ON bill_cosignataires FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can cosign" ON bill_cosignataires FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own cosign" ON bill_cosignataires FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Allow eligible roles to insert bills
CREATE POLICY "Eligible roles can submit bills" ON bills FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('president_groupe', 'ministre', 'president_seance', 'parlementaire')
  )
);

-- Authors can update their own bills when still deposee
CREATE POLICY "Authors can update own deposee bills" ON bills FOR UPDATE TO authenticated
USING (author_id = auth.uid() AND status = 'deposee')
WITH CHECK (author_id = auth.uid());
