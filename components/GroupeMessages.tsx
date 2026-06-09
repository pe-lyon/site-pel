'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Trash2, MessageCircle, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  contenu: string
  created_at: string
  auteur_id: string
  profiles: { first_name: string; last_name: string } | null
}

interface Props {
  groupeId: string
  currentUserId: string
  groupColor: string
  canSend: boolean
  isSpeaker: boolean
  allGroups?: { id: string; name: string; color: string }[]
}

function formatTimestamp(dt: string) {
  const date = new Date(dt)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `il y a ${hrs}h`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getDayLabel(dt: string) {
  const date = new Date(dt)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (msgDay.getTime() === today.getTime()) return "Aujourd'hui"
  if (msgDay.getTime() === yesterday.getTime()) return 'Hier'
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function GroupeMessages({ groupeId: initialGroupeId, currentUserId, groupColor, canSend, isSpeaker, allGroups }: Props) {
  const supabase = createClient()
  const [activeGroupeId, setActiveGroupeId] = useState(initialGroupeId)
  const [activeColor, setActiveColor] = useState(groupColor)
  const [messages, setMessages] = useState<Message[]>([])
  const [contenu, setContenu] = useState('')
  const [sending, setSending] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showGroupDropdown, setShowGroupDropdown] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const loadMessages = useCallback(async (gid: string) => {
    try {
      const { data, error } = await supabase
        .from('messages_groupe')
        .select('id, contenu, created_at, auteur_id, profiles!messages_groupe_auteur_id_fkey(first_name, last_name)')
        .eq('groupe_id', gid)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          setUnavailable(true)
          return
        }
        throw error
      }
      setMessages((data ?? []).reverse() as unknown as Message[])
    } catch {
      setUnavailable(true)
    }
  }, [supabase])

  useEffect(() => {
    setMessages([])
    setUnavailable(false)
    loadMessages(activeGroupeId)

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel(`messages-groupe-${activeGroupeId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages_groupe',
        filter: `groupe_id=eq.${activeGroupeId}`,
      }, () => { loadMessages(activeGroupeId) })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'messages_groupe',
        filter: `groupe_id=eq.${activeGroupeId}`,
      }, () => { loadMessages(activeGroupeId) })
      .subscribe()

    channelRef.current = channel

    return () => { supabase.removeChannel(channel) }
  }, [supabase, activeGroupeId, loadMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent | React.KeyboardEvent) {
    e.preventDefault()
    if (!contenu.trim() || sending) return
    setSending(true)
    try {
      const { error } = await supabase
        .from('messages_groupe')
        .insert({ groupe_id: activeGroupeId, auteur_id: currentUserId, contenu: contenu.trim() })
      if (error) throw error
      setContenu('')
    } catch (err: unknown) {
      console.error('Erreur envoi message', err)
      toast.error('Impossible d\'envoyer le message')
    } finally {
      setSending(false)
    }
  }

  async function handleDelete(msgId: string) {
    setDeleting(msgId)
    try {
      const { error } = await supabase.from('messages_groupe').delete().eq('id', msgId)
      if (error) throw error
      setMessages(prev => prev.filter(m => m.id !== msgId))
      toast.success('Message supprimé')
    } catch {
      toast.error('Impossible de supprimer le message')
    } finally {
      setDeleting(null)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  function switchGroup(g: { id: string; name: string; color: string }) {
    setActiveGroupeId(g.id)
    setActiveColor(g.color)
    setShowGroupDropdown(false)
  }

  // Group messages by day
  const groupedMessages: { label: string; msgs: Message[] }[] = []
  for (const msg of messages) {
    const label = getDayLabel(msg.created_at)
    const last = groupedMessages[groupedMessages.length - 1]
    if (last && last.label === label) {
      last.msgs.push(msg)
    } else {
      groupedMessages.push({ label, msgs: [msg] })
    }
  }

  if (unavailable) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <MessageCircle size={18} color="#9ca3af" />
          <h2 style={{ fontFamily: 'var(--font-titre)', fontWeight: 700, color: '#6b7280', fontSize: '1rem' }}>
            Messagerie du groupe
          </h2>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>
          Messagerie disponible prochainement
        </p>
      </div>
    )
  }

  const activeGroupInfo = isSpeaker && allGroups ? allGroups.find(g => g.id === activeGroupeId) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Speaker group selector */}
      {isSpeaker && allGroups && allGroups.length > 0 && (
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(4,67,154,0.08)', position: 'relative' }}>
          <button
            onClick={() => setShowGroupDropdown(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
              background: 'rgba(4,67,154,0.06)', border: '1px solid rgba(4,67,154,0.15)',
              borderRadius: '0.625rem', padding: '0.5rem 0.75rem', cursor: 'pointer',
              fontFamily: 'var(--font-corps)', fontSize: '0.8rem', color: '#1e3a5f',
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: activeColor, flexShrink: 0 }} />
            <span style={{ flex: 1, textAlign: 'left', fontWeight: 600 }}>
              {activeGroupInfo?.name ?? 'Sélectionner un groupe'}
            </span>
            <ChevronDown size={14} />
          </button>
          {showGroupDropdown && (
            <div style={{
              position: 'absolute', top: 'calc(100% - 4px)', left: '0.75rem', right: '0.75rem',
              background: 'white', border: '1px solid rgba(4,67,154,0.15)', borderRadius: '0.75rem',
              boxShadow: '0 8px 24px rgba(4,67,154,0.12)', zIndex: 10, overflow: 'hidden',
            }}>
              {allGroups.map(g => (
                <button
                  key={g.id}
                  onClick={() => switchGroup(g)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                    padding: '0.6rem 0.875rem', border: 'none', background: g.id === activeGroupeId ? 'rgba(4,67,154,0.06)' : 'transparent',
                    cursor: 'pointer', fontFamily: 'var(--font-corps)', fontSize: '0.8rem', color: '#1e3a5f',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                  {g.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages list */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '1rem',
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        minHeight: 0,
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
            <MessageCircle size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <p style={{ fontSize: '0.875rem' }}>Aucun message pour l&apos;instant.</p>
            {canSend && <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Soyez le premier à écrire !</p>}
          </div>
        ) : (
          groupedMessages.map(({ label, msgs }) => (
            <div key={label}>
              {/* Day separator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.75rem 0 0.5rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(4,67,154,0.08)' }} />
                <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontFamily: 'var(--font-corps)', whiteSpace: 'nowrap' }}>{label}</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(4,67,154,0.08)' }} />
              </div>
              {msgs.map(msg => {
                const isMine = msg.auteur_id === currentUserId
                const initials = `${msg.profiles?.first_name?.charAt(0) ?? '?'}${msg.profiles?.last_name?.charAt(0) ?? ''}`
                const isHovered = hoveredId === msg.id
                return (
                  <div
                    key={msg.id}
                    onMouseEnter={() => setHoveredId(msg.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      display: 'flex', gap: '0.625rem',
                      flexDirection: isMine ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem',
                      position: 'relative',
                    }}
                  >
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                      background: activeColor, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'white', fontSize: '0.6rem', fontWeight: 700,
                      marginTop: '4px',
                    }}>
                      {initials}
                    </div>
                    <div style={{ maxWidth: '72%' }}>
                      <div style={{
                        display: 'flex', gap: '0.5rem', alignItems: 'baseline',
                        flexDirection: isMine ? 'row-reverse' : 'row',
                        marginBottom: '0.2rem',
                      }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#374151' }}>
                          {isMine ? 'Moi' : `${msg.profiles?.first_name ?? ''} ${msg.profiles?.last_name ?? ''}`}
                        </span>
                        <span style={{ fontSize: '0.6rem', color: '#9ca3af' }}>{formatTimestamp(msg.created_at)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexDirection: isMine ? 'row-reverse' : 'row' }}>
                        <div style={{
                          padding: '0.5rem 0.75rem', borderRadius: isMine ? '1rem 0.25rem 1rem 1rem' : '0.25rem 1rem 1rem 1rem',
                          background: isMine ? activeColor : 'rgba(255,255,255,0.85)',
                          color: isMine ? 'white' : '#1f2937',
                          fontSize: '0.8rem', lineHeight: 1.5,
                          border: isMine ? 'none' : '1px solid rgba(4,67,154,0.1)',
                          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        }}>
                          {msg.contenu}
                        </div>
                        {/* Delete button on hover for own messages */}
                        {isMine && isHovered && (
                          <button
                            onClick={() => handleDelete(msg.id)}
                            disabled={deleting === msg.id}
                            title="Supprimer le message"
                            style={{
                              width: '24px', height: '24px', borderRadius: '50%',
                              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                              color: '#ef4444', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0, opacity: deleting === msg.id ? 0.5 : 1,
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Send form */}
      {canSend && (
        <div style={{ borderTop: '1px solid rgba(4,67,154,0.08)', padding: '0.75rem 1rem' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                value={contenu}
                onChange={e => setContenu(e.target.value.slice(0, 500))}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez un message… (Entrée pour envoyer, Maj+Entrée pour sauter une ligne)"
                rows={2}
                style={{
                  width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.75rem',
                  border: '1px solid rgba(4,67,154,0.2)', fontSize: '0.8rem',
                  resize: 'none', background: 'rgba(255,255,255,0.8)',
                  outline: 'none', fontFamily: 'var(--font-corps)',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{
                position: 'absolute', bottom: '6px', right: '10px',
                fontSize: '0.6rem', color: contenu.length > 450 ? '#ef4444' : '#9ca3af',
              }}>
                {contenu.length}/500
              </span>
            </div>
            <button
              type="submit"
              disabled={sending || !contenu.trim()}
              style={{
                padding: '0.5rem 0.875rem', borderRadius: '0.75rem',
                background: activeColor, color: 'white',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: (sending || !contenu.trim()) ? 0.5 : 1,
                transition: 'opacity 0.2s',
                flexShrink: 0, height: '42px',
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
