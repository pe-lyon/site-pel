-- ============================================================
-- DONNÉES DE DÉMONSTRATION — PEL
-- À exécuter APRÈS avoir créé les comptes dans Supabase Auth
-- et APRÈS avoir exécuté schema.sql
-- ============================================================

-- Groupes politiques de démonstration
INSERT INTO political_groups (name, color) VALUES
  ('Rassemblement Progressiste', '#2563EB'),
  ('Alliance Conservatrice', '#DC2626'),
  ('Mouvement Écologiste', '#16A34A'),
  ('Centre Démocrate', '#D97706'),
  ('Front Social', '#7C3AED')
ON CONFLICT (name) DO NOTHING;

-- NOTE : Les profils sont créés automatiquement via le trigger
-- lors de la création des comptes dans Supabase Auth.
-- Vous pouvez ensuite mettre à jour les rôles et groupes :

-- Exemple (remplacer les UUIDs par les vrais IDs après création des comptes) :
-- UPDATE profiles SET role = 'president_seance' WHERE email = 'president@pel-lyon.fr';
-- UPDATE profiles SET group_id = (SELECT id FROM political_groups WHERE name = 'Rassemblement Progressiste')
--   WHERE email = 'parlementaire1@pel-lyon.fr';

-- Propositions de loi de démonstration
INSERT INTO bills (number, title, description, status) VALUES
  ('PEL-2024-001', 'Réforme du règlement intérieur', 'Proposition visant à moderniser le règlement intérieur du Parlement des Étudiants de Lyon.', 'en_discussion'),
  ('PEL-2024-002', 'Budget prévisionnel 2025', 'Adoption du budget prévisionnel pour l''exercice 2025.', 'deposee'),
  ('PEL-2024-003', 'Création d''une commission culture', 'Proposition de création d''une commission permanente dédiée à la culture étudiante.', 'deposee'),
  ('PEL-2024-004', 'Plan de développement durable', 'Plan d''action pour réduire l''empreinte carbone des activités du PEL.', 'adoptee'),
  ('PEL-2024-005', 'Protocole de vote électronique', 'Adoption officielle de la plateforme de vote numérique.', 'soumise_au_vote')
ON CONFLICT (number) DO NOTHING;
