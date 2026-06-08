import { createClient } from '@supabase/supabase-js'
import { getSettings, getEvenements, getActualites } from '@/lib/cms'
import HomeContent from '@/components/site/HomeContent'

export const dynamic = 'force-dynamic'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ROLES_PARLEMENTAIRES = ['parlementaire', 'president_groupe', 'president_seance', 'ministre']

export default async function HomePage() {
  const [settings, evenements, actualites] = await Promise.all([
    getSettings(['hero_titre', 'hero_sous_titre', 'pel_bref_texte', 'cta_texte']),
    getEvenements(3),
    getActualites(3),
  ])

  // Chiffres calculés en temps réel depuis la base
  const [{ count: nbParlementaires }, { count: nbGroupes }, { count: nbScrutins }, { count: nbTextesAdoptes }] = await Promise.all([
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).in('role', ROLES_PARLEMENTAIRES),
    adminClient.from('political_groups').select('*', { count: 'exact', head: true }).neq('is_public', false),
    adminClient.from('vote_sessions').select('*', { count: 'exact', head: true }).eq('status', 'ferme'),
    adminClient.from('bills').select('*', { count: 'exact', head: true }).eq('status', 'adoptee'),
  ])

  const chiffres = [
    { id: '1', label: 'Parlementaires', valeur: String(nbParlementaires ?? 0), ordre: 1 },
    { id: '2', label: 'Groupes politiques', valeur: String(nbGroupes ?? 0), ordre: 2 },
    { id: '3', label: 'Scrutins tenus', valeur: String(nbScrutins ?? 0), ordre: 3 },
    { id: '4', label: 'Textes adoptés', valeur: String(nbTextesAdoptes ?? 0), ordre: 4 },
  ]

  return (
    <HomeContent
      settings={settings}
      evenements={evenements ?? []}
      actualites={actualites ?? []}
      chiffres={chiffres}
    />
  )
}
