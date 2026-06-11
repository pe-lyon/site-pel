'use client'
import { useState } from 'react'
import { Mail, Check, Loader2 } from 'lucide-react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [prenom, setPrenom] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/public/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, prenom }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMsg(data.error ?? 'Une erreur est survenue')
      } else {
        setStatus('success')
        setMsg(
          data.message === 'already_subscribed'
            ? 'Tu es déjà abonné·e à la newsletter !'
            : 'Inscription réussie ! Vérifie ta boîte mail 📬'
        )
      }
    } catch {
      setStatus('error')
      setMsg('Erreur réseau, réessaie plus tard.')
    }
  }

  if (status === 'success') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
        padding: '2rem', textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={28} style={{ color: '#16a34a' }} />
        </div>
        <p style={{ fontFamily: 'var(--font-corps)', color: '#166534', fontWeight: 600, fontSize: '1rem' }}>
          {msg}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <input
        type="text"
        placeholder="Ton prénom (facultatif)"
        value={prenom}
        onChange={e => setPrenom(e.target.value)}
        style={{
          padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1.5px solid rgba(4,67,154,0.15)',
          background: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-corps)', fontSize: '0.95rem',
          color: '#1e293b', outline: 'none',
        }}
      />
      <input
        type="email"
        placeholder="Ton adresse email *"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{
          padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1.5px solid rgba(4,67,154,0.15)',
          background: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-corps)', fontSize: '0.95rem',
          color: '#1e293b', outline: 'none',
        }}
      />
      {status === 'error' && (
        <p style={{ color: '#dc2626', fontSize: '0.85rem', fontFamily: 'var(--font-corps)', margin: 0 }}>
          {msg}
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'loading' || !email}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          padding: '0.875rem 1.5rem', borderRadius: '0.75rem', border: 'none',
          background: status === 'loading' ? '#93c5fd' : 'var(--pel-bleu)',
          color: 'white', fontFamily: 'var(--font-corps)', fontSize: '1rem', fontWeight: 700,
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s, transform 0.2s',
        }}
      >
        {status === 'loading' ? (
          <><Loader2 size={18} className="animate-spin" /> Inscription en cours...</>
        ) : (
          <><Mail size={18} /> S'abonner gratuitement</>
        )}
      </button>
      <p style={{ fontSize: '0.78rem', color: '#9ca3af', textAlign: 'center', fontFamily: 'var(--font-corps)', margin: 0 }}>
        Pas de spam. Désinscription en un clic à tout moment.
      </p>
    </form>
  )
}
