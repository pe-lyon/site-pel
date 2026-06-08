'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/layout/TopBar'
import { ClipboardList } from 'lucide-react'

interface MonVote {
  id: string
  vote_value: 'pour' | 'contre' | 'abstention'
  created_at: string
  is_proxy?: boolean
  vote_sessions: {
    title: string
    type_scrutin?: string | null
    bills?: { title: string } | null
  } | null
}

const glassCard = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 4px 24px rgba(4,67,154,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
  borderRadius: '1rem',
  padding: '1.5rem',
} as const

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function MesVotesPage() {
  const supabase = createClient()
  const [votes, setVotes] = useState<MonVote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }

        const { data } = await supabase
          .from('votes')
          .select('id, vote_value, created_at, is_proxy, vote_sessions(title, type_scrutin, bills(title))')
          .eq('voter_id', user.id)
          .order('created_at', { ascending: false })

        setVotes((data ?? []) as MonVote[])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  if (loading) {
    return (
      <div>
        <TopBar title="Mes votes" />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-pel-blue/30 border-t-pel-blue rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const total = votes.length
  const pour = votes.filter(v => v.vote_value === 'pour').length
  const contre = votes.filter(v => v.vote_value === 'contre').length
  const abstention = votes.filter(v => v.vote_value === 'abstention').length
  const pct = (v: number) => total > 0 ? Math.round((v / total) * 100) : 0

  return (
    <div>
      <TopBar title="Mes votes" />
      <div className="p-6 max-w-3xl space-y-6">

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div style={{ ...glassCard, textAlign: 'center', padding: '1rem' }}>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#04439a' }}>{total}</p>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>Total</p>
          </div>
          <div style={{ ...glassCard, textAlign: 'center', padding: '1rem', borderTop: '3px solid #22c55e' }}>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a' }}>{pct(pour)}%</p>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>Pour ({pour})</p>
          </div>
          <div style={{ ...glassCard, textAlign: 'center', padding: '1rem', borderTop: '3px solid #ef4444' }}>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626' }}>{pct(contre)}%</p>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>Contre ({contre})</p>
          </div>
          <div style={{ ...glassCard, textAlign: 'center', padding: '1rem', borderTop: '3px solid #d1d5db' }}>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#9ca3af' }}>{pct(abstention)}%</p>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>Abstention ({abstention})</p>
          </div>
        </div>

        {/* Liste des votes */}
        <div style={glassCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ClipboardList size={18} color="#04439a" />
            <h2 style={{ fontFamily: 'var(--font-titre)', fontWeight: 700, color: '#1e3a5f', fontSize: '1rem' }}>
              Historique de mes votes
            </h2>
          </div>

          {votes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <ClipboardList size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Aucun vote enregistré</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Vos votes apparaîtront ici après chaque scrutin.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {votes.map(vote => {
                const voteColor = vote.vote_value === 'pour' ? '#16a34a' : vote.vote_value === 'contre' ? '#dc2626' : '#9ca3af'
                const voteLabel = vote.vote_value === 'pour' ? 'Pour ✓' : vote.vote_value === 'contre' ? 'Contre ✗' : 'Abstention —'
                return (
                  <div key={vote.id} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.25rem', borderRadius: '0.75rem',
                    background: 'rgba(255,255,255,0.6)',
                    border: `1px solid ${voteColor}20`,
                    borderLeft: `4px solid ${voteColor}`,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: '#1f2937', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                        {vote.vote_sessions?.title ?? 'Scrutin'}
                      </p>
                      {vote.vote_sessions?.bills?.title && (
                        <p style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                          {vote.vote_sessions.bills.title}
                        </p>
                      )}
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                        {formatDate(vote.created_at)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '999px',
                        fontSize: '0.8rem', fontWeight: 700,
                        background: voteColor + '15', color: voteColor,
                      }}>
                        {voteLabel}
                      </span>
                      {vote.vote_sessions?.type_scrutin && (
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                          {vote.vote_sessions.type_scrutin === 'secret' ? '🔒 Secret' : '🔓 Public'}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
