import { createClient } from '@supabase/supabase-js'
import SiteHero from '@/components/site/SiteHero'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function SeancesArchivePage() {
  // Charger les séances
  const { data: seances } = await adminClient
    .from('seances')
    .select('id,title,date,status,created_at')
    .order('date', { ascending: false })
    .limit(50)

  // Pour chaque séance, compter les votes et propositions adoptées
  const seancesWithStats = await Promise.all(
    (seances ?? []).map(async (seance: any) => {
      // Compter les sessions de vote liées à cette séance
      const { count: nbVotes } = await adminClient
        .from('vote_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('seance_id', seance.id)

      // Compter les propositions adoptées (sessions fermées où pour > contre)
      const { data: sessions } = await adminClient
        .from('vote_sessions')
        .select('id')
        .eq('seance_id', seance.id)
        .eq('status', 'ferme')

      // On ne calcule pas le détail par séance pour éviter N+1 excessif
      return {
        ...seance,
        nbVotes: nbVotes ?? 0,
        nbSessions: sessions?.length ?? 0,
      }
    })
  )

  const glassCard = {
    background: 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.75)',
    boxShadow: '0 4px 24px rgba(4,67,154,0.07)',
    borderRadius: '1rem',
    padding: '1.5rem',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f0f4ff 0%,#e8effc 100%)' }}>
      <SiteHero
        badge="Vie parlementaire"
        title="Archives des séances"
        description="Retrouvez l'historique complet des séances plénières du Parlement des Étudiants de Lyon."
      />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {seancesWithStats.length === 0 ? (
          <div style={{ ...glassCard, textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Aucune séance enregistrée pour le moment.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {seancesWithStats.map((seance: any) => (
              <div key={seance.id} style={glassCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
                        background: seance.status === 'terminee' ? '#dcfce7' : seance.status === 'en_cours' ? '#dbeafe' : '#f3f4f6',
                        color: seance.status === 'terminee' ? '#166534' : seance.status === 'en_cours' ? '#1d4ed8' : '#6b7280',
                      }}>
                        {seance.status === 'terminee' ? 'Terminée' : seance.status === 'en_cours' ? 'En cours' : seance.status ?? 'Planifiée'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {formatDate(seance.date ?? seance.created_at)}
                      </span>
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.15rem', fontWeight: 700, color: '#1e3a5f', margin: 0 }}>
                      {seance.title ?? `Séance du ${formatDate(seance.date ?? seance.created_at)}`}
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        🗳️ <strong>{seance.nbVotes}</strong> vote{seance.nbVotes > 1 ? 's' : ''}
                      </span>
                      {seance.nbSessions > 0 && (
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          📋 <strong>{seance.nbSessions}</strong> scrutin{seance.nbSessions > 1 ? 's' : ''} clos
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <Link
                      href="/resultats"
                      style={{
                        padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 600,
                        background: 'var(--pel-bleu)', color: 'white', textDecoration: 'none',
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      }}
                    >
                      Voir les résultats →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
