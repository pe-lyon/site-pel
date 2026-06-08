'use client'

import { useState } from 'react'

const ROLE_LABELS: Record<string, string> = {
  parlementaire: 'Parlementaire',
  president_groupe: 'Président de groupe',
  president_seance: 'Président de séance',
  ministre: 'Ministre',
}

interface ParlementaireProfile {
  id: string
  first_name: string
  last_name: string
  role: string
  avatar_url?: string | null
  political_groups?: { name: string; color: string } | null
}

export default function ParlementairesContent({ profiles }: { profiles: ParlementaireProfile[] }) {
  const [filtreGroupe, setFiltreGroupe] = useState<string>('all')

  // Groupes uniques
  const groupes = Array.from(
    new Map(
      profiles
        .filter(p => p.political_groups)
        .map(p => [p.political_groups!.name, p.political_groups!])
    ).values()
  )

  const filtered = filtreGroupe === 'all'
    ? profiles
    : profiles.filter(p => p.political_groups?.name === filtreGroupe)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Compteur + filtres */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem' }}>
        <span style={{ fontFamily: 'var(--font-corps)', color: '#6b7280', fontSize: '0.95rem' }}>
          {filtered.length} parlementaire{filtered.length !== 1 ? 's' : ''}
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginLeft: 'auto' }}>
          <button
            onClick={() => setFiltreGroupe('all')}
            style={{
              padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
              border: '1.5px solid',
              borderColor: filtreGroupe === 'all' ? '#04439a' : 'rgba(4,67,154,0.2)',
              background: filtreGroupe === 'all' ? '#04439a' : 'rgba(255,255,255,0.7)',
              color: filtreGroupe === 'all' ? 'white' : '#04439a',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            Tous
          </button>
          {groupes.map(g => (
            <button
              key={g.name}
              onClick={() => setFiltreGroupe(g.name)}
              style={{
                padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
                border: '1.5px solid',
                borderColor: filtreGroupe === g.name ? g.color : g.color + '40',
                background: filtreGroupe === g.name ? g.color : g.color + '15',
                color: filtreGroupe === g.name ? 'white' : g.color,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grille de cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {filtered.map(p => {
          const initials = `${p.first_name.charAt(0)}${p.last_name.charAt(0)}`
          const groupColor = p.political_groups?.color ?? '#04439a'
          return (
            <div key={p.id} style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.75)',
              boxShadow: '0 4px 24px rgba(4,67,154,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
              borderRadius: '1rem',
              padding: '1.5rem',
              textAlign: 'center',
              borderTop: `4px solid ${groupColor}`,
            }}>
              {/* Avatar */}
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 1rem',
                background: groupColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {p.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.avatar_url} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{initials}</span>
                )}
              </div>
              <h3 style={{ fontFamily: 'var(--font-titre)', fontWeight: 700, color: '#1e3a5f', fontSize: '1rem', marginBottom: '0.25rem' }}>
                {p.first_name} {p.last_name}
              </h3>
              {p.political_groups && (
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: groupColor, marginBottom: '0.4rem' }}>
                  {p.political_groups.name}
                </p>
              )}
              <span style={{
                display: 'inline-block',
                padding: '0.2rem 0.6rem', borderRadius: '999px',
                fontSize: '0.7rem', fontWeight: 600,
                background: 'rgba(4,67,154,0.08)', color: '#04439a',
              }}>
                {ROLE_LABELS[p.role] ?? p.role}
              </span>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
          <p>Aucun parlementaire dans ce groupe.</p>
        </div>
      )}
    </div>
  )
}
