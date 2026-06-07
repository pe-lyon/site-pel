'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VoteSession, Bill } from '@/types'
import { formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Plus, X, Lock, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import TopBar from '@/components/layout/TopBar'
import { logAction } from '@/lib/utils'

export default function AdminScrutinsPage() {
  const supabase = createClient()
  const [sessions, setSessions] = useState<VoteSession[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [billId, setBillId] = useState('')
  const [duration, setDuration] = useState('')
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUserId(user?.id ?? null)
    const [{ data: s }, { data: b }] = await Promise.all([
      supabase.from('vote_sessions').select('*, bills(number, title)').order('created_at', { ascending: false }),
      supabase.from('bills').select('*').in('status', ['deposee', 'en_discussion', 'soumise_au_vote']).order('number'),
    ])
    setSessions(s ?? [])
    setBills(b ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
    const channel = supabase
      .channel('scrutins-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vote_sessions' }, fetchData)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchData, supabase])

  async function handleOpenScrutin() {
    if (!title.trim()) { toast.error('Le titre est obligatoire'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('vote_sessions').insert({
      title: title.trim(),
      bill_id: billId || null,
      duration_minutes: duration ? parseInt(duration) : null,
      opened_by: user?.id,
      status: 'ouvert',
    }).select().single()

    if (error) {
      toast.error('Erreur lors de l\'ouverture du scrutin')
    } else {
      // Mettre à jour le statut de la proposition
      if (billId) {
        await supabase.from('bills').update({ status: 'soumise_au_vote' }).eq('id', billId)
      }
      await logAction(supabase, user!.id, 'ouverture_scrutin', 'vote_session', data.id, { title })
      toast.success('Scrutin ouvert !')
      setShowForm(false)
      setTitle('')
      setBillId('')
      setDuration('')
      fetchData()
    }
    setSaving(false)
  }

  async function handleCloseScrutin(session: VoteSession) {
    if (!confirm(`Fermer le scrutin "${session.title}" ? Cette action est irréversible.`)) return
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('vote_sessions').update({
      status: 'ferme',
      closed_at: new Date().toISOString(),
    }).eq('id', session.id)

    if (error) {
      toast.error('Erreur')
    } else {
      // Mettre à jour le statut de la proposition selon les résultats
      if (session.bill_id) {
        const { data: votes } = await supabase.from('votes').select('vote_value').eq('session_id', session.id)
        const pour = votes?.filter(v => v.vote_value === 'pour').length ?? 0
        const contre = votes?.filter(v => v.vote_value === 'contre').length ?? 0
        const newStatus = pour > contre ? 'adoptee' : 'rejetee'
        await supabase.from('bills').update({ status: newStatus }).eq('id', session.bill_id)
      }
      await logAction(supabase, user!.id, 'fermeture_scrutin', 'vote_session', session.id)
      toast.success('Scrutin clos')
      fetchData()
    }
  }

  return (
    <div>
      <TopBar title="Gestion des scrutins" />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-500 text-sm">{sessions.length} scrutin(s)</p>
          {!sessions.find(s => s.status === 'ouvert') && (
            <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} />
              Ouvrir un scrutin
            </button>
          )}
        </div>

        {/* Scrutin actif */}
        {sessions.find(s => s.status === 'ouvert') && (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-700 font-semibold text-sm">Scrutin en cours</span>
                </div>
                <p className="font-bold text-green-900">{sessions.find(s => s.status === 'ouvert')?.title}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/administration/resultats`}
                  className="btn-secondary text-sm flex items-center gap-1"
                >
                  <ExternalLink size={14} />
                  Résultats
                </Link>
                <button
                  onClick={() => handleCloseScrutin(sessions.find(s => s.status === 'ouvert')!)}
                  className="btn-danger text-sm flex items-center gap-2"
                >
                  <Lock size={14} />
                  Clore le scrutin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire nouveau scrutin */}
        {showForm && (
          <div className="card border-2 border-pel-blue/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="section-title">Ouvrir un nouveau scrutin</h3>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Intitulé du scrutin *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="Ex: Vote solennel sur la proposition PEL-2024-001"
                />
              </div>
              <div>
                <label className="label">Proposition de loi liée (optionnel)</label>
                <select
                  value={billId}
                  onChange={e => setBillId(e.target.value)}
                  className="input-field"
                >
                  <option value="">— Vote libre sans proposition liée —</option>
                  {bills.map(b => (
                    <option key={b.id} value={b.id}>{b.number} — {b.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Durée limite (minutes, optionnel)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="input-field"
                  placeholder="Laisser vide pour clore manuellement"
                  min={1}
                  max={120}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleOpenScrutin} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? 'Ouverture...' : '🗳️ Ouvrir le scrutin'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
            </div>
          </div>
        )}

        {/* Historique */}
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="section-title">Historique des scrutins</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header">Scrutin</th>
                <th className="table-header hidden md:table-cell">Proposition</th>
                <th className="table-header hidden lg:table-cell">Ouvert le</th>
                <th className="table-header">Statut</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map(session => (
                <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell font-medium text-gray-900">{session.title}</td>
                  <td className="table-cell hidden md:table-cell text-gray-500 text-xs">
                    {session.bills ? `${session.bills.number}` : '—'}
                  </td>
                  <td className="table-cell hidden lg:table-cell text-gray-400 text-xs">
                    {formatDateTime(session.opened_at)}
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${session.status === 'ouvert' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {session.status === 'ouvert' ? 'En cours' : 'Clos'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <Link
                      href={`/administration/resultats?session=${session.id}`}
                      className="text-xs text-pel-blue hover:underline"
                    >
                      Résultats
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sessions.length === 0 && (
            <p className="text-center text-gray-400 py-12">Aucun scrutin</p>
          )}
        </div>
      </div>
    </div>
  )
}
