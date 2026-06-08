'use client'

import { useEffect, useState } from 'react'
import { Users, FileText, Vote, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { formatDateTime, formatDate } from '@/lib/utils'
import { STATUS_LABELS, STATUS_COLORS, ROLE_LABELS } from '@/types'
import TopBar from '@/components/layout/TopBar'
import { createClient } from '@/lib/supabase/client'

async function adminRead(table: string, select = '*', order?: { col: string; asc?: boolean }, filters?: Record<string, string>) {
  const res = await fetch('/api/admin/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, select, order, filters }),
  })
  const result = await res.json()
  return result.data ?? []
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [totalParlementaires, setTotalParlementaires] = useState(0)
  const [totalGroupes, setTotalGroupes] = useState(0)
  const [billsEnCours, setBillsEnCours] = useState(0)
  const [billsVote, setBillsVote] = useState(0)
  const [activeSession, setActiveSession] = useState<any>(null)
  const [recentBills, setRecentBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { window.location.href = '/login'; return }

        // Chargements indépendants avec fallback sur []
        const [profiles, groups, bills, sessions, recent, profileRes] = await Promise.all([
          adminRead('profiles', 'id').catch(() => []),
          adminRead('political_groups', 'id').catch(() => []),
          adminRead('bills', 'status').catch(() => []),
          adminRead('vote_sessions', 'id, title, opened_at, bill_id, bills(title, number)', { col: 'opened_at', asc: false }, { status: 'ouvert' }).catch(() => []),
          adminRead('bills', 'id, number, title, status, created_at', { col: 'created_at', asc: false }).catch(() => []),
          adminRead('profiles', '*, political_groups!profiles_group_id_fkey(*)', undefined, { id: user.id }).catch(() => []),
        ])

        setTotalParlementaires(Array.isArray(profiles) ? profiles.length : 0)
        setTotalGroupes(Array.isArray(groups) ? groups.length : 0)
        setBillsEnCours(Array.isArray(bills) ? bills.filter((b: any) => b.status === 'en_discussion').length : 0)
        setBillsVote(Array.isArray(bills) ? bills.filter((b: any) => b.status === 'soumise_au_vote').length : 0)
        setActiveSession(Array.isArray(sessions) ? (sessions[0] ?? null) : null)
        setRecentBills(Array.isArray(recent) ? recent.slice(0, 5) : [])
        setProfile(Array.isArray(profileRes) ? (profileRes[0] ?? null) : null)
      } catch (err) {
        console.error('Erreur dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = [
    { label: 'Parlementaires', value: totalParlementaires, icon: Users, color: 'bg-blue-500', href: '/administration/parlementaires' },
    { label: 'Groupes politiques', value: totalGroupes, icon: TrendingUp, color: 'bg-purple-500', href: '/hemicycle' },
    { label: 'Propositions en discussion', value: billsEnCours, icon: FileText, color: 'bg-amber-500', href: '/propositions' },
    { label: 'Soumises au vote', value: billsVote, icon: Vote, color: 'bg-red-500', href: '/propositions' },
  ]

  if (loading) {
    return (
      <div>
        <TopBar title="Tableau de bord" />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-pel-blue/30 border-t-pel-blue rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar title="Tableau de bord" />

      <div className="p-6 space-y-6">
        {/* Scrutin actif */}
        {activeSession && (
          <div className="bg-gradient-to-r from-pel-blue to-pel-blue-light rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white/80 text-sm font-medium uppercase tracking-wide">
                    Scrutin en cours
                  </span>
                </div>
                <h2 className="text-xl font-bold">{activeSession.title}</h2>
                {activeSession.bills && (
                  <p className="text-white/70 text-sm mt-1">
                    {activeSession.bills.number} — {activeSession.bills.title}
                  </p>
                )}
                <p className="text-white/60 text-xs mt-2">
                  Ouvert le {formatDateTime(activeSession.opened_at)}
                </p>
              </div>
              <Link
                href={`/scrutin/${activeSession.id}`}
                className="flex-shrink-0 bg-white text-pel-blue font-bold px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                Voter →
              </Link>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="card hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-3xl font-bold text-pel-blue mt-1">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                  </div>
                  <div className={`${stat.color} p-2.5 rounded-lg`}>
                    <Icon size={20} className="text-white" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Propositions récentes */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Propositions récentes</h2>
              <Link href="/propositions" className="text-sm text-pel-blue hover:underline">
                Voir tout →
              </Link>
            </div>

            {recentBills.length > 0 ? (
              <div className="space-y-3">
                {recentBills.map((bill) => (
                  <Link
                    key={bill.id}
                    href={`/propositions/${bill.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-400 font-mono">{bill.number}</span>
                        <span className={`badge ${STATUS_COLORS[bill.status as keyof typeof STATUS_COLORS]}`}>
                          {STATUS_LABELS[bill.status as keyof typeof STATUS_LABELS]}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 truncate mt-0.5">{bill.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(bill.created_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">Aucune proposition déposée</p>
            )}
          </div>

          {/* Ma situation */}
          <div className="card">
            <h2 className="section-title mb-4">Ma situation</h2>
            {!profile ? (
              <p className="text-gray-400 text-sm text-center py-8">Profil introuvable — contactez l&apos;administration</p>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Nom</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {profile.first_name} {profile.last_name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Identifiant</span>
                  <span className="text-sm font-mono font-semibold text-gray-800">
                    {profile.email?.replace('@assemblee-pel.fr', '')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Rôle</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {ROLE_LABELS[profile.role as keyof typeof ROLE_LABELS] ?? profile.role}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500">Groupe</span>
                  {profile.political_groups ? (
                    <span
                      className="text-sm font-semibold flex items-center gap-1.5"
                      style={{ color: profile.political_groups.color }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: profile.political_groups.color }}
                      />
                      {profile.political_groups.name}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Non affilié</span>
                  )}
                </div>
              </div>
            )}
            <Link href="/profil" className="btn-secondary w-full mt-4 text-center block text-sm">
              Modifier mon profil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
