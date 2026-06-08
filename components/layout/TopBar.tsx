'use client'

import { Menu } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useMobileMenu } from './DashboardShell'

interface TopBarProps {
  title: string
}

export default function TopBar({ title }: TopBarProps) {
  const today = formatDate(new Date().toISOString())
  const openMenu = useMobileMenu()

  return (
    <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-10" style={{
      background: 'rgba(255,255,255,0.65)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      borderBottom: '1px solid rgba(255,255,255,0.70)',
      boxShadow: '0 2px 16px rgba(4,67,154,0.06)',
    }}>
      <div className="flex items-center gap-4">
        <button
          onClick={openMenu}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-pel-blue">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden sm:block text-sm text-gray-500">{today}</span>
        <div className="flex items-center gap-1 bg-pel-blue/5 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-pel-blue font-medium">En séance</span>
        </div>
      </div>
    </header>
  )
}
