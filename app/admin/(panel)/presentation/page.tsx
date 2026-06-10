'use client'
import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Helpers API ─────────────────────────────────────────────────────────────

async function getSetting(key: string) {
  const r = await fetch('/api/admin/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'site_settings', select: 'value', filters: { key } }) })
  const d = await r.json()
  return d.data?.[0]?.value ?? ''
}
async function setSetting(key: string, value: string) {
  await fetch('/api/admin/write', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'site_settings', operation: 'upsert', data: { key, value, updated_at: new Date().toISOString() } }) })
}
async function getRows(table: string, order?: string) {
  const r = await fetch('/api/admin/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table, select: '*', order }) })
  const d = await r.json()
  return d.data ?? []
}
async function upsertRow(table: string, data: any) {
  await fetch('/api/admin/write', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table, operation: 'upsert', data }) })
}
async function deleteRow(table: string, id: string) {
  await fetch('/api/admin/write', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table, operation: 'delete', id }) })
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface TimelineItem { id?: string; annee: string; texte: string; _local?: boolean }
interface ValeurCard { id: string; emoji: string; titre: string; texte: string }

const DEFAULT_VALEURS: ValeurCard[] = [
  { id: '1', emoji: '⚖️', titre: 'DÉMOCRATIE', texte: 'Tout parlementaire a une voix égale. Chaque vote compte autant que celui du voisin.' },
  { id: '2', emoji: '🗣️', titre: 'DÉBAT', texte: "La confrontation d'idées, dans le respect mutuel, est le moteur de notre démocratie." },
  { id: '3', emoji: '🤝', titre: 'COLLÉGIALITÉ', texte: "Nous avançons ensemble, dans l'intérêt de l'institution et de ses membres." },
]

// ─── Composant ───────────────────────────────────────────────────────────────

