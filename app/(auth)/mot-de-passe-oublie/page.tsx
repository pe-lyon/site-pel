
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
    <div className="min-h-screen flex items-center justify-center p-8 relative" style={{ background: '#eef2ff' }}>
      {/* Fond orbs */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 10% 5%, rgba(4,67,154,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 95%, rgba(178,29,11,0.08) 0%, transparent 60%), #eef2ff'
      }} aria-hidden="true">
        <div className="animate-orb" style={{ position: 'absolute', width: 700, height: 700, top: '-15%', left: '-5%', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', filter: 'blur(80px)', background: 'radial-gradient(circle, rgba(4,67,154,0.18) 0%, transparent 70%)' }} />
        <div className="animate-orb-reverse" style={{ position: 'absolute', width: 600, height: 600, bottom: '-10%', right: '-10%', borderRadius: '40% 60% 70% 30% / 40% 70% 30% 60%', filter: 'blur(70px)', background: 'radial-gradient(circle, rgba(178,29,11,0.12) 0%, transparent 70%)' }} />
        <div className="animate-float-slow" style={{ position: 'absolute', width: 400, height: 400, top: '30%', left: '50%', borderRadius: '50%', filter: 'blur(90px)', background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md" style={{ zIndex: 1 }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4" style={{
            background: 'rgba(255,255,255,0.70)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.85)',
            boxShadow: '0 4px 20px rgba(4,67,154,0.12)',
          }}>
            <span className="text-pel-blue font-black text-2xl">PEL</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--pel-bleu)' }}>Mot de passe oublié</h1>
        </div>

        {/* Glass card */}
        <div style={{
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.80)',
          borderRadius: '1.5rem',
          boxShadow: '0 8px 40px rgba(4,67,154,0.10), 0 1px 0 rgba(255,255,255,0.9) inset',
          padding: '2rem',
        }}>
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
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--pel-bleu)' }}>Réinitialisation</h2>
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
                      required
                      style={{
                        width: '100%',
                        paddingLeft: '2.5rem',
                        paddingRight: '0.875rem',
                        paddingTop: '0.65rem',
                        paddingBottom: '0.65rem',
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
    </div>
  )
}
