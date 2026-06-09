'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import TurnstileWidget from '@/components/TurnstileWidget'

export default function AdminLoginPage() {
  const [identifiant, setIdentifiant] = useState('')
  const [password, setPassword] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [loading, setLoading] = useState(false)
  const hasTurnstile = !!(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY !== 'CONFIGURE_ME')
  const supabase = createClient()

  const onTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // Étape 1 : vérification sécurité
      const check = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turnstileToken, honeypot }),
      })
      const checkJson = await check.json()
      if (!check.ok) {
        toast.error(checkJson.error ?? 'Vérification échouée')
        setLoading(false)
        return
      }

      // Étape 2 : auth Supabase côté client
      const email = identifiant.includes('@') ? identifiant : `${identifiant.trim().toLowerCase()}@assemblee-pel.fr`
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) {
        toast.error('Identifiants incorrects')
        setLoading(false)
        return
      }

      // Vérifier le rôle admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role !== 'president_seance') {
        await supabase.auth.signOut()
        toast.error("Accès non autorisé à l'espace administration")
        setLoading(false)
        return
      }

      window.location.href = '/admin'
    } catch {
      toast.error('Erreur réseau, réessayez.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: '#f1f5f9' }}
    >
      <div className="w-full max-w-sm">

        {/* En-tête */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
            style={{ background: 'var(--pel-bleu)' }}
          >
            <Lock size={24} color="white" />
          </div>
          <h1
            className="text-gray-900 font-bold text-xl"
            style={{ fontFamily: 'var(--font-corps)' }}
          >
            Administration du site
          </h1>
          <p className="text-gray-500 text-sm mt-1" style={{ fontFamily: 'var(--font-corps)' }}>
            Parlement des Étudiants de Lyon
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Honeypot — invisible pour les humains */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={e => setHoneypot(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
            />

            <div>
              <label className="label">Identifiant</label>
              <input
                type="text"
                value={identifiant}
                onChange={e => setIdentifiant(e.target.value)}
                placeholder="admin"
                className="input-field"
                required
                autoFocus
                autoComplete="username"
              />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
                autoComplete="current-password"
              />
            </div>

            <TurnstileWidget onVerify={onTurnstileVerify} />

            <button
              type="submit"
              disabled={loading || (hasTurnstile && !turnstileToken)}
              className="btn-secondary w-full py-2.5 mt-2"
            >
              {loading ? 'Connexion...' : hasTurnstile && !turnstileToken ? 'Vérification...' : 'Accéder au panel →'}
            </button>
          </form>
        </div>

        {/* Liens bas */}
        <div className="text-center mt-6 space-y-2">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors block"
            style={{ fontFamily: 'var(--font-corps)' }}
          >
            ← Retour au site
          </Link>
          <Link
            href="/login"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors block"
            style={{ fontFamily: 'var(--font-corps)' }}
          >
            Espace parlementaire →
          </Link>
        </div>
      </div>
    </div>
  )
}
