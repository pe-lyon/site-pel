interface SectionTitleProps {
  title: string
  subtitle?: string
  centered?: boolean        // défaut true
  as?: 'h2' | 'h3'
}

/**
 * Titre de section harmonisé — utilisé dans le corps des pages site vitrine.
 */
export default function SectionTitle({ title, subtitle, centered = true, as: Tag = 'h2' }: SectionTitleProps) {
  return (
    <div style={{ textAlign: centered ? 'center' : 'left', marginBottom: '2.5rem' }}>
      <Tag style={{
        fontFamily: 'var(--font-titre)',
        fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
        fontWeight: 800,
        color: 'var(--pel-bleu)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        lineHeight: 1.15,
        marginBottom: subtitle ? '0.75rem' : 0,
      }}>
        {title}
      </Tag>
      {subtitle && (
        <p style={{
          fontFamily: 'var(--font-corps)',
          fontSize: '1rem',
          color: '#6b7280',
          lineHeight: 1.6,
          maxWidth: centered ? '580px' : 'none',
          margin: centered ? '0 auto' : 0,
        }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
