'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    if (error) {
      toast.error('Une erreur est survenue')
    } else {
      setSent(true)
      toast.success('Email de réinitialisation envoyé')
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
          <span className="text-pel-blue font-black text-2xl">PEL</span>
        </div>
        <h1 className="text-white text-2xl font-bold">Mot de passe oublié</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Email envoyé !</h2>
            <p className="text-gray-500 text-sm mb-6">
              Vérifiez votre boîte mail et suivez les instructions pour réinitialiser votre mot de passe.
            </p>
            <Link href="/login" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft size={16} />
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-pel-blue text-xl font-bold mb-1">Réinitialisation</h2>
            <p className="text-gray-500 text-sm mb-6">
              Entrez votre adresse email pour recevoir un lien de réinitialisation.
            </p>

            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="label">Adresse email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.fr"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/login" className="text-sm text-pel-blue hover:underline inline-flex items-center gap-1">
                <ArrowLeft size={14} />
                Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
