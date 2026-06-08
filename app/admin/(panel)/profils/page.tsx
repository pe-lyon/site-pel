'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// Normalise un nom pour l'email : accents, espaces, casse
function normalize(s: string) {
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // supprime les accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')  // remplace tout ce qui n'est pas alphanum par un point
    .replace(/^\.+|\.+$/g, '')    // supprime les points en début/fin
}

function buildEmail(firstName: string, lastName: string) {
  const f = normalize(firstName)
  const l = normalize(lastName)
  if (!f || !l) return ''
  return `${f}.${l}@assemblee-pel.fr`
}

const ROLES_PRINCIPAUX = [
  { value: 'parlementaire',    label: 'Parlementaire' },
  { value: 'president_groupe', label: 'Président de groupe' },
  { value: 'president_seance', label: 'Président de séance (Admin PEL)' },
]

const ACCES_CONTRIBUTEURS = [
  { value: 'contributeur_journalisme', label: '📰 Journalisme — soumettre des articles' },
  { value: 'contributeur_agenda',      label: '📅 Agenda — soumettre des événements' },
  { value: 'contributeur_general',     label: '✏️ Général — articles + événements' },
]

const ALL_ROLES = [...ROLES_PRINCIPAUX, ...ACCES_CONTRIBUTEURS]

function glassCard(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: 'rgba(255,255,255,0.58)',
    backdropFilter: 'blur(18px) saturate(160%)',
    WebkitBackdropFilter: 'blur(18px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.72)',
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(4,67,154,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
    ...extra,
  }
}

function glassInput(): React.CSSProperties {
  return {
    background: 'rgba(255,255,255,0.65)',
    backdropFilter: 'blur(10px)',
    border: '1.5px solid rgba(255,255,255,0.80)',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
    color: '#1e293b',
    fontFamily: 'var(--font-corps)',
  }
}

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  permissions?: string[]
}

