'use client'

import { useState, useRef, useCallback } from 'react'

export interface ParliamentSeat {
  id: string
  color: string
  label?: string
  sublabel?: string
  meta?: string
}

interface ParliamentChartProps {
  seats: ParliamentSeat[]
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  presidentLabel?: string
  className?: string
}

interface SeatPos {
  x: number
  y: number
  seatIdx: number
  row: number
}

/**
 * Algorithme "parliament-chart" fidèle à Flourish :
 *
 * 1. On calcule le rayon optimal des sièges (binary search) pour que les n membres
 *    tiennent dans nRows rangs en remplissant le demi-cercle de façon compacte.
 * 2. Chaque rang est rempli de gauche à droite sur tout l'arc [π, 2π].
 * 3. Les membres sont assignés rang par rang de l'intérieur vers l'extérieur,
 *    gauche à droite dans chaque rang — ce qui crée des blocs politiques cohérents.
 */
function buildLayout(n: number, cx: number, cy: number, innerR: number, outerR: number) {
  if (n === 0) return { positions: [] as SeatPos[], seatR: 14 }

  // Nombre de rangs adaptatif
  const nRows = n <= 5 ? 1 : n <= 14 ? 2 : n <= 32 ? 3 : n <= 60 ? 4 : 5

  const radii = Array.from({ length: nRows }, (_, i) =>
    nRows === 1 ? (innerR + outerR) / 2 : innerR + (i * (outerR - innerR)) / (nRows - 1)
  )

  /**
   * Nombre de sièges qui tiennent sur un arc de rayon R avec un siège de rayon r :
   * L'espacement angulaire minimum entre deux centres = 2 * asin(r / R)
   * ⟹ count = floor(π / (2 * asin(r / R)))
   * (on ajoute 1% de marge via le facteur 1.01)
   */
  const countInRow = (r: number, R: number) =>
    Math.max(1, Math.floor(Math.PI / (2 * Math.asin((r * 1.01) / R))))

  const totalFor = (r: number) => radii.reduce((s, R) => s + countInRow(r, R), 0)

  // Recherche binaire : plus grand r tel que totalFor(r) >= n
  let lo = 1, hi = innerR * 0.55
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    totalFor(mid) >= n ? (lo = mid) : (hi = mid)
  }
  // Légère réduction pour un gap visuel agréable
  const seatR = Math.min(lo * 0.90, 24)

  // Capacité de chaque rang
  const capacity = radii.map(R => countInRow(seatR, R))

  // Distribution des n sièges :
  // On remplit d'abord les rangs intérieurs (plus proches de la présidence)
  // puis les extérieurs, proportionnellement à leur capacité
  const seatsPerRow = new Array(nRows).fill(0)
  let remaining = n
  for (let r = 0; r < nRows && remaining > 0; r++) {
    seatsPerRow[r] = Math.min(capacity[r], remaining)
    remaining -= seatsPerRow[r]
  }

  // Placer les sièges gauche → droite dans chaque rang
  const positions: SeatPos[] = []
  let seatIdx = 0

  for (let r = 0; r < nRows; r++) {
    const count = seatsPerRow[r]
    if (count === 0) continue
    const R = radii[r]
    for (let i = 0; i < count; i++) {
      // t ∈ [0,1] de gauche (π) à droite (2π)
      const t = count === 1 ? 0.5 : i / (count - 1)
      const angle = Math.PI + t * Math.PI
      positions.push({ x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle), seatIdx: seatIdx++, row: r })
    }
  }

  return { positions, seatR, nRows, radii }
}

