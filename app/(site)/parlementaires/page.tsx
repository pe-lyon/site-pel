import { createClient } from '@supabase/supabase-js'
import ParlementairesContent from '@/components/site/ParlementairesContent'
import SiteHero from '@/components/site/SiteHero'

export const dynamic = 'force-dynamic'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ROLES_PUBLICS = ['parlementaire', 'president_groupe', 'president_seance', 'ministre']

export default async function ParlementairesPage() {
  const [profilesRes, univRes] = await Promise.all([
    adminClient
      .from('profiles')
      .select('id, first_name, last_name, role, avatar_url, political_groups!profiles_group_id_fkey(name, color)')
      .in('role', ROLES_PUBLICS)
      .order('last_name'),
    adminClient
      .from('site_settings')
      .select('value')
      .eq('key', 'profils_universite_json')
      .single(),
  ])

  const univMap: Record<string, string> = univRes.data?.value
    ? JSON.parse(univRes.data.value)
    : {}

  // Merge universite into each profile as permissions.universite
  const profiles = (profilesRes.data ?? []).map((p: any) => ({
    ...p,
    permissions: { universite: univMap[p.id] ?? null },
  }))

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f0f4ff 0%,#e8effc 100%)' }}>
      <SiteHero
        badge="Assemblée parlementaire"
        title="Parlementaires"
        description="Les élus qui composent le Parlement des Étudiants de Lyon, représentant leurs groupes politiques."
      />

      <ParlementairesContent profiles={profiles as any} />
    </div>
  )
}
