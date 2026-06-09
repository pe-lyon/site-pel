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
  const strokeWidth = 22
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r

  const pctPour = pour / total
  const pctContre = contre / total
  const pctAbst = abstention / total

  // Each arc: dasharray = [arc_length, rest]
  // offset rotates start point: start at top (-90deg = -circumference/4)
  const pourLen = pctPour * circumference
  const contreLen = pctContre * circumference
  const abstLen = pctAbst * circumference

  const pourOffset = circumference / 4
  const contreOffset = pourOffset - pourLen + circumference  // wrap with modulo-like calc
  const abstOffset = contreOffset - contreLen + circumference

  // Gap between segments (2px)
  const gap = 2

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />
        {/* Pour - green */}
        {pourLen > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#22c55e"
            strokeWidth={strokeWidth}
            strokeDasharray={`${Math.max(0, pourLen - gap)} ${circumference - pourLen + gap}`}
            strokeDashoffset={circumference - circumference / 4}
            strokeLinecap="round"
          />
        )}
        {/* Contre - red */}
        {contreLen > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#ef4444"
            strokeWidth={strokeWidth}
            strokeDasharray={`${Math.max(0, contreLen - gap)} ${circumference - contreLen + gap}`}
            strokeDashoffset={circumference - circumference / 4 + pourLen}
            strokeLinecap="round"
          />
        )}
        {/* Abstention - gray */}
        {abstLen > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#d1d5db"
            strokeWidth={strokeWidth}
            strokeDasharray={`${Math.max(0, abstLen - gap)} ${circumference - abstLen + gap}`}
            strokeDashoffset={circumference - circumference / 4 + pourLen + contreLen}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <span style={{ color: '#16a34a', fontWeight: 600 }}>Pour {pour}</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          <span style={{ color: '#dc2626', fontWeight: 600 }}>Contre {contre}</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d1d5db', display: 'inline-block' }} />
          <span style={{ color: '#9ca3af', fontWeight: 600 }}>Abst. {abstention}</span>
        </span>
      </div>
    </div>
  )
}