export default function ParliamentChart({
  seats,
  selectedId,
  onSelect,
  presidentLabel = 'PRÉSIDENCE',
  className = '',
}: ParliamentChartProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; seat: ParliamentSeat } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const cx = 500, cy = 470
  const innerR = 145, outerR = 385

  const { positions, seatR, nRows = 4, radii = [] } = buildLayout(seats.length, cx, cy, innerR, outerR)

  const handleMouseMove = useCallback((e: React.MouseEvent, seat: ParliamentSeat) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, seat })
  }, [])

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      <svg
        viewBox="0 0 1000 515"
        className="w-full"
        style={{ overflow: 'visible' }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Arcs de guide (un par rang) */}
        {radii.map((r, i) => (
          <path
            key={i}
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="rgba(4,67,154,0.06)"
            strokeWidth={i === radii.length - 1 ? 1.5 : 1}
          />
        ))}

        {/* Lignes de bord gauche / droite */}
        <line x1={cx - outerR} y1={cy} x2={cx - innerR} y2={cy} stroke="rgba(4,67,154,0.06)" strokeWidth="1" />
        <line x1={cx + outerR} y1={cy} x2={cx + innerR} y2={cy} stroke="rgba(4,67,154,0.06)" strokeWidth="1" />

        {/* Labels */}
        <text x={cx - outerR - 12} y={cy + 5} textAnchor="end"
          fill="rgba(4,67,154,0.28)" fontSize="13" fontStyle="italic" fontFamily="Georgia,serif">
          Gauche
        </text>
        <text x={cx + outerR + 12} y={cy + 5} textAnchor="start"
          fill="rgba(4,67,154,0.28)" fontSize="13" fontStyle="italic" fontFamily="Georgia,serif">
          Droite
        </text>

        {/* ── Sièges ── */}
        {positions.map((pos) => {
          const seat = seats[pos.seatIdx]
          if (!seat) return null
          const isSelected = selectedId === seat.id
          const isHovered = tooltip?.seat.id === seat.id
          const r = isSelected ? seatR * 1.22 : isHovered ? seatR * 1.12 : seatR
          return (
            <g
              key={seat.id}
              onClick={() => onSelect?.(isSelected ? null : seat.id)}
              onMouseMove={(e) => handleMouseMove(e, seat)}
              onMouseEnter={(e) => handleMouseMove(e, seat)}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Zone de clic élargie */}
              <circle cx={pos.x} cy={pos.y} r={seatR + 5} fill="transparent" />
              {/* Siège */}
              <circle
                cx={pos.x} cy={pos.y} r={r}
                fill={seat.color}
                stroke={isSelected ? '#fff' : isHovered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)'}
                strokeWidth={isSelected ? 2.5 : 1.2}
                style={{
                  transition: 'r 0.1s ease',
                  filter: isHovered || isSelected ? `drop-shadow(0 0 ${seatR * 0.5}px ${seat.color}88)` : 'none',
                }}
              />
              {/* Anneau sélection */}
              {isSelected && (
                <circle cx={pos.x} cy={pos.y} r={r + 5}
                  fill="none" stroke={seat.color} strokeWidth="2"
                  strokeDasharray="4 3" opacity="0.7" />
              )}
            </g>
          )
        })}

        {/* ── Podium présidence ── */}
        <ellipse cx={cx} cy={cy + 22} rx={74} ry={29} fill="#04439a" />
        <ellipse cx={cx} cy={cy + 20} rx={74} ry={29} fill="#04439a" />
        <text x={cx} y={cy + 16} textAnchor="middle" fill="white"
          fontSize="10" fontWeight="bold" letterSpacing="0.06em">
          {presidentLabel.length > 22 ? presidentLabel.slice(0, 21) + '…' : presidentLabel}
        </text>
        <text x={cx} y={cy + 31} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="7.5">
          Président ou Présidente de séance
        </text>
      </svg>

      {/* ── Tooltip ── */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-50 px-3 py-2 rounded-xl shadow-xl"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y - 14,
            background: 'rgba(255,255,255,0.97)',
            border: `2px solid ${tooltip.seat.color}`,
            backdropFilter: 'blur(12px)',
            maxWidth: 220,
            transform: tooltip.x > (containerRef.current?.offsetWidth ?? 500) * 0.68
              ? 'translateX(-110%)' : undefined,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.15rem' }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: tooltip.seat.color, flexShrink: 0, display: 'inline-block',
            }} />
            <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.82rem' }}>
              {tooltip.seat.label}
            </span>
          </div>
          {tooltip.seat.sublabel && (
            <div style={{ color: tooltip.seat.color, fontSize: '0.75rem', fontWeight: 600 }}>
              {tooltip.seat.sublabel}
            </div>
          )}
          {tooltip.seat.meta && (
            <div style={{ color: '#6b7280', fontSize: '0.72rem', marginTop: '0.1rem' }}>
              {tooltip.seat.meta}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
