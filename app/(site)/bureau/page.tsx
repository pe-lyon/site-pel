import { getBureauMembres } from '@/lib/cms'
import SiteHero from '@/components/site/SiteHero'
import { getInitials } from '@/lib/utils'
import { Mail, Linkedin } from 'lucide-react'

export const revalidate = 60

function parseRole(role: string) {
  const parts = role.split(' > ')
  return parts.length >= 2
    ? { section: parts[0].trim(), fonction: parts.slice(1).join(' > ').trim() }
    : { section: '', fonction: role }
}

export default async function BureauPage() {
  const membres = await getBureauMembres()

  // Grouper par section
  const grouped: Record<string, any[]> = {}
  for (const m of membres) {
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
        description="Les membres élus qui dirigent le Parlement des Étudiants de Lyon."
      />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {membres.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">👥</p>
              <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-gris)', fontWeight: 700 }}>BUREAU EN COURS DE CONSTITUTION</p>
              <p className="text-gray-400 mt-2 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>Les membres du bureau seront affichés ici.</p>
            </div>
          ) : (
            <div className="space-y-14">
              {sections.map(sec => (
                <div key={sec}>
                  {sec !== '__sans_section__' && (
                    <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.4rem', color: 'var(--pel-bleu)', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(4,67,154,0.15)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {sec.toUpperCase()}
                    </h2>
                  )}
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {grouped[sec].map((m: any) => {
                      const { fonction } = parseRole(m.role ?? '')
                      return (
                        <div
                          key={m.id}
                          className="glass-card rounded-2xl p-6 text-center"
                        >
                          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold" style={{ background: 'var(--pel-bleu)', fontFamily: 'var(--font-titre)' }}>
                            {m.photo_url
                              ? <img src={m.photo_url} alt={`${m.prenom} ${m.nom}`} className="w-full h-full rounded-full object-cover"/>
                              : getInitials(m.prenom, m.nom)
                            }
                          </div>
                          <h3 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.1rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>{m.prenom.toUpperCase()} {m.nom.toUpperCase()}</h3>
                          <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'var(--font-corps)' }}>{fonction}</p>
                          <div className="flex justify-center gap-3 mt-4">
                            {m.email && (
                              <a href={`mailto:${m.email}`} className="p-2 rounded-lg hover:bg-white/50 transition-colors text-gray-400 hover:text-[#04439a]">
                                <Mail size={16}/>
                              </a>
                            )}
                            {m.linkedin_url && (
                              <a href={m.linkedin_url} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-white/50 transition-colors text-gray-400 hover:text-[#04439a]">
                                <Linkedin size={16}/>
                              </a>
                            )}
                          </div>
                        </div>
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
