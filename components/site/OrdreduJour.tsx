'use client'

const TYPE_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  vote:         { label: 'Vote',          color: '#fff', bg: '#b21d0b' },
  discussion:   { label: 'Discussion',    color: '#fff', bg: '#04439a' },
  presentation: { label: 'Présentation',  color: '#fff', bg: '#7c3aed' },
  pause:        { label: 'Pause',         color: '#374151', bg: '#e5e7eb' },
  divers:       { label: 'Divers',        color: '#374151', bg: '#f3f4f6' },
}

const glassStyle = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(20px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 4px 24px rgba(4,67,154,0.07)',
  borderRadius: '1rem',
}

interface Props {
  seance: any
  ordreJour: any[]
}

export default function OrdreduJour({ seance, ordreJour }: Props) {
  const dateStr = seance?.date
    ? new Date(seance.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <section>
      <div style={{ ...glassStyle, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.2rem', color: 'var(--pel-bleu)', fontWeight: 700, margin: 0 }}>
            📋 ORDRE DU JOUR
          </h2>
          {dateStr && (
            <span style={{ fontFamily: 'var(--font-corps)', fontSize: '0.8rem', color: '#6b7280' }}>
              {dateStr}
            </span>
          )}
        </div>

        {ordreJour.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-corps)', color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>
            L&apos;ordre du jour sera publié prochainement.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {ordreJour.map((point, i) => {
              const badge = TYPE_BADGES[point.type] ?? { label: point.type ?? 'Point', color: '#374151', bg: '#f3f4f6' }
              return (
                <div
                  key={point.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    background: 'rgba(255,255,255,0.6)',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1rem',
                    border: '1px solid rgba(255,255,255,0.8)',
                  }}
                >
                  <span style={{
                    flexShrink: 0,
                    width: 28, height: 28,
                    borderRadius: '50%',
                    background: 'var(--pel-bleu)',
                    color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700,
                    fontFamily: 'var(--font-titre)',
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-corps)', fontWeight: 600, color: '#1e3a5f', fontSize: '0.9rem', margin: 0 }}>
                      {point.titre}
                    </p>
                  </div>
                  <span style={{
                    flexShrink: 0,
                    padding: '0.15rem 0.6rem',
                    borderRadius: 999,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-corps)',
                    background: badge.bg,
                    color: badge.color,
                  }}>
                    {badge.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
