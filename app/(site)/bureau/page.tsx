import { createClient } from '@supabase/supabase-js'
import SiteHero from '@/components/site/SiteHero'
import { getInitials } from '@/lib/utils'
import { Mail, Linkedin, GraduationCap, MapPin } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function parseRole(role: string) {
  const parts = role.split(' > ')
  return parts.length >= 2
    ? { section: parts[0].trim(), fonction: parts.slice(1).join(' > ').trim() }
    : { section: '', fonction: role }
}

export default async function BureauPage() {
  const { data: membres, error: membresError } = await adminClient
    .from('bureau_membres')
    .select('*')
    .eq('actif', true)
    .order('ordre', { ascending: true })

  if (membresError) {
    console.error('[BureauPage] Supabase error:', membresError)
    throw new Error(`Supabase: ${membresError.message}`)
  }

  const grouped: Record<string, any[]> = {}
  for (const m of (membres ?? [])) {
    const { section } = parseRole(m.role ?? '')
    const key = section || '__sans_section__'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  }
  const sections = Object.keys(grouped).sort((a, b) => {
    if (a === '__sans_section__') return 1
    if (b === '__sans_section__') return -1
    return a.localeCompare(b)
  })

  return (
    <div>
      <SiteHero
        badge="L'équipe dirigeante"
        title="Le Bureau"
        description="Les membres élus qui dirigent le Parlement des Étudiants de Lyon. Cliquez sur un membre pour voir sa fiche complète."
      />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!membres || membres.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">👥</p>
              <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-gris)', fontWeight: 700 }}>BUREAU EN COURS DE CONSTITUTION</p>
              <p className="text-gray-400 mt-2 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>Les membres du bureau seront affichés ici.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {sections.map(sec => (
                <div key={sec}>
                  {sec !== '__sans_section__' && (
                    <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.4rem', color: 'var(--pel-bleu)', fontWeight: 700, marginBottom: '2rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(4,67,154,0.15)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {sec}
                    </h2>
                  )}
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {grouped[sec].map((m: any) => {
                      const { fonction } = parseRole(m.role ?? '')
                      return (
                        <Link
                          key={m.id}
                          href={`/bureau/${m.id}`}
                          className="glass-card rounded-2xl p-6 text-center group transition-all hover:scale-[1.02] hover:shadow-xl block"
                          style={{ textDecoration: 'none' }}
                        >
                          {/* Photo / Avatar */}
                          <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center text-white text-xl font-bold" style={{ background: 'var(--pel-bleu)', fontFamily: 'var(--font-titre)' }}>
                            {m.photo_url
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={m.photo_url} alt={`${m.prenom} ${m.nom}`} className="w-full h-full object-cover" />
                              : getInitials(m.prenom, m.nom)
                            }
                          </div>

                          {/* Nom & Fonction */}
                          <h3 style={{ fontFamily: 'var(--font-titre)', fontSize: '1rem', color: 'var(--pel-bleu)', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}>
                            {m.prenom} {m.nom}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'var(--font-corps)', textAlign: 'center' }}>{fonction}</p>

                          {/* Formation */}
                          {m.formation && (
                            <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1" style={{ fontFamily: 'var(--font-corps)' }}>
                              <GraduationCap size={11} /> {m.formation}
                            </p>
                          )}
                          {m.universite && (
                            <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-0.5" style={{ fontFamily: 'var(--font-corps)' }}>
                              <MapPin size={11} /> {m.universite}
                            </p>
                          )}

                          {/* Liens */}
                          <div className="flex justify-center gap-2 mt-4" onClick={e => e.preventDefault()}>
                            {m.email && (
                              <a href={`mailto:${m.email}`} className="p-2 rounded-lg hover:bg-white/50 transition-colors text-gray-400 hover:text-[#04439a]" onClick={e => e.stopPropagation()}>
                                <Mail size={15} />
                              </a>
                            )}
                            {m.linkedin_url && (
                              <a href={m.linkedin_url} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-white/50 transition-colors text-gray-400 hover:text-[#04439a]" onClick={e => e.stopPropagation()}>
                                <Linkedin size={15} />
                              </a>
                            )}
                          </div>

                          <p className="text-xs text-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>
                            Voir la fiche →
                          </p>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
