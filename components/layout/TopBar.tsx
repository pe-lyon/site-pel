'use client'

import { Bell, Menu } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface TopBarProps {
  title: string
  onMenuClick?: () => void
}

export default function TopBar({ title, onMenuClick }: TopBarProps) {
  const today = formatDate(new Date().toISOString())

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
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