export default function ProfilsAdminPage() {
  const supabase = createClient()

  const [firstName, setFirstName]   = useState('')
  const [lastName, setLastName]     = useState('')
  const [role, setRole]             = useState('parlementaire')
  const [permissions, setPermissions] = useState<string[]>([])
  const [password, setPassword]     = useState('')
  const [loading, setLoading]       = useState(false)

  const [profiles, setProfiles]           = useState<Profile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [editingId, setEditingId]         = useState<string | null>(null)
  const [editRole, setEditRole]           = useState('')
  const [editPerms, setEditPerms]         = useState<string[]>([])

  const emailPreview = buildEmail(firstName, lastName)

  useEffect(() => { fetchProfiles() }, [])

  async function fetchProfiles() {
    setLoadingProfiles(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, role, permissions')
      .order('last_name')
    setProfiles(data ?? [])
    setLoadingProfiles(false)
  }

  function togglePerm(val: string, list: string[], setList: (v: string[]) => void) {
    setList(list.includes(val) ? list.filter(p => p !== val) : [...list, val])
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName || !lastName || !password) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (!emailPreview) {
      toast.error('Prénom/nom invalides pour générer un identifiant')
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
          permissions,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création')
      toast.success('Profil créé avec succès ✅')
      setFirstName(''); setLastName(''); setPassword('')
      setRole('parlementaire'); setPermissions([])
      fetchProfiles()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(p: Profile) {
    setEditingId(p.id)
    setEditRole(p.role)
    setEditPerms(p.permissions ?? [])
  }

  async function saveEdit(profileId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: editRole, permissions: editPerms })
      .eq('id', profileId)
    if (error) {
      toast.error('Erreur lors de la modification')
    } else {
      toast.success('Accès mis à jour ✅')
      setProfiles(prev => prev.map(p =>
        p.id === profileId ? { ...p, role: editRole, permissions: editPerms } : p
      ))
      setEditingId(null)
    }
  }

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#04439a', marginBottom: 6, fontFamily: 'var(--font-titre)' }}>
        Création de profil
      </h1>
      <p style={{ color: '#64748b', marginBottom: 32, fontFamily: 'var(--font-corps)', fontSize: 14 }}>
        Créez des comptes pour les parlementaires et contributeurs, et combinez librement plusieurs accès.
      </p>

      {/* ————— Formulaire ————— */}
      <div style={{ ...glassCard(), padding: 28, marginBottom: 32 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1e293b', marginBottom: 20, fontFamily: 'var(--font-corps)' }}>
          Nouveau profil
        </h2>
        <form onSubmit={handleCreate}>

          {/* Noms */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Prénom *</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jean" style={glassInput()} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Nom *</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Dupont" style={glassInput()} />
            </div>
          </div>

          {/* Preview identifiant */}
          {emailPreview && (
            <div style={{ background: 'rgba(4,67,154,0.06)', border: '1px solid rgba(4,67,154,0.15)', borderRadius: 8, padding: '8px 14px', marginBottom: 16, fontSize: 13, color: '#04439a', fontFamily: 'var(--font-corps)' }}>
              Identifiant généré : <strong>{emailPreview.replace('@assemblee-pel.fr','')}</strong>
              <span style={{ color: '#94a3b8' }}> @assemblee-pel.fr</span>
            </div>
          )}

          {/* Rôle principal */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
              Rôle principal
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ROLES_PRINCIPAUX.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  style={{
                    padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    border: role === r.value ? '2px solid #04439a' : '1.5px solid rgba(4,67,154,0.2)',
                    background: role === r.value ? 'rgba(4,67,154,0.12)' : 'rgba(255,255,255,0.5)',
                    color: role === r.value ? '#04439a' : '#475569',
                    fontFamily: 'var(--font-corps)',
                    transition: 'all 0.15s',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accès contributeurs — checkboxes */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
              Accès contributeur <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optionnel, cumulable)</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ACCES_CONTRIBUTEURS.map(a => (
                <label key={a.value} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', borderRadius: 10, background: permissions.includes(a.value) ? 'rgba(4,67,154,0.08)' : 'rgba(255,255,255,0.4)', border: permissions.includes(a.value) ? '1.5px solid rgba(4,67,154,0.25)' : '1.5px solid rgba(255,255,255,0.6)', transition: 'all 0.15s' }}>
                  <input
                    type="checkbox"
                    checked={permissions.includes(a.value)}
                    onChange={() => togglePerm(a.value, permissions, setPermissions)}
                    style={{ width: 16, height: 16, accentColor: '#04439a' }}
                  />
                  <span style={{ fontSize: 13, color: permissions.includes(a.value) ? '#04439a' : '#475569', fontFamily: 'var(--font-corps)' }}>
                    {a.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Mot de passe temporaire *</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...glassInput(), maxWidth: 300 }} />
          </div>

          <button type="submit" disabled={loading} className="btn-secondary" style={{ opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Création...' : '+ Créer le profil'}
          </button>
        </form>
      </div>

      {/* ————— Liste des profils ————— */}
      <div style={{ ...glassCard(), padding: 28 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1e293b', marginBottom: 20, fontFamily: 'var(--font-corps)' }}>
          Profils existants ({profiles.length})
        </h2>
        {loadingProfiles ? (
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Chargement…</p>
        ) : profiles.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Aucun profil trouvé.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profiles.map(p => (
              <div key={p.id} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.50)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.65)' }}>
                {editingId === p.id ? (
                  /* Mode édition */
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#04439a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {(p.first_name?.[0] ?? '?')}{(p.last_name?.[0] ?? '')}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', margin: 0 }}>{p.first_name} {p.last_name}</p>
                        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{p.email}</p>
                      </div>
                    </div>
                    {/* Rôle principal */}
                    <div style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Rôle principal</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {ROLES_PRINCIPAUX.map(r => (
                          <button key={r.value} type="button" onClick={() => setEditRole(r.value)}
                            style={{ padding: '5px 12px', borderRadius: 16, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: editRole === r.value ? '2px solid #04439a' : '1.5px solid rgba(4,67,154,0.2)', background: editRole === r.value ? 'rgba(4,67,154,0.12)' : 'rgba(255,255,255,0.5)', color: editRole === r.value ? '#04439a' : '#475569' }}>
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Accès contributeur */}
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Accès contributeur</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {ACCES_CONTRIBUTEURS.map(a => (
                          <label key={a.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: '#475569' }}>
                            <input type="checkbox" checked={editPerms.includes(a.value)} onChange={() => togglePerm(a.value, editPerms, setEditPerms)} style={{ accentColor: '#04439a' }} />
                            {a.label}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => saveEdit(p.id)} style={{ background: '#04439a', color: 'white', border: 'none', borderRadius: 7, padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Enregistrer</button>
                      <button onClick={() => setEditingId(null)} style={{ background: 'rgba(4,67,154,0.08)', color: '#475569', border: '1px solid rgba(4,67,154,0.15)', borderRadius: 7, padding: '6px 16px', fontSize: 13, cursor: 'pointer' }}>Annuler</button>
                    </div>
                  </div>
                ) : (
                  /* Mode affichage */
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#04439a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {(p.first_name?.[0] ?? '?')}{(p.last_name?.[0] ?? '')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', margin: 0 }}>{p.first_name} {p.last_name}</p>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '1px 0 0' }}>{p.email?.replace('@assemblee-pel.fr', '')} <span style={{ color: '#cbd5e1' }}>@assemblee-pel.fr</span></p>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'flex-end', flex: 1 }}>
                      <span style={{ background: 'rgba(4,67,154,0.10)', color: '#04439a', borderRadius: 6, padding: '3px 9px', fontSize: 12, fontWeight: 500 }}>
                        {ALL_ROLES.find(r => r.value === p.role)?.label ?? p.role}
                      </span>
                      {(p.permissions ?? []).map(perm => (
                        <span key={perm} style={{ background: 'rgba(99,102,241,0.10)', color: '#6366f1', borderRadius: 6, padding: '3px 9px', fontSize: 12, fontWeight: 500 }}>
                          {ACCES_CONTRIBUTEURS.find(a => a.value === perm)?.label.split(' — ')[0] ?? perm}
                        </span>
                      ))}
                    </div>
                    <button onClick={() => startEdit(p)} style={{ flexShrink: 0, background: 'rgba(4,67,154,0.08)', color: '#04439a', border: '1px solid rgba(4,67,154,0.20)', borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                      Modifier
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
