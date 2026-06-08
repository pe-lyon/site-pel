'use client'

import { Users, FileCheck, Vote, Building2 } from 'lucide-react'

interface Props {
  profiles: any[]
  groups: any[]
  closedSessions: any[]
  bills: any[]
}

const glassStyle = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(20px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 4px 24px rgba(4,67,154,0.07)',
  borderRadius: '1rem',
}

export default function SeanceStats({ profiles, groups, closedSessions, bills }: Props) {
  const parlementaires = profiles.filter(p =>
    ['parlementaire', 'president_groupe', 'president_seance'].includes(p.role)
  ).length

  const adoptees = bills.filter(b => b.status === 'adoptee').length
  const soumisesAuVote = bills.filter(b => ['adoptee', 'rejetee', 'soumise_au_vote'].includes(b.status)).length

  const stats = [
    {
      icon: Users,
      color: '#04439a',
      bg: 'rgba(4,67,154,0.08)',
      value: parlementaires,
      label: 'Parlementaires',
      sub: null,
    },
    {
      icon: FileCheck,
      color: '#059669',
      bg: 'rgba(5,150,105,0.08)',
      value: adoptees,
      label: 'Textes adoptés',
      sub: soumisesAuVote > 0 ? `${adoptees} / ${soumisesAuVote} soumis au vote` : null,
    },
    {
      icon: Vote,
      color: '#b21d0b',
      bg: 'rgba(178,29,11,0.08)',
      value: closedSessions.length,
      label: 'Scrutins tenus',
      sub: null,
    },
    {
      icon: Building2,
      color: '#7c3aed',
      bg: 'rgba(124,58,237,0.08)',
      value: groups.length,
      label: 'Groupes politiques',
      sub: null,
    },
  ]

  return (
    <section>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}
        className="sm:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} style={{ ...glassStyle, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem' }}>
                <Icon size={24} color={s.color} />
              </div>
              <span style={{ fontFamily: 'var(--font-titre)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--pel-bleu)', lineHeight: 1 }}>
                {s.value}
              </span>
              <span style={{ fontFamily: 'var(--font-corps)', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                {s.label}
              </span>
              {s.sub && (
                <span style={{ fontFamily: 'var(--font-corps)', fontSize: '0.72rem', color: '#9ca3af' }}>
                  {s.sub}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
