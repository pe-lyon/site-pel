'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/', label: 'Accueil' },
  { href: '/presentation', label: 'Présentation' },
  { href: '/bureau', label: 'Bureau' },
  { href: '/groupes', label: 'Groupes' },
  { href: '/actualites', label: 'Actualités' },
  { href: '/agenda', label: 'Agenda' },
  { href: '/ressources', label: 'Ressources' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Ferme le menu mobile au changement de route
  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex justify-center"
        style={{ transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        {/* Barre principale */}
        <div
          style={{
            margin: scrolled ? '0' : '10px 0 0',
            width: scrolled ? '100%' : 'auto',
            borderRadius: scrolled ? '0' : '999px',
            background: scrolled
              ? 'rgba(255,255,255,0.92)'
              : 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: scrolled ? 'none' : '1px solid rgba(255,255,255,0.75)',
            borderBottom: scrolled ? '1px solid rgba(4,67,154,0.10)' : 'none',
            boxShadow: scrolled
              ? '0 2px 24px rgba(4,67,154,0.08)'
              : '0 8px 32px rgba(4,67,154,0.14), 0 2px 8px rgba(0,0,0,0.05)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div style={{ width: scrolled ? undefined : 'auto', maxWidth: scrolled ? '100%' : undefined }}
            className={scrolled ? 'max-w-5xl mx-auto px-6' : ''}>
            <div className="flex items-center gap-1 h-12 px-4"
              style={{ width: scrolled ? undefined : 'auto' }}>

              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 flex-shrink-0 group mr-3">
                <div style={{
                  transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                }} className="group-hover:scale-110">
                  <Image src="/logo-pel.png" alt="PE de Lyon" width={36} height={36} className="rounded-xl" />
                </div>
                <div className="hidden sm:block">
                  <p style={{
                    fontFamily: 'var(--font-titre)', fontSize: '1.05rem',
                    color: 'var(--pel-bleu)', fontWeight: 700, lineHeight: 1.1,
                    transition: 'letter-spacing 0.3s',
                  }}
                    className="group-hover:tracking-wide"
                  >PE DE LYON</p>
                  <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corps)' }}>
                    Parlement des Étudiants
                  </p>
                </div>
              </Link>

              {/* Nav desktop */}
              <nav className="hidden lg:flex items-center gap-0">
                {NAV.map(item => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="relative px-2.5 py-1.5 text-sm font-medium rounded-lg group"
                      style={{
                        fontFamily: 'var(--font-corps)',
                        color: active ? 'var(--pel-bleu)' : '#4b5563',
                        background: active ? 'rgba(4,67,154,0.08)' : 'transparent',
                        transition: 'color 0.2s, background 0.2s',
                      }}
                    >
                      <span style={{ position: 'relative', zIndex: 1 }}>{item.label}</span>
                      {/* Hover pill bg */}
                      <span
                        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100"
                        style={{
                          background: 'rgba(4,67,154,0.07)',
                          transition: 'opacity 0.2s',
                        }}
                      />
                      {/* Active / hover underline */}
                      <span
                        className="absolute bottom-1 left-3.5 right-3.5 h-0.5 rounded-full"
                        style={{
                          background: 'var(--pel-bleu)',
                          transform: active ? 'scaleX(1)' : 'scaleX(0)',
                          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                          transformOrigin: 'left',
                        }}
                      />
                    </Link>
                  )
                })}
              </nav>

              {/* CTA + Mobile toggle */}
              <div className="flex items-center gap-2 ml-3">
                <Link
                  href="/seance"
                  className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-xl"
                  style={{
                    background: 'var(--pel-rouge)',
                    fontFamily: 'var(--font-corps)',
                    boxShadow: '0 2px 12px rgba(178,29,11,0.30)',
                    transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.03)'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(178,29,11,0.40)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = ''
                    ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(178,29,11,0.30)'
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Séance en direct
                </Link>

                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="lg:hidden p-2 rounded-xl text-gray-600"
                  style={{
                    background: mobileOpen ? 'rgba(4,67,154,0.08)' : 'transparent',
                    transition: 'background 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: mobileOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  }}
                  aria-label="Menu"
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        <div
          style={{
            maxHeight: mobileOpen ? '600px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            margin: mobileOpen ? '4px 16px 0' : '0 16px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: mobileOpen ? '0 16px 48px rgba(4,67,154,0.12)' : 'none',
            border: mobileOpen ? '1px solid rgba(255,255,255,0.7)' : 'none',
          }}
        >
          <div className="px-4 py-3 space-y-1">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                style={{
                  fontFamily: 'var(--font-corps)',
                  color: pathname === item.href ? 'var(--pel-bleu)' : '#374151',
                  background: pathname === item.href ? 'rgba(4,67,154,0.08)' : 'transparent',
                  transition: 'background 0.2s',
                  animationDelay: `${i * 40}ms`,
                }}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 pb-1">
              <Link
                href="/seance"
                className="btn-primary w-full justify-center"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-2" />
                Séance en direct
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer pour le header flottant */}
      <div style={{ height: scrolled ? '57px' : '80px', transition: 'height 0.4s' }} />
    </>
  )
}
