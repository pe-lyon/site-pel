'use client'

interface DonutChartProps {
  pour: number
  contre: number
  abstention: number
}

export default function DonutChart({ pour, contre, abstention }: DonutChartProps) {
  const total = pour + contre + abstention
  if (total === 0) return null

  const size = 120
  const strokeWidth = 20
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const gap = 3

  const pourLen = (pour / total) * circ
  const contreLen = (contre / total) * circ
  const abstLen = (abstention / total) * circ

  // strokeDashoffset positif = rotation dans le sens horaire
  // On démarre à 12h : offset = circ/4
  const pourOffset = circ / 4
  const contreOffset = pourOffset - pourLen
  const abstOffset = contreOffset - contreLen

  const seg = (len: number, offset: number, color: string) => {
    if (len < gap) return null
    return (
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${len - gap} ${circ - (len - gap)}`}
        strokeDashoffset={offset}
        strokeLinecap="butt"
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
          {seg(pourLen, pourOffset, '#22c55e')}
          {seg(contreLen, contreOffset, '#ef4444')}
          {seg(abstLen, abstOffset, '#d1d5db')}
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22c55e', lineHeight: 1 }}>
            {Math.round((pour / total) * 100)}%
          </span>
          <span style={{ fontSize: '0.6rem', color: '#6b7280', marginTop: 2 }}>POUR</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <span style={{ color: '#16a34a', fontWeight: 700 }}>Pour {pour}</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          <span style={{ color: '#dc2626', fontWeight: 700 }}>Contre {contre}</span>
        </span>
        {abstention > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d1d5db', display: 'inline-block' }} />
            <span style={{ color: '#9ca3af', fontWeight: 700 }}>Abst. {abstention}</span>
          </span>
        )}
      </div>
    </div>
  )
}
