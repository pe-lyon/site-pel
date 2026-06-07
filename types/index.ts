export type UserRole = 'president_seance' | 'president_groupe' | 'parlementaire' | 'ministre'
export type BillStatus = 'deposee' | 'en_discussion' | 'soumise_au_vote' | 'adoptee' | 'rejetee' | 'archivee'
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
  created_at: string
  updated_at: string
  profiles?: Profile
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
  en_discussion: 'En discussion',
  soumise_au_vote: 'Soumise au vote',
  adoptee: 'Adoptée',
  rejetee: 'Rejetée',
  archivee: 'Archivée',
}

export const STATUS_COLORS: Record<BillStatus, string> = {
  deposee: 'bg-gray-100 text-gray-700',
  en_discussion: 'bg-blue-100 text-blue-700',
  soumise_au_vote: 'bg-yellow-100 text-yellow-700',
  adoptee: 'bg-green-100 text-green-700',
  rejetee: 'bg-red-100 text-red-700',
  archivee: 'bg-gray-200 text-gray-600',
}
