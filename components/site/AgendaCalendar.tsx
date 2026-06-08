'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MOIS_LONG = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const JOURS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

const PALETTE = ['#04439a','#b21d0b','#7c3aed','#0369a1','#059669','#d97706','#db2777','#374151']

function getColor(type: string) {
  if (!type) return PALETTE[7]
  const known: Record<string,string> = { seance:'#04439a', séance:'#04439a', commission:'#7c3aed', evenement:'#b21d0b', événement:'#b21d0b', reunion:'#0369a1', réunion:'#0369a1', ceremonie:'#059669', cérémonie:'#059669', atelier:'#d97706' }
  const k = type.toLowerCase()
  if (known[k]) return known[k]
  // Hash déterministe
  let h = 0; for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) % PALETTE.length
  return PALETTE[h]
}

export default function AgendaCalendar({ evenements }: { evenements: any[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<string | null>(null)

  // Navigation
  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelected(null)
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelected(null)
  }

  // Grille du mois
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7 // lundi = 0
  const daysInMonth = lastDay.getDate()

  // Index des événements par jour
  const evByDay: Record<string, any[]> = {}
  for (const e of evenements) {
    if (!e.date) continue
    const d = new Date(e.date)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate().toString()
      if (!evByDay[key]) evByDay[key] = []
      evByDay[key].push(e)
    }
  }

  // Cellules du calendrier
  const cells: (number | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const todayKey = today.getFullYear() === year && today.getMonth() === month ? today.getDate().toString() : null

  const selectedEvs = selected ? (evByDay[selected] ?? []) : []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Header navigation */}
      <div className="flex items-center justify-between mb-6"
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.75)',
          boxShadow: '0 4px 24px rgba(4,67,154,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
          borderRadius: '1rem',
          padding: '1rem 1.5rem',
        }}
      >
        <button onClick={prev} className="p-2 rounded-lg transition-all hover:bg-blue-50"
          style={{ color: 'var(--pel-bleu)' }}>
          <ChevronLeft size={22} />
        </button>
        <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.6rem', color: 'var(--pel-bleu)', fontWeight: 700, letterSpacing: '0.05em' }}>
          {MOIS_LONG[month].toUpperCase()} {year}
        </h2>
        <button onClick={next} className="p-2 rounded-lg transition-all hover:bg-blue-50"
          style={{ color: 'var(--pel-bleu)' }}>
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Grille calendrier */}
      <div style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.75)',
        boxShadow: '0 4px 24px rgba(4,67,154,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        marginBottom: '1.5rem',
      }}>
        {/* Jours de la semaine */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(4,67,154,0.08)' }}>
          {JOURS.map(j => (
            <div key={j} style={{
              textAlign: 'center',
              padding: '0.75rem 0',
              fontFamily: 'var(--font-corps)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--pel-bleu)',
              opacity: 0.6,
            }}>{j}</div>
          ))}
        </div>

        {/* Cellules jours */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`e${i}`} style={{ minHeight: 90, borderRight: '1px solid rgba(4,67,154,0.05)', borderBottom: '1px solid rgba(4,67,154,0.05)', background: 'rgba(238,242,255,0.3)' }} />
            }
            const key = day.toString()
            const dayEvs = evByDay[key] ?? []
            const isToday = key === todayKey
            const isSelected = key === selected
            const isWeekend = ((startDow + day - 1) % 7) >= 5

            return (
              <div
                key={key}
                onClick={() => dayEvs.length > 0 ? setSelected(isSelected ? null : key) : setSelected(null)}
                style={{
                  minHeight: 90,
                  padding: '0.5rem',
                  borderRight: '1px solid rgba(4,67,154,0.05)',
                  borderBottom: '1px solid rgba(4,67,154,0.05)',
                  cursor: dayEvs.length > 0 ? 'pointer' : 'default',
                  background: isSelected
                    ? 'rgba(4,67,154,0.08)'
                    : isToday
                    ? 'rgba(4,67,154,0.04)'
                    : isWeekend
                    ? 'rgba(238,242,255,0.4)'
                    : 'transparent',
                  transition: 'background 0.15s',
                  position: 'relative',
                }}
              >
                {/* Numéro du jour */}
                <div style={{
                  width: 28, height: 28,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isToday ? 'var(--pel-bleu)' : 'transparent',
                  color: isToday ? 'white' : isWeekend ? '#94a3b8' : '#1e293b',
                  fontFamily: 'var(--font-corps)',
                  fontSize: '0.85rem',
                  fontWeight: isToday ? 700 : 500,
                  marginBottom: '0.25rem',
                }}>
                  {day}
                </div>

                {/* Points événements */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {dayEvs.slice(0, 3).map((ev, idx) => (
                    <div key={idx} style={{
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-corps)',
                      fontWeight: 600,
                      color: 'white',
                      background: getColor(ev.type),
                      borderRadius: 4,
                      padding: '1px 5px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}>
                      {ev.heure ? ev.heure.slice(0,5) + ' ' : ''}{ev.titre}
                    </div>
                  ))}
                  {dayEvs.length > 3 && (
                    <div style={{ fontSize: '0.6rem', color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)', fontWeight: 600, paddingLeft: 2 }}>
                      +{dayEvs.length - 3} autre{dayEvs.length - 3 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Détail événements du jour sélectionné */}
      {selected && selectedEvs.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.80)',
          boxShadow: '0 4px 24px rgba(4,67,154,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
          borderRadius: '1.25rem',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h3 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.1rem', color: 'var(--pel-bleu)', fontWeight: 700, marginBottom: '1rem' }}>
            {parseInt(selected)} {MOIS_LONG[month]} {year}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {selectedEvs.map((ev: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: 4, borderRadius: 2, alignSelf: 'stretch', minHeight: 40, background: getColor(ev.type), flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-corps)', fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{ev.titre}</p>
                  <p style={{ fontFamily: 'var(--font-corps)', fontSize: '0.8rem', color: '#64748b' }}>
                    {ev.heure ? ev.heure.slice(0,5) + (ev.lieu ? ' · ' : '') : ''}{ev.lieu ?? ''}
                  </p>
                  {ev.description && <p style={{ fontFamily: 'var(--font-corps)', fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>{ev.description}</p>}
                  {ev.lien_externe && (
                    <a href={ev.lien_externe} target="_blank" rel="noreferrer"
                      style={{ fontFamily: 'var(--font-corps)', fontSize: '0.78rem', color: 'var(--pel-bleu)', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      🔗 Voir le lien
                    </a>
                  )}
                </div>
                <span style={{
                  fontFamily: 'var(--font-corps)', fontSize: '0.7rem', fontWeight: 600,
                  background: getColor(ev.type), color: 'white',
                  borderRadius: 6, padding: '2px 8px', flexShrink: 0, textTransform: 'capitalize',
                }}>{ev.type ?? 'Événement'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Légende dynamique */}
      {evenements.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
          {[...new Set(evenements.map(e => e.type).filter(Boolean))].map((type: string) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: getColor(type) }} />
              <span style={{ fontFamily: 'var(--font-corps)', fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>{type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
