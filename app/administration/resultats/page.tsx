'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VoteSession, Vote, Profile, PoliticalGroup } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import { BarChart3, ThumbsUp, ThumbsDown, Minus, RefreshCw } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'

interface Results {
  pour: number
  contre: number
  abstention: number
  total: number
  byGroup: Record<string, {
    name: string
    color: string
    pour: number
    contre: number
    abstention: number
  }>
  votes: (Vote & { voter?: Profile })[]
}

export default function ResultatsPage() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const sessionIdParam = searchParams.get('session')

  const [sessions, setSessions] = useState<VoteSession[]>([])
  const [selectedSession, setSelectedSession] = useState<string>(sessionIdParam ?? '')
  const [results, setResults] = useState<Results | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSessions = useCallback(async () => {
    const { data } = await supabase
      .from('vote_sessions')
      .select('*, bills(number, title)')
      .order('created_at', { ascending: false })
    setSessions(data ?? [])
    setLoading(false)
  }, [supabase])

  const fetchResults = useCallback(async (sessionId: string) => {
    if (!sessionId) { setResults(null); return }

    const [{ data: votes }, { data: profiles }, { data: groups }] = await Promise.all([
      supabase.from('votes').select('*, profiles(first_name, last_name, group_id)').eq('session_id', sessionId),
      supabase.from('profiles').select('id, first_name, last_name, group_id'),
      supabase.from('political_groups').select('id, name, color'),
    ])

    const r: Results = {
      pour: 0,
      contre: 0,
      abstention: 0,
      total: votes?.length ?? 0,
      byGroup: {},
      votes: votes ?? [],
    }

    votes?.forEach(vote => {
      if (vote.vote_value === 'pour') r.pour++
      else if (vote.vote_value === 'contre') r.contre++
      else r.abstention++

      const voter = vote.profiles as Profile | undefined
      if (voter?.group_id) {
        const group = groups?.find(g => g.id === voter.group_id)
        if (group) {
          if (!r.byGroup[group.id]) {
            r.byGroup[group.id] = { name: group.name, color: group.color, pour: 0, contre: 0, abstention: 0 }
          }
          r.byGroup[group.id][vote.vote_value as 'pour' | 'contre' | 'abstention']++
        }
      }
    })

    setResults(r)
  }, [supabase])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  useEffect(() => {
    fetchResults(selectedSession)
    if (!selectedSession) return
    const channel = supabase
      .channel(`results-${selectedSession}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'votes',
        filter: `session_id=eq.${selectedSession}`,
      }, () => fetchResults(selectedSession))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedSession, fetchResults, supabase])

  const session = sessions.find(s => s.id === selectedSession)
  const totalParlementaires = results ? results.pour + results.contre + results.abstention : 0

  function pct(val: number) {
    if (!totalParlementaires) return 0
    return Math.round((val / totalParlementaires) * 100)
  }

  return (
    <div>
      <TopBar title="Résultats des scrutins" />
      <div className="p-6 space-y-6">
        {/* Sélecteur de scrutin */}
        <div className="card">
          <label className="label">Sélectionner un scrutin</label>
          <div className="flex gap-3">
            <select
              value={selectedSession}
              onChange={e => setSelectedSession(e.target.value)}
              className="input-field flex-1"
            >
              <option value="">— Choisir un scrutin —</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.status === 'ouvert' ? '🟢 ' : '⚫ '}
                  {s.title} ({formatDateTime(s.opened_at)})
                </option>
              ))}
            </select>
            <button
              onClick={() => fetchResults(selectedSession)}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Résultats */}
        {results && session && (
          <>
            {/* En-tête scrutin */}
            <div className="card bg-pel-blue text-white">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`badge text-xs mb-2 ${session.status === 'ouvert' ? 'bg-green-400 text-green-900' : 'bg-white/20 text-white'}`}>
                    {session.status === 'ouvert' ? '● En cours' : 'Terminé'}
                  </span>
                  <h2 className="text-xl font-bold">{session.title}</h2>
                  {session.bills && (
                    <p className="text-white/70 text-sm mt-1">{session.bills.number} — {session.bills.title}</p>
                  )}
                </div>
                <BarChart3 size={32} className="text-white/40" />
              </div>
            </div>

            {/* Chiffres clés */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card text-center border-l-4 border-green-400">
                <ThumbsUp size={28} className="text-green-500 mx-auto mb-2" />
                <p className="text-4xl font-bold text-green-600">{results.pour}</p>
                <p className="text-sm text-gray-500 mt-1">POUR</p>
                <p className="text-lg font-semibold text-green-500">{pct(results.pour)}%</p>
              </div>
              <div className="card text-center border-l-4 border-red-400">
                <ThumbsDown size={28} className="text-red-500 mx-auto mb-2" />
                <p className="text-4xl font-bold text-red-600">{results.contre}</p>
                <p className="text-sm text-gray-500 mt-1">CONTRE</p>
                <p className="text-lg font-semibold text-red-500">{pct(results.contre)}%</p>
              </div>
              <div className="card text-center border-l-4 border-gray-300">
                <Minus size={28} className="text-gray-400 mx-auto mb-2" />
                <p className="text-4xl font-bold text-gray-600">{results.abstention}</p>
                <p className="text-sm text-gray-500 mt-1">ABSTENTION</p>
                <p className="text-lg font-semibold text-gray-400">{pct(results.abstention)}%</p>
              </div>
            </div>

            {/* Barre de résultat */}
            <div className="card">
              <h3 className="section-title mb-3">Répartition ({totalParlementaires} votes exprimés)</h3>
              <div className="h-8 rounded-full overflow-hidden flex">
                {results.pour > 0 && (
                  <div className="bg-green-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${pct(results.pour)}%` }}>
                    {pct(results.pour) > 8 ? `${pct(results.pour)}%` : ''}
                  </div>
                )}
                {results.abstention > 0 && (
                  <div className="bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold" style={{ width: `${pct(results.abstention)}%` }}>
                    {pct(results.abstention) > 8 ? `${pct(results.abstention)}%` : ''}
                  </div>
                )}
                {results.contre > 0 && (
                  <div className="bg-red-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${pct(results.contre)}%` }}>
                    {pct(results.contre) > 8 ? `${pct(results.contre)}%` : ''}
                  </div>
                )}
                {totalParlementaires === 0 && (
                  <div className="bg-gray-100 w-full flex items-center justify-center text-gray-400 text-xs">
                    Aucun vote
                  </div>
                )}
              </div>
              {results.pour > results.contre && totalParlementaires > 0 && (
                <p className="text-green-600 font-bold mt-3 text-center">✓ Proposition ADOPTÉE</p>
              )}
              {results.contre > results.pour && totalParlementaires > 0 && (
                <p className="text-red-600 font-bold mt-3 text-center">✗ Proposition REJETÉE</p>
              )}
              {results.pour === results.contre && totalParlementaires > 0 && (
                <p className="text-amber-600 font-bold mt-3 text-center">= ÉGALITÉ</p>
              )}
            </div>

            {/* Par groupe */}
            {Object.keys(results.byGroup).length > 0 && (
              <div className="card">
                <h3 className="section-title mb-4">Résultats par groupe</h3>
                <div className="space-y-4">
                  {Object.entries(results.byGroup).map(([gid, gdata]) => {
                    const total = gdata.pour + gdata.contre + gdata.abstention
                    return (
                      <div key={gid}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: gdata.color }} />
                            <span className="text-sm font-semibold text-gray-800">{gdata.name}</span>
                          </div>
                          <div className="flex gap-4 text-xs">
                            <span className="text-green-600 font-bold">{gdata.pour} pour</span>
                            <span className="text-red-600 font-bold">{gdata.contre} contre</span>
                            <span className="text-gray-500">{gdata.abstention} abs.</span>
                          </div>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden flex bg-gray-100">
                          {gdata.pour > 0 && (
                            <div className="bg-green-500" style={{ width: `${(gdata.pour / total) * 100}%` }} />
                          )}
                          {gdata.abstention > 0 && (
                            <div className="bg-gray-300" style={{ width: `${(gdata.abstention / total) * 100}%` }} />
                          )}
                          {gdata.contre > 0 && (
                            <div className="bg-red-500" style={{ width: `${(gdata.contre / total) * 100}%` }} />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Détail des votes individuels */}
            <div className="card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="section-title">Détail des votes individuels</h3>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="table-header">Parlementaire</th>
                    <th className="table-header">Vote</th>
                    <th className="table-header hidden sm:table-cell">Procuration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.votes.map(vote => (
                    <tr key={vote.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        {vote.is_proxy ? (
                          <span className="text-amber-600 font-medium text-sm">
                            Vote par procuration
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-gray-800">
                            {(vote.profiles as any)?.first_name} {(vote.profiles as any)?.last_name}
                          </span>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className={`badge font-bold ${
                          vote.vote_value === 'pour'
                            ? 'bg-green-100 text-green-700'
                            : vote.vote_value === 'contre'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {vote.vote_value.toUpperCase()}
                        </span>
                      </td>
                      <td className="table-cell hidden sm:table-cell text-xs text-gray-400">
                        {vote.is_proxy ? 'Oui' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {results.votes.length === 0 && (
                <p className="text-center text-gray-400 py-8 text-sm">Aucun vote encore enregistré</p>
              )}
            </div>
          </>
        )}

        {!selectedSession && !loading && (
          <div className="card text-center py-16 text-gray-400">
            <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Sélectionnez un scrutin pour voir les résultats</p>
          </div>
        )}
      </div>
    </div>
  )
}