export default function AdminPresentationPage() {
  // Settings simples
  const [vals, setVals] = useState({
    hero_titre: '', hero_sous_titre: '', pel_bref_texte: '',
    presentation_mission: '', cta_texte: '',
    presentation_hero_badge: '', presentation_hero_titre: '', presentation_hero_description: '',
  })

  // Timeline
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [deletedTimeline, setDeletedTimeline] = useState<string[]>([])

  // Valeurs
  const [valeurs, setValeurs] = useState<ValeurCard[]>(DEFAULT_VALEURS)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Sections ouvertes/fermées
  const [open, setOpen] = useState({ accueil: true, hero: false, mission: true, timeline: true, valeurs: true, cta: false })
  const toggle = (k: keyof typeof open) => setOpen(p => ({ ...p, [k]: !p[k] }))

  useEffect(() => {
    async function load() {
      const keys = Object.keys(vals) as (keyof typeof vals)[]
      const [results, timelineData, valeursJson] = await Promise.all([
        Promise.all(keys.map(k => getSetting(k))),
        getRows('presentation_timeline', 'annee'),
        getSetting('presentation_valeurs_json'),
      ])
      const next: any = {}
      keys.forEach((k, i) => { next[k] = results[i] })
      setVals(next)
      setTimeline(timelineData.length > 0 ? timelineData : [])
      if (valeursJson) {
        try { setValeurs(JSON.parse(valeursJson)) } catch { /* garde les défauts */ }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    try {
      // Sauvegarde settings
      await Promise.all(Object.entries(vals).map(([k, v]) => setSetting(k, v)))

      // Sauvegarde valeurs en JSON
      await setSetting('presentation_valeurs_json', JSON.stringify(valeurs))

      // Timeline : suppression
      await Promise.all(deletedTimeline.map(id => deleteRow('presentation_timeline', id)))
      setDeletedTimeline([])

      // Timeline : upsert
      await Promise.all(timeline.map((item, i) => upsertRow('presentation_timeline', {
        ...(item.id && !item._local ? { id: item.id } : {}),
        annee: item.annee,
        texte: item.texte,
        ordre: i,
      })))

      // Recharger la timeline pour avoir les vrais IDs
      const fresh = await getRows('presentation_timeline', 'ordre')
      setTimeline(fresh)

      toast.success('Contenu sauvegardé !')
    } catch (e) {
      toast.error('Erreur lors de la sauvegarde')
    }
    setSaving(false)
  }

  const F = (k: keyof typeof vals, v: string) => setVals(p => ({ ...p, [k]: v }))

  // ── Timeline helpers
  function addTimelineItem() {
    setTimeline(p => [...p, { id: `local-${Date.now()}`, annee: '', texte: '', _local: true }])
  }
  function removeTimelineItem(idx: number) {
    const item = timeline[idx]
    if (item.id && !item._local) setDeletedTimeline(p => [...p, item.id!])
    setTimeline(p => p.filter((_, i) => i !== idx))
  }
  function updateTimelineItem(idx: number, field: 'annee' | 'texte', value: string) {
    setTimeline(p => p.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }
  function moveTimeline(idx: number, dir: -1 | 1) {
    const next = [...timeline]
    const swap = idx + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    setTimeline(next)
  }

  // ── Valeurs helpers
  function addValeur() {
    setValeurs(p => [...p, { id: `v-${Date.now()}`, emoji: '🌟', titre: 'NOUVELLE VALEUR', texte: '' }])
  }
  function removeValeur(idx: number) {
    setValeurs(p => p.filter((_, i) => i !== idx))
  }
  function updateValeur(idx: number, field: keyof ValeurCard, value: string) {
    setValeurs(p => p.map((v, i) => i === idx ? { ...v, [field]: value } : v))
  }
  function moveValeur(idx: number, dir: -1 | 1) {
    const next = [...valeurs]
    const swap = idx + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    setValeurs(next)
  }

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-200 border-t-[#04439a] rounded-full animate-spin" /></div>

  const SectionHeader = ({ label, k }: { label: string; k: keyof typeof open }) => (
    <button
      onClick={() => toggle(k)}
      className="w-full flex items-center justify-between font-bold text-gray-800 mb-0 pb-3 border-b border-gray-100 text-left"
      style={{ fontFamily: 'var(--font-corps)' }}
    >
      {label}
      {open[k] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
    </button>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: '2rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>NOTRE INSTITUTION</h1>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save size={15} /> {saving ? 'Sauvegarde...' : 'Tout enregistrer'}
        </button>
      </div>

      <div className="space-y-4">

        {/* ── Page d'accueil Hero ── */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <SectionHeader label="🏠 Page d'accueil — Hero" k="accueil" />
          {open.accueil && (
            <div className="space-y-4 mt-5">
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
          )}
        </div>

        {/* ── Hero de la page Présentation ── */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <SectionHeader label="🎯 Page Présentation — En-tête" k="hero" />
          {open.hero && (
            <div className="space-y-4 mt-5">
              <div>
                <label className="label">Badge (petit label au-dessus du titre)</label>
                <input className="input-field" value={vals.presentation_hero_badge} onChange={e => F('presentation_hero_badge', e.target.value)} placeholder="Notre institution" />
              </div>
              <div>
                <label className="label">Titre principal</label>
                <input className="input-field" value={vals.presentation_hero_titre} onChange={e => F('presentation_hero_titre', e.target.value)} placeholder="Présentation" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input-field" rows={2} value={vals.presentation_hero_description} onChange={e => F('presentation_hero_description', e.target.value)} placeholder="Découvrez l'histoire, la mission et les valeurs du PEL." style={{ resize: 'none' }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Mission ── */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <SectionHeader label="📋 Notre Mission" k="mission" />
          {open.mission && (
            <div className="mt-5">
              <label className="label">Texte de mission <span className="text-gray-400 font-normal">(une ligne = un paragraphe)</span></label>
              <textarea className="input-field" rows={8} value={vals.presentation_mission} onChange={e => F('presentation_mission', e.target.value)} placeholder="Décrivez la mission et les objectifs du PEL..." style={{ resize: 'vertical' }} />
            </div>
          )}
        </div>

        {/* ── Timeline ── */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <SectionHeader label="📅 Notre Histoire — Timeline" k="timeline" />
          {open.timeline && (
            <div className="mt-5 space-y-3">
              {timeline.length === 0 && (
                <p className="text-sm text-gray-400 italic">Aucune entrée. Cliquez sur &quot;Ajouter une étape&quot; pour commencer.</p>
              )}
              {timeline.map((item, idx) => (
                <div key={item.id ?? idx} className="flex gap-3 items-start p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex flex-col gap-1 pt-1">
                    <button onClick={() => moveTimeline(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors">
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => moveTimeline(idx, 1)} disabled={idx === timeline.length - 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors">
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <div className="flex-1 grid grid-cols-[100px,1fr] gap-3">
                    <div>
                      <label className="label text-xs">Année</label>
                      <input
                        className="input-field text-center font-bold"
                        value={item.annee}
                        onChange={e => updateTimelineItem(idx, 'annee', e.target.value)}
                        placeholder="2024"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Description</label>
                      <textarea
                        className="input-field"
                        rows={2}
                        value={item.texte}
                        onChange={e => updateTimelineItem(idx, 'texte', e.target.value)}
                        placeholder="Événement marquant..."
                        style={{ resize: 'none' }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeTimelineItem(idx)}
                    className="mt-1 p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <button
                onClick={addTimelineItem}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-[#04439a] hover:text-[#04439a] transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={15} /> Ajouter une étape
              </button>
            </div>
          )}
        </div>

        {/* ── Valeurs ── */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <SectionHeader label="💎 Nos Valeurs" k="valeurs" />
          {open.valeurs && (
            <div className="mt-5 space-y-3">
              {valeurs.map((v, idx) => (
                <div key={v.id} className="flex gap-3 items-start p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex flex-col gap-1 pt-1">
                    <button onClick={() => moveValeur(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors">
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => moveValeur(idx, 1)} disabled={idx === valeurs.length - 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors">
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <div className="flex-1 grid grid-cols-[60px,1fr,1fr] gap-3">
                    <div>
                      <label className="label text-xs">Emoji</label>
                      <input
                        className="input-field text-center text-xl"
                        value={v.emoji}
                        onChange={e => updateValeur(idx, 'emoji', e.target.value)}
                        placeholder="⚖️"
                        maxLength={4}
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Titre</label>
                      <input
                        className="input-field font-bold uppercase"
                        value={v.titre}
                        onChange={e => updateValeur(idx, 'titre', e.target.value)}
                        placeholder="DÉMOCRATIE"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Description</label>
                      <textarea
                        className="input-field"
                        rows={2}
                        value={v.texte}
                        onChange={e => updateValeur(idx, 'texte', e.target.value)}
                        placeholder="Description de cette valeur..."
                        style={{ resize: 'none' }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeValeur(idx)}
                    className="mt-1 p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <button
                onClick={addValeur}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-[#04439a] hover:text-[#04439a] transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={15} /> Ajouter une valeur
              </button>
            </div>
          )}
        </div>

        {/* ── CTA ── */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <SectionHeader label="📢 Appel à l'action (bas de page d'accueil)" k="cta" />
          {open.cta && (
            <div className="mt-5">
              <label className="label">Texte du CTA</label>
              <textarea className="input-field" rows={3} value={vals.cta_texte} onChange={e => F('cta_texte', e.target.value)} placeholder="Une question, un partenariat ? Nous sommes à votre disposition..." style={{ resize: 'none' }} />
            </div>
          )}
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
