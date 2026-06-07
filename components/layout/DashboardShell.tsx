'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import { UserRole } from '@/types'
import { X } from 'lucide-react'

interface Props {
  role: UserRole
  firstName: string
  lastName: string
  children: React.ReactNode
}

export default function DashboardShell({ role, firstName, lastName, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-pel-gray-light">
      {/* Sidebar desktop */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar role={role} firstName={firstName} lastName={lastName} />
      </div>

      {/* Sidebar mobile — overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 z-10">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-3 z-20 p-1 rounded-full bg-white/20 text-white hover:bg-white/30"
            >
              <X size={16} />
            </button>
            <Sidebar role={role} firstName={firstName} lastName={lastName} />
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Injecter onMenuClick dans les enfants via contexte */}
        <MobileMenuContext.Provider value={() => setMobileOpen(true)}>
          {children}
        </MobileMenuContext.Provider>
      </main>
    </div>
  )
}

import { createContext, useContext } from 'react'
export const MobileMenuContext = createContext<() => void>(() => {})
export function useMobileMenu() { return useContext(MobileMenuContext) }
