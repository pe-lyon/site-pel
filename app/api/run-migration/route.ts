/**
 * Route API one-shot pour appliquer la migration 20260609_bill_reform
 * Sécurisée : nécessite le SUPABASE_SERVICE_ROLE_KEY en header secret
 * Idempotente : utilise IF NOT EXISTS partout
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Chaque étape est une requête SQL indépendante
const MIGRATION_STEPS = [
  // 1. Colonnes bills
  `ALTER TABLE bills ADD COLUMN IF NOT EXISTS recevabilite text CHECK (recevabilite IN ('en_attente', 'recevable', 'irrecevable')) DEFAULT 'en_attente'`,
  `ALTER TABLE bills ADD COLUMN IF NOT EXISTS motif_irrecevabilite text`,
  `ALTER TABLE bills ADD COLUMN IF NOT EXISTS recevabilite_par uuid REFERENCES profiles(id)`,
  `ALTER TABLE bills ADD COLUMN IF NOT EXISTS recevabilite_le timestamptz`,
  `ALTER TABLE bills ADD COLUMN IF NOT EXISTS procedure_urgence boolean NOT NULL DEFAULT false`,
  `ALTER TABLE bills ADD COLUMN IF NOT EXISTS urgence_demandee_par uuid REFERENCES profiles(id)`,
  `ALTER TABLE bills ADD COLUMN IF NOT EXISTS urgence_le timestamptz`,
  `ALTER TABLE bills ADD COLUMN IF NOT EXISTS inscrit_odj_le timestamptz`,
  `ALTER TABLE bills ADD COLUMN IF NOT EXISTS debat_ouvert_le timestamptz`,
  `ALTER TABLE bills ADD COLUMN IF NOT EXISTS debat_clos_le timestamptz`,

  // 2. Mise à jour contrainte status bills
  `ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_status_check`,
  `ALTER TABLE bills ADD CONSTRAINT bills_status_check CHECK (status IN ('deposee','recevable','irrecevable','inscrit_ordre_du_jour','en_debat','soumis_au_vote','adoptee','rejetee','renvoyee','archivee'))`,

  // 3. Table amendements
  `CREATE TABLE IF NOT EXISTS amendements (
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
  )`,
  `ALTER TABLE amendements ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='amendements' AND policyname='Authentifiés peuvent lire les amendements') THEN
      CREATE POLICY "Authentifiés peuvent lire les amendements" ON amendements FOR SELECT TO authenticated USING (true);
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='amendements' AND policyname='Parlementaires peuvent soumettre un amendement') THEN
      CREATE POLICY "Parlementaires peuvent soumettre un amendement" ON amendements FOR INSERT TO authenticated WITH CHECK (auteur_id = auth.uid());
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='amendements' AND policyname='Président séance peut mettre à jour') THEN
      CREATE POLICY "Président séance peut mettre à jour" ON amendements FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'president_seance'));
    END IF;
  END $$`,

  // 4. Table liste_orateurs
  `CREATE TABLE IF NOT EXISTS liste_orateurs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id uuid NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    orateur_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    position integer NOT NULL DEFAULT 0,
    a_parle boolean NOT NULL DEFAULT false,
    duree_secondes integer,
    inscrit_le timestamptz NOT NULL DEFAULT now(),
    UNIQUE(bill_id, orateur_id)
  )`,
  `ALTER TABLE liste_orateurs ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='liste_orateurs' AND policyname='Authentifiés peuvent lire la liste') THEN
      CREATE POLICY "Authentifiés peuvent lire la liste" ON liste_orateurs FOR SELECT TO authenticated USING (true);
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='liste_orateurs' AND policyname='Parlementaires peuvent s''inscrire') THEN
      CREATE POLICY "Parlementaires peuvent s'inscrire" ON liste_orateurs FOR INSERT TO authenticated WITH CHECK (orateur_id = auth.uid());
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='liste_orateurs' AND policyname='Président séance peut gérer orateurs') THEN
      CREATE POLICY "Président séance peut gérer orateurs" ON liste_orateurs FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'president_seance'));
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='liste_orateurs' AND policyname='Parlementaires peuvent se désinscrire') THEN
      CREATE POLICY "Parlementaires peuvent se désinscrire" ON liste_orateurs FOR DELETE TO authenticated USING (orateur_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'president_seance'));
    END IF;
  END $$`,

  // 5. Table motions_procedure
  `CREATE TABLE IF NOT EXISTS motions_procedure (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id uuid NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    auteur_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('renvoi','cloture_debats','suspension_seance','rappel_reglement')),
    motif text,
    statut text NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente','acceptee','refusee')),
    traite_par uuid REFERENCES profiles(id),
    traite_le timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `ALTER TABLE motions_procedure ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='motions_procedure' AND policyname='Authentifiés peuvent lire motions') THEN
      CREATE POLICY "Authentifiés peuvent lire motions" ON motions_procedure FOR SELECT TO authenticated USING (true);
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='motions_procedure' AND policyname='Parlementaires peuvent soumettre une motion') THEN
      CREATE POLICY "Parlementaires peuvent soumettre une motion" ON motions_procedure FOR INSERT TO authenticated WITH CHECK (auteur_id = auth.uid());
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='motions_procedure' AND policyname='Président séance peut traiter motions') THEN
      CREATE POLICY "Président séance peut traiter motions" ON motions_procedure FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'president_seance'));
    END IF;
  END $$`,

  // 6. Index
  `CREATE INDEX IF NOT EXISTS idx_amendements_bill ON amendements(bill_id)`,
  `CREATE INDEX IF NOT EXISTS idx_orateurs_bill ON liste_orateurs(bill_id)`,
  `CREATE INDEX IF NOT EXISTS idx_motions_bill ON motions_procedure(bill_id)`,
  `CREATE INDEX IF NOT EXISTS idx_bills_recevabilite ON bills(recevabilite)`,
  `CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status)`,
]

export async function GET(request: Request) {
  // Sécurité : vérifier le secret en query param
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(-16)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const results: { step: number; sql: string; ok: boolean; error?: string }[] = []

  for (let i = 0; i < MIGRATION_STEPS.length; i++) {
    const sql = MIGRATION_STEPS[i].trim()
    try {
      const { error } = await adminClient.rpc('exec_migration_sql', { sql_query: sql })
      if (error) {
        // Essayer autrement — certaines erreurs sont attendues (already exists)
        results.push({ step: i + 1, sql: sql.slice(0, 80), ok: false, error: error.message })
      } else {
        results.push({ step: i + 1, sql: sql.slice(0, 80), ok: true })
      }
    } catch (err: any) {
      results.push({ step: i + 1, sql: sql.slice(0, 80), ok: false, error: err.message })
    }
  }

  const failed = results.filter(r => !r.ok)
  return NextResponse.json({
    total: results.length,
    success: results.filter(r => r.ok).length,
    failed: failed.length,
    results,
  })
}
