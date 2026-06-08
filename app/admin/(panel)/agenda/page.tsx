'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { titre: '', date: '', heure: '', lieu: '', type: '', description: '', lien_externe: '' }

async function apiRead(table: string, select = '*', order?: { col: string }) {
  const r = await fetch('/api/admin/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table, select, order }) })
  return (await r.json()).data ?? []
}
async function apiWrite(table: string, operation: string, data: any, filters?: any) {
  const r = await fetch('/api/admin/write', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table, operation, data, filters }) })
  return await r.json()
}

export default function AdminAgendaPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    const data = await apiRead('evenements', '*', { col: 'date' })
    setEvents(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  function openNew() { setForm(EMPTY); setEditing(null); setOpen(true) }
  function openEdit(e: any) {
    setForm({ titre: e.titre, date: e.date, heure: e.heure ?? '', lieu: e.lieu ?? '', type: e.type ?? 'evenement', description: e.description ?? '', lien_externe: e.lien_externe ?? '' })
    setEditing(e.id); setOpen(true)
  }

  async function save() {
    if (!form.titre || !form.date) return toast.error('Titre et date requis')
    const data = { ...form, heure: form.heure || null, lieu: form.lieu || null, description: form.description || null, lien_externe: form.lien_externe || null }
    if (editing) {
      await apiWrite('evenements', 'update', data, { id: editing })
      toast.success('Événement modifié')
    } else {
      await apiWrite('evenements', 'insert', data)
      toast.success('Événement ajouté')
    }
    setOpen(false); fetch()
  }

  async function del(id: string) {
    if (!confirm('Supprimer cet événement ?')) return
    await apiWrite('evenements', 'delete', {}, { id })
    toast.success('Supprimé'); fetch()
  }

  const F = (k: keyof typeof EMPTY, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: '2rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>AGENDA</h1>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nouvel événement</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-200 border-t-[#04439a] rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {events.length === 0 && <p className="text-gray-400 text-center py-12" style={{ fontFamily: 'var(--font-corps)' }}>Aucun événement. Créez-en un !</p>}
          {events.map(e => (
            <div key={e.id} className="bg-white rounded-xl px-5 py-4 flex items-start gap-4 border border-gray-100">
              <div className="flex-shrink-0 text-center w-12">
                <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-bleu)', fontWeight: 700, lineHeight: 1 }}>
                  {new Date(e.date).getDate().toString().padStart(2, '0')}
                </p>
                <p className="text-xs font-bold" style={{ color: 'var(--pel-rouge)', fontFamily: 'var(--font-corps)' }}>
                  {new Date(e.date).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
                </p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-corps)' }}>{e.titre}</p>
                <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: 'var(--font-corps)' }}>
                  {e.heure && `${e.heure.slice(0, 5)} · `}{e.lieu ?? ''}{e.type ? ` · ${e.type}` : ''}
                </p>
                {e.description && <p className="text-xs text-gray-400 mt-1 line-clamp-1" style={{ fontFamily: 'var(--font-corps)' }}>{e.description}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(e)} className="p-2 text-gray-400 hover:text-[#04439a] rounded-lg hover:bg-blue-50 transition-colors"><Pencil size={15} /></button>
                <button onClick={() => del(e.id)} className="p-2 text-gray-400 hover:text-[#b21d0b] rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>
                {editing ? 'MODIFIER' : 'NOUVEL ÉVÉNEMENT'}
              </h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Titre *</label>
                <input className="input-field" value={form.titre} onChange={e => F('titre', e.target.value)} placeholder="Titre de l'événement" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date *</label>
                  <input type="date" className="input-field" value={form.date} onChange={e => F('date', e.target.value)} />
                </div>
                <div>
                  <label className="label">Heure</label>
                  <input type="time" className="input-field" value={form.heure} onChange={e => F('heure', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Lieu</label>
                <input className="input-field" value={form.lieu} onChange={e => F('lieu', e.target.value)} placeholder="Amphi Lacassagne, Université Lyon 3" />
              </div>
              <div>
                <label className="label">Type / Catégorie</label>
                <input
                  className="input-field"
                  list="event-types"
                  value={form.type}
                  onChange={e => F('type', e.target.value)}
                  placeholder="Séance, Réunion, Cérémonie..."
                />
                <datalist id="event-types">
                  <option value="Séance plénière" />
                  <option value="Réunion" />
                  <option value="Cérémonie" />
                  <option value="Événement" />
                  <option value="Commission" />
                  <option value="Atelier" />
                  {[...new Set(events.map((e: any) => e.type).filter(Boolean))].map((t: any) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-400 mt-1">Tape librement ou choisis dans la liste</p>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input-field" rows={3} value={form.description} onChange={e => F('description', e.target.value)} placeholder="Description de l'événement..." style={{ resize: 'none' }} />
              </div>
              <div>
                <label className="label">Lien externe (optionnel)</label>
                <input className="input-field" value={form.lien_externe} onChange={e => F('lien_externe', e.target.value)} placeholder="https://..." />
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
