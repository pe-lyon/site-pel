'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  FileText,
  Vote,
  User,
  Users,
  Shield,
  BarChart3,
  UserCheck,
  BookOpen,
  LogOut,
  ChevronDown,
  ChevronRight,
  Calendar,
  PenLine,
  Flag,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/hemicycle', label: 'Hémicycle', icon: Building2 },
  { href: '/propositions', label: 'Propositions de loi', icon: FileText },
  { href: '/mes-votes', label: 'Mes votes', icon: ClipboardList },
  { href: '/profil', label: 'Mon profil', icon: User },
  { href: '/groupe', label: 'Mon Groupe', icon: Flag },
]

const adminItems: NavItem[] = [
  { href: '/administration/parlementaires', label: 'Parlementaires', icon: Users },
  { href: '/administration/groupes', label: 'Groupes politiques', icon: Shield },
  { href: '/administration/propositions', label: 'Gérer les propositions', icon: BookOpen },
  { href: '/administration/scrutins', label: 'Scrutins', icon: Vote },
  { href: '/administration/procurations', label: 'Procurations', icon: UserCheck },
  { href: '/administration/resultats', label: 'Résultats', icon: BarChart3 },
  { href: '/administration/seances', label: 'Séances', icon: Calendar },
]

interface SidebarProps {
  role: UserRole
  firstName: string
  lastName: string
}

const CONTRIBUTEUR_ROLES: string[] = ['contributeur_journalisme', 'contributeur_agenda', 'contributeur_general']

export default function Sidebar({ role, firstName, lastName }: SidebarProps) {
  const pathname = usePathname()
  const [adminOpen, setAdminOpen] = useState(pathname.startsWith('/administration'))
  const router = useRouter()
  const supabase = createClient()

  const isPresident = role === 'president_seance'
  const isContributeur = CONTRIBUTEUR_ROLES.includes(role as string)

  const [openSession, setOpenSession] = useState<{ id: string; title: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    async function fetchOpenSession() {
      try {
        const { data } = await supabase
          .from('vote_sessions')
          .select('id, title')
          .eq('status', 'ouvert')
          .maybeSingle()
        setOpenSession(data ?? null)
      } catch { /* ignore */ }
    }
    fetchOpenSession()
    const channel = supabase
      .channel('sidebar-vote-sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vote_sessions' }, fetchOpenSession)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Déconnexion réussie')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{
      background: 'rgba(4,67,154,0.88)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderRight: '1px solid rgba(255,255,255,0.12)',
      boxShadow: '4px 0 32px rgba(4,67,154,0.15)',
    }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-pel-blue-light/40">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/logo-pel.png"
            alt="PE de Lyon"
            width={44}
            height={44}
            className="rounded-lg flex-shrink-0"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <div>
            <p className="text-white font-bold text-base leading-tight">PE de Lyon</p>
            <p className="text-blue-200 text-xs leading-tight">Parlement des Étudiants</p>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-pel-blue-light/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-pel-gold rounded-full flex items-center justify-center">
            <span className="text-pel-blue font-bold text-xs">
              {firstName.charAt(0)}{lastName.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">{firstName} {lastName}</p>
            <p className="text-blue-200 text-xs truncate capitalize">{role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Bannière vote en cours */}
      {openSession && (
        <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <Link
            href={`/scrutin/${openSession.id}`}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-white"
            style={{ background: 'rgba(178,29,11,0.85)', backdropFilter: 'blur(8px)' }}
          >
            <span className="w-2 h-2 rounded-full bg-red-300 animate-pulse flex-shrink-0" />
            <span className="truncate">🔴 Vote en cours — {openSession.title}</span>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          const isDashboard = item.href === '/dashboard'
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 relative',
                active
                  ? 'text-white'
                  : 'text-blue-100 hover:text-white'
              )}
              style={active ? {
                background: 'rgba(255,255,255,0.18)',
                borderLeft: '3px solid white',
              } : undefined}
            >
              <Icon size={18} />
              {item.label}
              {isDashboard && openSession && (
                <span className="ml-auto w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
              )}
            </Link>
          )
        })}

        {/* Section Contribuer (contributeurs uniquement) */}
        {isContributeur && (
          <div className="pt-2">
            <p className="px-3 py-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">Contributions</p>
            <Link
              href="/contribuer"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                pathname === '/contribuer' ? 'text-white' : 'text-blue-100 hover:text-white'
              )}
              style={pathname === '/contribuer' ? { background: 'rgba(255,255,255,0.18)', borderLeft: '3px solid white' } : undefined}
            >
              <PenLine size={18} />
              Soumettre une contribution
            </Link>
          </div>
        )}

        {/* Section Administration (président uniquement) */}
        {isPresident && (
          <div className="pt-4">
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-blue-300 uppercase tracking-wider hover:text-blue-100 transition-colors"
            >
              <span>Administration</span>
              {adminOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {adminOpen && (
              <div className="mt-1 space-y-1">
                {adminItems.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                        active
                          ? 'text-white'
                          : 'text-blue-100 hover:text-white'
                      )}
                      style={active ? {
                        background: 'rgba(255,255,255,0.18)',
                        borderLeft: '3px solid white',
                      } : undefined}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-pel-blue-light/40">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-100 hover:bg-pel-red hover:text-white transition-colors duration-150"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
