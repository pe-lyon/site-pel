'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'

const DOMAIN = '@assemblee-pel.fr'
const toEmail = (identifiant: string) =>
  identifiant.includes('@') ? identifiant : `${identifiant.trim().toLowerCase()}${DOMAIN}`

export default function LoginPage() {
  const [identifiant, setIdentifiant] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const email = toEmail(identifiant)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Identifiants incorrects')
      setLoading(false)
      return
    }

    const next = new URLSearchParams(window.location.search).get('next')
    const destination = next ?? '/dashboard'
    window.location.href = destination
  }

  return (
    <div className="min-h-screen flex relative" style={{ background: '#eef2ff' }}>
      {/* Fond orbs */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 10% 5%, rgba(4,67,154,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 95%, rgba(178,29,11,0.08) 0%, transparent 60%), #eef2ff'
      }} aria-hidden="true">
        <div className="animate-orb" style={{ position: 'absolute', width: 700, height: 700, top: '-15%', left: '-5%', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', filter: 'blur(80px)', background: 'radial-gradient(circle, rgba(4,67,154,0.18) 0%, transparent 70%)' }} />
        <div className="animate-orb-reverse" style={{ position: 'absolute', width: 600, height: 600, bottom: '-10%', right: '-10%', borderRadius: '40% 60% 70% 30% / 40% 70% 30% 60%', filter: 'blur(70px)', background: 'radial-gradient(circle, rgba(178,29,11,0.12) 0%, transparent 70%)' }} />
        <div className="animate-float-slow" style={{ position: 'absolute', width: 400, height: 400, top: '30%', left: '50%', borderRadius: '50%', filter: 'blur(90px)', background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)' }} />
      </div>

      {/* Moitié gauche — visuel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-16 relative overflow-hidden" style={{ zIndex: 1 }}>
        <div className="relative z-10 text-center">
          <Image src="/logo-pel.png" alt="PEL" width={100} height={100} className="mx-auto mb-8" style={{ filter: 'drop-shadow(0 4px 24px rgba(4,67,154,0.25))' }} />

          <div className="mb-8">
            <svg viewBox="0 0 300 200" className="w-64 mx-auto">
              <path d="M 20 160 A 130 130 0 0 1 280 160" fill="none" stroke="rgba(4,67,154,0.4)" strokeWidth="2"/>
              <path d="M 45 160 A 105 105 0 0 1 255 160" fill="none" stroke="rgba(4,67,154,0.3)" strokeWidth="1.5"/>
              <path d="M 70 160 A 80 80 0 0 1 230 160" fill="none" stroke="rgba(4,67,154,0.3)" strokeWidth="1.5"/>
              {Array.from({length: 18}, (_, i) => {
                const row = Math.floor(i / 6); const idx = i % 6
                const r = 130 - row * 25
                const angle = Math.PI + (idx / 5) * Math.PI
                const x = 150 + r * Math.cos(angle); const y = 160 + r * Math.sin(angle)
                const colors = ['#b21d0b','#059669','#d97706','#7c3aed']
                return <circle key={i} cx={x} cy={y} r={7} fill={colors[Math.floor(i / 4) % 4]} opacity={0.85}/>
              })}
              <ellipse cx="150" cy="170" rx="22" ry="9" fill="rgba(4,67,154,0.90)"/>
              <text x="150" y="173" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">PRÉSIDENCE</text>
            </svg>
          </div>

          <h1 className="mb-3" style={{ fontFamily: 'var(--font-titre)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--pel-bleu)' }}>ESPACE PARLEMENTAIRE</h1>
          <p className="text-sm max-w-xs mx-auto" style={{ fontFamily: 'var(--font-corps)', color: 'rgba(4,67,154,0.65)' }}>
            Accès réservé aux membres du Parlement des Étudiants de Lyon
          </p>
        </div>
      </div>

      {/* Moitié droite — formulaire glass */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ zIndex: 1 }}>
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <Image src="/logo-pel.png" alt="PEL" width={64} height={64} className="mx-auto mb-3" />
            <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.4rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>ESPACE PARLEMENTAIRE</p>
          </div>

          {/* Glass card */}
          <div style={{
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.80)',
            borderRadius: '1.5rem',
            boxShadow: '0 8px 40px rgba(4,67,154,0.10), 0 1px 0 rgba(255,255,255,0.9) inset',
            padding: '2.5rem',
          }}>
            <div className="mb-8">
              <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '2rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>SE CONNECTER</h2>
              <p className="text-gray-500 text-sm mt-1" style={{ fontFamily: 'var(--font-corps)' }}>Entrez vos identifiants parlementaires</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="label">Identifiant</label>
                <input
                  type="text"
                  value={identifiant}
                  onChange={e => setIdentifiant(e.target.value)}
                  placeholder="prenom.nom"
                  required
                  autoComplete="username"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.875rem',
                    background: 'rgba(255,255,255,0.70)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(4,67,154,0.18)',
                    borderRadius: '0.625rem',
                    fontSize: '0.875rem',
                    color: '#1a1a2e',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(4,67,154,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(4,67,154,0.08)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(4,67,154,0.18)'; e.target.style.boxShadow = 'none' }}
                />
                <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'var(--font-corps)' }}>
                  Format : <span className="font-medium">prenom.nom</span> (sans accent, sans majuscule)
                </p>
              </div>
              <div>
                <label className="label">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.875rem',
                    background: 'rgba(255,255,255,0.70)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(4,67,154,0.18)',
                    borderRadius: '0.625rem',
                    fontSize: '0.875rem',
                    color: '#1a1a2e',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(4,67,154,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(4,67,154,0.08)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(4,67,154,0.18)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? 'Connexion...' : 'Se connecter →'}
              </button>
            </form>

            <div className="mt-6 pt-6 space-y-3 text-center" style={{ borderTop: '1px solid rgba(4,67,154,0.10)' }}>
              <Link href="/seance" className="text-sm text-gray-400 hover:text-[#04439a] transition-colors block" style={{ fontFamily: 'var(--font-corps)' }}>
                Accéder à la séance en cours sans connexion →
              </Link>
              <Link href="/" className="text-sm text-gray-400 hover:text-[#04439a] transition-colors block" style={{ fontFamily: 'var(--font-corps)' }}>
                ← Retour au site du PEL
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
