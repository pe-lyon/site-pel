'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PoliticalGroup, Profile } from '@/types'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Save, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'

const POLITICAL_POSITIONS = [
  { value: '', label: '— Non défini —' },
  { value: 'extreme_gauche', label: 'Extrême-gauche' },
  { value: 'gauche_radicale', label: 'Gauche radicale' },
  { value: 'gauche', label: 'Gauche' },
  { value: 'centre_gauche', label: 'Centre-gauche' },
  { value: 'centre', label: 'Centre' },
  { value: 'centre_droit', label: 'Centre-droit' },
  { value: 'droite', label: 'Droite' },
  { value: 'droite_radicale', label: 'Droite radicale' },
  { value: 'extreme_droite', label: 'Extrême-droite' },
  { value: 'monarchiste', label: 'Monarchiste' },
  { value: 'autre', label: 'Autre' },
]

interface GroupForm {
  name: string
  color: string
  president_id: string
  political_position: string
}

const emptyForm: GroupForm = {
  name: '',
  color: '#3B82F6',
  president_id: '',
  political_position: '',
}

const PRESET_COLORS = [
  '#1D4ED8', '#DC2626', '#16A34A', '#D97706', '#7C3AED',
  '#DB2777', '#0891B2', '#65A30D', '#EA580C', '#475569',
]

async function adminRead(table: string, select = '*', order?: { col: string, asc?: boolean }) {
  const res = await fetch('/api/admin/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, select, order }),
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.error)
  return result.data
}

interface DissolutionRequest {
  id: string
  groupe_id: string
  demandeur_id: string
  motif: string | null
  statut: 'en_attente' | 'approuvee' | 'refusee'
  created_at: string
  political_groups: { name: string; color: string } | null
  profiles: { first_name: string; last_name: string } | null
}

