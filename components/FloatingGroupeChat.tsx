'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, X } from 'lucide-react'
import GroupeMessages from './GroupeMessages'

interface GroupInfo {
  id: string
  name: string
  color: string
}

export default function FloatingGroupeChat() {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)
  const [isSpeaker, setIsSpeaker] = useState(false)
  const [canSend, setCanSend] = useState(false)
  const [allGroups, setAllGroups] = useState<GroupInfo[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeGroupId, setActiveGroupId] = useState<string>('')
  const [ready, setReady] = useState(false)

  const getSeenKey = (gid: string) => `pel-chat-seen-${gid}`

  const countUnread = useCallback(async (gid: string) => {
    const seenTs = localStorage.getItem(getSeenKey(gid))
    if (!seenTs) return

    try {
      const { count } = await supabase
        .from('messages_groupe')
        .select('id', { count: 'exact', head: true })
        .eq('groupe_id', gid)
        .gt('created_at', seenTs)

      setUnreadCount(count ?? 0)
    } catch {}
  }, [supabase])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setReady(true); return }
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('group_id, role, political_groups!profiles_group_id_fkey(id, name, color)')
        .eq('id', user.id)
        .single()

      if (!profile) { setReady(true); return }

      const isPresSéance = profile.role === 'president_seance'

      if (isPresSéance) {
        // Fetch all groups
        const { data: groups } = await supabase
          .from('political_groups')
          .select('id, name, color')
          .order('name')

        const gs: GroupInfo[] = (groups ?? []).map((g: any) => ({ id: g.id, name: g.name, color: g.color }))
        setAllGroups(gs)
        setIsSpeaker(true)
        setCanSend(true)

        const first = gs[0] ?? null
        if (first) {
          setGroupInfo(first)
          setActiveGroupId(first.id)
          countUnread(first.id)
        }
      } else if (profile.group_id && (profile as any).political_groups) {
        const g = (profile as any).political_groups
        const gi: GroupInfo = { id: g.id, name: g.name, color: g.color }
        setGroupInfo(gi)
        setActiveGroupId(g.id)
        setCanSend(true)
        countUnread(g.id)
      }
      // else: no group, stay ready but groupInfo remains null → return null below

      setReady(true)
    }
    load()
  }, [supabase, countUnread])

  // Real-time unread counter
  useEffect(() => {
    if (!activeGroupId) return
    const channel = supabase
      .channel(`chat-unread-${activeGroupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages_groupe',
        filter: `groupe_id=eq.${activeGroupId}`,
      }, () => {
        if (!open) {
          setUnreadCount(n => n + 1)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, activeGroupId, open])

  function handleOpen() {
    setOpen(true)
    if (activeGroupId) {
      const now = new Date().toISOString()
      localStorage.setItem(getSeenKey(activeGroupId), now)
      setUnreadCount(0)
    }
  }

  function handleClose() {
    setOpen(false)
  }

  if (!ready) return null
  if (!groupInfo) return null

  const buttonColor = isSpeaker ? '#04439a' : groupInfo.color
  const panelHeaderLabel = isSpeaker ? 'Vue Président de Séance' : groupInfo.name

  return (
    <>
      {/* Panneau chat */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '4.5rem',
          right: '1.5rem',
          width: '380px',
          maxWidth: 'calc(100vw - 2rem)',
          zIndex: 100,
          borderRadius: '1.25rem',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(4,67,154,0.22)',
          border: '1px solid rgba(255,255,255,0.7)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 8rem)',
        }}>
          {/* Header */}
          <div style={{
            background: buttonColor,
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageCircle size={16} color="white" />
              <span style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'var(--font-corps)' }}>
                {panelHeaderLabel}
              </span>
            </div>
            <button
              onClick={handleClose}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={14} color="white" />
            </button>
          </div>

          {/* Messages panel */}
          <div style={{ flex: 1, overflow: 'hidden', background: 'rgba(255,255,255,0.97)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <GroupeMessages
              groupeId={groupInfo.id}
              currentUserId={userId}
              groupColor={groupInfo.color}
              canSend={canSend}
              isSpeaker={isSpeaker}
              allGroups={isSpeaker ? allGroups : undefined}
            />
          </div>
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={open ? handleClose : handleOpen}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: buttonColor,
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          zIndex: 100,
          transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'fixed',
        } as React.CSSProperties}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        title={`Messagerie — ${panelHeaderLabel}`}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}

        {/* Badge non lu */}
        {!open && unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#ef4444',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 700,
            borderRadius: '999px',
            minWidth: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            border: '2px solid white',
            fontFamily: 'var(--font-corps)',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </>
  )
}
