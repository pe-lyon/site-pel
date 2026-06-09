import { createClient } from '@supabase/supabase-js'
import SiteHero from '@/components/site/SiteHero'

export const dynamic = 'force-dynamic'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ResultatsPublicsPage() {
  const supabase = adminClient

  // Charger les sessions fermées avec leurs propositions
  const { data: sessions } = await supabase
    .from('vote_sessions')
    .select('*, bills(title, description)')
    .eq('status', 'ferme')
    .order('created_at', { ascending: false })

  // Pour chaque session, charger les votes agrégés
  const sessionsWithResults = await Promise.all(
    (sessions ?? []).map(async (session: any) => {
      const { data: votes } = await supabase
        .from('votes')
        .select('vote_value, voter_id, is_proxy, profiles!votes_voter_id_fkey(first_name, last_name, group_id), political_groups:profiles!votes_voter_id_fkey(political_groups!profiles_group_id_fkey(name,color))')
        .eq('session_id', session.id)

      const pour = votes?.filter((v: any) => v.vote_value === 'pour').length ?? 0
      const contre = votes?.filter((v: any) => v.vote_value === 'contre').length ?? 0
      const abstention = votes?.filter((v: any) => v.vote_value === 'abstention').length ?? 0
      const total = pour + contre + abstention
      const exprime = pour + contre
      const adopte = exprime > 0 && pour > exprime / 2

      // Pour scrutin public : récupérer les votes nominatifs
      let votesNominatifs: any[] = []
      if (session.type_scrutin === 'public') {
        const { data: vn } = await supabase
          .from('votes')
          .select('vote_value, is_proxy, profiles!votes_voter_id_fkey(first_name, last_name, political_groups!profiles_group_id_fkey(name, color))')
          .eq('session_id', session.id)
        votesNominatifs = vn ?? []
      }

      return { ...session, pour, contre, abstention, total, adopte, votesNominatifs }
    })
  )

  const glassCard = {
    background: 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.75)',
    boxShadow: '0 4px 24px rgba(4,67,154,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
    borderRadius: '1rem',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f0f4ff 0%,#e8effc 100%)' }}>
      <SiteHero
        badge="Transparence démocratique"
        title="Résultats des scrutins"
        description="Consultez les résultats de tous les votes tenus en séance plénière."
      />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {sessionsWithResults.length === 0 ? (
          <div style={{ ...glassCard, padding: '4rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Aucun scrutin clos pour le moment.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {sessionsWithResults.map((session: any) => {
              const total = session.pour + session.contre + session.abstention
              const pct = (v: number) => total > 0 ? Math.round((v / total) * 100) : 0

              return (
                <details key={session.id} style={{ ...glassCard, padding: '1.5rem' }}>
                  <summary style={{ cursor: 'pointer', listStyle: 'none', outline: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 700,
                            background: session.adopte ? '#dcfce7' : '#fee2e2',
                            color: session.adopte ? '#166534' : '#991b1b',
                          }}>
                            {session.adopte ? '✓ ADOPTÉ' : '✗ REJETÉ'}
                          </span>
                          {session.type_scrutin === 'secret' ? (
                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>🔒 Scrutin secret</span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>🔓 Scrutin public</span>
                          )}
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.2rem', fontWeight: 700, color: '#1e3a5f', margin: 0 }}>
                          {session.title}
                        </h2>
                        {session.bills?.title && (
                          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            {session.bills.title}
                          </p>
                        )}
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                          Clos le {formatDate(session.closed_at ?? session.created_at)}
                        </p>
                      </div>

                      {/* Barres résultats */}
                      <div style={{ minWidth: '220px' }}>
                        {/* Pour */}
                        <div style={{ marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                            <span style={{ color: '#16a34a', fontWeight: 600 }}>Pour</span>
                            <span style={{ color: '#16a34a', fontWeight: 700 }}>{session.pour} ({pct(session.pour)}%)</span>
                          </div>
                          <div style={{ height: '8px', background: '#f0fdf4', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct(session.pour)}%`, background: '#22c55e', borderRadius: '999px' }} />
                          </div>
                        </div>
                        {/* Contre */}
                        <div style={{ marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                            <span style={{ color: '#dc2626', fontWeight: 600 }}>Contre</span>
                            <span style={{ color: '#dc2626', fontWeight: 700 }}>{session.contre} ({pct(session.contre)}%)</span>
                          </div>
                          <div style={{ height: '8px', background: '#fef2f2', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct(session.contre)}%`, background: '#ef4444', borderRadius: '999px' }} />
                          </div>
                        </div>
                        {/* Abstention */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                            <span style={{ color: '#9ca3af', fontWeight: 600 }}>Abstention</span>
                            <span style={{ color: '#9ca3af', fontWeight: 700 }}>{session.abstention}</span>
                          </div>
                          <div style={{ height: '8px', background: '#f9fafb', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct(session.abstention)}%`, background: '#d1d5db', borderRadius: '999px' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </summary>

                  {/* Contenu dépliable */}
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(4,67,154,0.1)' }}>
                    {session.type_scrutin === 'secret' ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(59,130,246,0.05)', borderRadius: '0.75rem', color: '#6b7280' }}>
                        <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔒</p>
                        <p style={{ fontWeight: 600 }}>Scrutin à bulletin secret</p>
                        <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Les votes individuels ne sont pas publiés.</p>
                      </div>
                    ) : session.votesNominatifs.length > 0 ? (
                      <div>
                        <h3 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '1rem', fontSize: '0.95rem' }}>
                          Votes nominatifs ({session.votesNominatifs.length})
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                          {session.votesNominatifs.map((v: any, i: number) => {
                            const profil = v.profiles
                            const groupe = profil?.political_groups
                            const couleur = v.vote_value === 'pour' ? '#16a34a' : v.vote_value === 'contre' ? '#dc2626' : '#9ca3af'
                            return (
                              <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                background: 'rgba(255,255,255,0.7)', border: `1px solid ${couleur}30`
                              }}>
                                <div style={{
                                  width: '28px', height: '28px', borderRadius: '50%',
                                  background: groupe?.color ?? '#04439a',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: 'white', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
                                }}>
                                  {profil?.first_name?.charAt(0)}{profil?.last_name?.charAt(0)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {profil?.first_name} {profil?.last_name}
                                  </p>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: couleur, textTransform: 'uppercase' }}>
                                  {v.vote_value === 'pour' ? '✓' : v.vote_value === 'contre' ? '✗' : '—'}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center' }}>Aucun vote enregistré.</p>
                    )}
                  </div>
                </details>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
