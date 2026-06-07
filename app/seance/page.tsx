'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SeancePage() {
  const [seance, setSeance] = useState<any>(null)
  const [ordreJour, setOrdreJour] = useState<any[]>([])
  const [voteSession, setVoteSession] = useState<any>(null)
  const [resultats, setResultats] = useState<{pour: number, contre: number, abstention: number}>({pour: 0, contre: 0, abstention: 0})

  useEffect(() => {
    const supabase = createClient()

    async function fetchData() {
      const { data: seances } = await supabase.from('seances').select('*').in('statut', ['en_cours', 'planifiee']).order('date', { ascending: false }).limit(1)
      if (seances && seances.length > 0) setSeance(seances[0])

      if (seances && seances.length > 0) {
        const { data: odj } = await supabase.from('ordre_du_jour').select('*').eq('seance_id', seances[0].id).eq('public', true).order('ordre')
        setOrdreJour(odj ?? [])
      }

      const { data: sessions } = await supabase.from('vote_sessions').select('*, bills(title)').eq('status', 'open').limit(1)
      if (sessions && sessions.length > 0) {
        setVoteSession(sessions[0])
        const { data: votes } = await supabase.from('votes').select('vote').eq('session_id', sessions[0].id)
        if (votes) {
          setResultats({
            pour: votes.filter(v => v.vote === 'pour').length,
            contre: votes.filter(v => v.vote === 'contre').length,
            abstention: votes.filter(v => v.vote === 'abstention').length,
          })
        }
      }
    }

    fetchData()

    const channel = supabase.channel('votes-public').on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, fetchData).subscribe()
    const channel2 = supabase.channel('sessions-public').on('postgres_changes', { event: '*', schema: 'public', table: 'vote_sessions' }, fetchData).subscribe()
    const interval = setInterval(fetchData, 15000)

    return () => {
      channel.unsubscribe()
      channel2.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const totalVotes = resultats.pour + resultats.contre + resultats.abstention
  const pctPour = totalVotes > 0 ? Math.round(resultats.pour / totalVotes * 100) : 0
  const pctContre = totalVotes > 0 ? Math.round(resultats.contre / totalVotes * 100) : 0
  const pctAbs = totalVotes > 0 ? Math.round(resultats.abstention / totalVotes * 100) : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

      {/* Bandeau statut séance */}
      <section>
        {seance ? (
          <div className="rounded-2xl p-8 text-white relative overflow-hidden" style={{ background: seance.statut === 'en_cours' ? 'var(--pel-rouge)' : 'var(--pel-bleu)' }}>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {seance.statut === 'en_cours' && <span className="w-3 h-3 rounded-full bg-white animate-pulse" />}
              <span className="text-sm font-semibold px-3 py-1 bg-white/20 rounded-full" style={{ fontFamily: 'var(--font-corps)' }}>
                {seance.statut === 'en_cours' ? '🔴 SÉANCE EN COURS' : '📅 PROCHAINE SÉANCE'}
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700 }}>{seance.titre}</h1>
            <p className="text-white/80 mt-2" style={{ fontFamily: 'var(--font-corps)' }}>
              {new Date(seance.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {seance.lieu && ` · ${seance.lieu}`}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl p-8 bg-white border border-gray-100 text-center">
            <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-gris)', fontWeight: 700 }}>AUCUNE SÉANCE PLANIFIÉE</p>
            <p className="text-gray-500 mt-2" style={{ fontFamily: 'var(--font-corps)' }}>Consultez l&apos;agenda pour les prochaines dates.</p>
          </div>
        )}
      </section>

      {/* Vote en cours */}
      {voteSession && (
        <section>
          <div className="bg-white rounded-2xl p-8 border-2 shadow-lg" style={{ borderColor: 'var(--pel-rouge)' }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'var(--pel-rouge)' }} />
              <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-rouge)', fontWeight: 700 }}>VOTE EN COURS</h2>
            </div>
            <p className="font-semibold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-corps)' }}>
              {voteSession.bills?.title ?? 'Proposition de loi'}
            </p>

            <div className="space-y-4">
              {[
                { label: 'Pour', count: resultats.pour, pct: pctPour, color: '#059669' },
                { label: 'Contre', count: resultats.contre, pct: pctContre, color: '#b21d0b' },
                { label: 'Abstention', count: resultats.abstention, pct: pctAbs, color: '#6b7280' },
              ].map(r => (
                <div key={r.label}>
                  <div className="flex justify-between text-sm mb-1" style={{ fontFamily: 'var(--font-corps)' }}>
                    <span className="font-medium" style={{ color: r.color }}>{r.label}</span>
                    <span className="text-gray-500">{r.count} voix · {r.pct}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${r.pct}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4" style={{ fontFamily: 'var(--font-corps)' }}>
              Résultats en temps réel · {totalVotes} vote{totalVotes !== 1 ? 's' : ''} enregistré{totalVotes !== 1 ? 's' : ''}
            </p>
          </div>
        </section>
      )}

      {/* Ordre du jour */}
      {ordreJour.length > 0 && (
        <section>
          <h2 className="mb-6" style={{ fontFamily: 'var(--font-titre)', fontSize: '1.8rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>ORDRE DU JOUR</h2>
          <div className="space-y-4">
            {ordreJour.map((point, i) => (
              <div key={point.id} className="bg-white rounded-xl p-6 border border-gray-100 flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'var(--pel-bleu)' }}>{i + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-corps)' }}>{point.titre}</p>
                  {point.texte_complet && <p className="text-sm text-gray-500 mt-1 line-clamp-2" style={{ fontFamily: 'var(--font-corps)' }}>{point.texte_complet}</p>}
                </div>
                <span className="flex-shrink-0 badge text-xs" style={{
                  background: point.statut === 'en_cours' ? 'var(--pel-rouge)' : point.statut === 'adopte' ? '#059669' : point.statut === 'rejete' ? '#6b7280' : 'var(--pel-bleu-light)',
                  color: point.statut === 'a_debattre' ? 'var(--pel-bleu)' : 'white',
                }}>
                  {{ a_debattre: 'À débattre', en_cours: '⚡ En cours', adopte: '✓ Adopté', rejete: '✗ Rejeté' }[point.statut as string] ?? point.statut}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA connexion */}
      <section className="rounded-2xl p-10 text-white text-center" style={{ background: 'var(--pel-bleu)' }}>
        <h2 className="text-white mb-3" style={{ fontFamily: 'var(--font-titre)', fontSize: '2rem', fontWeight: 700 }}>VOUS ÊTES PARLEMENTAIRE ?</h2>
        <p className="text-blue-200 mb-6" style={{ fontFamily: 'var(--font-corps)' }}>
          Connectez-vous pour accéder à votre espace parlementaire, voter et consulter les documents de séance.
        </p>
        <Link href="/login" className="btn-primary text-base px-8 py-3">
          Se connecter à mon espace →
        </Link>
      </section>
    </div>
  )
}
