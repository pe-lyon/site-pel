'use client'

import { useState } from 'react'
import { GraduationCap, Search } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  parlementaire: 'Parlementaire',
  president_groupe: 'Président·e de groupe',
  president_seance: 'Président·e de séance',
  ministre: 'Ministre',
}

interface ParlementaireProfile {
  id: string
  first_name: string
  last_name: string
  role: string
  avatar_url?: string | null
  permissions?: Record<string, any> | null
  political_groups?: { name: string; color: string } | null
}

export default function ParlementairesContent({ profiles }: { profiles: ParlementaireProfile[] }) {
  const [filtreGroupe, setFiltreGroupe] = useState<string>('all')
  const [search, setSearch] = useState('')

  // Groupes uniques
  const groupes = Array.from(
    new Map(
      profiles
        .filter(p => p.political_groups)
        .map(p => [p.political_groups!.name, p.political_groups!])
    ).values()
  )

  const filtered = profiles
    .filter(p => filtreGroupe === 'all' || p.political_groups?.name === filtreGroupe)
    .filter(p => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        p.first_name.toLowerCase().includes(q) ||
        p.last_name.toLowerCase().includes(q) ||
        (p.political_groups?.name.toLowerCase().includes(q) ?? false) ||
        (p.permissions?.universite?.toLowerCase().includes(q) ?? false)
      )
    })

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Barre de recherche + filtres */}
      <div style={{ marginBottom: '2rem' }}>
        {/* Recherche */}
        <div style={{
          position: 'relative', marginBottom: '1rem', maxWidth: '400px',
        }}>
          <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Rechercher un parlementaire…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.6rem 0.9rem 0.6rem 2.4rem',
              borderRadius: '0.75rem', border: '1.5px solid rgba(4,67,154,0.15)',
              background: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-corps)',
              fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Filtres groupe + compteur */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-corps)', color: '#6b7280', fontSize: '0.875rem', marginRight: '0.25rem' }}>
            {filtered.length} parlementaire{filtered.length !== 1 ? 's' : ''}
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginLeft: 'auto' }}>
            <button
              onClick={() => setFiltreGroupe('all')}
              style={{
                padding: '0.35rem 0.875rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
                border: '1.5px solid',
                borderColor: filtreGroupe === 'all' ? '#04439a' : 'rgba(4,67,154,0.2)',
                background: filtreGroupe === 'all' ? '#04439a' : 'rgba(255,255,255,0.7)',
                color: filtreGroupe === 'all' ? 'white' : '#04439a',
                cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-corps)',
              }}
            >
              Tous les groupes
            </button>
            {groupes.map(g => (
              <button
                key={g.name}
                onClick={() => setFiltreGroupe(g.name)}
                style={{
                  padding: '0.35rem 0.875rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
                  border: '1.5px solid',
                  borderColor: filtreGroupe === g.name ? g.color : g.color + '40',
                  background: filtreGroupe === g.name ? g.color : g.color + '15',
                  color: filtreGroupe === g.name ? 'white' : g.color,
                  cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-corps)',
                }}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grille de cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {filtered.map(p => {
          const initials = `${(p.first_name ?? '').charAt(0)}${(p.last_name ?? '').charAt(0)}`
          const groupColor = p.political_groups?.color ?? '#04439a'
          const universite = p.permissions?.universite ?? null

          return (
            <div key={p.id} style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.75)',
              boxShadow: '0 4px 24px rgba(4,67,154,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
              borderRadius: '1rem',
              padding: '1.5rem 1.25rem',
              textAlign: 'center',
              borderTop: `4px solid ${groupColor}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              {/* Avatar */}
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 1rem',
                background: groupColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
                boxShadow: `0 4px 12px ${groupColor}40`,
              }}>
                {p.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.avatar_url} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', fontFamily: 'var(--font-titre)' }}>{initials}</span>
                )}
              </div>

              <h3 style={{ fontFamily: 'var(--font-titre)', fontWeight: 700, color: '#1e3a5f', fontSize: '1rem', marginBottom: '0.25rem', lineHeight: 1.2 }}>
                {p.first_name} {p.last_name}
              </h3>

              {p.political_groups && (
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: groupColor, marginBottom: '0.5rem', fontFamily: 'var(--font-corps)' }}>
                  {p.political_groups.name}
                </p>
              )}

              <span style={{
                display: 'inline-block',
                padding: '0.2rem 0.65rem', borderRadius: '999px',
                fontSize: '0.68rem', fontWeight: 600,
                background: 'rgba(4,67,154,0.08)', color: '#04439a',
                fontFamily: 'var(--font-corps)', marginBottom: universite ? '0.625rem' : 0,
              }}>
                {ROLE_LABELS[p.role] ?? p.role}
              </span>

              {universite && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginTop: '0.5rem' }}>
                  <GraduationCap size={13} style={{ color: '#9ca3af', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.72rem', color: '#6b7280', fontFamily: 'var(--font-corps)' }}>
                    {universite}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
          <p style={{ fontFamily: 'var(--font-corps)' }}>Aucun parlementaire trouvé.</p>
        </div>
      )}
    </div>
  )
}
