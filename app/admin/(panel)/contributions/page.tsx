'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function glassCard(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(16px) saturate(160%)',
    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.7)',
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(4,67,154,0.08)',
    ...extra,
  }
}

interface Contribution {
  id: string
  titre: string
  statut: string
  created_at: string
  type: 'article' | 'evenement'
  soumis_par: string | null
  auteur_prenom: string | null
  auteur_nom: string | null
}

export default function ContributionsPage() {
  const supabase = createClient()
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [refusCommentaire, setRefusCommentaire] = useState<{ [id: string]: string }>({})
  const [showRefus, setShowRefus] = useState<{ [id: string]: boolean }>({})
  const [processing, setProcessing] = useState<{ [id: string]: boolean }>({})

  const fetchContributions = useCallback(async () => {
    setLoading(true)
    const [actuRes, evenRes] = await Promise.all([
      supabase
        .from('actualites')
        .select('id, titre, statut, created_at, soumis_par, profiles:soumis_par(first_name, last_name)')
        .eq('statut', 'en_attente_validation'),
      supabase
        .from('evenements')
        .select('id, titre, statut, created_at, soumis_par, profiles:soumis_par(first_name, last_name)')
        .eq('statut', 'en_attente_validation'),
    ])

    const articles: Contribution[] = (actuRes.data ?? []).map((a: Record<string, unknown>) => {
      const profile = a.profiles as { first_name?: string; last_name?: string } | null
      return {
        id: a.id as string,
        titre: a.titre as string,
        statut: a.statut as string,
        created_at: a.created_at as string,
        type: 'article' as const,
        soumis_par: a.soumis_par as string | null,
        auteur_prenom: profile?.first_name ?? null,
        auteur_nom: profile?.last_name ?? null,
      }
    })

    const evenements: Contribution[] = (evenRes.data ?? []).map((e: Record<string, unknown>) => {
      const profile = e.profiles as { first_name?: string; last_name?: string } | null
      return {
        id: e.id as string,
        titre: e.titre as string,
        statut: e.statut as string,
        created_at: e.created_at as string,
        type: 'evenement' as const,
        soumis_par: e.soumis_par as string | null,
        auteur_prenom: profile?.first_name ?? null,
        auteur_nom: profile?.last_name ?? null,
      }
    })

    setContributions([...articles, ...evenements].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchContributions()
  }, [fetchContributions])

  async function handleApprouver(contrib: Contribution) {
    setProcessing(prev => ({ ...prev, [contrib.id]: true }))
    const { data: { user } } = await supabase.auth.getUser()
    const table = contrib.type === 'article' ? 'actualites' : 'evenements'
    const { error } = await supabase.from(table).update({ statut: 'publie', valide_par: user?.id }).eq('id', contrib.id)
    if (error) {
      toast.error('Erreur lors de l\'approbation')
    } else {
      toast.success('Contribution approuvée et publiée')
      setContributions(prev => prev.filter(c => c.id !== contrib.id))
    }
    setProcessing(prev => ({ ...prev, [contrib.id]: false }))
  }

  async function handleRefuser(contrib: Contribution) {
    const commentaire = refusCommentaire[contrib.id] ?? ''
    if (!commentaire.trim()) {
      toast.error('Veuillez indiquer un motif de refus')
      return
    }
    setProcessing(prev => ({ ...prev, [contrib.id]: true }))
    const { data: { user } } = await supabase.auth.getUser()
    const table = contrib.type === 'article' ? 'actualites' : 'evenements'
    const { error } = await supabase.from(table).update({ statut: 'refuse', valide_par: user?.id, commentaire_admin: commentaire }).eq('id', contrib.id)
    if (error) {
      toast.error('Erreur lors du refus')
    } else {
      toast.success('Contribution refusée')
      setContributions(prev => prev.filter(c => c.id !== contrib.id))
    }
    setProcessing(prev => ({ ...prev, [contrib.id]: false }))
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#04439a', marginBottom: 8 }}>Contributions en attente</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Examinez et approuvez ou refusez les contenus soumis par les contributeurs.</p>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Chargement...</p>
      ) : contributions.length === 0 ? (
        <div style={{ ...glassCard(), padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: '#64748b' }}>Aucune contribution en attente de validation.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {contributions.map(contrib => (
            <div key={contrib.id} style={{ ...glassCard(), padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{
                      background: contrib.type === 'article' ? 'rgba(4,67,154,0.1)' : 'rgba(178,29,11,0.1)',
                      color: contrib.type === 'article' ? '#04439a' : '#b21d0b',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {contrib.type === 'article' ? 'Article' : 'Événement'}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>
                      {new Date(contrib.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: '0 0 4px' }}>{contrib.titre}</h3>
                  {contrib.auteur_prenom && (
                    <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                      Soumis par : {contrib.auteur_prenom} {contrib.auteur_nom}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => handleApprouver(contrib)}
                    disabled={processing[contrib.id]}
                    style={{
                      background: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: processing[contrib.id] ? 'not-allowed' : 'pointer',
                      opacity: processing[contrib.id] ? 0.7 : 1,
                    }}
                  >
                    ✅ Approuver
                  </button>
                  <button
                    onClick={() => setShowRefus(prev => ({ ...prev, [contrib.id]: !prev[contrib.id] }))}
                    disabled={processing[contrib.id]}
                    style={{
                      background: '#b21d0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: processing[contrib.id] ? 'not-allowed' : 'pointer',
                      opacity: processing[contrib.id] ? 0.7 : 1,
                    }}
                  >
                    ❌ Refuser
                  </button>
                </div>
              </div>
              {showRefus[contrib.id] && (
                <div style={{ marginTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Motif du refus *</label>
                  <textarea
                    value={refusCommentaire[contrib.id] ?? ''}
                    onChange={e => setRefusCommentaire(prev => ({ ...prev, [contrib.id]: e.target.value }))}
                    placeholder="Expliquez pourquoi cette contribution est refusée..."
                    rows={3}
                    style={{
                      background: 'rgba(255,255,255,0.6)',
                      border: '1px solid rgba(4,67,154,0.15)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 14,
                      width: '100%',
                      resize: 'vertical',
                      color: '#1e293b',
                      marginBottom: 10,
                    }}
                  />
                  <button
                    onClick={() => handleRefuser(contrib)}
                    disabled={processing[contrib.id]}
                    style={{ background: '#b21d0b', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Confirmer le refus
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
