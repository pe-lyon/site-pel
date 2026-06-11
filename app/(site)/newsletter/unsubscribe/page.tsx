'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SiteHero from '@/components/site/SiteHero'
import { Check, Loader2 } from 'lucide-react'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function handleUnsubscribe() {
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/public/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('done')
        setMsg('Tu as bien été désinscrit·e de la newsletter.')
      } else {
        setStatus('error')
        setMsg(data.error ?? 'Une erreur est survenue')
      }
    } catch {
      setStatus('error')
      setMsg('Erreur réseau')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.75)',
        boxShadow: '0 4px 24px rgba(4,67,154,0.07)',
        borderRadius: '1.5rem',
        padding: '2.5rem',
        textAlign: 'center',
      }}>
        {status === 'done' ? (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Check size={28} style={{ color: '#16a34a' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-corps)', color: '#166534', fontWeight: 600 }}>{msg}</p>
          </>
        ) : (
          <>
            <h2 style={{ fontFamily: 'var(--font-titre)', color: 'var(--pel-bleu)', fontSize: '1.3rem', marginBottom: '0.75rem' }}>
              Se désabonner
            </h2>
            <p style={{ fontFamily: 'var(--font-corps)', color: '#374151', marginBottom: '1.5rem' }}>
              Confirmes-tu la désinscription de <strong>{email ?? '?'}</strong> ?
            </p>
            {status === 'error' && <p style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: '1rem' }}>{msg}</p>}
            <button
              onClick={handleUnsubscribe}
              disabled={status === 'loading' || !email}
              style={{
                background: '#dc2626', color: 'white', border: 'none', padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem', fontFamily: 'var(--font-corps)', fontWeight: 600,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              }}
            >
              {status === 'loading' && <Loader2 size={16} className="animate-spin" />}
              Confirmer la désinscription
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <div>
      <SiteHero badge="Newsletter" title="Désinscription" description="" />
      <Suspense fallback={<div className="py-20 text-center">Chargement...</div>}>
        <UnsubscribeContent />
      </Suspense>
    </div>
  )
}
