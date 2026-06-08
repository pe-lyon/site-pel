'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Save, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { titre: '', slug: '', extrait: '', contenu_texte: '', statut: 'brouillon', categorie: '', auteur: '' }
const STATUTS = [{ value: 'brouillon', label: 'Brouillon' }, { value: 'publie', label: 'Publié' }]
const CATS = ['Séance plénière', 'Vie du PEL', 'Partenariats', 'Communiqué', 'Autre']

function toSlug(s: string) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

async function apiRead(table: string, select = '*', order?: any) {
  const r = await fetch('/api/admin/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table, select, order }) })
  return (await r.json()).data ?? []
}
async function apiWrite(table: string, operation: string, data: any, filters?: any) {
  const r = await fetch('/api/admin/write', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table, operation, data, filters }) })
  return await r.json()
}

export default function AdminActualitesPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    const data = await apiRead('actualites', '*', { col: 'created_at' })
    setArticles(data.reverse())
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  function openNew() { setForm(EMPTY); setEditing(null); setOpen(true) }
  function openEdit(a: any) {
    setForm({ titre: a.titre, slug: a.slug, extrait: a.extrait ?? '', contenu_texte: typeof a.contenu === 'string' ? a.contenu : (a.contenu?.texte ?? ''), statut: a.statut, categorie: a.categorie ?? '', auteur: a.auteur ?? '' })
    setEditing(a.id); setOpen(true)
  }

  const F = (k: keyof typeof EMPTY, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function save() {
    if (!form.titre) return toast.error('Titre requis')
    const slug = form.slug || toSlug(form.titre)
    const data = {
      titre: form.titre, slug, extrait: form.extrait || null,
      contenu: form.contenu_texte ? { texte: form.contenu_texte } : null,
      statut: form.statut,
      categorie: form.categorie || null,
      auteur: form.auteur || null,
      publie_le: form.statut === 'publie' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }
    if (editing) {
      const res = await apiWrite('actualites', 'update', data, { id: editing })
      if (res.error) return toast.error(res.error)
      toast.success('Article modifié')
    } else {
      const res = await apiWrite('actualites', 'insert', { ...data, created_at: new Date().toISOString() })
      if (res.error) return toast.error(res.error)
      toast.success('Article créé')
    }
    setOpen(false); fetch()
  }

  async function del(id: string) {
    if (!confirm('Supprimer cet article ?')) return
    await apiWrite('actualites', 'delete', {}, { id })
    toast.success('Supprimé'); fetch()
  }

  async function toggleStatut(a: any) {
    const newStatut = a.statut === 'publie' ? 'brouillon' : 'publie'
    await apiWrite('actualites', 'update', { statut: newStatut, publie_le: newStatut === 'publie' ? new Date().toISOString() : null }, { id: a.id })
    fetch()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: '2rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>ACTUALITÉS</h1>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nouvel article</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-200 border-t-[#04439a] rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {articles.length === 0 && <p className="text-gray-400 text-center py-12" style={{ fontFamily: 'var(--font-corps)' }}>Aucun article. Écrivez le premier !</p>}
          {articles.map(a => (
            <div key={a.id} className="bg-white rounded-xl px-5 py-4 flex items-start gap-4 border border-gray-100">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-corps)' }}>{a.titre}</p>
                  <span className={`badge text-xs ${a.statut === 'publie' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {a.statut === 'publie' ? '✓ Publié' : 'Brouillon'}
                  </span>
                </div>
                {a.categorie && <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>{a.categorie}</p>}
                {a.extrait && <p className="text-xs text-gray-400 mt-1 line-clamp-1" style={{ fontFamily: 'var(--font-corps)' }}>{a.extrait}</p>}
                <p className="text-xs text-gray-300 mt-1" style={{ fontFamily: 'var(--font-corps)' }}>Slug : /{a.slug}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => toggleStatut(a)} className="px-3 py-1.5 rounded text-xs font-medium transition-colors" style={{ background: a.statut === 'publie' ? '#fef3c7' : '#d1fae5', color: a.statut === 'publie' ? '#92400e' : '#065f46', fontFamily: 'var(--font-corps)' }}>
                  {a.statut === 'publie' ? 'Dépublier' : 'Publier'}
                </button>
                <button onClick={() => openEdit(a)} className="p-2 text-gray-400 hover:text-[#04439a] rounded-lg hover:bg-blue-50 transition-colors"><Pencil size={15} /></button>
                <button onClick={() => del(a.id)} className="p-2 text-gray-400 hover:text-[#b21d0b] rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>
                {editing ? 'MODIFIER L\'ARTICLE' : 'NOUVEL ARTICLE'}
              </h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Titre *</label>
                <input className="input-field" value={form.titre} onChange={e => { F('titre', e.target.value); if (!editing) F('slug', toSlug(e.target.value)) }} placeholder="Titre de l'article" />
              </div>
              <div>
                <label className="label">Slug (URL)</label>
                <input className="input-field" value={form.slug} onChange={e => F('slug', e.target.value)} placeholder="titre-de-larticle" />
                <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'var(--font-corps)' }}>/actualites/{form.slug || '...'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Catégorie</label>
                  <select className="input-field" value={form.categorie} onChange={e => F('categorie', e.target.value)}>
                    <option value="">Sélectionner...</option>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Auteur</label>
                  <input className="input-field" value={form.auteur} onChange={e => F('auteur', e.target.value)} placeholder="Prénom Nom" />
                </div>
              </div>
              <div>
                <label className="label">Extrait (résumé court)</label>
                <textarea className="input-field" rows={2} value={form.extrait} onChange={e => F('extrait', e.target.value)} placeholder="Résumé affiché dans la liste d'articles..." style={{ resize: 'none' }} />
              </div>
              <div>
                <label className="label">Contenu de l&apos;article</label>
                <textarea className="input-field" rows={10} value={form.contenu_texte} onChange={e => F('contenu_texte', e.target.value)} placeholder="Rédigez le contenu complet de l'article ici..." style={{ resize: 'vertical', minHeight: 200 }} />
              </div>
              <div>
                <label className="label">Statut</label>
                <select className="input-field" value={form.statut} onChange={e => F('statut', e.target.value)}>
                  {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
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
