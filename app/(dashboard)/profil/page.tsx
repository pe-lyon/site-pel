
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { User, Lock, Save } from 'lucide-react'
import { Profile } from '@/types'
import { getInitials } from '@/lib/utils'
import TopBar from '@/components/layout/TopBar'
import { ROLE_LABELS } from '@/types'

export default function ProfilPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('*, political_groups(*)')
        .eq('id', user.id)
        .single()
      if (data) {
        setProfile(data)
        setFirstName(data.first_name)
        setLastName(data.last_name)
        setBirthDate(data.birth_date ?? '')
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ first_name: firstName, last_name: lastName, birth_date: birthDate || null })
      .eq('id', profile.id)
    if (error) {
      toast.error('Erreur lors de la sauvegarde')
    } else {
      toast.success('Profil mis à jour')
    }
    setSaving(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    setChangingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      toast.error('Erreur : ' + error.message)
    } else {
      toast.success('Mot de passe modifié avec succès')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setChangingPassword(false)
  }

  if (loading) {
    return (
      <div>
        <TopBar title="Mon profil" />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-pel-blue/30 border-t-pel-blue rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar title="Mon profil" />
      <div className="p-6 max-w-2xl space-y-6">
        {/* Avatar et identité */}
        <div className="card flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
            style={{ backgroundColor: profile?.political_groups?.color ?? '#1a3a6b' }}
          >
            {profile ? getInitials(profile.first_name, profile.last_name) : '?'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {profile?.first_name} {profile?.last_name}
            </h2>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="badge bg-pel-blue/10 text-pel-blue">
                {ROLE_LABELS[profile?.role ?? 'parlementaire']}
              </span>
              {profile?.political_groups && (
                <span
                  className="badge"
                  style={{
                    backgroundColor: profile.political_groups.color + '20',
                    color: profile.political_groups.color,
                  }}
                >
                  {profile.political_groups.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modifier les informations */}
        <div className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <User size={18} className="text-pel-blue" />
            Mes informations
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Prénom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Nom</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Date de naissance</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Adresse email</label>
              <input
                type="email"
                value={profile?.email ?? ''}
                className="input-field bg-gray-50"
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">L&apos;email ne peut pas être modifié ici.</p>
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Save size={16} />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </form>
        </div>

        {/* Changer le mot de passe */}
        <div className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Lock size={18} className="text-pel-blue" />
            Changer le mot de passe
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="label">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="Minimum 8 caractères"
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="label">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Répétez le mot de passe"
                required
              />
            </div>
            <button type="submit" disabled={changingPassword} className="btn-primary flex items-center gap-2">
              <Lock size={16} />
              {changingPassword ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
