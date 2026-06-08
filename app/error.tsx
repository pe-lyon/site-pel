'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Global Error]', error.message, error.stack)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--pel-creme)' }}>
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#fef3c7' }}>
            <AlertTriangle size={36} style={{ color: '#d97706' }} />
          </div>
        </div>

        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: '2rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>
          ERREUR INATTENDUE
        </h1>
        <p className="text-gray-500 mt-2 mb-8 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>
          Une erreur s&apos;est produite. Veuillez réessayer ou retourner à l&apos;accueil.
        </p>

        {error?.message && (
          <div className="bg-white border border-red-100 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Détail</p>
            <p className="text-sm text-gray-700 font-mono break-all">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary flex items-center justify-center gap-2 py-3 px-6">
            <RefreshCw size={16} /> Réessayer
          </button>
          <Link href="/" className="btn-outline flex items-center justify-center gap-2 py-3 px-6">
            <Home size={16} /> Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
