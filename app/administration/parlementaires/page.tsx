'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile, PoliticalGroup, UserRole, ROLE_LABELS } from '@/types'
import { getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'

interface FormData {
  email: string
  password: string
  first_name: string
  last_name: string
  birth_date: string
  role: UserRole
  group_id: string
}

const emptyForm: FormData = {
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  birth_date: '',
  role: 'parlementaire',
  group_id: '',
}

export default function ParlementairesPage() {
  const supabase = createClient()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [groups, setGroups] = useState<PoliticalGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Profile | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    const [{ data: p }, { data: g }] = await Promise.all([
      supabase.from('profiles').select('*, political_groups(*)').order('last_name'),
      supabase.from('political_groups').select('*').order('name'),
    ])
    setProfiles(p ?? [])
    setGroups(g ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(profile: Profile) {
    setEditing(profile)
    setForm({
      email: profile.email,
      password: '',
      first_name: profile.first_name,
      last_name: profile.last_name,
      birth_date: profile.birth_date ?? '',
      role: profile.role,
      group_id: profile.group_id ?? '',
    })
    setShowForm(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editing) {
        // Mise à jour
        const { error } = await supabase.from('profiles').update({
          first_name: form.first_name,
          last_name: form.last_name,
          birth_date: form.birth_date || null,
          role: form.role,
          group_id: form.group_id || null,
        }).eq('id', editing.id)
        if (error) throw error
        toast.success('Parlementaire modifié')
      } else {
        // Création via Supabase Auth Admin (depuis le client, on utilise signUp)
        const { data: authData, error: authError } = await supabase.auth.admin
          ? (supabase as any).auth.admin.createUser({
              email: form.email,
              password: form.password,
              email_confirm: true,
              user_metadata: {
                first_name: form.first_name,
                last_name: form.last_name,
                role: form.role,
              },
            })
          : { data: null, error: new Error('Admin API non disponible côté client') }

        if (authError) {
          // Fallback: utiliser l'API route
          const res = await fetch('/api/admin/create-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
          })
          const result = await res.json()
          if (!res.ok) throw new Error(result.error)
        } else if (authData?.user) {
          await supabase.from('profiles').update({
            role: form.role,
            group_id: form.group_id || null,
            birth_date: form.birth_date || null,
          }).eq('id', authData.user.id)
        }
        toast.success('Parlementaire créé')
      }
      setShowForm(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur')
    }
    setSaving(false)
  }

  async function handleDelete(profile: Profile) {
    if (!confirm(`Supprimer ${profile.first_name} ${profile.last_name} ?`)) return
    const res = await fetch('/api/admin/delete-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: profile.id }),
    })
    if (res.ok) {
      toast.success('Parlementaire supprimé')
      fetchData()
    } else {
      toast.error('Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div>
        <TopBar title="Parlementaires" />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-pel-blue/30 border-t-pel-blue rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar title="Gestion des parlementaires" />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-500 text-sm">{profiles.length} parlementaire(s) enregistré(s)</p>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Nouveau parlementaire
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="card border-2 border-pel-blue/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="section-title">
                {editing ? 'Modifier le parlementaire' : 'Nouveau parlementaire'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Prénom *</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={e => setForm({ ...form, first_name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Nom *</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={e => setForm({ ...form, last_name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              {!editing && (
                <>
                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Mot de passe provisoire *</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      className="input-field"
                      placeholder="Minimum 8 caractères"
                      minLength={8}
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <label className="label">Date de naissance</label>
                <input
                  type="date"
                  value={form.birth_date}
                  onChange={e => setForm({ ...form, birth_date: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Rôle</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value as UserRole })}
                  className="input-field"
                >
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Groupe politique</label>
                <select
                  value={form.group_id}
                  onChange={e => setForm({ ...form, group_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">— Non affilié —</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
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

        {/* Liste */}
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header">Parlementaire</th>
                <th className="table-header hidden sm:table-cell">Groupe</th>
                <th className="table-header hidden md:table-cell">Rôle</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profiles.map(profile => (
                <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: profile.political_groups?.color ?? '#94a3b8' }}
                      >
                        {getInitials(profile.first_name, profile.last_name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{profile.first_name} {profile.last_name}</p>
                        <p className="text-xs text-gray-400">{profile.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell hidden sm:table-cell">
                    {profile.political_groups ? (
                      <span
                        className="badge"
                        style={{
                          backgroundColor: profile.political_groups.color + '20',
                          color: profile.political_groups.color,
                        }}
                      >
                        {profile.political_groups.name}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="table-cell hidden md:table-cell">
                    <span className="badge bg-pel-blue/10 text-pel-blue">
                      {ROLE_LABELS[profile.role]}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(profile)}
                        className="p-1.5 text-gray-400 hover:text-pel-blue hover:bg-pel-blue/10 rounded-lg transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(profile)}
                        className="p-1.5 text-gray-400 hover:text-pel-red hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {profiles.length === 0 && (
            <p className="text-center text-gray-400 py-12">Aucun parlementaire enregistré</p>
          )}
        </div>
      </div>
    </div>
  )
}
