'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
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

    // Vérifier que c'est bien le compte admin du site
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'president_seance') {
      await supabase.auth.signOut()
      toast.error('Accès non autorisé à l\'espace administration')
      setLoading(false)
      return
    }

    // Redirection directe vers le panel admin
    window.location.href = '/admin'
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
            <div>
              <label className="label">Email administrateur</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@assemblee-pel.fr"
                className="input-field"
                required
                autoFocus
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
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-secondary w-full py-2.5 mt-2"
            >
              {loading ? 'Connexion...' : 'Accéder au panel →'}
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
