'use client'
import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

async function getSetting(key: string) {
  const r = await fetch('/api/admin/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'site_settings', select: 'value', filters: { key } }) })
  const d = await r.json()
  return d.data?.[0]?.value ?? ''
}
async function setSetting(key: string, value: string) {
  await fetch('/api/admin/write', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'site_settings', operation: 'upsert', data: { key, value, updated_at: new Date().toISOString() } }) })
}

export default function AdminPresentationPage() {
  const [vals, setVals] = useState({
    hero_titre: '', hero_sous_titre: '', pel_bref_texte: '',
    presentation_mission: '', presentation_valeurs: '', cta_texte: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const keys = Object.keys(vals) as (keyof typeof vals)[]
      const results = await Promise.all(keys.map(k => getSetting(k)))
      const next: any = {}
      keys.forEach((k, i) => { next[k] = results[i] })
      setVals(next)
      setLoading(false)
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    await Promise.all(Object.entries(vals).map(([k, v]) => setSetting(k, v)))
    toast.success('Contenu sauvegardé !')
    setSaving(false)
  }

  const F = (k: keyof typeof vals, v: string) => setVals(p => ({ ...p, [k]: v }))

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-200 border-t-[#04439a] rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: '2rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>NOTRE INSTITUTION</h1>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save size={15} /> {saving ? 'Sauvegarde...' : 'Tout enregistrer'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Page d'accueil */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100" style={{ fontFamily: 'var(--font-corps)' }}>
            🏠 Page d&apos;accueil — Hero
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Grand titre (Hero)</label>
              <input className="input-field" value={vals.hero_titre} onChange={e => F('hero_titre', e.target.value)} placeholder="PARLEMENT DES ÉTUDIANTS DE LYON" />
            </div>
            <div>
              <label className="label">Sous-titre (Hero)</label>
              <input className="input-field" value={vals.hero_sous_titre} onChange={e => F('hero_sous_titre', e.target.value)} placeholder="L'institution parlementaire étudiante de référence..." />
            </div>
            <div>
              <label className="label">Texte &quot;Le PEL en bref&quot;</label>
              <textarea className="input-field" rows={4} value={vals.pel_bref_texte} onChange={e => F('pel_bref_texte', e.target.value)} placeholder="Présentation courte du PEL affichée en page d'accueil..." style={{ resize: 'none' }} />
            </div>
          </div>
        </div>

        {/* Présentation */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100" style={{ fontFamily: 'var(--font-corps)' }}>
            📋 Page Présentation
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Texte de mission</label>
              <textarea className="input-field" rows={6} value={vals.presentation_mission} onChange={e => F('presentation_mission', e.target.value)} placeholder="Décrivez la mission et les objectifs du PEL..." style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label className="label">Nos valeurs (texte)</label>
              <textarea className="input-field" rows={4} value={vals.presentation_valeurs} onChange={e => F('presentation_valeurs', e.target.value)} placeholder="Démocratie, débat, collégialité..." style={{ resize: 'none' }} />
            </div>
          </div>
        </div>

        {/* CTA bas de page */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100" style={{ fontFamily: 'var(--font-corps)' }}>
            📢 Appel à l&apos;action (bas de page d&apos;accueil)
          </h2>
          <div>
            <label className="label">Texte du CTA</label>
            <textarea className="input-field" rows={3} value={vals.cta_texte} onChange={e => F('cta_texte', e.target.value)} placeholder="Une question, un partenariat ? Nous sommes à votre disposition..." style={{ resize: 'none' }} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save size={15} /> {saving ? 'Sauvegarde...' : 'Tout enregistrer'}
        </button>
      </div>
    </div>
  )
}
