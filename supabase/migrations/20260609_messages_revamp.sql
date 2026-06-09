-- Allow all authenticated users to insert messages (not just presidents)
DROP POLICY IF EXISTS "insert_messages_groupe" ON messages_groupe;
CREATE POLICY "Membres peuvent envoyer" ON messages_groupe
  FOR INSERT TO authenticated
  WITH CHECK (
    auteur_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND group_id = groupe_id)
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'president_seance')
  );

-- Allow authors to delete their own messages
CREATE POLICY IF NOT EXISTS "Auteurs peuvent supprimer" ON messages_groupe
  FOR DELETE TO authenticated
  USING (auteur_id = auth.uid());

-- President de seance can read all group messages
DROP POLICY IF EXISTS "read_messages_groupe" ON messages_groupe;
CREATE POLICY "Read messages" ON messages_groupe
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (group_id = groupe_id OR role = 'president_seance'))
  );
