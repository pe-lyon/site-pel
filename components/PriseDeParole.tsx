'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface PriseDeParoleProps {
  nom: string
  userId: string
  seance?: string
}

export default function PriseDeParole({ nom, userId, seance = 'default' }: PriseDeParoleProps) {
  const [loading, setLoading] = useState(false)
  const [demandeFaite, setDemandeFaite] = useState(false)

  async function handleDemander() {
    if (demandeFaite) return
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/parole', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demander', nom, userId, seance }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409) {
          toast.error('Vous avez déjà demandé la parole')
          setDemandeFaite(true)
        } else {
          toast.error(data.error ?? 'Erreur')
        }
        return
      }
      toast.success('Demande enregistrée ✋')
      setDemandeFaite(true)
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDemander}
      disabled={loading || demandeFaite}
      className={demandeFaite ? 'btn-secondary' : 'btn-primary'}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
    >
      ✋ {demandeFaite ? 'Demande envoyée' : loading ? 'Envoi…' : 'Demander la parole'}
    </button>
  )
}
