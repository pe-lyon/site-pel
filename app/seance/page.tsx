'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'

const POSITION_ORDER: Record<string, number> = {
  extreme_gauche: 0, gauche_radicale: 1, gauche: 2, centre_gauche: 3,
  centre: 4, centre_droit: 5, droite: 6, droite_radicale: 7,
  extreme_droite: 8, monarchiste: 9, autre: 10,
}

function computeSeats(profiles: any[]) {
  if (profiles.length === 0) return []
  const cx = 500, cy = 420, rows = 4, baseRadius = 200, radiusStep = 60
  const sorted = [...profiles].sort((a, b) => {
    const pa = POSITION_ORDER[a.political_groups?.political_position] ?? 10
    const pb = POSITION_ORDER[b.political_groups?.political_position] ?? 10
    return pa !== pb ? pa - pb : (a.last_name ?? '').localeCompare(b.last_name ?? '')
  })
  const seatsPerRow: number[] = []
  let remaining = sorted.length
  for (let r = 0; r < rows; r++) {
    const share = Math.ceil(remaining / (rows - r))
    seatsPerRow.push(share)
    remaining -= share
  }
  const seats: { profile: any; x: number; y: number }[] = []
  let idx = 0
  for (let r = 0; r < rows; r++) {
    const count = seatsPerRow[r]
    const radius = baseRadius + r * radiusStep
    for (let i = 0; i < count; i++) {
      if (idx >= sorted.length) break
      const angle = Math.PI + (i / Math.max(count - 1, 1)) * Math.PI
      seats.push({ profile: sorted[idx], x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) })
      idx++
    }
  }
  return seats
}

