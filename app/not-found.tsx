'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(ellipse 80% 60% at 10% 5%, rgba(4,67,154,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 95%, rgba(178,29,11,0.07) 0%, transparent 60%), #eef2ff',
      textAlign: 'center',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '2rem', opacity: 0.9 }}>
        <Image src="/logo-pel.png" alt="PEL" width={80} height={80} style={{ filter: 'drop-shadow(0 4px 16px rgba(4,67,154,0.20))' }} />
      </div>

      {/* 404 */}
      <div style={{
        fontFamily: 'var(--font-titre)',
        fontSize: 'clamp(5rem, 15vw, 9rem)',
        fontWeight: 900,
        color: 'var(--pel-bleu)',
        lineHeight: 1,
        letterSpacing: '-0.03em',
        opacity: 0.12,
        marginBottom: '-1rem',
        userSelect: 'none',
      }}>
        404
      </div>

      {/* Titre */}
      <h1 style={{
        fontFamily: 'var(--font-titre)',
        fontSize: 'clamp(1.4rem, 4vw, 2rem)',
        fontWeight: 800,
        color: 'var(--pel-bleu)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        margin: '0 0 1rem',
      }}>
        Page introuvable
      </h1>

      <p style={{
        fontFamily: 'var(--font-corps)',
        color: '#6b7280',
        fontSize: '1rem',
        maxWidth: '380px',
        lineHeight: 1.6,
        marginBottom: '2.5rem',
      }}>
        La page que vous cherchez n'existe pas ou a été déplacée. Revenez à l'accueil ou explorez le site.
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1.75rem', borderRadius: '999px',
            background: 'var(--pel-bleu)', color: 'white',
            fontFamily: 'var(--font-corps)', fontSize: '0.9rem', fontWeight: 600,
            textDecoration: 'none', boxShadow: '0 4px 16px rgba(4,67,154,0.25)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
        >
          ← Accueil
        </Link>
        <Link
          href="/login"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1.75rem', borderRadius: '999px',
            background: 'rgba(4,67,154,0.08)', color: 'var(--pel-bleu)',
            fontFamily: 'var(--font-corps)', fontSize: '0.9rem', fontWeight: 600,
            textDecoration: 'none', border: '1px solid rgba(4,67,154,0.18)',
          }}
        >
          Espace parlementaire →
        </Link>
      </div>

      {/* Liens rapides */}
      <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { href: '/actualites', label: 'Actualités' },
          { href: '/agenda', label: 'Agenda' },
          { href: '/bureau', label: 'Bureau' },
          { href: '/contact', label: 'Contact' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontFamily: 'var(--font-corps)', fontSize: '0.85rem',
              color: '#9ca3af', textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--pel-bleu)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#9ca3af'}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
