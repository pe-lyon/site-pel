-- Fix : la politique RLS d'insert sur bills était trop restrictive
-- (seulement president_seance). On autorise tout parlementaire authentifié
-- à déposer un texte dont il est l'auteur.

DROP POLICY IF EXISTS "Seul le président de séance peut créer des propositions" ON bills;

CREATE POLICY "Tout parlementaire peut déposer un texte"
  ON bills FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND current_user_role() IN ('parlementaire', 'president_groupe', 'ministre', 'president_seance')
  );
