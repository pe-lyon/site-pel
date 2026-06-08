'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error.message, error.stack)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--pel-creme)' }}>
      <div className="w-full max-w-lg">
        {/* Icône */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#fef3c7' }}>
            <AlertTriangle size={36} style={{ color: '#d97706' }} />
          </div>
        </div>

        {/* Titre */}
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: '2rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>
            UNE ERREUR EST SURVENUE
          </h1>
          <p className="text-gray-500 mt-2 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>
            Le tableau de bord a rencontré un problème inattendu.
          </p>
        </div>

        {/* Détail de l'erreur */}
        {error?.message && (
          <div className="bg-white border border-red-100 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-corps)' }}>
              Détail technique
            </p>
            <p className="text-sm text-gray-700 font-mono break-all">{error.message}</p>
            {error.digest && (
              <p className="text-xs text-gray-400 mt-2">Code : {error.digest}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
          <Link
            href="/dashboard"
            className="btn-outline flex-1 flex items-center justify-center gap-2 py-3"
          >
            <Home size={16} />
            Tableau de bord
          </Link>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1"
            style={{ fontFamily: 'var(--font-corps)' }}
          >
            <ArrowLeft size={14} />
            Se reconnecter
          </Link>
        </div>
      </div>
    </div>
  )
}
