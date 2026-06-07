'use client'
import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

const KEYS = ['nom_site', 'description', 'email_contact', 'instagram', 'linkedin']
const LABELS: Record<string, string> = {
  nom_site: 'Nom du site',
  description: 'Description du site (SEO)',
  email_contact: 'Email de contact',
  instagram: 'Lien Instagram',
  linkedin: 'Lien LinkedIn',
}
const PLACEHOLDERS: Record<string, string> = {
  nom_site: 'Parlement des Étudiants de Lyon',
  description: 'Le Parlement des Étudiants de Lyon est...',
  email_contact: 'communication.pelyon@gmail.com',
  instagram: 'https://instagram.com/pel_lyon',
  linkedin: 'https://linkedin.com/company/pel-lyon',
}

export default function AdminParametresPage() {
  const [vals, setVals] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const r = await fetch('/api/admin/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'site_settings', select: 'key,value' }) })
      const { data } = await r.json()
      const m: Record<string, string> = {}
      ;(data ?? []).forEach((row: any) => { m[row.key] = row.value ?? '' })
      KEYS.forEach(k => { if (!m[k]) m[k] = '' })
      setVals(m)
      setLoading(false)
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    await Promise.all(Object.entries(vals).map(([key, value]) =>
      fetch('/api/admin/write', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'site_settings', operation: 'upsert', data: { key, value, updated_at: new Date().toISOString() } }) })
    ))
    toast.success('Paramètres enregistrés !')
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-200 border-t-[#04439a] rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: '2rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>PARAMÈTRES</h1>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save size={15} /> {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 max-w-2xl space-y-5">
        {KEYS.map(key => (
          <div key={key}>
            <label className="label">{LABELS[key]}</label>
            {key === 'description' ? (
              <textarea className="input-field" rows={3} value={vals[key] ?? ''} onChange={e => setVals(p => ({ ...p, [key]: e.target.value }))} placeholder={PLACEHOLDERS[key]} style={{ resize: 'none' }} />
            ) : (
              <input className="input-field" value={vals[key] ?? ''} onChange={e => setVals(p => ({ ...p, [key]: e.target.value }))} placeholder={PLACEHOLDERS[key]} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex">
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save size={15} /> {saving ? 'Sauvegarde...' : 'Enregistrer tous les paramètres'}
        </button>
      </div>
    </div>
  )
}
