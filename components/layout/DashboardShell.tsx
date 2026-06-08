'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import { UserRole } from '@/types'
import { X } from 'lucide-react'
import FloatingGroupeChat from '@/components/FloatingGroupeChat'
import NotificationManager from '@/components/NotificationManager'

interface Props {
  role: UserRole
  firstName: string
  lastName: string
  children: React.ReactNode
}

export default function DashboardShell({ role, firstName, lastName, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen relative" style={{ background: '#eef2ff' }}>
      {/* Fond orbs fixe */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 10% 5%, rgba(4,67,154,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 95%, rgba(178,29,11,0.07) 0%, transparent 60%), #eef2ff'
      }} aria-hidden="true">
        <div className="animate-orb" style={{ position: 'absolute', width: 600, height: 600, top: '-10%', left: '5%', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', filter: 'blur(70px)', background: 'radial-gradient(circle, rgba(4,67,154,0.15) 0%, transparent 70%)' }} />
        <div className="animate-orb-reverse" style={{ position: 'absolute', width: 500, height: 500, bottom: '5%', right: '-5%', borderRadius: '40% 60% 70% 30% / 40% 70% 30% 60%', filter: 'blur(60px)', background: 'radial-gradient(circle, rgba(178,29,11,0.10) 0%, transparent 70%)' }} />
        <div className="animate-float-slow" style={{ position: 'absolute', width: 400, height: 400, top: '40%', left: '40%', borderRadius: '50%', filter: 'blur(80px)', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:block flex-shrink-0 relative z-20">
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
      <main className="flex-1 overflow-auto min-w-0 relative z-10">
        {/* Injecter onMenuClick dans les enfants via contexte */}
        <MobileMenuContext.Provider value={() => setMobileOpen(true)}>
          {children}
        </MobileMenuContext.Provider>
      </main>

      {/* Chat flottant groupe */}
      <FloatingGroupeChat />
      <NotificationManager />
    </div>
  )
}

import { createContext, useContext } from 'react'
export const MobileMenuContext = createContext<() => void>(() => {})
export function useMobileMenu() { return useContext(MobileMenuContext) }
