'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'parlementaire', label: 'Parlementaire' },
  { value: 'president_groupe', label: 'Président de groupe' },
  { value: 'president_seance', label: 'Président de séance (Admin)' },
  { value: 'contributeur_journalisme', label: 'Contributeur Journalisme' },
  { value: 'contributeur_agenda', label: 'Contributeur Agenda' },
  { value: 'contributeur_general', label: 'Contributeur Général' },
]

function glassCard(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(16px) saturate(160%)',
    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.7)',
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(4,67,154,0.08)',
    ...extra,
  }
}

function glassInput(): React.CSSProperties {
  return {
    background: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(4,67,154,0.15)',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
    color: '#1e293b',
  }
}

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
}

export default function ProfilsAdminPage() {
  const supabase = createClient()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('parlementaire')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [editingRole, setEditingRole] = useState<{ [id: string]: string }>({})

  const emailPreview = firstName && lastName
    ? `${firstName.toLowerCase().replace(/\s+/g, '.')}.${lastName.toLowerCase().replace(/\s+/g, '.')}@assemblee-pel.fr`
    : ''

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    setLoadingProfiles(true)
    const { data } = await supabase.from('profiles').select('id, first_name, last_name, email, role').order('last_name')
    setProfiles(data ?? [])
    setLoadingProfiles(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName || !lastName || !password) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailPreview,
          password,
          first_name: firstName,
          last_name: lastName,
          role,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création')
      toast.success('Profil créé avec succès')
      setFirstName('')
      setLastName('')
      setPassword('')
      setRole('parlementaire')
      fetchProfiles()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange(profileId: string, newRole: string) {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', profileId)
    if (error) {
      toast.error('Erreur lors de la modification du rôle')
    } else {
      toast.success('Rôle mis à jour')
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, role: newRole } : p))
    }
    setEditingRole(prev => { const n = { ...prev }; delete n[profileId]; return n })
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#04439a', marginBottom: 8 }}>Création de profil</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Créez des comptes pour les parlementaires et contributeurs.</p>

      {/* Formulaire de création */}
      <div style={{ ...glassCard(), padding: 28, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 20 }}>Nouveau profil</h2>
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Prénom *</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Jean"
                style={glassInput()}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Nom *</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Dupont"
                style={glassInput()}
              />
            </div>
          </div>

          {emailPreview && (
            <div style={{ background: 'rgba(4,67,154,0.06)', border: '1px solid rgba(4,67,154,0.15)', borderRadius: 8, padding: '8px 12px', marginBottom: 16, fontSize: 13, color: '#04439a' }}>
              Identifiant : <strong>{emailPreview}</strong>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Rôle</label>
              <select value={role} onChange={e => setRole(e.target.value)} style={glassInput()}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Mot de passe temporaire *</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={glassInput()}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#94a3b8' : '#04439a',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Création...' : 'Créer le profil'}
          </button>
        </form>
      </div>

      {/* Liste des profils */}
      <div style={{ ...glassCard(), padding: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 20 }}>Profils existants</h2>
        {loadingProfiles ? (
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Chargement...</p>
        ) : profiles.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Aucun profil trouvé.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profiles.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.5)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.6)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#04439a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {(p.first_name?.[0] ?? '?')}{(p.last_name?.[0] ?? '')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', margin: 0 }}>{p.first_name} {p.last_name}</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{p.email}</p>
                </div>
                <div>
                  {editingRole[p.id] !== undefined ? (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select
                        value={editingRole[p.id]}
                        onChange={e => setEditingRole(prev => ({ ...prev, [p.id]: e.target.value }))}
                        style={{ ...glassInput(), width: 'auto', fontSize: 13 }}
                      >
                        {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                      <button onClick={() => handleRoleChange(p.id, editingRole[p.id])} style={{ background: '#04439a', color: 'white', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>OK</button>
                      <button onClick={() => setEditingRole(prev => { const n = { ...prev }; delete n[p.id]; return n })} style={{ background: '#e2e8f0', color: '#64748b', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Annuler</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ background: 'rgba(4,67,154,0.1)', color: '#04439a', borderRadius: 6, padding: '3px 8px', fontSize: 12, fontWeight: 500 }}>
                        {ROLES.find(r => r.value === p.role)?.label ?? p.role}
                      </span>
                      <button
                        onClick={() => setEditingRole(prev => ({ ...prev, [p.id]: p.role }))}
                        style={{ background: 'rgba(4,67,154,0.08)', color: '#04439a', border: '1px solid rgba(4,67,154,0.2)', borderRadius: 6, padding: '3px 8px', fontSize: 12, cursor: 'pointer' }}
                      >
                        Modifier
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
