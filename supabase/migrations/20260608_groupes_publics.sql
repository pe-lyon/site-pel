ALTER TABLE political_groups ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE political_groups ADD COLUMN IF NOT EXISTS ideologies text[] DEFAULT '{}';
ALTER TABLE political_groups ADD COLUMN IF NOT EXISTS presentation TEXT;
ALTER TABLE political_groups ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
