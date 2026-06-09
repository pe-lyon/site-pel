import React from 'react'

interface SiteHeroProps {
  badge?: string            // petit label au-dessus (ex: "Notre institution")
  title: string             // titre principal en majuscules
  description?: string      // paragraphe de description sous le titre
  children?: React.ReactNode // contenu optionnel supplémentaire sous la description
}

/**
 * Bandeau hero centré — utilisé sur toutes les pages du site vitrine.
 * Gradient bleu, titre centré, badge optionnel, description optionnelle.
 */
export default function SiteHero({ badge, title, description, children }: SiteHeroProps) {
  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #04439a 0%, #0a2d6e 100%)',
        position: 'relative',
        overflow: 'hidden',
        marginTop: '-1px',
        padding: '7rem 1.5rem 4.5rem',
        textAlign: 'center',
      }}
    >
      {/* Orbs décoratifs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          style={{
            position: 'absolute', width: 420, height: 420, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', filter: 'blur(80px)',
            top: '-120px', right: '5%',
          }}
        />
        <div
          style={{
            position: 'absolute', width: 260, height: 260, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)', filter: 'blur(50px)',
            bottom: '-80px', left: '8%',
          }}
        />
        <div
          style={{
            position: 'absolute', width: 180, height: 180, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', filter: 'blur(40px)',
            top: '30%', left: '30%',
          }}
        />
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Badge optionnel */}
        {badge && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '999px',
            padding: '0.35rem 1rem',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-corps)',
            color: 'rgba(255,255,255,0.85)',
            marginBottom: '1.25rem',
            letterSpacing: '0.03em',
          }}>
            {badge}
          </div>
        )}

        {/* Titre */}
        <h1
          style={{
            fontFamily: 'var(--font-titre)',
            fontSize: 'clamp(2.2rem, 6vw, 4rem)',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
            marginBottom: description ? '1.25rem' : 0,
          }}
        >
          {title}
        </h1>

        {/* Description optionnelle */}
        {description && (
          <p style={{
            fontFamily: 'var(--font-corps)',
            fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
            color: 'rgba(255,255,255,0.80)',
            lineHeight: 1.65,
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            {description}
          </p>
        )}

        {/* Contenu additionnel (stats, boutons, etc.) */}
        {children && (
          <div style={{ marginTop: '2rem' }}>
            {children}
          </div>
        )}
      </div>
    </section>
  )
}
