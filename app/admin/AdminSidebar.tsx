'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Calendar, Newspaper, Info, Users, Settings, LogOut, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const NAV = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/admin/actualites', label: 'Actualités', icon: Newspaper },
  { href: '/admin/agenda', label: 'Agenda', icon: Calendar },
  { href: '/admin/presentation', label: 'Notre institution', icon: Info },
  { href: '/admin/bureau', label: 'Bureau', icon: Users },
  { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
]

export default function AdminSidebar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    toast.success('Déconnecté')
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="w-60 min-h-screen flex flex-col shadow-xl flex-shrink-0" style={{ background: 'var(--pel-bleu)' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-3">
          <Image src="/logo-pel.png" alt="PEL" width={36} height={36} style={{ filter: 'brightness(0) invert(1)' }} />
          <div>
            <p className="text-white font-bold text-sm leading-tight" style={{ fontFamily: 'var(--font-titre)', letterSpacing: '0.05em' }}>ADMIN PEL</p>
            <p className="text-blue-200 text-xs">Gestion du site</p>
          </div>
        </Link>
      </div>

      {/* User */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--pel-rouge)', color: 'white' }}>
            {firstName[0]}{lastName[0]}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{firstName} {lastName}</p>
            <p className="text-blue-200 text-xs">Président de séance</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ background: active ? 'rgba(255,255,255,0.15)' : 'transparent', color: active ? 'white' : 'rgba(255,255,255,0.65)' }}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          )
        })}

        <div className="pt-4 border-t border-white/10 mt-4">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <Globe size={17} />
            Voir le site
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.65)' }}>
          <LogOut size={17} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
