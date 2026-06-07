'use client'

import Link from 'next/link'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types'
import { useState } from 'react'
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
  { href: '/profil', label: 'Mon profil', icon: User },
]

const adminItems: NavItem[] = [
  { href: '/administration/parlementaires', label: 'Parlementaires', icon: Users },
  { href: '/administration/groupes', label: 'Groupes politiques', icon: Shield },
  { href: '/administration/propositions', label: 'Gérer les propositions', icon: BookOpen },
  { href: '/administration/scrutins', label: 'Scrutins', icon: Vote },
  { href: '/administration/procurations', label: 'Procurations', icon: UserCheck },
  { href: '/administration/resultats', label: 'Résultats', icon: BarChart3 },
]

interface SidebarProps {
  role: UserRole
  firstName: string
  lastName: string
}

export default function Sidebar({ role, firstName, lastName }: SidebarProps) {
  const pathname = usePathname()
  const [adminOpen, setAdminOpen] = useState(pathname.startsWith('/administration'))
  const router = useRouter()
  const supabase = createClient()

  const isPresident = role === 'president_seance'

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Déconnexion réussie')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-pel-blue min-h-screen flex flex-col shadow-xl">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-pel-blue-light/40">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-pel-blue font-bold text-sm">PEL</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Parlement des</p>
            <p className="text-white font-bold text-sm leading-tight">Étudiants de Lyon</p>
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

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                active
                  ? 'bg-white text-pel-blue'
                  : 'text-blue-100 hover:bg-pel-blue-light hover:text-white'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}

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
                          ? 'bg-white text-pel-blue'
                          : 'text-blue-100 hover:bg-pel-blue-light hover:text-white'
                      )}
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
