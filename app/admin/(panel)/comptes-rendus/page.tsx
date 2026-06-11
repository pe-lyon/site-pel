'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, FileText, Upload, Loader2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface CompteRendu {
  id: string
  seance_titre: string
  date: string
  pdf_url: string
  nom: string
  seance_id?: string
  created_at: string
}

function glassCard(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: 'rgba(255,255,255,0.58)',
    backdropFilter: 'blur(18px) saturate(160%)',
    WebkitBackdropFilter: 'blur(18px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.72)',
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(4,67,154,0.08)',
    ...extra,
  }
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ComptesRendusAdmin() {
  const [items, setItems] = useState<CompteRendu[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    seance_titre: '',
    date: new Date().toISOString().slice(0, 10),
    nom: '',
    pdf_url: '',
  })

  useEffect(() => {
    fetch('/api/admin/comptes-rendus')
      .then(r => r.json())
      .then(d => { setItems(d.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') return toast.error('Seuls les PDFs sont acceptés')
    if (file.size > 20 * 1024 * 1024) return toast.error('Fichier trop lourd (max 20 Mo)')

    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', 'comptes-rendus')
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm(f => ({ ...f, pdf_url: data.url, nom: f.nom || file.name.replace('.pdf', '') }))
      toast.success('PDF uploadé !')
    } catch (err: any) {
      toast.error(err.message || 'Erreur upload')
    } finally {
      setUploading(false)
    }
  }

  async function handleAdd() {
    if (!form.pdf_url || !form.seance_titre) return toast.error('Titre et PDF requis')
    setSaving(true)
    try {
      const res = await fetch('/api/admin/comptes-rendus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seance_titre: form.seance_titre,
          date: form.date,
          pdf_url: form.pdf_url,
          nom: form.nom || form.seance_titre,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setItems(prev => [data.data, ...prev])
      setForm({ seance_titre: '', date: new Date().toISOString().slice(0, 10), nom: '', pdf_url: '' })
      setShowForm(false)
      toast.success('Compte-rendu ajouté !')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce compte-rendu ?')) return
    try {
      await fetch('/api/admin/comptes-rendus', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setItems(prev => prev.filter(c => c.id !== id))
      toast.success('Supprimé')
    } catch {
      toast.error('Erreur')
    }
  }

  return (
    <div style={{ padding: 'clamp(1rem, 3vw, 2rem)', maxWidth: 800 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', color: '#1e3a5f', fontWeight: 800, margin: 0 }}>
            📋 Comptes-rendus de séances
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '4px 0 0', fontFamily: 'var(--font-corps)' }}>
            PDFs téléchargeables affichés publiquement sur /seances
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none',
            background: 'var(--pel-bleu)', color: 'white',
            fontFamily: 'var(--font-corps)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
          }}
        >
          <Plus size={16} /> Ajouter un PDF
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ ...glassCard({ padding: '1.5rem', marginBottom: '1.5rem' }) }}>
          <h3 style={{ fontFamily: 'var(--font-titre)', color: '#1e3a5f', marginBottom: '1.25rem', fontWeight: 700 }}>
            Nouveau compte-rendu
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', fontFamily: 'var(--font-corps)' }}>
                Titre de la séance *
              </label>
              <input
                value={form.seance_titre}
                onChange={e => setForm(f => ({ ...f, seance_titre: e.target.value }))}
                placeholder="ex: Séance plénière n°12 — juin 2025"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(4,67,154,0.15)', background: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-corps)', fontSize: 14, marginTop: 4, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', fontFamily: 'var(--font-corps)' }}>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(4,67,154,0.15)', background: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-corps)', fontSize: 14, marginTop: 4, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', fontFamily: 'var(--font-corps)' }}>Nom affiché</label>
              <input
                value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                placeholder="Nom du fichier (optionnel)"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(4,67,154,0.15)', background: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-corps)', fontSize: 14, marginTop: 4, boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Upload PDF */}
          <div style={{ marginTop: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', fontFamily: 'var(--font-corps)' }}>Fichier PDF *</label>
            {form.pdf_url ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 6, padding: '0.75rem 1rem', borderRadius: 8, background: '#f0fdf4', border: '1.5px solid #86efac' }}>
                <FileText size={18} style={{ color: '#16a34a' }} />
                <span style={{ fontSize: '0.85rem', color: '#166534', fontFamily: 'var(--font-corps)', flex: 1, wordBreak: 'break-all' }}>
                  PDF uploadé ✓
                </span>
                <button onClick={() => setForm(f => ({ ...f, pdf_url: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '0.8rem' }}>
                  Changer
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                style={{ marginTop: 6, padding: '1.5rem', borderRadius: 8, border: '2px dashed rgba(4,67,154,0.2)', cursor: 'pointer', textAlign: 'center', background: uploading ? 'rgba(4,67,154,0.03)' : 'transparent' }}
              >
                {uploading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#04439a' }}>
                    <Loader2 size={18} className="animate-spin" /> Upload en cours...
                  </div>
                ) : (
                  <>
                    <Upload size={24} style={{ color: '#9ca3af', margin: '0 auto 0.5rem' }} />
                    <p style={{ fontFamily: 'var(--font-corps)', color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
                      Cliquez pour uploader un PDF (max 20 Mo)
                    </p>
                  </>
                )}
              </div>
            )}
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontFamily: 'var(--font-corps)' }}>
              Annuler
            </button>
            <button
              onClick={handleAdd}
              disabled={saving || !form.pdf_url || !form.seance_titre}
              style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', background: 'var(--pel-bleu)', color: 'white', cursor: 'pointer', fontFamily: 'var(--font-corps)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {saving && <Loader2 size={14} className="animate-spin" />} Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>Chargement...</div>
      ) : items.length === 0 ? (
        <div style={{ ...glassCard({ padding: '3rem', textAlign: 'center' }) }}>
          <FileText size={40} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
          <p style={{ color: '#9ca3af', fontFamily: 'var(--font-corps)' }}>Aucun compte-rendu pour l'instant.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map(item => (
            <div key={item.id} style={{ ...glassCard({ padding: '1.25rem' }), display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={22} style={{ color: '#dc2626' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--font-titre)', fontWeight: 700, color: '#1e3a5f', margin: 0, fontSize: '0.95rem' }}>
                  {item.nom || item.seance_titre}
                </p>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', fontFamily: 'var(--font-corps)', margin: '2px 0 0' }}>
                  {formatDate(item.date)} · {item.seance_titre}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <a href={item.pdf_url} target="_blank" rel="noreferrer"
                  style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid rgba(4,67,154,0.2)', background: 'rgba(4,67,154,0.05)', color: 'var(--pel-bleu)', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ExternalLink size={13} /> Voir
                </a>
                <button onClick={() => handleDelete(item.id)}
                  style={{ padding: '0.4rem 0.6rem', borderRadius: 8, border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.05)', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
