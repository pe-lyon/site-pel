export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import GroupeCard from '@/components/site/GroupeCard'
import SiteHero from '@/components/site/SiteHero'

// Client service role — contourne RLS pour les données publiques
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Member {
  id: string
  first_name: string
  last_name: string
}

interface PoliticalGroup {
  id: string
  name: string
  color: string
  political_position: string | null
  ideologies: string[] | null
  description: string | null
  presentation: string | null
  is_public: boolean | null
  profiles: Member[]
}

export default async function GroupesPage() {
  const { data: groupes } = await adminClient
    .from('political_groups')
    .select('*, profiles!profiles_group_id_fkey(id, first_name, last_name)')
    .order('name')

  const groups: PoliticalGroup[] = (groupes ?? []).filter(
    (g: PoliticalGroup) => g.is_public !== false
  )

  return (
    <div>
      {/* Hero */}
      <SiteHero
        badge="Vie politique"
        title="Groupes politiques"
        description="Les groupes parlementaires représentés au sein du Parlement des Étudiants de Lyon."
      >
        {groups.length > 0 && (
          <p style={{ fontFamily: 'var(--font-corps)', color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem' }}>
            {groups.length} groupe{groups.length > 1 ? 's' : ''} — {groups.reduce((acc, g) => acc + (g.profiles?.length ?? 0), 0)} parlementaires
          </p>
        )}
      </SiteHero>

      {/* Grille des groupes */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {groups.length === 0 ? (
            <div
              className="text-center py-16"
              style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.75)',
                borderRadius: '1rem',
              }}
            >
              <p className="text-gray-500" style={{ fontFamily: 'var(--font-corps)' }}>
                Aucun groupe politique n&apos;est encore enregistré.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map(group => (
                <GroupeCard
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  color={group.color}
                  political_position={group.political_position}
                  ideologies={group.ideologies}
                  description={group.description}
                  presentation={group.presentation}
                  members={group.profiles ?? []}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
