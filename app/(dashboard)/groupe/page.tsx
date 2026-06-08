'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Flag, Users, Save, LogOut, Plus } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import GroupeMessages from '@/components/GroupeMessages'

const POLITICAL_POSITIONS = [
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

interface PoliticalGroup {
  id: string
  name: string
  color: string
  logo_url: string | null
  president_id: string | null
  political_position?: string | null
  description?: string | null
  presentation?: string | null
  profiles?: { id: string; first_name: string; last_name: string; role: string }[]
}

interface Profile {
  id: string
  first_name: string
  last_name: string
  role: string
  group_id: string | null
  political_groups?: Omit<PoliticalGroup, 'profiles'> | null
}

const glassCard = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 4px 24px rgba(4,67,154,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
  borderRadius: '1rem',
  padding: '1.5rem',
}

export default function GroupePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [allGroups, setAllGroups] = useState<PoliticalGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  // Formulaire édition groupe (président)
  const [editName, setEditName] = useState('')
  const [editPosition, setEditPosition] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPresentation, setEditPresentation] = useState('')

  // Formulaire création groupe
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupColor, setNewGroupColor] = useState('#04439a')
  const [newGroupPosition, setNewGroupPosition] = useState('')
  const [creatingGroup, setCreatingGroup] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }
        setCurrentUserId(user.id)

        // Charger le profil directement
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*, political_groups!profiles_group_id_fkey(id, name, color, logo_url, president_id, political_position, description, presentation)')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData as Profile)
          if (profileData.political_groups) {
            const g = profileData.political_groups as any
            setEditName(g.name ?? '')
            setEditPosition(g.political_position ?? '')
            setEditDescription(g.description ?? '')
            setEditPresentation(g.presentation ?? '')
          }
        }

        // Charger tous les groupes directement (pas besoin d'être admin)
        const { data: groupsData } = await supabase
          .from('political_groups')
          .select('id, name, color, logo_url, president_id, political_position, description, presentation, profiles!profiles_group_id_fkey(id, first_name, last_name, role)')
        setAllGroups((groupsData ?? []) as PoliticalGroup[])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  async function handleSaveGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!profile?.group_id) return
    setSaving(true)

    const { error } = await supabase
      .from('political_groups')
      .update({
        name: editName,
        political_position: editPosition || null,
        description: editDescription || null,
        presentation: editPresentation || null,
      })
      .eq('id', profile.group_id)

    if (error) {
      toast.error('Erreur : ' + error.message)
    } else {
      toast.success('Groupe mis à jour ✓')
    }
    setSaving(false)
  }

  async function handleJoinGroup(groupId: string) {
    if (!profile) return
    const { error } = await supabase
      .from('profiles')
      .update({ group_id: groupId })
      .eq('id', profile.id)
    if (error) {
      toast.error('Erreur : ' + error.message)
    } else {
      toast.success('Vous avez rejoint le groupe')
      window.location.reload()
    }
  }

  async function handleLeaveGroup() {
    if (!profile) return
    if (!confirm('Êtes-vous sûr de vouloir quitter ce groupe ?')) return
    const { error } = await supabase
      .from('profiles')
      .update({ group_id: null })
      .eq('id', profile.id)
    if (error) {
      toast.error('Erreur : ' + error.message)
    } else {
      toast.success('Vous avez quitté le groupe')
      window.location.reload()
    }
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setCreatingGroup(true)
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('political_groups')
        .insert({
          name: newGroupName,
          color: newGroupColor,
          political_position: newGroupPosition || null,
        })
        .select()
        .single()
      if (groupError) throw groupError

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ group_id: groupData.id, role: 'president_groupe' })
        .eq('id', profile.id)
      if (profileError) throw profileError

      toast.success('Groupe créé avec succès ! Vous en êtes maintenant président.')
      window.location.reload()
    } catch (err: unknown) {
      toast.error('Erreur : ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setCreatingGroup(false)
    }
  }

  const positionLabel = (val: string) =>
    POLITICAL_POSITIONS.find(p => p.value === val)?.label ?? val

  if (loading) {
    return (
      <div>
        <TopBar title="Mon Groupe" />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-pel-blue/30 border-t-pel-blue rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const isPresident = profile?.role === 'president_groupe'
  const hasGroup = !!profile?.group_id
  const myGroup = profile?.political_groups ?? null
  const myGroupFull = allGroups.find(g => g.id === profile?.group_id) ?? null

  // ---- VUE PRÉSIDENT ----
  if (isPresident && hasGroup) {
    const members = myGroupFull?.profiles ?? []
    return (
      <div>
        <TopBar title="Mon Groupe" />
        <div className="p-6 max-w-3xl space-y-6">
          <div style={glassCard}>
            <h2 className="section-title mb-6 flex items-center gap-2">
              <Flag size={18} className="text-pel-blue" />
              Gérer mon groupe
            </h2>
            <form onSubmit={handleSaveGroup} className="space-y-4">
              <div>
                <label className="label">Nom du groupe</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Classement politique</label>
                <select
                  value={editPosition}
                  onChange={e => setEditPosition(e.target.value)}
                  className="input-field"
                >
                  <option value="">-- Sélectionner --</option>
                  {POLITICAL_POSITIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Description courte</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="input-field"
                  placeholder="Slogan ou résumé du groupe..."
                />
              </div>
              <div>
                <label className="label">Présentation détaillée</label>
                <textarea
                  value={editPresentation}
                  onChange={e => setEditPresentation(e.target.value)}
                  className="input-field"
                  rows={4}
                  placeholder="Programme, valeurs, engagements du groupe..."
                  style={{ resize: 'vertical' }}
                />
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                <Save size={16} />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </form>
          </div>

          <div style={glassCard}>
            <h2 className="section-title mb-4 flex items-center gap-2">
              <Users size={18} className="text-pel-blue" />
              Membres du groupe ({members.length})
            </h2>
            {members.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun membre pour l&apos;instant.</p>
            ) : (
              <ul className="space-y-2">
                {members.map(m => (
                  <li key={m.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ backgroundColor: myGroup?.color ?? '#1a3a6b' }}
                    >
                      {m.first_name.charAt(0)}{m.last_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.first_name} {m.last_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{m.role === 'president_groupe' ? 'Président' : 'Parlementaire'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {profile?.group_id && currentUserId && (
            <GroupeMessages
              groupeId={profile.group_id}
              isPresident={true}
              currentUserId={currentUserId}
              groupColor={myGroup?.color ?? '#04439a'}
            />
          )}
        </div>
      </div>
    )
  }

  // ---- VUE MEMBRE (pas président, a un groupe) ----
  if (hasGroup && myGroupFull) {
    const members = myGroupFull.profiles ?? []
    return (
      <div>
        <TopBar title="Mon Groupe" />
        <div className="p-6 max-w-2xl space-y-6">
          <div style={{ ...glassCard, borderTop: `4px solid ${myGroupFull.color}` }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-titre)' }}>
                  {myGroupFull.name}
                </h2>
                {myGroupFull.political_position && (
                  <span
                    className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: myGroupFull.color + '20', color: myGroupFull.color }}
                  >
                    {positionLabel(myGroupFull.political_position)}
                  </span>
                )}
              </div>
              <button
                onClick={handleLeaveGroup}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-200"
              >
                <LogOut size={16} />
                Quitter
              </button>
            </div>
            {(myGroupFull as any).description && (
              <p className="text-sm text-gray-600 italic mt-1 mb-2">{(myGroupFull as any).description}</p>
            )}
            {(myGroupFull as any).presentation && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Présentation</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{(myGroupFull as any).presentation}</p>
              </div>
            )}
          </div>

          <div style={glassCard}>
            <h2 className="section-title mb-4 flex items-center gap-2">
              <Users size={18} className="text-pel-blue" />
              Membres ({members.length})
            </h2>
            {members.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun membre.</p>
            ) : (
              <ul className="space-y-2">
                {members.map(m => (
                  <li key={m.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ backgroundColor: myGroupFull.color }}
                    >
                      {m.first_name.charAt(0)}{m.last_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.first_name} {m.last_name}</p>
                      <p className="text-xs text-gray-500">{m.role === 'president_groupe' ? 'Président' : 'Parlementaire'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {profile?.group_id && currentUserId && (
            <GroupeMessages
              groupeId={profile.group_id}
              isPresident={false}
              currentUserId={currentUserId}
              groupColor={myGroupFull.color}
            />
          )}
        </div>
      </div>
    )
  }

  // ---- VUE SANS GROUPE ----
  return (
    <div>
      <TopBar title="Mon Groupe" />
      <div className="p-6 max-w-4xl space-y-6">
        <div style={glassCard}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <Flag size={18} className="text-pel-blue" />
              Groupes politiques
            </h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              Créer un groupe
            </button>
          </div>

          {showCreateForm && (
            <div
              className="mb-6 p-4 rounded-xl"
              style={{ background: 'rgba(4,67,154,0.05)', border: '1px solid rgba(4,67,154,0.15)' }}
            >
              <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-amber-800 text-sm font-medium">
                  Pour créer un groupe, vous devez être au moins 5 parlementaires.
                  Votre groupe sera créé en statut &quot;en formation&quot;.
                </p>
              </div>
              <form onSubmit={handleCreateGroup} className="space-y-3">
                <div>
                  <label className="label">Nom du groupe</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    className="input-field"
                    required
                    placeholder="Nom du groupe politique..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Couleur</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newGroupColor}
                        onChange={e => setNewGroupColor(e.target.value)}
                        className="w-12 h-10 rounded border border-gray-200 cursor-pointer"
                      />
                      <span className="text-sm text-gray-500">{newGroupColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="label">Classement politique</label>
                    <select
                      value={newGroupPosition}
                      onChange={e => setNewGroupPosition(e.target.value)}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      {POLITICAL_POSITIONS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={creatingGroup} className="btn-primary flex items-center gap-2">
                    <Plus size={16} />
                    {creatingGroup ? 'Création...' : 'Créer le groupe'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {allGroups.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Aucun groupe politique n&apos;existe pour l&apos;instant.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allGroups.map(group => {
                const members = group.profiles ?? []
                return (
                  <div
                    key={group.id}
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(255,255,255,0.7)',
                      border: `2px solid ${group.color}30`,
                      borderTop: `4px solid ${group.color}`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{group.name}</h3>
                        {group.political_position && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: group.color + '20', color: group.color }}
                          >
                            {positionLabel(group.political_position)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Users size={12} />
                        {members.length}
                      </span>
                    </div>
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className="w-full py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ background: group.color, color: '#fff' }}
                    >
                      Rejoindre
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
