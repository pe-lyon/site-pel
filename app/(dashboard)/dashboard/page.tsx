export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, FileText, Vote, UserCheck, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatDateTime, formatDate } from '@/lib/utils'
import { STATUS_LABELS, STATUS_COLORS } from '@/types'
import TopBar from '@/components/layout/TopBar'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, political_groups(*)')
    .eq('id', user.id)
    .single()

  const [
    { count: totalParlementaires },
    { count: totalGroupes },
    { data: bills },
    { data: activeSessions },
    { data: recentBills },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('political_groups').select('*', { count: 'exact', head: true }),
    supabase.from('bills').select('status'),
    supabase.from('vote_sessions')
      .select('*, bills(title, number)')
      .eq('status', 'ouvert')
      .order('opened_at', { ascending: false })
      .limit(1),
    supabase.from('bills')
      .select('*, profiles(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const billsEnCours = bills?.filter(b => b.status === 'en_discussion').length ?? 0
  const billsVote = bills?.filter(b => b.status === 'soumise_au_vote').length ?? 0
  const activeSession = activeSessions?.[0]

  const stats = [
    {
      label: 'Parlementaires',
      value: totalParlementaires ?? 0,
      icon: Users,
      color: 'bg-blue-500',
      href: '/administration/parlementaires',
    },
    {
      label: 'Groupes politiques',
      value: totalGroupes ?? 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      href: '/hemicycle',
    },
    {
      label: 'Propositions en discussion',
      value: billsEnCours,
      icon: FileText,
      color: 'bg-amber-500',
      href: '/propositions',
    },
    {
      label: 'Soumises au vote',
      value: billsVote,
      icon: Vote,
      color: 'bg-red-500',
      href: '/propositions',
    },
  ]

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

            {recentBills && recentBills.length > 0 ? (
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

          {/* Mon groupe */}
          <div className="card">
            <h2 className="section-title mb-4">Ma situation</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Nom</span>
                <span className="text-sm font-semibold text-gray-800">
                  {profile?.first_name} {profile?.last_name}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Rôle</span>
                <span className="text-sm font-semibold text-gray-800 capitalize">
                  {profile?.role?.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Groupe</span>
                {profile?.political_groups ? (
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
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Email</span>
                <span className="text-sm font-semibold text-gray-800">{profile?.email}</span>
              </div>
            </div>
            <Link href="/profil" className="btn-secondary w-full mt-4 text-center block text-sm">
              Modifier mon profil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
