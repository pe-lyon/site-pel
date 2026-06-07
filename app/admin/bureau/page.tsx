'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { getInitials } from '@/lib/utils'

const EMPTY = { prenom: '', nom: '', role: '', email: '', linkedin_url: '', ordre: '0' }

async function apiRead(table: string) {
  const r = await fetch('/api/admin/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table, select: '*', order: { col: 'ordre' } }) })
  return (await r.json()).data ?? []
}
async function apiWrite(table: string, op: string, data: any, filters?: any) {
  const r = await fetch('/api/admin/write', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table, operation: op, data, filters }) })
  return await r.json()
}

const ROLES = [
  'Président(e) du Parlement', 'Vice-Président(e)', 'Secrétaire Général(e)',
  'Trésorier(ère)', 'Responsable communication', 'Chargé(e) de mission', 'Autre',
]

export default function AdminBureauPage() {
  const [membres, setMembres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    setMembres(await apiRead('bureau_membres'))
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  function openNew() { setForm(EMPTY); setEditing(null); setOpen(true) }
  function openEdit(m: any) {
    setForm({ prenom: m.prenom, nom: m.nom, role: m.role, email: m.email ?? '', linkedin_url: m.linkedin_url ?? '', ordre: String(m.ordre ?? 0) })
    setEditing(m.id); setOpen(true)
  }
  const F = (k: keyof typeof EMPTY, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function save() {
    if (!form.prenom || !form.nom || !form.role) return toast.error('Prénom, nom et rôle requis')
    const data = { prenom: form.prenom, nom: form.nom, role: form.role, email: form.email || null, linkedin_url: form.linkedin_url || null, ordre: parseInt(form.ordre) || 0, actif: true }
    if (editing) {
      await apiWrite('bureau_membres', 'update', data, { id: editing })
      toast.success('Membre modifié')
    } else {
      await apiWrite('bureau_membres', 'insert', data)
      toast.success('Membre ajouté')
    }
    setOpen(false); fetch()
  }

  async function del(id: string) {
    if (!confirm('Supprimer ce membre ?')) return
    await apiWrite('bureau_membres', 'delete', {}, { id })
    toast.success('Supprimé'); fetch()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: '2rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>BUREAU</h1>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16} /> Ajouter un membre</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-200 border-t-[#04439a] rounded-full animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {membres.length === 0 && <p className="col-span-3 text-gray-400 text-center py-12" style={{ fontFamily: 'var(--font-corps)' }}>Aucun membre. Ajoutez le premier !</p>}
          {membres.map(m => (
            <div key={m.id} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>
                  {getInitials(m.prenom, m.nom)}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-[#04439a] rounded transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => del(m.id)} className="p-1.5 text-gray-400 hover:text-[#b21d0b] rounded transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-corps)' }}>{m.prenom} {m.nom}</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>{m.role}</p>
              {m.email && <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'var(--font-corps)' }}>{m.email}</p>}
              <p className="text-xs text-gray-300 mt-2" style={{ fontFamily: 'var(--font-corps)' }}>Ordre : {m.ordre}</p>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>
                {editing ? 'MODIFIER' : 'NOUVEAU MEMBRE'}
              </h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Prénom *</label>
                  <input className="input-field" value={form.prenom} onChange={e => F('prenom', e.target.value)} placeholder="Marie" />
                </div>
                <div>
                  <label className="label">Nom *</label>
                  <input className="input-field" value={form.nom} onChange={e => F('nom', e.target.value)} placeholder="Dupont" />
                </div>
              </div>
              <div>
                <label className="label">Rôle *</label>
                <select className="input-field" value={form.role} onChange={e => F('role', e.target.value)}>
                  <option value="">Sélectionner un rôle...</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field" value={form.email} onChange={e => F('email', e.target.value)} placeholder="marie@pel.fr" />
              </div>
              <div>
                <label className="label">LinkedIn (URL)</label>
                <input className="input-field" value={form.linkedin_url} onChange={e => F('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label className="label">Ordre d&apos;affichage</label>
                <input type="number" className="input-field" value={form.ordre} onChange={e => F('ordre', e.target.value)} min="0" />
                <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'var(--font-corps)' }}>0 = premier affiché</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setOpen(false)} className="btn-outline flex-1">Annuler</button>
              <button onClick={save} className="btn-primary flex-1 flex items-center justify-center gap-2"><Save size={15} /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
