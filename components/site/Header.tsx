'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'

/* ─── Structure de navigation ─────────────────────────────────────── */
const NAV: NavItem[] = [
  { href: '/', label: 'Accueil' },
  {
    label: "L'institution",
    children: [
      { href: '/presentation', label: 'Présentation', desc: 'Histoire, valeurs, missions' },
      { href: '/bureau',       label: 'Bureau',        desc: 'Les membres du bureau exécutif' },
      { href: '/groupes',      label: 'Groupes',       desc: 'Les groupes politiques' },
      { href: '/partenaires',  label: 'Partenaires',   desc: 'Universités et associations partenaires' },
    ],
  },
  { href: '/actualites', label: 'Actualités' },
  {
    label: 'Vie parlementaire',
    children: [
      { href: '/seances',         label: 'Séances',          desc: 'Archives et comptes-rendus' },
      { href: '/journal-officiel',label: 'Journal officiel', desc: 'Textes adoptés en séance' },
      { href: '/agenda',          label: 'Agenda',            desc: 'Événements à venir' },
      { href: '/parlementaires',  label: 'Parlementaires',    desc: 'Annuaire des élus' },
    ],
  },
  {
    label: 'Ressources',
    children: [
      { href: '/ressources', label: 'Documents',  desc: 'Règlement, statuts, textes fondateurs' },
      { href: '/lexique',    label: 'Lexique',    desc: 'Vocabulaire parlementaire expliqué' },
      { href: '/presse',     label: 'Presse',     desc: 'Communiqués et contacts médias' },
      { href: '/newsletter', label: 'Newsletter', desc: 'Recevoir les actualités par email' },
    ],
  },
]

type NavChild = { href: string; label: string; desc: string }
type NavItem =
  | { href: string; label: string; children?: undefined }
  | { href?: undefined; label: string; children: NavChild[] }

