'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bill, BillStatus, STATUS_LABELS, STATUS_COLORS } from '@/types'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Save, Archive } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'

interface BillForm {
  number: string
  title: string
  description: string
  full_text: string
  status: BillStatus
}

const emptyForm: BillForm = {
  number: '',
  title: '',
  description: '',
  full_text: '',
  status: 'deposee',
}

export default function AdminPropositionsPage() {
  const supabase = createClient()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Bill | null>(null)
  const [form, setForm] = useState<BillForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchBills = useCallback(async () => {
    const { data } = await supabase
      .from('bills')
      .select('*, profiles(first_name, last_name)')
      .order('created_at', { ascending: false })
    setBills(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchBills() }, [fetchBills])

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

  return (
    <div>
      <TopBar title="Gestion des propositions" />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-500 text-sm">{bills.length} proposition(s)</p>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Nouvelle proposition
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="card border-2 border-pel-blue/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="section-title">
                {editing ? 'Modifier la proposition' : 'Nouvelle proposition de loi'}
              </h3>
              <button onClick={() => setShowForm(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Numéro *</label>
                  <input
                    type="text"
                    value={form.number}
                    onChange={e => setForm({ ...form, number: e.target.value })}
                    className="input-field font-mono"
                    placeholder="PEL-2024-001"
                  />
                </div>
                <div>
                  <label className="label">Statut</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value as BillStatus })}
                    className="input-field"
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Titre *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="input-field"
                  placeholder="Titre de la proposition"
                />
              </div>
              <div>
                <label className="label">Résumé</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Bref résumé de la proposition..."
                />
              </div>
              <div>
                <label className="label">Texte complet</label>
                <textarea
                  value={form.full_text}
                  onChange={e => setForm({ ...form, full_text: e.target.value })}
                  className="input-field resize-none"
                  rows={8}
                  placeholder="Texte intégral de la proposition de loi..."
                />
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

        {/* Liste */}
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header">Proposition</th>
                <th className="table-header hidden md:table-cell">Statut</th>
                <th className="table-header hidden lg:table-cell">Date</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bills.map(bill => (
                <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell">
                    <p className="font-medium text-gray-900">{bill.title}</p>
                    <p className="text-xs text-gray-400 font-mono">{bill.number}</p>
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
                      <button onClick={() => handleDelete(bill)} className="p-1.5 text-gray-400 hover:text-pel-red hover:bg-red-50 rounded-lg">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bills.length === 0 && (
            <p className="text-center text-gray-400 py-12">Aucune proposition de loi</p>
          )}
        </div>
      </div>
    </div>
  )
}
