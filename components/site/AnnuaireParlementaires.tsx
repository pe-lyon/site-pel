'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, X, FileText, Vote, ChevronRight, Users } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  president_seance: 'Président de séance',
  president_groupe: 'Président de groupe',
  parlementaire: 'Parlementaire',
  ministre: 'Ministre',
  admin: 'Administrateur',
}

const POSITION_LABELS: Record<string, string> = {
  extreme_gauche: 'Extrême-gauche', gauche_radicale: 'Gauche radicale', gauche: 'Gauche',
  centre_gauche: 'Centre-gauche', centre: 'Centre', centre_droit: 'Centre-droit',
  droite: 'Droite', droite_radicale: 'Droite radicale', extreme_droite: 'Extrême-droite',
  monarchiste: 'Monarchiste', autre: 'Autre',
}

function Initials({ first, last, color, size = 40 }: { first: string; last: string; color: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
      fontFamily: 'var(--font-corps)',
    }}>
      {first.charAt(0).toUpperCase()}{last.charAt(0).toUpperCase()}
    </div>
  )
}

function ProfileModal({ profile, onClose }: { profile: any; onClose: () => void }) {
  const supabase = createClient()
  const [bills, setBills] = useState<any[]>([])
  const [voteStats, setVoteStats] = useState<{ pour: number; contre: number; abstention: number; total: number } | null>(null)
  const [recentVotes, setRecentVotes] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const color = profile.political_groups?.color ?? '#04439a'

  useEffect(() => {
    async function load() {
      try {
        // Bills soumis par ce parlementaire
        const { data: b } = await supabase
          .from('bills')
          .select('id, number, title, status, created_at')
          .eq('author_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5)
        setBills(b ?? [])

        // Votes de ce parlementaire (uniquement scrutins publics)
        const { data: v } = await supabase
          .from('votes')
          .select('vote_value, session_id, vote_sessions!votes_session_id_fkey(title, status, type_scrutin, closed_at)')
          .eq('voter_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (v) {
          const pour = v.filter((x: any) => x.vote_value === 'pour').length
          const contre = v.filter((x: any) => x.vote_value === 'contre').length
          const abstention = v.filter((x: any) => x.vote_value === 'abstention').length
          setVoteStats({ pour, contre, abstention, total: v.length })

          const publics = v.filter((x: any) =>
            x.vote_sessions?.type_scrutin === 'public' && x.vote_sessions?.status === 'ferme'
          ).slice(0, 5)
          setRecentVotes(publics)
        }
      } catch (e) {
        console.error('ProfileModal load error', e)
      } finally {
        setLoadingData(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id])

  const billStatusLabel: Record<string, { label: string; color: string }> = {
    deposee: { label: 'Déposée', color: '#6b7280' },
    en_discussion: { label: 'En discussion', color: '#0369a1' },
    soumise_au_vote: { label: 'En vote', color: '#d97706' },
    adoptee: { label: 'Adoptée', color: '#16a34a' },
    rejetee: { label: 'Rejetée', color: '#dc2626' },
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: '1.5rem',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
      }}>
        {/* Header coloré */}
        <div style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, padding: '1.5rem', borderRadius: '1.5rem 1.5rem 0 0', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={16} color="white" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Initials first={profile.first_name} last={profile.last_name} color="rgba(255,255,255,0.25)" size={56} />
            <div>
              <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.4rem', fontWeight: 800, color: 'white', margin: 0 }}>
                {profile.first_name} {profile.last_name.toUpperCase()}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', marginTop: '0.25rem', fontFamily: 'var(--font-corps)' }}>
                {ROLE_LABELS[profile.role] ?? profile.role}
              </p>
              {profile.political_groups && (
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', marginTop: '0.15rem', fontFamily: 'var(--font-corps)' }}>
                  {profile.political_groups.name}
                  {profile.political_groups.political_position ? ` · ${POSITION_LABELS[profile.political_groups.political_position] ?? ''}` : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Corps */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {loadingData ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div style={{ width: 28, height: 28, border: `2px solid ${color}40`, borderTop: color, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <>
              {/* Stats votes */}
              {voteStats && voteStats.total > 0 && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-corps)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Vote size={14} /> Participation aux votes
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {[
                      { label: 'Pour', value: voteStats.pour, color: '#16a34a', bg: '#f0fdf4' },
                      { label: 'Contre', value: voteStats.contre, color: '#dc2626', bg: '#fef2f2' },
                      { label: 'Abstention', value: voteStats.abstention, color: '#9ca3af', bg: '#f9fafb' },
                    ].map(({ label, value, color: c, bg }) => (
                      <div key={label} style={{ background: bg, borderRadius: '0.75rem', padding: '0.75rem', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', fontWeight: 800, color: c, lineHeight: 1 }}>{value}</p>
                        <p style={{ fontFamily: 'var(--font-corps)', fontSize: '0.7rem', color: '#6b7280', marginTop: '0.25rem' }}>{label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Barre */}
                  {voteStats.total > 0 && (
                    <div style={{ display: 'flex', height: 6, borderRadius: 999, overflow: 'hidden', marginTop: '0.5rem', gap: 2 }}>
                      {voteStats.pour > 0 && <div style={{ flex: voteStats.pour, background: '#22c55e' }} />}
                      {voteStats.contre > 0 && <div style={{ flex: voteStats.contre, background: '#ef4444' }} />}
                      {voteStats.abstention > 0 && <div style={{ flex: voteStats.abstention, background: '#d1d5db' }} />}
                    </div>
                  )}
                </div>
              )}

              {/* Votes récents publics */}
              {recentVotes.length > 0 && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-corps)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🔓 Votes nominatifs récents
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {recentVotes.map((v: any, i: number) => {
                      const vc = v.vote_value === 'pour' ? '#16a34a' : v.vote_value === 'contre' ? '#dc2626' : '#9ca3af'
                      const vl = v.vote_value === 'pour' ? '✓ Pour' : v.vote_value === 'contre' ? '✗ Contre' : '— Abstention'
                      return (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: '#f9fafb', gap: '0.5rem' }}>
                          <p style={{ fontSize: '0.8rem', color: '#374151', fontFamily: 'var(--font-corps)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {v.vote_sessions?.title}
                          </p>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: vc, flexShrink: 0 }}>{vl}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Propositions déposées */}
              {bills.length > 0 && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-corps)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={14} /> Propositions déposées
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {bills.map((b: any) => {
                      const st = billStatusLabel[b.status] ?? { label: b.status, color: '#6b7280' }
                      return (
                        <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: '#f9fafb', gap: '0.5rem' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#04439a', fontFamily: 'var(--font-corps)' }}>{b.number}</p>
                            <p style={{ fontSize: '0.8rem', color: '#374151', fontFamily: 'var(--font-corps)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</p>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: st.color, flexShrink: 0, padding: '0.15rem 0.5rem', borderRadius: 999, background: st.color + '18' }}>{st.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Aucune donnée */}
              {(!voteStats || voteStats.total === 0) && bills.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                  <p style={{ fontSize: '0.9rem' }}>Aucune activité parlementaire enregistrée.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AnnuaireParlementaires({ profiles, groups }: { profiles: any[]; groups: any[] }) {
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<any>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return profiles.filter(p => {
      if (selectedGroup && p.group_id !== selectedGroup) return false
      if (!q) return true
      return (
        p.first_name?.toLowerCase().includes(q) ||
        p.last_name?.toLowerCase().includes(q) ||
        p.political_groups?.name?.toLowerCase().includes(q)
      )
    })
  }, [profiles, search, selectedGroup])

  const groupsWithMembers = groups.filter(g => profiles.some(p => p.group_id === g.id))

  return (
    <section>
      <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.4rem', color: 'var(--pel-bleu)', fontWeight: 700, marginBottom: '1rem' }}>
        ANNUAIRE DES PARLEMENTAIRES
      </h2>

      {/* Barre de recherche + filtres */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un parlementaire…"
            style={{
              width: '100%',
              paddingLeft: '2.25rem',
              paddingRight: search ? '2.25rem' : '0.75rem',
              paddingTop: '0.6rem',
              paddingBottom: '0.6rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(4,67,154,0.15)',
              background: 'rgba(255,255,255,0.7)',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-corps)',
              outline: 'none',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtres groupes */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          <button
            onClick={() => setSelectedGroup(null)}
            style={{
              padding: '0.4rem 0.875rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-corps)', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
              background: !selectedGroup ? 'var(--pel-bleu)' : 'rgba(255,255,255,0.7)',
              color: !selectedGroup ? 'white' : '#6b7280',
            }}
          >
            <Users size={11} style={{ display: 'inline', marginRight: 4 }} />
            Tous ({profiles.length})
          </button>
          {groupsWithMembers.map(g => {
            const count = profiles.filter(p => p.group_id === g.id).length
            const active = selectedGroup === g.id
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGroup(active ? null : g.id)}
                style={{
                  padding: '0.4rem 0.875rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-corps)', cursor: 'pointer', border: `2px solid ${g.color}`,
                  background: active ? g.color : 'rgba(255,255,255,0.7)',
                  color: active ? 'white' : g.color,
                  transition: 'all 0.2s',
                }}
              >
                {g.name} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Grille */}
      {filtered.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem', fontFamily: 'var(--font-corps)' }}>Aucun parlementaire trouvé.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {filtered.map(p => {
            const color = p.political_groups?.color ?? '#04439a'
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProfile(p)}
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid rgba(255,255,255,0.8)`,
                  borderTop: `3px solid ${color}`,
                  borderRadius: '0.875rem',
                  padding: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  boxShadow: '0 2px 8px rgba(4,67,154,0.06)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${color}30` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(4,67,154,0.06)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Initials first={p.first_name} last={p.last_name} color={color} size={36} />
                  <ChevronRight size={14} style={{ color: '#9ca3af' }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-corps)', fontWeight: 700, color: '#1e3a5f', fontSize: '0.875rem', lineHeight: 1.2 }}>
                    {p.first_name} {p.last_name.toUpperCase()}
                  </p>
                  {p.political_groups && (
                    <p style={{ fontFamily: 'var(--font-corps)', fontSize: '0.72rem', color: color, marginTop: '0.2rem', fontWeight: 600 }}>
                      {p.political_groups.name}
                    </p>
                  )}
                  <p style={{ fontFamily: 'var(--font-corps)', fontSize: '0.68rem', color: '#9ca3af', marginTop: '0.1rem' }}>
                    {ROLE_LABELS[p.role] ?? p.role}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Modal profil */}
      {selectedProfile && (
        <ProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}
    </section>
  )
}
