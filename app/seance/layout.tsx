import Link from 'next/link'
import Image from 'next/image'

export default function SeanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--pel-creme)' }}>
      <header style={{ background: 'var(--pel-bleu)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image src="/logo-pel.png" alt="PEL" width={32} height={32} style={{ filter: 'brightness(0) invert(1)' }} />
              <div>
                <p className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-titre)', letterSpacing: '0.05em' }}>PLATEFORME PARLEMENTAIRE</p>
                <p className="text-blue-200 text-xs" style={{ fontFamily: 'var(--font-corps)' }}>Session 2026-2027</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-blue-200 hover:text-white text-sm transition-colors" style={{ fontFamily: 'var(--font-corps)' }}>
                ← Retour au site
              </Link>
              <Link href="/login" className="btn-primary text-sm py-2">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
