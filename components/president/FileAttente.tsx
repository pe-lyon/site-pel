'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Mic, Trash2, RefreshCw } from 'lucide-react'

interface Demande {
  id: string
  nom: string
  userId: string
  createdAt: number
}

interface FileAttenteProps {
  seance?: string
}

export default function FileAttente({ seance = 'default' }: FileAttenteProps) {
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [loading, setLoading] = useState(false)

  const fetchDemandes = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard/parole?seance=${seance}`)
      const data = await res.json()
      setDemandes(data.demandes ?? [])
    } catch { /* ignore */ }
  }, [seance])

  useEffect(() => {
    fetchDemandes()
    const interval = setInterval(fetchDemandes, 5000)
    return () => clearInterval(interval)
  }, [fetchDemandes])

  async function handleRetirer(id: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/parole', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retirer', id, seance }),
      })
      if (!res.ok) { toast.error('Erreur'); return }
      toast.success('Parole accordée')
      setDemandes(prev => prev.filter(d => d.id !== id))
    } finally {
      setLoading(false)
    }
  }

  async function handleVider() {
    if (!confirm('Vider toute la file d\'attente ?')) return
    await fetch('/api/dashboard/parole', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'vider', seance }),
    })
    setDemandes([])
    toast.success('File vidée')
  }

  return (
    <div className="card" style={{ maxWidth: '500px' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mic size={20} className="text-pel-blue" />
          <h3 className="font-bold text-pel-blue" style={{ fontFamily: 'var(--font-titre)' }}>
            FILE D&apos;ATTENTE — PAROLE
          </h3>
          {demandes.length > 0 && (
            <span className="badge bg-pel-blue text-white">{demandes.length}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchDemandes} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Actualiser">
            <RefreshCw size={14} className="text-gray-400" />
          </button>
          {demandes.length > 0 && (
            <button onClick={handleVider} className="btn-outline text-xs" style={{ color: '#dc2626', borderColor: '#dc2626' }}>
              Vider
            </button>
          )}
        </div>
      </div>

      {demandes.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Aucune demande de parole en attente.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {demandes.map((d, i) => (
            <div key={d.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem', borderRadius: '0.75rem',
              background: i === 0 ? 'rgba(4,67,154,0.07)' : 'rgba(0,0,0,0.03)',
              border: i === 0 ? '1px solid rgba(4,67,154,0.2)' : '1px solid transparent',
            }}>
              <span style={{ fontWeight: 700, color: '#9ca3af', fontSize: '0.85rem', minWidth: '1.5rem' }}>
                {i + 1}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: '#1f2937', fontSize: '0.9rem' }}>{d.nom}</p>
                <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                  {new Date(d.createdAt).toLocaleTimeString('fr-FR')}
                </p>
              </div>
              <button
                onClick={() => handleRetirer(d.id)}
                disabled={loading}
                className="btn-primary text-xs flex items-center gap-1"
              >
                <Mic size={13} />
                Donner la parole
              </button>
              <button
                onClick={() => handleRetirer(d.id)}
                disabled={loading}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                title="Retirer"
              >
                <Trash2 size={14} className="text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