export default function SeancePage() {
  const [seance, setSeance] = useState<any>(null)
  const [billEnCours, setBillEnCours] = useState<any>(null)
  const [rapporteur, setRapporteur] = useState<any>(null)
  const [voteSession, setVoteSession] = useState<any>(null)
  const [resultats, setResultats] = useState({ pour: 0, contre: 0, abstention: 0 })
  const [ordreJour, setOrdreJour] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [selectedSeat, setSelectedSeat] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    const supabase = createClient()

    const { data: seances } = await supabase
      .from('seances').select('*')
      .in('statut', ['en_cours', 'planifiee'])
      .order('date', { ascending: false }).limit(1)
    const seanceActive = seances?.[0] ?? null
    setSeance(seanceActive)

    if (seanceActive) {
      const { data: odj } = await supabase.from('ordre_du_jour')
        .select('*').eq('seance_id', seanceActive.id).eq('public', true).order('ordre')
      setOrdreJour(odj ?? [])
    }

    const { data: sessions } = await supabase
      .from('vote_sessions')
      .select('*, bills(id, title, description, full_text, author_id)')
      .eq('status', 'open').limit(1)

    if (sessions?.[0]) {
      const session = sessions[0]
      setVoteSession(session)
      const bill = session.bills
      setBillEnCours(bill)
      if (bill?.author_id) {
        const { data: author } = await supabase.from('profiles')
          .select('first_name, last_name, political_groups!profiles_group_id_fkey(name, color)')
          .eq('id', bill.author_id).single()
        setRapporteur(author)
      }
      const { data: votes } = await supabase.from('votes').select('vote').eq('session_id', session.id)
      if (votes) {
        setResultats({
          pour: votes.filter((v: any) => v.vote === 'pour').length,
          contre: votes.filter((v: any) => v.vote === 'contre').length,
          abstention: votes.filter((v: any) => v.vote === 'abstention').length,
        })
      }
    } else {
      const { data: billsEn } = await supabase.from('bills')
        .select('id, title, description, full_text, author_id')
        .eq('status', 'en_discussion').order('updated_at', { ascending: false }).limit(1)
      if (billsEn?.[0]) {
        setBillEnCours(billsEn[0])
        if (billsEn[0].author_id) {
          const { data: author } = await supabase.from('profiles')
            .select('first_name, last_name, political_groups!profiles_group_id_fkey(name, color)')
            .eq('id', billsEn[0].author_id).single()
          setRapporteur(author)
        }
      } else {
        setBillEnCours(null); setRapporteur(null)
      }
      setVoteSession(null)
      setResultats({ pour: 0, contre: 0, abstention: 0 })
    }

    const { data: profs } = await supabase.from('profiles')
      .select('*, political_groups!profiles_group_id_fkey(*)').order('last_name')
    setProfiles(profs ?? [])

    const { data: grps } = await supabase.from('political_groups').select('*').order('name')
    setGroups(grps ?? [])

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
    const supabase = createClient()
    const ch1 = supabase.channel('votes-rt').on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, fetchAll).subscribe()
    const ch2 = supabase.channel('sessions-rt').on('postgres_changes', { event: '*', schema: 'public', table: 'vote_sessions' }, fetchAll).subscribe()
    const interval = setInterval(fetchAll, 20000)
    return () => { ch1.unsubscribe(); ch2.unsubscribe(); clearInterval(interval) }
  }, [fetchAll])

  const total = resultats.pour + resultats.contre + resultats.abstention
  const pctPour = total > 0 ? Math.round(resultats.pour / total * 100) : 0
  const pctContre = total > 0 ? Math.round(resultats.contre / total * 100) : 0
  const pctAbs = total > 0 ? Math.round(resultats.abstention / total * 100) : 0
  const seats = computeSeats(profiles)
  const groupInfos = groups
    .map(g => ({ group: g, count: profiles.filter(p => p.group_id === g.id).length }))
    .filter(g => g.count > 0)
    .sort((a, b) => (POSITION_ORDER[a.group.political_position] ?? 10) - (POSITION_ORDER[b.group.political_position] ?? 10))

  return (
    <div style={{ background: 'var(--pel-creme)', minHeight: '100vh' }}>

      {/* ═══ BANDEAU CONNEXION PARLEMENTAIRE ═══ */}
      <div style={{ background: 'var(--pel-bleu)' }} className="border-b border-blue-900">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-blue-100 text-sm text-center sm:text-left" style={{ fontFamily: 'var(--font-corps)' }}>
            🏛️{' '}<strong className="text-white">Vous êtes parlementaire ?</strong>{' '}
            Connectez-vous pour accéder à votre espace de vote et aux documents internes.
          </p>
          <Link
            href="/login"
            className="flex-shrink-0 px-5 py-2 rounded font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: 'var(--pel-rouge)', color: 'white', fontFamily: 'var(--font-corps)' }}
          >
            Se connecter →
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* 1. STATUT SÉANCE */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-[#04439a] rounded-full animate-spin" />
          </div>
        ) : seance ? (
          <div
            className="rounded-2xl p-8 text-white relative overflow-hidden"
            style={{ background: seance.statut === 'en_cours' ? 'linear-gradient(135deg,#b21d0b,#8f1709)' : 'linear-gradient(135deg,#04439a,#033278)' }}
          >
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="pg" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#pg)"/></svg>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                {seance.statut === 'en_cours' && <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />}
                <span className="text-xs font-bold uppercase tracking-widest text-white/70" style={{ fontFamily: 'var(--font-corps)' }}>
                  {seance.statut === 'en_cours' ? 'Séance en cours' : 'Prochaine séance'}
                </span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(1.6rem,4vw,2.8rem)', fontWeight: 700 }}>{seance.titre}</h1>
              <p className="text-white/75 mt-2 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>
                {new Date(seance.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {seance.lieu && <> &middot; {seance.lieu}</>}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-8 bg-white border border-gray-100 text-center">
            <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.4rem', color: 'var(--pel-gris)', fontWeight: 700 }}>AUCUNE SÉANCE PLANIFIÉE</p>
            <p className="text-gray-400 mt-2 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>Consultez l&apos;agenda du PEL pour les prochaines dates.</p>
          </div>
        )}

        {/* 2. PPL EN DÉBAT */}
        {!loading && billEnCours && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gray-200" />
              <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.2rem', color: 'var(--pel-bleu)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {voteSession ? '⚡ VOTE EN COURS' : '📄 TEXTE EN DÉBAT'}
              </h2>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div
              className="bg-white rounded-2xl overflow-hidden shadow-sm"
              style={{ border: `${voteSession ? 2 : 1}px solid ${voteSession ? 'var(--pel-rouge)' : 'var(--pel-gris-light)'}` }}
            >
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5 mb-6">
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--pel-rouge)', fontFamily: 'var(--font-corps)' }}>
                      Proposition de loi
                    </p>
                    <h3 style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(1.2rem,3vw,1.8rem)', color: 'var(--pel-bleu)', fontWeight: 700, lineHeight: 1.2 }}>
                      {billEnCours.title}
                    </h3>
                  </div>
                  {rapporteur && (
                    <div
                      className="flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: 'var(--pel-bleu-light)' }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: rapporteur.political_groups?.color ?? 'var(--pel-bleu)' }}
                      >
                        {getInitials(rapporteur.first_name, rapporteur.last_name)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-corps)' }}>Député rapporteur</p>
                        <p className="font-semibold text-sm text-gray-900 leading-tight" style={{ fontFamily: 'var(--font-corps)' }}>
                          {rapporteur.first_name} {rapporteur.last_name}
                        </p>
                        {rapporteur.political_groups?.name && (
                          <p className="text-xs font-medium" style={{ color: rapporteur.political_groups.color ?? 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>
                            {rapporteur.political_groups.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {billEnCours.description && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2" style={{ fontFamily: 'var(--font-corps)' }}>Résumé</p>
                    <p className="text-gray-700 leading-relaxed text-sm" style={{ fontFamily: 'var(--font-corps)' }}>{billEnCours.description}</p>
                  </div>
                )}

                {billEnCours.full_text && (
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-semibold select-none" style={{ color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>
                      <span className="group-open:hidden">▶ Lire le texte complet</span>
                      <span className="hidden group-open:inline">▼ Replier</span>
                    </summary>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto pr-2 scrollbar-thin" style={{ fontFamily: 'var(--font-corps)' }}>
                        {billEnCours.full_text}
                      </div>
                    </div>
                  </details>
                )}
              </div>

              {/* Résultats temps réel */}
              {voteSession && (
                <div className="border-t px-6 sm:px-8 py-6" style={{ background: '#fef9f9', borderColor: '#fecaca' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'var(--pel-rouge)' }} />
                    <p className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--pel-rouge)', fontFamily: 'var(--font-corps)' }}>
                      Résultats en temps réel
                    </p>
                    <span className="ml-auto text-xs text-gray-400" style={{ fontFamily: 'var(--font-corps)' }}>
                      {total} vote{total !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Pour', count: resultats.pour, pct: pctPour, color: '#059669' },
                      { label: 'Contre', count: resultats.contre, pct: pctContre, color: '#b21d0b' },
                      { label: 'Abstention', count: resultats.abstention, pct: pctAbs, color: '#6b7280' },
                    ].map(r => (
                      <div key={r.label} className="flex items-center gap-3">
                        <span className="w-20 text-sm font-semibold flex-shrink-0" style={{ color: r.color, fontFamily: 'var(--font-corps)' }}>{r.label}</span>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                            style={{ width: `${Math.max(r.pct, r.count > 0 ? 8 : 0)}%`, background: r.color }}
                          >
                            {r.count > 0 && <span className="text-white text-xs font-bold">{r.count}</span>}
                          </div>
                        </div>
                        <span className="w-10 text-right text-sm font-bold flex-shrink-0" style={{ color: r.color, fontFamily: 'var(--font-corps)' }}>{r.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3. ORDRE DU JOUR */}
        {!loading && ordreJour.length > 0 && (
          <section>
            <h2 className="mb-4" style={{ fontFamily: 'var(--font-titre)', fontSize: '1.4rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>ORDRE DU JOUR</h2>
            <div className="space-y-3">
              {ordreJour.map((point, i) => (
                <div
                  key={point.id}
                  className="bg-white rounded-xl px-5 py-4 flex items-start gap-4"
                  style={{ border: `${point.statut === 'en_cours' ? 2 : 1}px solid ${point.statut === 'en_cours' ? 'var(--pel-rouge)' : 'var(--pel-gris-light)'}` }}
                >
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                    style={{ background: point.statut === 'en_cours' ? 'var(--pel-rouge)' : 'var(--pel-bleu)' }}
                  >{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>{point.titre}</p>
                    {point.texte_complet && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1" style={{ fontFamily: 'var(--font-corps)' }}>{point.texte_complet}</p>}
                  </div>
                  <span
                    className="flex-shrink-0 badge text-xs whitespace-nowrap"
                    style={{
                      background: point.statut === 'en_cours' ? 'var(--pel-rouge)' : point.statut === 'adopte' ? '#059669' : point.statut === 'rejete' ? '#6b7280' : 'var(--pel-bleu-light)',
                      color: point.statut === 'a_debattre' ? 'var(--pel-bleu)' : 'white',
                    }}
                  >
                    {({ a_debattre: 'À débattre', en_cours: '⚡ En cours', adopte: '✓ Adopté', rejete: '✗ Rejeté' } as any)[point.statut] ?? point.statut}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. HÉMICYCLE */}
        {!loading && profiles.length > 0 && (
          <section>
            <h2 className="mb-4" style={{ fontFamily: 'var(--font-titre)', fontSize: '1.4rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>
              COMPOSITION DE L&apos;HÉMICYCLE
            </h2>
            <div className="bg-white rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--pel-gris-light)' }}>
              <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-4">
                  <svg viewBox="0 0 1000 480" className="w-full" style={{ maxHeight: 360 }}>
                    <path d="M 80 420 A 420 420 0 0 1 920 420" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
                    <path d="M 140 420 A 360 360 0 0 1 860 420" fill="none" stroke="#e5e7eb" strokeWidth="1.5"/>
                    <path d="M 200 420 A 300 300 0 0 1 800 420" fill="none" stroke="#e5e7eb" strokeWidth="1.5"/>
                    <path d="M 260 420 A 240 240 0 0 1 740 420" fill="none" stroke="#e5e7eb" strokeWidth="1.5"/>
                    <text x="90" y="415" textAnchor="middle" fill="#9ca3af" fontSize="10" fontStyle="italic">Gauche</text>
                    <text x="910" y="415" textAnchor="middle" fill="#9ca3af" fontSize="10" fontStyle="italic">Droite</text>
                    <ellipse cx="500" cy="435" rx="65" ry="22" fill="#04439a"/>
                    <text x="500" y="440" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">PRÉSIDENCE</text>
                    {seats.map(seat => {
                      const color = seat.profile.political_groups?.color ?? '#94a3b8'
                      const isSel = selectedSeat?.id === seat.profile.id
                      return (
                        <g key={seat.profile.id} onClick={() => setSelectedSeat(isSel ? null : seat.profile)} className="cursor-pointer">
                          <circle cx={seat.x} cy={seat.y} r={isSel ? 16 : 13} fill={color} stroke={isSel ? '#04439a' : 'white'} strokeWidth={isSel ? 3 : 1.5} className="transition-all duration-150"/>
                          <text x={seat.x} y={seat.y + 4} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" className="pointer-events-none select-none">
                            {getInitials(seat.profile.first_name, seat.profile.last_name)}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                  {selectedSeat && (
                    <div className="mx-4 mb-4 p-4 rounded-xl flex items-center gap-3 border-2" style={{ borderColor: selectedSeat.political_groups?.color ?? '#e5e7eb' }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: selectedSeat.political_groups?.color ?? '#94a3b8' }}>
                        {getInitials(selectedSeat.first_name, selectedSeat.last_name)}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>{selectedSeat.first_name} {selectedSeat.last_name}</p>
                        {selectedSeat.political_groups?.name && (
                          <p className="text-xs font-medium" style={{ color: selectedSeat.political_groups.color, fontFamily: 'var(--font-corps)' }}>{selectedSeat.political_groups.name}</p>
                        )}
                      </div>
                      <button onClick={() => setSelectedSeat(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
                    </div>
                  )}
                </div>
                <div className="lg:w-52 p-5 border-t lg:border-t-0 lg:border-l" style={{ borderColor: 'var(--pel-gris-light)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-500" style={{ fontFamily: 'var(--font-corps)' }}>Groupes politiques</p>
                  <div className="space-y-2">
                    {groupInfos.map(({ group, count }) => (
                      <div key={group.id} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: group.color }} />
                        <span className="text-xs text-gray-700 flex-1 truncate" style={{ fontFamily: 'var(--font-corps)' }}>{group.name}</span>
                        <span className="text-xs font-bold text-gray-500">{count}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t flex justify-between text-xs" style={{ borderColor: 'var(--pel-gris-light)' }}>
                    <span className="text-gray-500" style={{ fontFamily: 'var(--font-corps)' }}>Total</span>
                    <span className="font-bold" style={{ color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>{profiles.length}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-3 leading-relaxed" style={{ fontFamily: 'var(--font-corps)' }}>Cliquez sur un siège pour afficher le parlementaire.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 5. CTA BAS DE PAGE */}
        {!loading && (
          <section className="rounded-2xl p-8 text-center" style={{ background: 'var(--pel-bleu)' }}>
            <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.6rem', color: 'white', fontWeight: 700 }}>ESPACE RÉSERVÉ AUX PARLEMENTAIRES</p>
            <p className="text-blue-200 mt-2 mb-5 text-sm max-w-lg mx-auto" style={{ fontFamily: 'var(--font-corps)' }}>
              Accédez à votre espace de vote, aux documents de séance et aux informations internes de votre groupe politique.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-2.5 rounded font-semibold text-sm hover:opacity-90 transition-opacity" style={{ background: 'var(--pel-rouge)', color: 'white', fontFamily: 'var(--font-corps)' }}>
              Se connecter à mon espace →
            </Link>
          </section>
        )}

      </div>
    </div>
  )
}
