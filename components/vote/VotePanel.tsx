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

  const fetchData = useCallback(async () => {
    const [
      { data: sessionData },
      { data: myVoteData },
      { data: proxyData },
    ] = await Promise.all([
      supabase.from('vote_sessions').select('*, bills(*)').eq('id', sessionId).single(),
      supabase.from('votes').select('*').eq('session_id', sessionId).eq('voter_id', userId).maybeSingle(),
      supabase.from('proxies').select('*, absent:profiles!absent_id(first_name, last_name)').eq('holder_id', userId).maybeSingle(),
    ])
    setSession(sessionData)
    setMyVote(myVoteData)
    setProxy(proxyData)

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
    return (
      <div className="card text-center py-12">
        <Clock size={40} className="mx-auto mb-3 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700">Vote terminé</h2>
        <p className="text-gray-400 text-sm mt-1">Ce scrutin est désormais clos.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
