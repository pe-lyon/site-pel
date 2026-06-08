'use client'

import { useState, useEffect } from 'react'
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

function glassInput(): React.CSSProperties {
  return {
    background: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(4,67,154,0.15)',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
    color: '#1e293b',
  }
}

const CONTRIBUTEUR_ROLES = ['contributeur_journalisme', 'contributeur_agenda', 'contributeur_general']

export default function ContribuerPage() {
  const supabase = createClient()
  const [role, setRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Article form
  const [articleTitre, setArticleTitre] = useState('')
  const [articleContenu, setArticleContenu] = useState('')
  const [submittingArticle, setSubmittingArticle] = useState(false)

  // Evenement form
  const [evenTitre, setEvenTitre] = useState('')
  const [evenDate, setEvenDate] = useState('')
  const [evenDescription, setEvenDescription] = useState('')
  const [evenLieu, setEvenLieu] = useState('')
  const [submittingEven, setSubmittingEven] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setRole(data?.role ?? null)
      setLoading(false)
    }
    fetchProfile()
  }, [supabase])

  const canArticle = role === 'contributeur_journalisme' || role === 'contributeur_general'
  const canAgenda = role === 'contributeur_agenda' || role === 'contributeur_general'
  const isContributeur = role ? CONTRIBUTEUR_ROLES.includes(role) : false

  async function handleArticleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!articleTitre.trim() || !articleContenu.trim()) { toast.error('Titre et contenu requis'); return }
    setSubmittingArticle(true)
    const { error } = await supabase.from('actualites').insert({
      titre: articleTitre,
      contenu: articleContenu,
      statut: 'en_attente_validation',
      soumis_par: userId,
    })
    if (error) {
      toast.error('Erreur lors de la soumission')
    } else {
      toast.success('Article soumis ! Il sera examiné par l\'administration avant publication.')
      setArticleTitre('')
      setArticleContenu('')
    }
    setSubmittingArticle(false)
  }

  async function handleEvenementSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!evenTitre.trim() || !evenDate) { toast.error('Titre et date requis'); return }
    setSubmittingEven(true)
    const { error } = await supabase.from('evenements').insert({
      titre: evenTitre,
      date: evenDate,
      description: evenDescription,
      lieu: evenLieu,
      statut: 'en_attente_validation',
      soumis_par: userId,
    })
    if (error) {
      toast.error('Erreur lors de la soumission')
    } else {
      toast.success('Événement soumis ! Il sera examiné par l\'administration avant publication.')
      setEvenTitre('')
      setEvenDate('')
      setEvenDescription('')
      setEvenLieu('')
    }
    setSubmittingEven(false)
  }

  if (loading) {
    return <div style={{ padding: 40, color: '#94a3b8' }}>Chargement...</div>
  }

  if (!isContributeur) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 40 }}>
        <div style={{ ...glassCard(), padding: 32, textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: 16 }}>Vous n&apos;avez pas accès à cet espace.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#04439a', marginBottom: 8 }}>Espace contributeur</h1>
      <p style={{ color: '#64748b', marginBottom: 8 }}>Soumettez vos contributions pour examen par l&apos;administration.</p>
      <div style={{ background: 'rgba(4,67,154,0.08)', border: '1px solid rgba(4,67,154,0.15)', borderRadius: 10, padding: '10px 16px', marginBottom: 32, fontSize: 13, color: '#04439a' }}>
        Votre contribution sera examinée par l&apos;administration avant publication.
      </div>

      {canArticle && (
        <div style={{ ...glassCard(), padding: 28, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 20 }}>Soumettre un article</h2>
          <form onSubmit={handleArticleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Titre *</label>
              <input
                type="text"
                value={articleTitre}
                onChange={e => setArticleTitre(e.target.value)}
                placeholder="Titre de l'article"
                style={glassInput()}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Contenu *</label>
              <textarea
                value={articleContenu}
                onChange={e => setArticleContenu(e.target.value)}
                placeholder="Rédigez votre article ici..."
                rows={8}
                style={{ ...glassInput(), resize: 'vertical' }}
              />
            </div>
            <button
              type="submit"
              disabled={submittingArticle}
              style={{ background: submittingArticle ? '#94a3b8' : '#04439a', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: submittingArticle ? 'not-allowed' : 'pointer' }}
            >
              {submittingArticle ? 'Soumission...' : 'Soumettre l\'article'}
            </button>
          </form>
        </div>
      )}

      {canAgenda && (
        <div style={{ ...glassCard(), padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 20 }}>Soumettre un événement</h2>
          <form onSubmit={handleEvenementSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Titre *</label>
                <input
                  type="text"
                  value={evenTitre}
                  onChange={e => setEvenTitre(e.target.value)}
                  placeholder="Titre de l'événement"
                  style={glassInput()}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Date *</label>
                <input
                  type="date"
                  value={evenDate}
                  onChange={e => setEvenDate(e.target.value)}
                  style={glassInput()}
                />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Lieu</label>
              <input
                type="text"
                value={evenLieu}
                onChange={e => setEvenLieu(e.target.value)}
                placeholder="Lieu de l'événement"
                style={glassInput()}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Description</label>
              <textarea
                value={evenDescription}
                onChange={e => setEvenDescription(e.target.value)}
                placeholder="Décrivez l'événement..."
                rows={4}
                style={{ ...glassInput(), resize: 'vertical' }}
              />
            </div>
            <button
              type="submit"
              disabled={submittingEven}
              style={{ background: submittingEven ? '#94a3b8' : '#04439a', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: submittingEven ? 'not-allowed' : 'pointer' }}
            >
              {submittingEven ? 'Soumission...' : 'Soumettre l\'événement'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
