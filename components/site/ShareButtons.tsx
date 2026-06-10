'use client'

import { useState } from 'react'
import { Twitter, Linkedin, Link2, Check } from 'lucide-react'

interface ShareButtonsProps {
  url: string
  titre: string
}

export default function ShareButtons({ url, titre }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitre = encodeURIComponent(titre)

  const links = [
    {
      label: 'X (Twitter)',
      icon: <Twitter size={16} />,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitre}`,
      color: '#000000',
    },
    {
      label: 'LinkedIn',
      icon: <Linkedin size={16} />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: '#0077b5',
    },
  ]

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* fallback silencieux */
    }
  }

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-titre)', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
        Partager cet article
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {links.map(l => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            title={`Partager sur ${l.label}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', borderRadius: '999px',
              background: l.color, color: 'white',
              fontFamily: 'var(--font-corps)', fontSize: '0.8rem', fontWeight: 600,
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {l.icon} {l.label}
          </a>
        ))}

        <button
          onClick={copyLink}
          title="Copier le lien"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem', borderRadius: '999px',
            background: copied ? '#059669' : '#f3f4f6', color: copied ? 'white' : '#374151',
            fontFamily: 'var(--font-corps)', fontSize: '0.8rem', fontWeight: 600,
            border: 'none', cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          {copied ? <><Check size={16} /> Copié !</> : <><Link2 size={16} /> Copier le lien</>}
        </button>
      </div>
    </div>
  )
}
