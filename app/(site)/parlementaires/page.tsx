import { createClient } from '@supabase/supabase-js'
import ParlementairesContent from '@/components/site/ParlementairesContent'

export const dynamic = 'force-dynamic'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ROLES_PUBLICS = ['parlementaire', 'president_groupe', 'president_seance', 'ministre']

export default async function ParlementairesPage() {
  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id, first_name, last_name, role, avatar_url, political_groups!profiles_group_id_fkey(name, color)')
    .in('role', ROLES_PUBLICS)
    .order('last_name')

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f0f4ff 0%,#e8effc 100%)' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#04439a 0%,#1a5fc8 100%)',
        color: 'white',
        padding: '7rem 1.5rem 3rem',
        textAlign: 'center',
      }}>
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          PARLEMENTAIRES
        </h1>
        <p style={{ fontFamily: 'var(--font-corps)', fontSize: '1.1rem', opacity: 0.85 }}>
          Les élus du Parlement des Étudiants de Lyon
        </p>
      </div>

      <ParlementairesContent profiles={(profiles ?? []) as any} />
    </div>
  )
}
