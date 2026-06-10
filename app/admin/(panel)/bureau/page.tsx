'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, X, Save, Upload, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getInitials } from '@/lib/utils'

const EMPTY = {
  prenom: '', nom: '', section: '', fonction: '', email: '', linkedin_url: '', ordre: '0',
  bio: '', formation: '', universite: '', promotion: '', photo_url: '',
}

function parseRole(role: string) {
  const parts = role.split(' > ')
  return parts.length >= 2
    ? { section: parts[0].trim(), fonction: parts.slice(1).join(' > ').trim() }
    : { section: '', fonction: role }
}

async function apiRead(table: string) {
  const r = await fetch('/api/admin/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table, select: '*', order: { col: 'ordre' } }) })
  return (await r.json()).data ?? []
}
async function apiWrite(table: string, op: string, data: any, filters?: any) {
  const r = await fetch('/api/admin/write', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table, operation: op, data, filters }) })
  return await r.json()
}

export default function AdminBureauPage() {
  const [membres, setMembres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setMembres(await apiRead('bureau_membres'))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openNew() { setForm(EMPTY); setEditing(null); setOpen(true) }
  function openEdit(m: any) {
    const { section, fonction } = parseRole(m.role ?? '')
    setForm({
      prenom: m.prenom, nom: m.nom, section, fonction,
      email: m.email ?? '', linkedin_url: m.linkedin_url ?? '', ordre: String(m.ordre ?? 0),
      bio: m.bio ?? '', formation: m.formation ?? '', universite: m.universite ?? '',
      promotion: m.promotion ?? '', photo_url: m.photo_url ?? '',
    })
    setEditing(m.id); setOpen(true)
  }
  const F = (k: keyof typeof EMPTY, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('bucket', 'bureau-photos')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        F('photo_url', data.url)
        toast.success('Photo uploadée !')
      } else {
        toast.error(data.error ?? 'Erreur upload')
      }
    } catch {
      toast.error('Erreur lors de l\'upload')
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function save() {
    if (!form.prenom || !form.nom || !form.fonction) return toast.error('Prénom, nom et fonction requis')
    const role = form.section ? `${form.section} > ${form.fonction}` : form.fonction
    const data = {
      prenom: form.prenom, nom: form.nom, role,
      email: form.email || null, linkedin_url: form.linkedin_url || null,
      ordre: parseInt(form.ordre) || 0, actif: true,
      bio: form.bio || null, formation: form.formation || null,
      universite: form.universite || null, promotion: form.promotion || null,
      photo_url: form.photo_url || null,
    }
    if (editing) {
      const res = await apiWrite('bureau_membres', 'update', data, { id: editing })
      if (res.error) return toast.error(`Erreur : ${res.error}`)
      toast.success('Membre modifié')
    } else {
      const res = await apiWrite('bureau_membres', 'insert', data)
      if (res.error) return toast.error(`Erreur : ${res.error}`)
      toast.success('Membre ajouté')
    }
    setOpen(false); load()
  }

  async function del(id: string) {
    if (!confirm('Supprimer ce membre ?')) return
    await apiWrite('bureau_membres', 'delete', {}, { id })
    toast.success('Supprimé'); load()
  }

  const grouped: Record<string, any[]> = {}
  for (const m of membres) {
    const { section } = parseRole(m.role ?? '')
    const key = section || '__sans_section__'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  }
  const sections = Object.keys(grouped).sort((a, b) => {
    if (a === '__sans_section__') return 1
    if (b === '__sans_section__') return -1
    return a.localeCompare(b)
  })

  const usedSections = Array.from(new Set(membres.map(m => parseRole(m.role ?? '').section).filter(Boolean)))
  const usedFonctions = Array.from(new Set(membres.map(m => parseRole(m.role ?? '').fonction).filter(Boolean)))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: '2rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>BUREAU</h1>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16} /> Ajouter un membre</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-200 border-t-[#04439a] rounded-full animate-spin" /></div>
      ) : membres.length === 0 ? (
        <p className="text-gray-400 text-center py-12" style={{ fontFamily: 'var(--font-corps)' }}>Aucun membre. Ajoutez le premier !</p>
      ) : (
        <div className="space-y-8">
          {sections.map(sec => (
            <div key={sec}>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-3 pb-2 border-b border-gray-200"
                style={{ color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>
                {sec === '__sans_section__' ? 'Sans section' : sec}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[sec].map(m => {
                  const { fonction } = parseRole(m.role ?? '')
                  return (
                    <div key={m.id} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {m.photo_url ? (
                            <img src={m.photo_url} alt={`${m.prenom} ${m.nom}`} className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />
                          ) : (
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>
                              {getInitials(m.prenom, m.nom)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>{m.prenom} {m.nom}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>{fonction}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-[#04439a] rounded transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => del(m.id)} className="p-1.5 text-gray-400 hover:text-[#b21d0b] rounded transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      {m.formation && <p className="text-xs text-gray-500 mb-0.5" style={{ fontFamily: 'var(--font-corps)' }}>🎓 {m.formation}{m.universite ? ` · ${m.universite}` : ''}</p>}
                      {m.promotion && <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corps)' }}>📅 {m.promotion}</p>}
                      {m.bio && <p className="text-xs text-gray-400 mt-2 line-clamp-2" style={{ fontFamily: 'var(--font-corps)' }}>{m.bio}</p>}
                      {m.email && <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'var(--font-corps)' }}>✉ {m.email}</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center p-6 pb-0">
              <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>
                {editing ? 'MODIFIER' : 'NOUVEAU MEMBRE'}
              </h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Identité */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Identité</p>
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
              </div>

              {/* Photo */}
              <div>
                <label className="label">Photo</label>
                <div className="flex items-center gap-4">
                  {/* Aperçu */}
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-bold" style={{ background: form.photo_url ? undefined : 'var(--pel-bleu)', color: 'white', fontFamily: 'var(--font-titre)' }}>
                    {form.photo_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={form.photo_url} alt="Aperçu" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      : getInitials(form.prenom, form.nom) || '?'
                    }
                  </div>
                  <div className="flex-1 space-y-2">
                    {/* Bouton upload */}
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:border-[#04439a] hover:text-[#04439a] transition-colors disabled:opacity-50"
                    >
                      {uploading ? <><Loader2 size={15} className="animate-spin" /> Upload en cours...</> : <><Upload size={15} /> Choisir une photo</>}
                    </button>
                    {/* Ou URL manuelle */}
                    <input className="input-field text-xs" value={form.photo_url} onChange={e => F('photo_url', e.target.value)} placeholder="Ou coller une URL directement..." />
                    {form.photo_url && (
                      <button type="button" onClick={() => F('photo_url', '')} className="text-xs text-red-400 hover:text-red-600">
                        × Supprimer la photo
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">JPG, PNG ou WebP · max 5 Mo. Laisse vide pour afficher les initiales.</p>
              </div>

              {/* Rôle */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Rôle au bureau</p>
                <div className="space-y-4">
                  <div>
                    <label className="label">Section</label>
                    <input className="input-field" list="sections-list" value={form.section} onChange={e => F('section', e.target.value)} placeholder="Bureau Exécutif, Pôle Communication..." />
                    <datalist id="sections-list">
                      <option value="Bureau Exécutif" /><option value="Bureau Restreint" />
                      <option value="Pôle Communication" /><option value="Pôle Logistique" />
                      <option value="Pôle Juridique" /><option value="Pôle Académique" />
                      {usedSections.map(s => <option key={s} value={s} />)}
                    </datalist>
                    <p className="text-xs text-gray-400 mt-1">Laisse vide si pas de section</p>
                  </div>
                  <div>
                    <label className="label">Fonction *</label>
                    <input className="input-field" list="fonctions-list" value={form.fonction} onChange={e => F('fonction', e.target.value)} placeholder="Président(e), Responsable..." />
                    <datalist id="fonctions-list">
                      <option value="Président(e)" /><option value="Vice-Président(e)" />
                      <option value="Secrétaire Général(e)" /><option value="Trésorier(ère)" />
                      <option value="Responsable" /><option value="Chargé(e) de mission" /><option value="Membre" />
                      {usedFonctions.map(f => <option key={f} value={f} />)}
                    </datalist>
                  </div>
                </div>
              </div>

              {/* Formation */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Formation & Parcours</p>
                <div className="space-y-4">
                  <div>
                    <label className="label">Formation / Diplôme</label>
                    <input className="input-field" value={form.formation} onChange={e => F('formation', e.target.value)} placeholder="Master Droit public, Licence Sciences Po..." />
                  </div>
                  <div>
                    <label className="label">Université / École</label>
                    <input className="input-field" value={form.universite} onChange={e => F('universite', e.target.value)} placeholder="Université Lyon 3, Sciences Po Lyon..." />
                  </div>
                  <div>
                    <label className="label">Promotion / Année</label>
                    <input className="input-field" value={form.promotion} onChange={e => F('promotion', e.target.value)} placeholder="Promo 2025, M2 2024-2025..." />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Biographie</p>
                <div>
                  <label className="label">Présentation courte</label>
                  <textarea
                    className="input-field"
                    value={form.bio}
                    onChange={e => F('bio', e.target.value)}
                    placeholder="Quelques mots sur son engagement, ses motivations, son parcours..."
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.bio.length}/300 caractères recommandés</p>
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Contact</p>
                <div className="space-y-4">
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input-field" value={form.email} onChange={e => F('email', e.target.value)} placeholder="marie@pel.fr" />
                  </div>
                  <div>
                    <label className="label">LinkedIn (URL)</label>
                    <input className="input-field" value={form.linkedin_url} onChange={e => F('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." />
                  </div>
                </div>
              </div>

              {/* Ordre */}
              <div>
                <label className="label">Ordre d&apos;affichage</label>
                <input type="number" className="input-field w-24" value={form.ordre} onChange={e => F('ordre', e.target.value)} min="0" />
                <p className="text-xs text-gray-400 mt-1">0 = premier affiché</p>
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setOpen(false)} className="btn-outline flex-1">Annuler</button>
              <button onClick={save} className="btn-primary flex-1 flex items-center justify-center gap-2"><Save size={15} /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
