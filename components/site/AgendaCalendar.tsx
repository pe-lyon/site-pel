'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, MapPin, ExternalLink } from 'lucide-react'

const MOIS_LONG = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const MOIS_COURT = ['jan.','fév.','mar.','avr.','mai','juin','juil.','août','sep.','oct.','nov.','déc.']
const JOURS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

const PALETTE = ['#04439a','#b21d0b','#7c3aed','#0369a1','#059669','#d97706','#db2777','#374151']

function getColor(type: string) {
  if (!type) return PALETTE[7]
  const known: Record<string, string> = {
    seance: '#04439a', séance: '#04439a',
    commission: '#7c3aed',
    evenement: '#b21d0b', événement: '#b21d0b',
    reunion: '#0369a1', réunion: '#0369a1',
    ceremonie: '#059669', cérémonie: '#059669',
    atelier: '#d97706',
  }
  const k = type.toLowerCase()
  if (known[k]) return known[k]
  let h = 0
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) % PALETTE.length
  return PALETTE[h]
}

function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    seance: 'Séance', séance: 'Séance',
    commission: 'Commission',
    evenement: 'Événement', événement: 'Événement',
    reunion: 'Réunion', réunion: 'Réunion',
    ceremonie: 'Cérémonie', cérémonie: 'Cérémonie',
    atelier: 'Atelier',
  }
  return labels[type?.toLowerCase()] ?? (type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Événement')
}