/* ─── Dropdown desktop ─────────────────────────────────────────────── */
function DropdownItem({
  item,
  pathname,
}: {
  item: NavItem & { children: NavChild[] }
  pathname: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isActive = item.children.some(c => pathname === c.href || pathname.startsWith(c.href + '/'))

  function enter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }
  function leave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <div ref={ref} onMouseEnter={enter} onMouseLeave={leave} style={{ position: 'relative' }}>
      <button
        className="relative flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium rounded-lg group"
        style={{
          fontFamily: 'var(--font-corps)',
          color: isActive ? 'var(--pel-bleu)' : '#4b5563',
          background: isActive ? 'rgba(4,67,154,0.08)' : 'transparent',
          border: 'none', cursor: 'pointer',
          transition: 'color 0.2s, background 0.2s',
        }}
        aria-expanded={open}
      >
        <span style={{ position: 'relative', zIndex: 1 }}>{item.label}</span>
        <ChevronDown
          size={13}
          style={{
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            color: isActive ? 'var(--pel-bleu)' : '#9ca3af',
          }}
        />
        <span
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100"
          style={{ background: 'rgba(4,67,154,0.07)', transition: 'opacity 0.2s' }}
        />
        {/* Underline actif */}
        <span
          className="absolute bottom-0.5 left-2.5 right-2.5 h-0.5 rounded-full"
          style={{
            background: 'var(--pel-bleu)',
            transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
            transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            transformOrigin: 'left',
          }}
        />
      </button>

      {/* Panneau déroulant */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          minWidth: '240px',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(4,67,154,0.10)',
          borderRadius: '1rem',
          boxShadow: '0 16px 48px rgba(4,67,154,0.14), 0 2px 8px rgba(0,0,0,0.06)',
          padding: '0.5rem',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transform: open
            ? 'translateX(-50%) translateY(0) scale(1)'
            : 'translateX(-50%) translateY(-6px) scale(0.97)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
          zIndex: 100,
        }}
      >
        {/* Petit triangle */}
        <div style={{
          position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
          width: 12, height: 6, overflow: 'hidden',
        }}>
          <div style={{
            width: 10, height: 10, background: 'rgba(255,255,255,0.97)',
            border: '1px solid rgba(4,67,154,0.10)',
            transform: 'rotate(45deg)', margin: '3px auto 0',
            boxShadow: '-2px -2px 4px rgba(4,67,154,0.04)',
          }} />
        </div>

        {item.children.map(child => {
          const childActive = pathname === child.href || pathname.startsWith(child.href + '/')
          return (
            <Link
              key={child.href}
              href={child.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.1rem',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.625rem',
                textDecoration: 'none',
                background: childActive ? 'rgba(4,67,154,0.07)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => {
                if (!childActive) (e.currentTarget as HTMLElement).style.background = 'rgba(4,67,154,0.05)'
              }}
              onMouseLeave={e => {
                if (!childActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <span style={{
                fontFamily: 'var(--font-corps)', fontWeight: 600, fontSize: '0.875rem',
                color: childActive ? 'var(--pel-bleu)' : '#1e3a5f',
              }}>
                {child.label}
              </span>
              <span style={{
                fontFamily: 'var(--font-corps)', fontSize: '0.72rem',
                color: '#9ca3af', lineHeight: 1.3,
              }}>
                {child.desc}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Composant principal ──────────────────────────────────────────── */
export default function Header() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setMobileOpen(false); setMobileExpanded(null) }, [pathname])

  const navContent = (
    <div className="flex items-center h-12 px-4 gap-1">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 flex-shrink-0 group mr-3">
        <div className="group-hover:scale-110" style={{ transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <Image src="/logo-pel.png" alt="PE de Lyon" width={32} height={32} className="rounded-xl" />
        </div>
        <div className="hidden sm:block">
          <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1rem', color: 'var(--pel-bleu)', fontWeight: 700, lineHeight: 1.1 }}>
            PE DE LYON
          </p>
          <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corps)' }}>
            Parlement des Étudiants
          </p>
        </div>
      </Link>

      {/* Nav desktop */}
      <nav className="hidden lg:flex items-center gap-0.5">
        {NAV.map(item => {
          if (item.children) {
            return <DropdownItem key={item.label} item={item as any} pathname={pathname} />
          }
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href!}
              className="relative px-2.5 py-1.5 text-sm font-medium rounded-lg group"
              style={{
                fontFamily: 'var(--font-corps)',
                color: active ? 'var(--pel-bleu)' : '#4b5563',
                background: active ? 'rgba(4,67,154,0.08)' : 'transparent',
                transition: 'color 0.2s, background 0.2s',
              }}
            >
              <span style={{ position: 'relative', zIndex: 1 }}>{item.label}</span>
              <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100"
                style={{ background: 'rgba(4,67,154,0.07)', transition: 'opacity 0.2s' }} />
              <span className="absolute bottom-0.5 left-2.5 right-2.5 h-0.5 rounded-full"
                style={{
                  background: 'var(--pel-bleu)',
                  transform: active ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  transformOrigin: 'left',
                }} />
            </Link>
          )
        })}
      </nav>

      {/* CTA + burger */}
      <div className="flex items-center gap-2 ml-3">
        <Link
          href="/rejoindre"
          className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(4,67,154,0.08)',
            color: 'var(--pel-bleu)',
            fontFamily: 'var(--font-corps)',
            border: '1px solid rgba(4,67,154,0.18)',
            whiteSpace: 'nowrap',
          }}
        >
          Rejoindre →
        </Link>

        <Link
          href="/seance"
          className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-full"
          style={{
            background: 'var(--pel-rouge)',
            fontFamily: 'var(--font-corps)',
            boxShadow: '0 2px 12px rgba(178,29,11,0.30)',
            transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s',
            whiteSpace: 'nowrap',
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
  )

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}
      >
        {/* ── Pill principale ── */}
        <div
          style={{
            borderRadius: '999px',
            background: scrolled ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.75)',
            boxShadow: scrolled
              ? '0 4px 32px rgba(4,67,154,0.18), 0 2px 12px rgba(0,0,0,0.08)'
              : '0 8px 32px rgba(4,67,154,0.14), 0 2px 8px rgba(0,0,0,0.05)',
            marginTop: scrolled ? '6px' : '12px',
            transition: 'margin-top 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
            width: 'auto',
          }}
        >
          {navContent}
        </div>

        {/* ── Menu mobile ── */}
        {mobileOpen && (
          <div
            style={{
              marginTop: '6px',
              borderRadius: '1.25rem',
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 16px 48px rgba(4,67,154,0.12)',
              border: '1px solid rgba(255,255,255,0.7)',
              width: 'calc(100vw - 2rem)',
              maxWidth: '400px',
            }}
          >
            <div className="px-3 py-3">
              {NAV.map(item => {
                if (item.children) {
                  const isExpanded = mobileExpanded === item.label
                  const hasActive = item.children.some(c => pathname === c.href || pathname.startsWith(c.href + '/'))
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => setMobileExpanded(isExpanded ? null : item.label)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium"
                        style={{
                          fontFamily: 'var(--font-corps)',
                          color: hasActive ? 'var(--pel-bleu)' : '#374151',
                          background: hasActive ? 'rgba(4,67,154,0.06)' : 'transparent',
                          border: 'none', cursor: 'pointer',
                        }}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          size={15}
                          style={{
                            color: '#9ca3af',
                            transition: 'transform 0.2s',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        />
                      </button>
                      {isExpanded && (
                        <div style={{ paddingLeft: '0.75rem', paddingBottom: '0.25rem' }}>
                          {item.children.map(child => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="flex flex-col px-4 py-2.5 rounded-xl"
                              style={{
                                fontFamily: 'var(--font-corps)',
                                color: pathname === child.href ? 'var(--pel-bleu)' : '#374151',
                                background: pathname === child.href ? 'rgba(4,67,154,0.08)' : 'transparent',
                                textDecoration: 'none',
                              }}
                            >
                              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{child.label}</span>
                              <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '1px' }}>{child.desc}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }

                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className="flex items-center px-4 py-3 rounded-xl text-sm font-medium"
                    style={{
                      fontFamily: 'var(--font-corps)',
                      color: active ? 'var(--pel-bleu)' : '#374151',
                      background: active ? 'rgba(4,67,154,0.08)' : 'transparent',
                      textDecoration: 'none',
                    }}
                  >
                    {item.label}
                  </Link>
                )
              })}

              <div className="pt-2 pb-1 flex flex-col gap-2 mt-1 border-t border-gray-100">
                <Link href="/rejoindre" className="btn-outline w-full justify-center text-sm">
                  Rejoindre le PEL →
                </Link>
                <Link href="/seance" className="btn-primary w-full justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-2" />
                  Séance en direct
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
