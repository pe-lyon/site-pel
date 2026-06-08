'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, X } from 'lucide-react'
import GroupeMessages from './GroupeMessages'

export default function FloatingGroupeChat() {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [groupInfo, setGroupInfo] = useState<{ id: string; name: string; color: string; isPresident: boolean } | null>(null)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('group_id, role, political_groups!profiles_group_id_fkey(id, name, color)')
        .eq('id', user.id)
        .single()

      if (profile?.group_id && (profile as any).political_groups) {
        const g = (profile as any).political_groups
        setGroupInfo({
          id: g.id,
          name: g.name,
          color: g.color,
          isPresident: profile.role === 'president_groupe',
        })
      }
    }
    load()
  }, [supabase])

  if (!groupInfo) return null

  return (
    <>
      {/* Panneau chat */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '5.5rem',
          right: '1.5rem',
          width: '360px',
          maxWidth: 'calc(100vw - 2rem)',
          zIndex: 100,
          borderRadius: '1.25rem',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(4,67,154,0.2)',
          border: '1px solid rgba(255,255,255,0.7)',
        }}>
          <div style={{
            background: groupInfo.color,
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageCircle size={16} color="white" />
              <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-corps)' }}>
                {groupInfo.name}
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={14} color="white" />
            </button>
          </div>
          <div style={{ maxHeight: '420px', overflowY: 'auto', background: 'rgba(255,255,255,0.97)' }}>
            <GroupeMessages
              groupeId={groupInfo.id}
              isPresident={groupInfo.isPresident}
              currentUserId={userId}
              groupColor={groupInfo.color}
            />
          </div>
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: groupInfo.color,
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          zIndex: 100,
          transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        title={`Messagerie — ${groupInfo.name}`}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  )
}
