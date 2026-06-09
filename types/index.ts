export type UserRole = 'president_seance' | 'president_groupe' | 'parlementaire' | 'ministre'
export type BillStatus =
  | 'deposee'
  | 'recevable'
  | 'irrecevable'
  | 'inscrit_ordre_du_jour'
  | 'en_debat'
  | 'soumis_au_vote'
  | 'adoptee'
  | 'rejetee'
  | 'renvoyee'
  | 'archivee'
export type BillRecevabilite = 'en_attente' | 'recevable' | 'irrecevable'
export type AmendementStatut = 'depose' | 'recevable' | 'irrecevable' | 'adopte' | 'rejete'
export type MotionType = 'renvoi' | 'cloture_debats' | 'suspension_seance' | 'rappel_reglement'
export type VoteValue = 'pour' | 'contre' | 'abstention'
export type SessionStatus = 'ouvert' | 'ferme'

export interface PoliticalGroup {
  id: string
  name: string
  color: string
  logo_url: string | null
  president_id: string | null
  created_at: string
  updated_at: string
  profiles?: Profile[]
  president?: Profile
}

export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  birth_date: string | null
  role: UserRole
  group_id: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  political_groups?: PoliticalGroup
}

export interface Bill {
  id: string
  number: string
  title: string
  description: string | null
  full_text: string | null
  author_id: string | null
  status: BillStatus
  type?: 'projet_de_loi' | 'proposition_de_loi'
  recevabilite?: BillRecevabilite
  motif_irrecevabilite?: string | null
  recevabilite_par?: string | null
  recevabilite_le?: string | null
  procedure_urgence?: boolean
  urgence_demandee_par?: string | null
  urgence_le?: string | null
  inscrit_odj_le?: string | null
  debat_ouvert_le?: string | null
  debat_clos_le?: string | null
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Amendement {
  id: string
  bill_id: string
  auteur_id: string
  numero: string
  titre: string
  texte: string
  article_vise: string | null
  statut: AmendementStatut
  traite_par: string | null
  traite_le: string | null
  created_at: string
  profiles?: { first_name: string; last_name: string; role: string }
}

export interface Orateur {
  id: string
  bill_id: string
  orateur_id: string
  position: number
  a_parle: boolean
  duree_secondes: number | null
  inscrit_le: string
  profiles?: { first_name: string; last_name: string; role: string; group_id: string | null }
}

export interface MotionProcedure {
  id: string
  bill_id: string
  auteur_id: string
  type: MotionType
  motif: string | null
  statut: 'en_attente' | 'acceptee' | 'refusee'
  traite_par: string | null
  traite_le: string | null
  created_at: string
  profiles?: { first_name: string; last_name: string }
}

export interface VoteSession {
  id: string
  bill_id: string | null
  title: string
  opened_by: string | null
  opened_at: string
  closed_at: string | null
  duration_minutes: number | null
  status: SessionStatus
  created_at: string
  bills?: Bill
  profiles?: Profile
}

export interface Vote {
  id: string
  session_id: string
  voter_id: string
  vote_value: VoteValue
  is_proxy: boolean
  proxy_for: string | null
  created_at: string
  profiles?: Profile
  proxy_profile?: Profile
}

export interface Proxy {
  id: string
  absent_id: string
  holder_id: string
  created_at: string
  absent?: Profile
  holder?: Profile
}

export interface AuditLog {
  id: string
  actor_id: string | null
  action: string
  target_type: string | null
  target_id: string | null
  details: Record<string, unknown> | null
  created_at: string
  profiles?: Profile
}

export interface VoteResults {
  pour: number
  contre: number
  abstention: number
  total: number
  byGroup: Record<string, { name: string; color: string; pour: number; contre: number; abstention: number }>
}

export const ROLE_LABELS: Record<UserRole, string> = {
  president_seance: 'Président de séance',
  president_groupe: 'Président de groupe',
  parlementaire: 'Parlementaire',
  ministre: 'Ministre',
}

export const STATUS_LABELS: Record<BillStatus, string> = {
  deposee: 'Déposée',
  recevable: 'Recevable',
  irrecevable: 'Irrecevable',
  inscrit_ordre_du_jour: 'À l\'ordre du jour',
  en_debat: 'En débat',
  soumis_au_vote: 'Soumise au vote',
  adoptee: 'Adoptée',
  rejetee: 'Rejetée',
  renvoyee: 'Renvoyée',
  archivee: 'Archivée',
}

export const STATUS_COLORS: Record<BillStatus, string> = {
  deposee: 'bg-gray-100 text-gray-700',
  recevable: 'bg-blue-100 text-blue-700',
  irrecevable: 'bg-red-100 text-red-700',
  inscrit_ordre_du_jour: 'bg-indigo-100 text-indigo-700',
  en_debat: 'bg-amber-100 text-amber-700',
  soumis_au_vote: 'bg-yellow-100 text-yellow-700',
  adoptee: 'bg-green-100 text-green-700',
  rejetee: 'bg-red-100 text-red-600',
  renvoyee: 'bg-orange-100 text-orange-700',
  archivee: 'bg-gray-200 text-gray-600',
}

export const TYPE_LABELS: Record<string, string> = {
  projet_de_loi: 'Projet de loi',
  proposition_de_loi: 'Proposition de loi',
}

export const AMENDEMENT_STATUT_LABELS: Record<AmendementStatut, string> = {
  depose: 'Déposé',
  recevable: 'Recevable',
  irrecevable: 'Irrecevable',
  adopte: 'Adopté',
  rejete: 'Rejeté',
}

export const AMENDEMENT_STATUT_COLORS: Record<AmendementStatut, string> = {
  depose: 'bg-gray-100 text-gray-700',
  recevable: 'bg-blue-100 text-blue-700',
  irrecevable: 'bg-red-100 text-red-600',
  adopte: 'bg-green-100 text-green-700',
  rejete: 'bg-red-100 text-red-600',
}

export const MOTION_LABELS: Record<MotionType, string> = {
  renvoi: 'Motion de renvoi',
  cloture_debats: 'Clôture des débats',
  suspension_seance: 'Suspension de séance',
  rappel_reglement: 'Rappel au règlement',
}
