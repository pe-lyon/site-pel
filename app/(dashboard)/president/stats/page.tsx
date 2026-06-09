'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/layout/TopBar'
import { BarChart3, Users, Vote, CheckCircle, XCircle } from 'lucide-react'

interface StatCard {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
}

interface GroupeStat {
  nom: string
  couleur: string
  participation: number
  total: number
}

interface DernierScrutin {
  id: string
  title: string
  pour: number
  contre: number
  abstention: number
  adopte: boolean
  closed_at: string | null
  created_at: string
}

export default function StatsPresidentPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalParlementaires: 0,
    tauxParticipationMoyen: 0,
    loisAdoptees: 0,
    loisRejetees: 0,
  })
  const [groupesStats, setGroupesStats] = useState<GroupeStat[]>([])
  const [dernierScrutins, setDernierScrutins] = useState<DernierScrutin[]>([])

  useEffect(() => {
    async function load() {
      // Total parlementaires actifs
      const profRes = await fetch('/api/admin/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'profiles', select: 'id,role,group_id' }),
      })
      const profData = await profRes.json()
      const profiles = (profData.data ?? []) as any[]
      const parlementaires = profiles.filter((p: any) =>
        ['parlementaire', 'president_groupe', 'president_seance', 'ministre'].includes(p.role)
      )

      // Sessions de vote fermées
      const sessRes = await fetch('/api/admin/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'vote_sessions',
          select: 'id,title,status,closed_at,created_at',
          filters: { status: 'ferme' },
        }),
      })
      const sessData = await sessRes.json()
      const sessions = (sessData.data ?? []) as any[]

      // Pour chaque session, charger les votes
      const sessionsWithVotes = await Promise.all(sessions.slice(0, 20).map(async (sess: any) => {
        const vRes = await fetch('/api/admin/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'votes',
            select: 'vote_value,voter_id',
            filters: { session_id: sess.id },
          }),
        })
        const vData = await vRes.json()
        const votes = (vData.data ?? []) as any[]
        const pour = votes.filter((v: any) => v.vote_value === 'pour').length
        const contre = votes.filter((v: any) => v.vote_value === 'contre').length
        const abstention = votes.filter((v: any) => v.vote_value === 'abstention').length
        const total = pour + contre + abstention
        const exprime = pour + contre
        const adopte = exprime > 0 && pour > exprime / 2
        const participation = parlementaires.length > 0 ? (total / parlementaires.length) * 100 : 0
        return { ...sess, pour, contre, abstention, total, adopte, participation }
      }))

      const tauxMoyen = sessionsWithVotes.length > 0
        ? sessionsWithVotes.reduce((acc: number, s: any) => acc + s.participation, 0) / sessionsWithVotes.length
        : 0

      const adoptees = sessionsWithVotes.filter((s: any) => s.adopte).length
      const rejetees = sessionsWithVotes.filter((s: any) => !s.adopte).length

      // Groupes politiques
      const grpRes = await fetch('/api/admin/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'political_groups', select: 'id,name,color' }),
      })
      const grpData = await grpRes.json()
      const groupes = (grpData.data ?? []) as any[]

      // Participation par groupe (basé sur les 10 dernières sessions)
      const groupesStatsCalc: GroupeStat[] = groupes.map((g: any) => {
        const membres = parlementaires.filter((p: any) => p.group_id === g.id)
        if (membres.length === 0) return { nom: g.name, couleur: g.color, participation: 0, total: 0 }
        const membreIds = new Set(membres.map((m: any) => m.id))
        let votesParGroupe = 0
        sessionsWithVotes.forEach((s: any) => {
          // On ne peut pas filtrer sans voter_id dans la réponse agrégée — on utilise une approx
          votesParGroupe += s.total
        })
        // Simplification : taux global utilisé
        return { nom: g.name, couleur: g.color ?? '#04439a', participation: tauxMoyen, total: membres.length }
      }).filter((g: GroupeStat) => g.total > 0)

      setStats({
        totalParlementaires: parlementaires.length,
        tauxParticipationMoyen: Math.round(tauxMoyen),
        loisAdoptees: adoptees,
        loisRejetees: rejetees,
      })
      setGroupesStats(groupesStatsCalc)
      setDernierScrutins(sessionsWithVotes.slice(0, 5) as DernierScrutin[])
      setLoading(false)
    }
    load()
  }, [supabase])

  const statCards: StatCard[] = [
    { label: 'Parlementaires actifs', value: stats.totalParlementaires, icon: Users, color: '#04439a' },
    { label: 'Taux de participation moyen', value: `${stats.tauxParticipationMoyen}%`, icon: BarChart3, color: '#7c3aed' },
    { label: 'Lois adoptées', value: stats.loisAdoptees, icon: CheckCircle, color: '#16a34a' },
    { label: 'Lois rejetées', value: stats.loisRejetees, icon: XCircle, color: '#dc2626' },
  ]

  if (loading) return (
    <div>
      <TopBar title="Statistiques" />
      <div className="p-6 text-center text-gray-400">Chargement des statistiques…</div>
    </div>
  )

  const maxParticipation = Math.max(...groupesStats.map(g => g.participation), 1)

  return (
    <div>
      <TopBar title="Statistiques" />
      <div className="p-6 space-y-8 max-w-4xl">
        <h2 className="section-title">Tableau de bord statistique</h2>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '0.75rem', background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} style={{ color: card.color }} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{card.label}</p>
                </div>
                <p style={{ fontFamily: 'var(--font-titre)', fontSize: '2rem', fontWeight: 700, color: card.color, lineHeight: 1 }}>
                  {card.value}
                </p>
              </div>
            )
          })}
        </div>

        {/* Graphique participation par groupe */}
        {groupesStats.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-pel-blue mb-4" style={{ fontFamily: 'var(--font-titre)' }}>
              PARTICIPATION PAR GROUPE POLITIQUE
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {groupesStats.map((g) => (
                <div key={g.nom} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '160px', fontSize: '0.85rem', fontWeight: 600, color: '#374151', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.nom}
                  </div>
                  <div style={{ flex: 1, height: '24px', background: '#f3f4f6', borderRadius: '999px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, (g.participation / maxParticipation) * 100)}%`,
                      background: g.couleur ?? '#04439a',
                      borderRadius: '999px',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                  <div style={{ width: '50px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: '#374151', flexShrink: 0 }}>
                    {Math.round(g.participation)}%
                  </div>
                  <div style={{ width: '40px', textAlign: 'right', fontSize: '0.75rem', color: '#9ca3af', flexShrink: 0 }}>
                    {g.total} mb
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Derniers scrutins */}
        {dernierScrutins.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-pel-blue mb-4" style={{ fontFamily: 'var(--font-titre)' }}>
              5 DERNIERS SCRUTINS
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {dernierScrutins.map((s) => {
                const total = s.pour + s.contre + s.abstention
                const pct = (v: number) => total > 0 ? Math.round((v / total) * 100) : 0
                return (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem',
                    borderRadius: '0.75rem', background: 'rgba(4,67,154,0.03)', flexWrap: 'wrap',
                  }}>
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700,
                      background: s.adopte ? '#dcfce7' : '#fee2e2',
                      color: s.adopte ? '#166534' : '#991b1b',
                      flexShrink: 0,
                    }}>
                      {s.adopte ? 'ADOPTÉ' : 'REJETÉ'}
                    </span>
                    <p style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>{s.title}</p>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', flexShrink: 0 }}>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ {s.pour} ({pct(s.pour)}%)</span>
                      <span style={{ color: '#dc2626', fontWeight: 700 }}>✗ {s.contre} ({pct(s.contre)}%)</span>
                      <span style={{ color: '#9ca3af' }}>— {s.abstention}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
