'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Accueil' },
  { href: '/presentation', label: 'Présentation' },
  { href: '/bureau', label: 'Bureau' },
  { href: '/groupes', label: 'Groupes' },
  { href: '/actualites', label: 'Actualités' },
  { href: '/agenda', label: 'Agenda' },
  { href: '/ressources', label: 'Ressources' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white shadow-md border-b-2 border-[#04439a]' : 'bg-white/95 backdrop-blur-sm'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <Image src="/logo-pel.png" alt="PE de Lyon" width={40} height={40} className="rounded-lg" />
            <div className="hidden sm:block">
              <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.1rem', color: 'var(--pel-bleu)', fontWeight: 700, lineHeight: 1.1 }}>PE DE LYON</p>
              <p className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-corps)' }}>Parlement des Étudiants</p>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map(item => (
              <Link key={item.href} href={item.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#04439a] hover:bg-[#e8f0fb] rounded-md transition-colors"
                style={{ fontFamily: 'var(--font-corps)' }}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile */}
          <div className="flex items-center gap-3">
            <Link href="/seance" className="btn-primary hidden sm:inline-flex text-sm py-2 px-4">
              Accéder à la séance →
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-md text-gray-700">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          {NAV.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#04439a] hover:bg-[#e8f0fb] rounded-md transition-colors">
              {item.label}
            </Link>
          ))}
          <Link href="/seance" className="btn-primary w-full mt-2 text-center">
            Accéder à la séance →
          </Link>
        </div>
      )}
    </header>
  )
}
