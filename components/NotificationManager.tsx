'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function NotificationManager() {
  useEffect(() => {
    // Request permission only if not yet decided
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }

    const supabase = createClient()

    const channel = supabase
      .channel('vote-sessions-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vote_sessions' },
        (payload) => {
          const session = payload.new as any
          if (session?.status === 'ouvert') {
            const title = session.title ?? 'Nouveau vote'

            // Browser notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('🗳️ Vote en cours !', {
                body: title,
                icon: '/logo-pel.png',
              })
            }

            // Toast
            toast(`🗳️ Vote ouvert : ${title}`, {
              duration: 6000,
              style: {
                background: '#04439a',
                color: '#fff',
                fontWeight: 600,
              },
            })
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return null
}
