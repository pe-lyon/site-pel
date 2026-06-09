'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function NotificationBell() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    if (permission !== 'granted') return

    const supabase = createClient()
    const channel = supabase
      .channel('notif-vote-sessions')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'vote_sessions' },
        (payload) => {
          const newRecord = payload.new as { status?: string; title?: string }
          if (newRecord.status === 'ouvert') {
            new Notification('Vote ouvert !', {
              body: newRecord.title ?? 'Un nouveau vote est ouvert',
              icon: '/logo-pel.png',
            })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [permission])

  async function handleActivate() {
    if (!supported) return
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  if (!supported) return null

  return (
    <div className="relative" title={permission === 'granted' ? 'Notifications activées' : 'Activer les notifications'}>
      <button
        onClick={permission !== 'granted' ? handleActivate : undefined}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell
          size={20}
          className={permission === 'granted' ? 'text-pel-blue' : 'text-gray-400'}
        />
        {permission === 'granted' && (
          <span
            style={{
              position: 'absolute', top: 6, right: 6,
              width: 8, height: 8, borderRadius: '50%',
              background: '#22c55e',
              border: '2px solid white',
            }}
          />
        )}
      </button>
    </div>
  )
}