export default function AgendaCalendar({ evenements }: { evenements: any[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<string | null>(null)

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

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7
  const daysInMonth = lastDay.getDate()

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

  const cells: (number | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const todayKey = today.getFullYear() === year && today.getMonth() === month ? today.getDate().toString() : null
  const selectedEvs = selected ? (evByDay[selected] ?? []) : []

  // Prochains événements (liste chronologique)
  const upcomingEvs = evenements
    .filter(e => e.date && new Date(e.date) >= new Date(year, month, 1))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'start' }}>

        {/* Calendrier */}
        <div>
          {/* Header navigation */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.60)',
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.80)',
            boxShadow: '0 4px 24px rgba(4,67,154,0.07)',
            borderRadius: '1rem',
            padding: '0.875rem 1.25rem',
            marginBottom: '0.75rem',
          }}>
            <button onClick={prev} style={{
              width: 36, height: 36, borderRadius: '0.625rem', border: 'none',
              background: 'rgba(4,67,154,0.07)', color: '#04439a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.15s',
            }}>
              <ChevronLeft size={18} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.4rem', color: '#04439a', fontWeight: 700, letterSpacing: '0.04em' }}>
              {MOIS_LONG[month]} {year}
            </h2>
            <button onClick={next} style={{
              width: 36, height: 36, borderRadius: '0.625rem', border: 'none',
              background: 'rgba(4,67,154,0.07)', color: '#04439a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.15s',
            }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Grille */}
          <div style={{
            background: 'rgba(255,255,255,0.60)',
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.80)',
            boxShadow: '0 4px 24px rgba(4,67,154,0.07)',
            borderRadius: '1.25rem',
            overflow: 'hidden',
          }}>
            {/* Jours de la semaine */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(4,67,154,0.07)' }}>
              {JOURS.map((j, idx) => (
                <div key={j} style={{
                  textAlign: 'center',
                  padding: '0.625rem 0',
                  fontFamily: 'var(--font-corps)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: idx >= 5 ? '#94a3b8' : '#04439a',
                  opacity: idx >= 5 ? 1 : 0.65,
                }}>{j}</div>
              ))}
            </div>

            {/* Cellules */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {cells.map((day, i) => {
                if (day === null) {
                  return <div key={`e${i}`} style={{
                    minHeight: 70,
                    borderRight: '1px solid rgba(4,67,154,0.04)',
                    borderBottom: '1px solid rgba(4,67,154,0.04)',
                    background: 'rgba(241,245,249,0.5)',
                  }} />
                }

                const key = day.toString()
                const dayEvs = evByDay[key] ?? []
                const isToday = key === todayKey
                const isSelected = key === selected
                const col = (startDow + day - 1) % 7
                const isWeekend = col >= 5

                return (
                  <div
                    key={key}
                    onClick={() => dayEvs.length > 0 ? setSelected(isSelected ? null : key) : setSelected(null)}
                    style={{
                      minHeight: 70,
                      padding: '0.5rem 0.4rem 0.4rem',
                      borderRight: '1px solid rgba(4,67,154,0.04)',
                      borderBottom: '1px solid rgba(4,67,154,0.04)',
                      cursor: dayEvs.length > 0 ? 'pointer' : 'default',
                      background: isSelected
                        ? 'rgba(4,67,154,0.09)'
                        : isToday
                        ? 'rgba(4,67,154,0.04)'
                        : isWeekend
                        ? 'rgba(241,245,249,0.6)'
                        : 'transparent',
                      transition: 'background 0.12s',
                      position: 'relative',
                    }}
                  >
                    {/* Numéro du jour */}
                    <div style={{
                      width: 26, height: 26,
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isToday ? '#04439a' : 'transparent',
                      color: isToday ? 'white' : isWeekend ? '#94a3b8' : '#1e293b',
                      fontFamily: 'var(--font-corps)',
                      fontSize: '0.82rem',
                      fontWeight: isToday ? 700 : 400,
                      margin: '0 auto 0.35rem',
                    }}>
                      {day}
                    </div>

                    {/* Points événements */}
                    {dayEvs.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                        {dayEvs.slice(0, 4).map((ev, idx) => (
                          <div
                            key={idx}
                            title={ev.titre}
                            style={{
                              width: 7, height: 7,
                              borderRadius: '50%',
                              background: getColor(ev.type),
                              flexShrink: 0,
                            }}
                          />
                        ))}
                        {dayEvs.length > 4 && (
                          <div style={{
                            width: 7, height: 7,
                            borderRadius: '50%',
                            background: '#94a3b8',
                            flexShrink: 0,
                          }} />
                        )}
                      </div>
                    )}

                    {/* Indicateur sélection */}
                    {isSelected && dayEvs.length > 0 && (
                      <div style={{
                        position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
                        width: 4, height: 4, borderRadius: '50%', background: '#04439a',
                      }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Légende */}
          {evenements.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.875rem', paddingLeft: '0.25rem' }}>
              {Array.from(new Set(evenements.map(e => e.type).filter(Boolean))).map((type: string) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: getColor(type), flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-corps)', fontSize: '0.72rem', color: '#64748b' }}>
                    {getTypeLabel(type)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panneau latéral : événements du jour OU prochains événements */}
        <div style={{ width: 280, position: 'sticky', top: '1rem' }}>
          {selected && selectedEvs.length > 0 ? (
            // Détail du jour cliqué
            <div style={{
              background: 'rgba(255,255,255,0.70)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.85)',
              boxShadow: '0 4px 24px rgba(4,67,154,0.10)',
              borderRadius: '1.25rem',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '1rem 1.25rem 0.75rem', borderBottom: '1px solid rgba(4,67,154,0.07)' }}>
                <p style={{ fontFamily: 'var(--font-corps)', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
                  Sélectionné
                </p>
                <p style={{ fontFamily: 'var(--font-titre)', fontWeight: 700, color: '#04439a', fontSize: '1.1rem' }}>
                  {parseInt(selected)} {MOIS_COURT[month]} {year}
                </p>
              </div>
              <div style={{ padding: '0.75rem 0' }}>
                {selectedEvs.map((ev: any, i: number) => (
                  <div key={i} style={{ padding: '0.625rem 1.25rem', borderBottom: i < selectedEvs.length - 1 ? '1px solid rgba(4,67,154,0.05)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                      <div style={{
                        width: 3, borderRadius: 2, alignSelf: 'stretch', minHeight: 36,
                        background: getColor(ev.type), flexShrink: 0,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem', marginBottom: '0.2rem' }}>
                          <span style={{
                            fontFamily: 'var(--font-corps)', fontSize: '0.66rem', fontWeight: 700,
                            background: getColor(ev.type) + '18',
                            color: getColor(ev.type),
                            borderRadius: '999px', padding: '0.1rem 0.5rem',
                          }}>
                            {getTypeLabel(ev.type)}
                          </span>
                        </div>
                        <p style={{ fontFamily: 'var(--font-corps)', fontWeight: 600, color: '#1e293b', fontSize: '0.85rem', lineHeight: 1.3 }}>
                          {ev.titre}
                        </p>
                        {(ev.heure || ev.lieu) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: '0.3rem' }}>
                            {ev.heure && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-corps)', fontSize: '0.75rem', color: '#64748b' }}>
                                <Clock size={10} /> {ev.heure.slice(0, 5)}
                              </span>
                            )}
                            {ev.lieu && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-corps)', fontSize: '0.75rem', color: '#64748b' }}>
                                <MapPin size={10} /> {ev.lieu}
                              </span>
                            )}
                          </div>
                        )}
                        {ev.description && (
                          <p style={{ fontFamily: 'var(--font-corps)', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem', lineHeight: 1.4 }}>
                            {ev.description}
                          </p>
                        )}
                        {ev.lien_externe && (
                          <a href={ev.lien_externe} target="_blank" rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: '0.35rem', fontFamily: 'var(--font-corps)', fontSize: '0.72rem', color: '#04439a', textDecoration: 'none' }}>
                            <ExternalLink size={10} /> Voir le lien
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Prochains événements (sidebar par défaut)
            <div style={{
              background: 'rgba(255,255,255,0.60)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.80)',
              boxShadow: '0 4px 24px rgba(4,67,154,0.07)',
              borderRadius: '1.25rem',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '1rem 1.25rem 0.75rem', borderBottom: '1px solid rgba(4,67,154,0.07)' }}>
                <p style={{ fontFamily: 'var(--font-corps)', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
                  À venir
                </p>
                <p style={{ fontFamily: 'var(--font-titre)', fontWeight: 700, color: '#04439a', fontSize: '1rem' }}>
                  Prochains événements
                </p>
              </div>

              {upcomingEvs.length === 0 ? (
                <div style={{ padding: '1.5rem 1.25rem', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-corps)', fontSize: '0.82rem', color: '#94a3b8' }}>
                    Aucun événement à venir
                  </p>
                </div>
              ) : (
                <div style={{ padding: '0.5rem 0' }}>
                  {upcomingEvs.map((ev: any, i: number) => {
                    const d = new Date(ev.date)
                    return (
                      <div key={i} style={{
                        display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                        padding: '0.625rem 1.25rem',
                        borderBottom: i < upcomingEvs.length - 1 ? '1px solid rgba(4,67,154,0.05)' : 'none',
                      }}>
                        {/* Mini date badge */}
                        <div style={{
                          flexShrink: 0, width: 38, textAlign: 'center',
                          background: getColor(ev.type) + '14',
                          border: `1px solid ${getColor(ev.type)}30`,
                          borderRadius: '0.5rem', padding: '0.25rem 0',
                        }}>
                          <div style={{ fontFamily: 'var(--font-corps)', fontSize: '0.65rem', fontWeight: 700, color: getColor(ev.type), textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {MOIS_COURT[d.getMonth()]}
                          </div>
                          <div style={{ fontFamily: 'var(--font-titre)', fontSize: '1rem', fontWeight: 800, color: getColor(ev.type), lineHeight: 1 }}>
                            {d.getDate()}
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: 'var(--font-corps)', fontWeight: 600, fontSize: '0.82rem', color: '#1e293b', lineHeight: 1.3, marginBottom: '0.15rem' }}>
                            {ev.titre}
                          </p>
                          {ev.heure && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-corps)', fontSize: '0.7rem', color: '#94a3b8' }}>
                              <Clock size={9} /> {ev.heure.slice(0, 5)}
                              {ev.lieu ? ` · ${ev.lieu}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Message aide */}
      {Object.keys(evByDay).length > 0 && !selected && (
        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontFamily: 'var(--font-corps)', fontSize: '0.78rem', color: '#94a3b8' }}>
          Cliquez sur un jour pour voir le détail de ses événements
        </p>
      )}
    </div>
  )
}
