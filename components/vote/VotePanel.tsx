'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VoteSession, Vote, Proxy } from '@/types'
import toast from 'react-hot-toast'
import { ThumbsUp, ThumbsDown, Minus, CheckCircle, Clock } from 'lucide-react'
import { logAction } from '@/lib/utils'

interface VotePanelProps {
  sessionId: string
  userId: string
}

export default function VotePanel({ sessionId, userId }: VotePanelProps) {
  const supabase = createClient()
  const [session, setSession] = useState<VoteSession | null>(null)
  const [myVote, setMyVote] = useState<Vote | null>(null)
  const [proxy, setProxy] = useState<Proxy | null>(null)
  const [proxyVote, setProxyVote] = useState<Vote | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [votingProxy, setVotingProxy] = useState(false)
  const [tallies, setTallies] = useState<{ pour: number; contre: number; abstention: number } | null>(null)

  const fetchData = useCallback(async () => {
    const [
      { data: sessionData },
      { data: myVoteData },
      { data: proxyData },
      { data: allVotes },
    ] = await Promise.all([
      supabase.from('vote_sessions').select('*, bills(*)').eq('id', sessionId).single(),
      supabase.from('votes').select('*').eq('session_id', sessionId).eq('voter_id', userId).maybeSingle(),
      supabase.from('proxies').select('*, absent:profiles!absent_id(first_name, last_name)').eq('holder_id', userId).maybeSingle(),
      supabase.from('votes').select('vote_value').eq('session_id', sessionId),
    ])
    setSession(sessionData)
    setMyVote(myVoteData)
    setProxy(proxyData)

    if (allVotes) {
      const pour = allVotes.filter((v: any) => v.vote_value === 'pour').length
      const contre = allVotes.filter((v: any) => v.vote_value === 'contre').length
      const abstention = allVotes.filter((v: any) => v.vote_value === 'abstention').length
      setTallies({ pour, contre, abstention })
    }

    // Vote de procuration déjà soumis ?
    if (proxyData) {
      const { data: pv } = await supabase
        .from('votes')
        .select('*')
        .eq('session_id', sessionId)
        .eq('voter_id', proxyData.absent_id)
        .maybeSingle()
      setProxyVote(pv)
    }
    setLoading(false)
  }, [sessionId, userId, supabase])

  useEffect(() => {
    fetchData()
    const channel = supabase
      .channel(`vote-session-${sessionId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'vote_sessions',
        filter: `id=eq.${sessionId}`,
      }, fetchData)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'votes',
        filter: `session_id=eq.${sessionId}`,
      }, fetchData)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchData, sessionId, supabase])

  async function submitVote(value: 'pour' | 'contre' | 'abstention', forProxy = false) {
    if (forProxy) setVotingProxy(true)
    else setVoting(true)

    const voterId = forProxy ? proxy?.absent_id : userId

    const { error } = await supabase.from('votes').insert({
      session_id: sessionId,
      voter_id: voterId,
      vote_value: value,
      is_proxy: forProxy,
      proxy_for: forProxy ? userId : null,
    })

    if (error) {
      toast.error('Erreur lors du vote')
    } else {
      toast.success('Vote enregistré')
      await logAction(supabase, userId, 'vote', 'vote_session', sessionId, {
        value,
        is_proxy: forProxy,
      })
    }

    if (forProxy) setVotingProxy(false)
    else setVoting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-pel-blue/30 border-t-pel-blue rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return <p className="text-center text-gray-400">Scrutin introuvable.</p>

  if (session.status === 'ferme') {
    const exprime = (tallies?.pour ?? 0) + (tallies?.contre ?? 0)
    const adopte = exprime > 0 && (tallies?.pour ?? 0) > exprime / 2
    const hasVotes = (tallies?.pour ?? 0) + (tallies?.contre ?? 0) + (tallies?.abstention ?? 0) > 0

    return (
      <div className="space-y-4">
        {hasVotes && (
          <div className={`rounded-2xl p-6 text-center font-bold text-3xl tracking-wide ${adopte ? 'bg-green-500 text-white' : 'bg-red-600 text-white'}`}>
            {adopte ? '✓ ADOPTÉ' : '✗ REJETÉ'}
            {tallies && (
              <p className="text-base font-normal mt-2 opacity-90">
                {tallies.pour} pour · {tallies.contre} contre · {tallies.abstention} abstentions
              </p>
            )}
          </div>
        )}
        <div className="card text-center py-8">
          <Clock size={36} className="mx-auto mb-3 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-700">Vote terminé</h2>
          <p className="text-gray-400 text-sm mt-1">Ce scrutin est désormais clos.</p>
        </div>
      </div>
    )
  }

  // Afficher les barres en temps réel si vote ouvert
  const RealtimeBars = () => {
    if (!tallies) return null
    const total = tallies.pour + tallies.contre + tallies.abstention
    if (total === 0) return null
    const pct = (v: number) => total > 0 ? Math.round((v / total) * 100) : 0
    return (
      <div className="card mt-4">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Résultats en direct ({total} votes)</p>
        <div className="space-y-2">
          {[
            { label: 'Pour', val: tallies.pour, color: '#22c55e', bg: '#f0fdf4' },
            { label: 'Contre', val: tallies.contre, color: '#ef4444', bg: '#fef2f2' },
            { label: 'Abstention', val: tallies.abstention, color: '#d1d5db', bg: '#f9fafb' },
          ].map(({ label, val, color, bg }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>{label}</span>
                <span style={{ color, fontWeight: 700 }}>{val} ({pct(val)}%)</span>
              </div>
              <div style={{ height: '8px', background: bg, borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct(val)}%`, background: color, borderRadius: '999px', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <RealtimeBars />
      {/* Mon vote */}
      <div className="card">
        <h2 className="section-title mb-1">Mon vote</h2>
        {session.bills && (
          <p className="text-gray-500 text-sm mb-4">
            {session.bills.number} — {session.bills.title}
          </p>
        )}

        {myVote ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Vote enregistré</p>
              <p className="text-sm text-green-600 capitalize">
                Vous avez voté : <strong>{myVote.vote_value.toUpperCase()}</strong>
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => submitVote('pour')}
              disabled={voting}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-400 transition-all disabled:opacity-50 group"
            >
              <ThumbsUp size={28} className="text-green-600 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-green-700">POUR</span>
            </button>

            <button
              onClick={() => submitVote('contre')}
              disabled={voting}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-400 transition-all disabled:opacity-50 group"
            >
              <ThumbsDown size={28} className="text-red-600 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-red-700">CONTRE</span>
            </button>

            <button
              onClick={() => submitVote('abstention')}
              disabled={voting}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all disabled:opacity-50 group"
            >
              <Minus size={28} className="text-gray-500 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-gray-600">ABSTENTION</span>
            </button>
          </div>
        )}
      </div>

      {/* Vote par procuration */}
      {proxy && (
        <div className="card border-2 border-amber-200">
          <h2 className="section-title mb-1 text-amber-700">Procuration</h2>
          <p className="text-sm text-gray-500 mb-4">
            Vous disposez de la procuration de{' '}
            <strong>{proxy.absent?.first_name} {proxy.absent?.last_name}</strong>
          </p>

          {proxyVote ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
              <CheckCircle size={24} className="text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Vote de procuration enregistré</p>
                <p className="text-sm text-green-600">
                  Voté : <strong>{proxyVote.vote_value.toUpperCase()}</strong>
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => submitVote('pour', true)}
                disabled={votingProxy}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all disabled:opacity-50"
              >
                <ThumbsUp size={22} className="text-green-600" />
                <span className="font-bold text-green-700 text-sm">POUR</span>
              </button>
              <button
                onClick={() => submitVote('contre', true)}
                disabled={votingProxy}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-50"
              >
                <ThumbsDown size={22} className="text-red-600" />
                <span className="font-bold text-red-700 text-sm">CONTRE</span>
              </button>
              <button
                onClick={() => submitVote('abstention', true)}
                disabled={votingProxy}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                <Minus size={22} className="text-gray-500" />
                <span className="font-bold text-gray-600 text-sm">ABSTENTION</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
