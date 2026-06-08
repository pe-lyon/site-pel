'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, Send } from 'lucide-react'

interface Message {
  id: string
  contenu: string
  created_at: string
  auteur_id: string
  profiles: { first_name: string; last_name: string } | null
}

const glassCard = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 4px 24px rgba(4,67,154,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
  borderRadius: '1rem',
  padding: '1.5rem',
} as const

function timeAgo(dt: string) {
  const diff = Date.now() - new Date(dt).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `il y a ${hrs}h`
  return new Date(dt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function GroupeMessages({
  groupeId,
  isPresident,
  currentUserId,
  groupColor,
}: {
  groupeId: string
  isPresident: boolean
  currentUserId: string
  groupColor: string
}) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [contenu, setContenu] = useState('')
  const [sending, setSending] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadMessages() {
      try {
        const { data, error } = await supabase
          .from('messages_groupe')
          .select('id, contenu, created_at, auteur_id, profiles!messages_groupe_auteur_id_fkey(first_name, last_name)')
          .eq('groupe_id', groupeId)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) {
          if (error.message?.includes('does not exist') || error.code === '42P01') {
            setUnavailable(true)
            return
          }
          throw error
        }
        setMessages((data ?? []).reverse() as Message[])
      } catch {
        setUnavailable(true)
      }
    }
    loadMessages()

    const channel = supabase
      .channel(`messages-groupe-${groupeId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages_groupe',
        filter: `groupe_id=eq.${groupeId}`,
      }, (payload: any) => {
        // Refetch for join data
        loadMessages()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, groupeId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!contenu.trim()) return
    setSending(true)
    try {
      const { error } = await supabase
        .from('messages_groupe')
        .insert({ groupe_id: groupeId, auteur_id: currentUserId, contenu: contenu.trim() })
      if (error) throw error
      setContenu('')
    } catch (err: unknown) {
      console.error('Erreur envoi message', err)
    } finally {
      setSending(false)
    }
  }

  if (unavailable) {
    return (
      <div style={glassCard}>
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

  return (
    <div style={glassCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <MessageCircle size={18} color="#04439a" />
        <h2 style={{ fontFamily: 'var(--font-titre)', fontWeight: 700, color: '#1e3a5f', fontSize: '1rem' }}>
          Messages du groupe
        </h2>
        <span style={{
          marginLeft: 'auto', fontSize: '0.7rem', color: '#9ca3af',
          background: 'rgba(4,67,154,0.07)', padding: '0.2rem 0.5rem', borderRadius: '999px'
        }}>
          {messages.length} messages
        </span>
      </div>

      {/* Liste des messages */}
      <div style={{
        maxHeight: '320px', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
        marginBottom: isPresident ? '1rem' : 0,
        paddingRight: '0.25rem',
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
            <MessageCircle size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <p style={{ fontSize: '0.875rem' }}>Aucun message pour l&apos;instant.</p>
            {isPresident && <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Envoyez le premier message à votre groupe !</p>}
          </div>
        ) : (
          messages.map(msg => {
            const isMine = msg.auteur_id === currentUserId
            const initials = `${msg.profiles?.first_name?.charAt(0) ?? '?'}${msg.profiles?.last_name?.charAt(0) ?? ''}`
            return (
              <div key={msg.id} style={{
                display: 'flex', gap: '0.75rem',
                flexDirection: isMine ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  background: groupColor, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'white', fontSize: '0.65rem', fontWeight: 700,
                }}>
                  {initials}
                </div>
                <div style={{ maxWidth: '75%' }}>
                  <div style={{
                    display: 'flex', gap: '0.5rem', alignItems: 'baseline',
                    flexDirection: isMine ? 'row-reverse' : 'row',
                    marginBottom: '0.25rem',
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>
                      {isMine ? 'Moi' : `${msg.profiles?.first_name ?? ''} ${msg.profiles?.last_name ?? ''}`}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>{timeAgo(msg.created_at)}</span>
                  </div>
                  <div style={{
                    padding: '0.6rem 0.875rem', borderRadius: isMine ? '1rem 0.25rem 1rem 1rem' : '0.25rem 1rem 1rem 1rem',
                    background: isMine ? groupColor : 'rgba(255,255,255,0.8)',
                    color: isMine ? 'white' : '#1f2937',
                    fontSize: '0.875rem', lineHeight: 1.5,
                    border: isMine ? 'none' : '1px solid rgba(4,67,154,0.1)',
                  }}>
                    {msg.contenu}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Formulaire envoi (président seulement) */}
      {isPresident && (
        <form onSubmit={handleSend} style={{
          display: 'flex', gap: '0.5rem',
          borderTop: '1px solid rgba(4,67,154,0.1)', paddingTop: '1rem',
        }}>
          <textarea
            value={contenu}
            onChange={e => setContenu(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as any) } }}
            placeholder="Écrivez un message à votre groupe..."
            rows={2}
            style={{
              flex: 1, padding: '0.6rem 0.875rem', borderRadius: '0.75rem',
              border: '1px solid rgba(4,67,154,0.2)', fontSize: '0.875rem',
              resize: 'none', background: 'rgba(255,255,255,0.8)',
              outline: 'none', fontFamily: 'var(--font-corps)',
            }}
          />
          <button
            type="submit"
            disabled={sending || !contenu.trim()}
            style={{
              padding: '0.6rem 1rem', borderRadius: '0.75rem',
              background: groupColor, color: 'white',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: (sending || !contenu.trim()) ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  )
}
