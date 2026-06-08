ALTER TABLE vote_sessions ADD COLUMN IF NOT EXISTS type_scrutin TEXT DEFAULT 'public';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
CREATE TABLE IF NOT EXISTS messages_groupe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  groupe_id UUID REFERENCES political_groups(id) ON DELETE CASCADE,
  auteur_id UUID REFERENCES profiles(id),
  contenu TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
