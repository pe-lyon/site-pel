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

  const liste = membres ?? []

  // Identifier le président (premier membre avec fonction "Président")
  const president = liste.find(m => {
    const { fonction } = parseRole(m.role ?? '')
    return fonction.toLowerCase().includes('président') || fonction.toLowerCase().includes('president')
  }) ?? null

  const autreMembres = president ? liste.filter(m => m.id !== president.id) : liste

  const grouped: Record<string, any[]> = {}
  for (const m of autreMembres) {
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

  const presidentRole = president ? parseRole(president.role ?? '') : null

  return (
    <div>
      <SiteHero
        badge="L'équipe dirigeante"
        title="Le Bureau"
        description="Les membres élus qui dirigent le Parlement des Étudiants de Lyon."
      />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {liste.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">👥</p>
              <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-gris)', fontWeight: 700 }}>BUREAU EN COURS DE CONSTITUTION</p>
            </div>
          ) : (
            <div className="space-y-20">

              {/* ── Carte Président ── */}
              {president && presidentRole && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.4rem', color: 'var(--pel-bleu)', fontWeight: 700, marginBottom: '2.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(4,67,154,0.15)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Présidence
                  </h2>

                  {/* Bannière pleine largeur */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(4,67,154,0.04) 0%, rgba(4,67,154,0.08) 100%)',
                    border: '1.5px solid rgba(4,67,154,0.12)',
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'wrap' }}>

                      {/* Zone photo */}
                      <div style={{
                        width: 260, flexShrink: 0,
                        background: 'linear-gradient(180deg, rgba(4,67,154,0.10) 0%, transparent 100%)',
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                        padding: '2rem 2rem 0',
                        minHeight: 280,
                      }}>
                        {president.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={president.photo_url}
                            alt={`${president.prenom} ${president.nom}`}
                            style={{ width: '100%', maxWidth: 200, objectFit: 'contain', objectPosition: 'bottom', display: 'block' }}
                          />
                        ) : (
                          <div style={{
                            width: 160, height: 160, borderRadius: '50%',
                            background: 'var(--pel-bleu)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-titre)',
                            marginBottom: '1rem',
                          }}>
                            {getInitials(president.prenom, president.nom)}
                          </div>
                        )}
                      </div>

                      {/* Zone texte */}
                      <div style={{ flex: 1, minWidth: 280, padding: '2.5rem 2.5rem 2.5rem 2rem' }}>

                        {/* Fonction badge */}
                        <span style={{
                          display: 'inline-block', marginBottom: '0.75rem',
                          padding: '0.2rem 0.85rem', borderRadius: '999px',
                          background: 'rgba(4,67,154,0.10)', color: 'var(--pel-bleu)',
                          fontSize: '0.72rem', fontFamily: 'var(--font-corps)',
                          fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                        }}>
                          {presidentRole.fonction}
                        </span>

                        {/* Nom cliquable */}
                        <Link href={`/bureau/${president.id}`} className="bureau-president-link" style={{ textDecoration: 'none' }}>
                          <h2 style={{
                            fontFamily: 'var(--font-titre)',
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                            fontWeight: 900,
                            color: 'var(--pel-bleu)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                            lineHeight: 1.05,
                            margin: 0,
                            display: 'inline-block',
                            borderBottom: '2px solid transparent',
                            transition: 'border-color 0.2s',
                          }}>
                            {president.prenom} {president.nom}
                          </h2>
                        </Link>
                        <style>{`.bureau-president-link:hover h2 { border-bottom-color: var(--pel-bleu) !important; }`}</style>

                        {/* Formation */}
                        {(president.formation || president.universite) && (
                          <p style={{ fontFamily: 'var(--font-corps)', color: '#6b7280', fontSize: '0.85rem', marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <GraduationCap size={14} />
                            {president.formation}{president.universite ? ` — ${president.universite}` : ''}
                          </p>
                        )}

                        {/* Bio */}
                        {president.bio && (
                          <p style={{
                            fontFamily: 'var(--font-corps)', color: '#374151',
                            fontSize: '0.95rem', lineHeight: 1.75,
                            marginTop: '1.25rem',
                            maxWidth: 560,
                          }}>
                            {president.bio}
                          </p>
                        )}

                        {/* Liens + CTA */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                          {president.email && (
                            <a href={`mailto:${president.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: '0.6rem', background: 'rgba(4,67,154,0.08)', color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                              <Mail size={14} /> {president.email}
                            </a>
                          )}
                          {president.linkedin_url && (
                            <a href={president.linkedin_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: '0.6rem', background: 'rgba(4,67,154,0.08)', color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                              <Linkedin size={14} /> LinkedIn
                            </a>
                          )}
                          <Link href={`/bureau/${president.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: '0.6rem', background: 'var(--pel-bleu)', color: 'white', fontFamily: 'var(--font-corps)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                            Voir la fiche complète →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Autres membres par section ── */}
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
                        <Link key={m.id} href={`/bureau/${m.id}`} className="glass-card rounded-2xl p-6 text-center group transition-all hover:scale-[1.02] hover:shadow-xl block" style={{ textDecoration: 'none' }}>
                          <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center text-white text-xl font-bold" style={{ background: 'var(--pel-bleu)', fontFamily: 'var(--font-titre)' }}>
                            {m.photo_url
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={m.photo_url} alt={`${m.prenom} ${m.nom}`} className="w-full h-full object-cover" />
                              : getInitials(m.prenom, m.nom)
                            }
                          </div>
                          <h3 style={{ fontFamily: 'var(--font-titre)', fontSize: '1rem', color: 'var(--pel-bleu)', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}>
                            {m.prenom} {m.nom}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'var(--font-corps)', textAlign: 'center' }}>{fonction}</p>
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
                          <div className="flex justify-center gap-2 mt-4">
                            {m.email && <span className="p-2 rounded-lg text-gray-400"><Mail size={15} /></span>}
                            {m.linkedin_url && <span className="p-2 rounded-lg text-gray-400"><Linkedin size={15} /></span>}
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
