'use client'

const glassStyle = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(20px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 4px 24px rgba(4,67,154,0.07)',
  borderRadius: '1rem',
}

interface Props {
  groups: any[]
  profiles: any[]
  bills: any[]
  closedSessions: any[]
}

export default function ClassementGroupes({ groups, profiles, bills }: Props) {
  const ranked = groups
    .map(g => {
      const membres = profiles.filter(p => p.group_id === g.id)
      if (membres.length === 0) return null
      const memberIds = new Set(membres.map((m: any) => m.id))
      const groupBills = bills.filter(b => memberIds.has(b.author_id))
      const adoptes = groupBills.filter(b => b.status === 'adoptee').length
      const soumis = groupBills.filter(b => ['adoptee', 'rejetee', 'soumise_au_vote'].includes(b.status)).length
      const score = adoptes * 3 + soumis * 1 + membres.length * 0.5
      return { group: g, membres: membres.length, adoptes, soumis, score }
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.score - a.score)

  if (ranked.length === 0) return null

  const maxScore = ranked[0]?.score ?? 1
  const medals = ['🥇', '🥈', '🥉']

  return (
    <section>
      <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.4rem', color: 'var(--pel-bleu)', fontWeight: 700, marginBottom: '1rem' }}>
        CLASSEMENT DES GROUPES
      </h2>
      <div style={{ ...glassStyle, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {ranked.map((item: any, i: number) => {
          const pct = maxScore > 0 ? Math.round((item.score / maxScore) * 100) : 0
          return (
            <div key={item.group.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Rang */}
                <span style={{ fontFamily: 'var(--font-titre)', fontSize: '1.1rem', width: 32, textAlign: 'center', flexShrink: 0 }}>
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </span>
                {/* Couleur + nom */}
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: item.group.color ?? '#94a3b8', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-corps)', fontWeight: 700, color: '#1e3a5f', flex: 1, fontSize: '0.9rem' }}>
                  {item.group.name}
                </span>
                {/* Score */}
                <span style={{ fontFamily: 'var(--font-titre)', fontSize: '1rem', fontWeight: 700, color: 'var(--pel-bleu)', flexShrink: 0 }}>
                  {item.score.toFixed(1)} pts
                </span>
              </div>
              {/* Barre de progression */}
              <div style={{ marginLeft: 44, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ height: 6, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: item.group.color ?? 'var(--pel-bleu)', borderRadius: 999, transition: 'width 0.6s ease' }} />
                </div>
                {/* Stats */}
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', fontFamily: 'var(--font-corps)', color: '#6b7280' }}>
                  <span>👥 {item.membres} membres</span>
                  <span>✓ {item.adoptes} adopté{item.adoptes > 1 ? 's' : ''}</span>
                  <span>📄 {item.soumis} soumis</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
