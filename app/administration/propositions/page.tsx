'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bill, BillStatus, STATUS_LABELS, STATUS_COLORS, TYPE_LABELS } from '@/types'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Save, CheckCircle, XCircle, Eye, Gavel, Zap } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'

interface BillForm {
  number: string
  title: string
  description: string
  full_text: string
  status: BillStatus
  type: string
}

const emptyForm: BillForm = {
  number: '',
  title: '',
  description: '',
  full_text: '',
  status: 'deposee',
  type: 'proposition_de_loi',
}

export default function AdminPropositionsPage() {
  const supabase = createClient()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Bill | null>(null)
  const [form, setForm] = useState<BillForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'recevabilite' | 'all'>('recevabilite')
  const [motifIrrecevabilite, setMotifIrrecevabilite] = useState<Record<string, string>>({})

  const fetchBills = useCallback(async () => {
    const { data } = await supabase
      .from('bills')
      .select('*, profiles(first_name, last_name)')
      .order('created_at', { ascending: false })
    setBills((data ?? []) as unknown as Bill[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchBills() }, [fetchBills])

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('admin-bills')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bills' }, fetchBills)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchBills])

  async function generateNumber() {
    const year = new Date().getFullYear()
    const count = bills.length + 1
    return `PEL-${year}-${String(count).padStart(3, '0')}`
  }

  async function openCreate() {
    const num = await generateNumber()
    setEditing(null)
    setForm({ ...emptyForm, number: num })
    setShowForm(true)
  }

  function openEdit(bill: Bill) {
    setEditing(bill)
    setForm({
      number: bill.number,
      title: bill.title,
      description: bill.description ?? '',
      full_text: bill.full_text ?? '',
      status: bill.status,
      type: bill.type ?? 'proposition_de_loi',
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title.trim() || !form.number.trim()) {
      toast.error('Le titre et le numéro sont obligatoires')
      return
    }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const payload = {
        number: form.number.trim(),
        title: form.title.trim(),
        description: form.description || null,
        full_text: form.full_text || null,
        status: form.status,
        type: form.type,
        author_id: user?.id,
      }
      if (editing) {
        const { error } = await supabase.from('bills').update(payload).eq('id', editing.id)
        if (error) throw error
        toast.success('Proposition modifiée')
      } else {
        const { error } = await supabase.from('bills').insert(payload)
        if (error) throw error
        toast.success('Proposition créée')
      }
      setShowForm(false)
      fetchBills()
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur')
    }
    setSaving(false)
  }

  async function handleDelete(bill: Bill) {
    if (!confirm(`Supprimer la proposition "${bill.title}" ?`)) return
    const { error } = await supabase.from('bills').delete().eq('id', bill.id)
    if (error) {
      toast.error('Erreur lors de la suppression')
    } else {
      toast.success('Proposition supprimée')
      fetchBills()
    }
  }

  async function handleStatusChange(bill: Bill, newStatus: BillStatus) {
    const { error } = await supabase.from('bills').update({ status: newStatus }).eq('id', bill.id)
    if (error) {
      toast.error('Erreur')
    } else {
      toast.success(`Statut : ${STATUS_LABELS[newStatus]}`)
      fetchBills()
    }
  }

  async function handleRecevabilite(bill: Bill, recevabilite: 'recevable' | 'irrecevable') {
    const { data: { user } } = await supabase.auth.getUser()
    const motif = motifIrrecevabilite[bill.id] || null

    const updates: Record<string, unknown> = {
      recevabilite,
      recevabilite_par: user?.id,
      recevabilite_le: new Date().toISOString(),
      status: recevabilite === 'recevable' ? 'recevable' : 'irrecevable',
    }
    if (recevabilite === 'irrecevable' && motif) {
      updates.motif_irrecevabilite = motif
    }

    const { error } = await supabase.from('bills').update(updates).eq('id', bill.id)
    if (error) { toast.error(error.message); return }
    toast.success(recevabilite === 'recevable' ? '✅ Déclarée recevable' : '❌ Déclarée irrecevable')
    setMotifIrrecevabilite(prev => { const n = { ...prev }; delete n[bill.id]; return n })
    fetchBills()
  }

  const pendingRecevabilite = bills.filter(b => b.status === 'deposee')
  const allBills = bills

  return (
    <div>
      <TopBar title="Gestion des propositions" />
      <div className="p-6 space-y-6">

        {/* Onglets */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('recevabilite')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'recevabilite' ? 'bg-white text-pel-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Recevabilité
              {pendingRecevabilite.length > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {pendingRecevabilite.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-white text-pel-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Toutes les propositions
            </button>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} />
            Nouvelle proposition
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="card border-2 border-pel-blue/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="section-title">{editing ? 'Modifier la proposition' : 'Nouvelle proposition de loi'}</h3>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Numéro *</label>
                  <input type="text" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} className="input-field font-mono" placeholder="PEL-2024-001" />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field">
                    <option value="proposition_de_loi">Proposition de loi</option>
                    <option value="projet_de_loi">Projet de loi</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Statut</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as BillStatus })} className="input-field">
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Titre *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Titre de la proposition" />
              </div>
              <div>
                <label className="label">Résumé</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows={3} placeholder="Bref résumé..." />
              </div>
              <div>
                <label className="label">Texte complet</label>
                <textarea value={form.full_text} onChange={e => setForm({ ...form, full_text: e.target.value })} className="input-field resize-none" rows={8} placeholder="Texte intégral..." />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                <Save size={16} />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
            </div>
          </div>
        )}

        {/* TAB : Recevabilité */}
        {activeTab === 'recevabilite' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Gavel size={18} className="text-pel-blue" />
              <h2 className="font-semibold text-gray-800">Propositions en attente d&apos;examen de recevabilité</h2>
            </div>

            {pendingRecevabilite.length === 0 ? (
              <div className="card text-center py-12">
                <CheckCircle size={32} className="mx-auto mb-3 text-green-400" />
                <p className="text-gray-500">Aucune proposition en attente d&apos;examen.</p>
              </div>
            ) : (
              pendingRecevabilite.map(bill => (
                <div key={bill.id} className="card border-l-4 border-amber-400">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">{bill.number}</span>
                        {bill.type && (
                          <span className="badge bg-indigo-100 text-indigo-700 text-xs">
                            {TYPE_LABELS[bill.type] ?? bill.type}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900">{bill.title}</h3>
                      {bill.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{bill.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        par {(bill as any).profiles ? `${(bill as any).profiles.first_name} ${(bill as any).profiles.last_name}` : 'Inconnu'}
                        {' · '}Déposée le {formatDate(bill.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Motif irrecevabilité */}
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Motif en cas d'irrecevabilité (optionnel)"
                      value={motifIrrecevabilite[bill.id] ?? ''}
                      onChange={e => setMotifIrrecevabilite(prev => ({ ...prev, [bill.id]: e.target.value }))}
                      className="input-field text-sm mb-3"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleRecevabilite(bill, 'recevable')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={15} />
                        Déclarer recevable
                      </button>
                      <button
                        onClick={() => handleRecevabilite(bill, 'irrecevable')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        <XCircle size={15} />
                        Déclarer irrecevable
                      </button>
                      <a
                        href={`/propositions/${bill.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:border-pel-blue hover:text-pel-blue transition-colors"
                      >
                        <Eye size={15} />
                        Voir
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Propositions récemment traitées */}
            {bills.filter(b => b.recevabilite === 'irrecevable' || (b.recevabilite === 'recevable' && b.status !== 'deposee')).length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Récemment traitées</h3>
                <div className="card p-0 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="table-header">Proposition</th>
                        <th className="table-header">Recevabilité</th>
                        <th className="table-header hidden md:table-cell">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bills.filter(b => b.recevabilite === 'irrecevable' || (b.recevabilite === 'recevable' && b.status !== 'deposee')).slice(0, 10).map(bill => (
                        <tr key={bill.id} className="hover:bg-gray-50">
                          <td className="table-cell">
                            <p className="font-medium text-gray-900 text-sm">{bill.title}</p>
                            <p className="text-xs text-gray-400 font-mono">{bill.number}</p>
                          </td>
                          <td className="table-cell">
                            {bill.recevabilite === 'recevable' ? (
                              <span className="badge bg-green-100 text-green-700 text-xs flex items-center gap-1 w-fit">
                                <CheckCircle size={11} />Recevable
                              </span>
                            ) : (
                              <span className="badge bg-red-100 text-red-600 text-xs flex items-center gap-1 w-fit">
                                <XCircle size={11} />Irrecevable
                              </span>
                            )}
                          </td>
                          <td className="table-cell hidden md:table-cell">
                            <span className={`badge text-xs ${STATUS_COLORS[bill.status]}`}>
                              {STATUS_LABELS[bill.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB : Toutes */}
        {activeTab === 'all' && (
          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">Proposition</th>
                  <th className="table-header hidden sm:table-cell">Type</th>
                  <th className="table-header hidden md:table-cell">Statut</th>
                  <th className="table-header hidden lg:table-cell">Date</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allBills.map(bill => (
                  <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <p className="font-medium text-gray-900 text-sm">{bill.title}</p>
                      <p className="text-xs text-gray-400 font-mono">{bill.number}</p>
                      {bill.procedure_urgence && (
                        <span className="text-xs text-orange-600 flex items-center gap-0.5 mt-0.5">
                          <Zap size={10} />Urgence
                        </span>
                      )}
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      {bill.type && (
                        <span className="badge bg-indigo-100 text-indigo-700 text-xs">
                          {TYPE_LABELS[bill.type] ?? bill.type}
                        </span>
                      )}
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <select
                        value={bill.status}
                        onChange={e => handleStatusChange(bill, e.target.value as BillStatus)}
                        className={`badge ${STATUS_COLORS[bill.status]} border-0 cursor-pointer text-xs`}
                      >
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </td>
                    <td className="table-cell hidden lg:table-cell text-gray-400 text-xs">
                      {formatDate(bill.created_at)}
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(bill)} className="p-1.5 text-gray-400 hover:text-pel-blue hover:bg-pel-blue/10 rounded-lg">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(bill)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allBills.length === 0 && !loading && (
              <p className="text-center text-gray-400 py-12">Aucune proposition de loi</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