export default function GroupesPage() {
  const supabase = createClient()
  const [groups, setGroups] = useState<PoliticalGroup[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PoliticalGroup | null>(null)
  const [form, setForm] = useState<GroupForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [dissolutionRequests, setDissolutionRequests] = useState<DissolutionRequest[]>([])

  const fetchDissolutionRequests = useCallback(async () => {
    const { data } = await supabase
      .from('dissolution_requests')
      .select('*, political_groups(name, color), profiles!dissolution_requests_demandeur_id_fkey(first_name, last_name)')
      .order('created_at', { ascending: false })
    setDissolutionRequests((data ?? []) as DissolutionRequest[])
  }, [supabase])

  async function handleDissolutionStatut(id: string, statut: 'approuvee' | 'refusee') {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('dissolution_requests')
      .update({ statut, traite_par: user?.id, traite_le: new Date().toISOString() })
      .eq('id', id)
    if (error) { toast.error('Erreur : ' + error.message); return }
    toast.success(statut === 'approuvee' ? 'Demande approuvée' : 'Demande refusée')
    fetchDissolutionRequests()
  }

  const fetchData = useCallback(async () => {
    try {
      const [g, p] = await Promise.all([
        adminRead('political_groups', '*', { col: 'name' }),
        adminRead('profiles', '*', { col: 'last_name' }),
      ])
      setGroups(g ?? [])
      setProfiles(p ?? [])
    } catch (err: any) {
      toast.error('Erreur de chargement : ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    fetchDissolutionRequests()
  }, [fetchData, fetchDissolutionRequests])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(group: PoliticalGroup) {
    setEditing(group)
    setForm({
      name: group.name,
      color: group.color,
      president_id: group.president_id ?? '',
      political_position: (group as any).political_position ?? '',
    })
    setShowForm(true)
  }

  async function adminWrite(table: string, operation: string, data: any, filters?: any) {
    const res = await fetch('/api/admin/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, operation, data, filters }),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
    return result.data
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Le nom du groupe est obligatoire')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        color: form.color,
        president_id: form.president_id || null,
        political_position: form.political_position || null,
      }
      if (editing) {
        await adminWrite('political_groups', 'update', payload, { id: editing.id })
        if (form.president_id && form.president_id !== editing.president_id) {
          if (editing.president_id) {
            await adminWrite('profiles', 'update', { role: 'parlementaire' }, { id: editing.president_id })
          }
          await adminWrite('profiles', 'update', { role: 'president_groupe', group_id: editing.id }, { id: form.president_id })
        }
        toast.success('Groupe modifié')
      } else {
        const [created] = await adminWrite('political_groups', 'insert', payload)
        if (form.president_id && created) {
          await adminWrite('profiles', 'update', { role: 'president_groupe', group_id: created.id }, { id: form.president_id })
        }
        toast.success('Groupe créé')
      }
      setShowForm(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur')
    }
    setSaving(false)
  }

  async function handleDelete(group: PoliticalGroup) {
    const memberCount = profiles.filter(p => p.group_id === group.id).length
    const confirmMsg = memberCount > 0
      ? `Supprimer le groupe "${group.name}" ? Les ${memberCount} membre(s) seront désaffiliés.`
      : `Supprimer le groupe "${group.name}" ?`
    if (!confirm(confirmMsg)) return

    try {
      await adminWrite('profiles', 'update', { group_id: null, role: 'parlementaire' }, { group_id: group.id })
      await adminWrite('political_groups', 'delete', {}, { id: group.id })
      toast.success('Groupe supprimé')
      fetchData()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div>
        <TopBar title="Groupes politiques" />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-pel-blue/30 border-t-pel-blue rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar title="Gestion des groupes politiques" />
      <div className="p-6 space-y-6">
        {/* Demandes de dissolution */}
        {dissolutionRequests.filter(r => r.statut === 'en_attente').length > 0 && (
          <div className="card border-2 border-red-200 bg-red-50/50">
            <h3 className="section-title flex items-center gap-2 text-red-700 mb-4" style={{ fontSize: '1rem' }}>
              <AlertTriangle size={18} />
              Demandes de dissolution ({dissolutionRequests.filter(r => r.statut === 'en_attente').length} en attente)
            </h3>
            <div className="space-y-3">
              {dissolutionRequests.filter(r => r.statut === 'en_attente').map(req => (
                <div key={req.id} className="bg-white rounded-xl p-4 border border-red-100 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ background: req.political_groups?.color ?? '#9ca3af' }} />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{req.political_groups?.name ?? 'Groupe inconnu'}</p>
                      <p className="text-xs text-gray-500">
                        Demande de {req.profiles?.first_name} {req.profiles?.last_name} — {new Date(req.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      {req.motif && <p className="text-sm text-gray-700 mt-2 italic">&laquo; {req.motif} &raquo;</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleDissolutionStatut(req.id, 'refusee')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <XCircle size={14} /> Refuser
                    </button>
                    <button
                      onClick={() => handleDissolutionStatut(req.id, 'approuvee')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-700 border border-red-300 hover:bg-red-50 transition-colors"
                    >
                      <CheckCircle size={14} /> Approuver
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {dissolutionRequests.filter(r => r.statut !== 'en_attente').length > 0 && (
              <details className="mt-4">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Voir l&apos;historique des demandes traitées</summary>
                <div className="mt-2 space-y-2">
                  {dissolutionRequests.filter(r => r.statut !== 'en_attente').map(req => (
                    <div key={req.id} className="flex items-center gap-2 text-sm text-gray-500 py-1 border-b border-gray-100 last:border-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${req.statut === 'approuvee' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {req.statut === 'approuvee' ? 'Approuvée' : 'Refusée'}
                      </span>
                      <span>{req.political_groups?.name}</span>
                      <span className="text-gray-400">— {req.profiles?.first_name} {req.profiles?.last_name}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <p className="text-gray-500 text-sm">{groups.length} groupe(s) politique(s)</p>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Nouveau groupe
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="card border-2 border-pel-blue/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="section-title">
                {editing ? 'Modifier le groupe' : 'Nouveau groupe politique'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Nom du groupe *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Rassemblement Progressiste"
                  required
                />
              </div>
              <div>
                <label className="label">Couleur</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={e => setForm({ ...form, color: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                  />
                  <span className="text-sm text-gray-500">{form.color}</span>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, color: c })}
                      className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        borderColor: form.color === c ? '#1a3a6b' : 'white',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Président de groupe</label>
                <select
                  value={form.president_id}
                  onChange={e => setForm({ ...form, president_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">— Aucun —</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Classement politique</label>
                <select
                  value={form.political_position}
                  onChange={e => setForm({ ...form, political_position: e.target.value })}
                  className="input-field"
                >
                  {POLITICAL_POSITIONS.map(pos => (
                    <option key={pos.value} value={pos.value}>{pos.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                <Save size={16} />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Liste des groupes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(group => {
            const members = profiles.filter(p => p.group_id === group.id)
            return (
              <div
                key={group.id}
                className="card border-l-4 hover:shadow-md transition-shadow"
                style={{ borderLeftColor: group.color }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: group.color }}
                    >
                      {group.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{group.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Users size={11} />
                        {members.length} membre(s)
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(group)}
                      className="p-1.5 text-gray-400 hover:text-pel-blue hover:bg-pel-blue/10 rounded-lg transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(group)}
                      className="p-1.5 text-gray-400 hover:text-pel-red hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {(group as any).political_position && (
                  <p className="text-xs text-gray-400 mb-1">
                    {POLITICAL_POSITIONS.find(p => p.value === (group as any).political_position)?.label}
                  </p>
                )}

                {/* Membres */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {members.slice(0, 6).map(m => (
                    <div
                      key={m.id}
                      title={`${m.first_name} ${m.last_name}`}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: group.color + 'cc' }}
                    >
                      {m.first_name.charAt(0)}{m.last_name.charAt(0)}
                    </div>
                  ))}
                  {members.length > 6 && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                      +{members.length - 6}
                    </div>
                  )}
                  {members.length === 0 && (
                    <span className="text-xs text-gray-300 italic">Aucun membre</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {groups.length === 0 && (
          <div className="card text-center py-12 text-gray-400">
            <p className="font-medium">Aucun groupe politique</p>
            <p className="text-sm mt-1">Créez le premier groupe pour commencer.</p>
          </div>
        )}
      </div>
    </div>
  )
}
