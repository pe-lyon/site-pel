'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Identifiants incorrects')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--pel-bleu)' }}>
      {/* Moitié gauche — visuel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-16 relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-10"><defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>

        <div className="relative z-10 text-center text-white">
          <Image src="/logo-pel.png" alt="PEL" width={100} height={100} className="mx-auto mb-8" style={{ filter: 'brightness(0) invert(1)' }} />

          <div className="mb-8">
            <svg viewBox="0 0 300 200" className="w-64 mx-auto">
              <path d="M 20 160 A 130 130 0 0 1 280 160" fill="none" stroke="white" strokeWidth="2" opacity="0.3"/>
              <path d="M 45 160 A 105 105 0 0 1 255 160" fill="none" stroke="white" strokeWidth="1.5" opacity="0.2"/>
              <path d="M 70 160 A 80 80 0 0 1 230 160" fill="none" stroke="white" strokeWidth="1.5" opacity="0.2"/>
              {Array.from({length: 18}, (_, i) => {
                const row = Math.floor(i / 6); const idx = i % 6
                const r = 130 - row * 25
                const angle = Math.PI + (idx / 5) * Math.PI
                const x = 150 + r * Math.cos(angle); const y = 160 + r * Math.sin(angle)
                const colors = ['#b21d0b','#059669','#d97706','#7c3aed']
                return <circle key={i} cx={x} cy={y} r={7} fill={colors[Math.floor(i / 4) % 4]} opacity={0.9}/>
              })}
              <ellipse cx="150" cy="170" rx="22" ry="9" fill="white" opacity="0.9"/>
              <text x="150" y="173" textAnchor="middle" fill="#04439a" fontSize="5" fontWeight="bold">PRÉSIDENCE</text>
            </svg>
          </div>

          <h1 className="text-white mb-3" style={{ fontFamily: 'var(--font-titre)', fontSize: '2.2rem', fontWeight: 700 }}>ESPACE PARLEMENTAIRE</h1>
          <p className="text-blue-200 text-sm max-w-xs mx-auto" style={{ fontFamily: 'var(--font-corps)' }}>
            Accès réservé aux membres du Parlement des Étudiants de Lyon
          </p>
        </div>
      </div>

      {/* Moitié droite — formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <Image src="/logo-pel.png" alt="PEL" width={64} height={64} className="mx-auto mb-3" />
            <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.4rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>ESPACE PARLEMENTAIRE</p>
          </div>

          <div className="mb-8">
            <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '2rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>SE CONNECTER</h2>
            <p className="text-gray-500 text-sm mt-1" style={{ fontFamily: 'var(--font-corps)' }}>Entrez vos identifiants parlementaires</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label">Adresse email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" className="input-field" required />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-field" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-center">
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
  )
}
