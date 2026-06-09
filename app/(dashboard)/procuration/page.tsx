'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/layout/TopBar'
import toast from 'react-hot-toast'
import { UserCheck, UserX, Users } from 'lucide-react'

interface Profile {
  id: string
  first_name: string
  last_name: string
  role: string
}

interface Proxy {
  id: string
  absent_id: string
  holder_id: string
  created_at: string
  holder: Profile | null
}

export default function ProcurationPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  const [myProxy, setMyProxy] = useState<Proxy | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedHolder, setSelectedHolder] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUser(user)

      // Load profiles
      const profRes = await fetch('/api/admin/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'profiles', select: 'id,first_name,last_name,role' }),
      })
      const profData = await profRes.json()
      const allProfiles = (profData.data ?? []) as Profile[]
      setProfiles(allProfiles.filter((p: Profile) => p.id !== user.id))

      // Load my proxy
      const proxyRes = await fetch('/api/admin/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'proxies',
          select: 'id,absent_id,holder_id,created_at',
          filters: { absent_id: user.id },
        }),
      })
      const proxyData = await proxyRes.json()
      const proxies = (proxyData.data ?? []) as { id: string; absent_id: string; holder_id: string; created_at: string }[]

      if (proxies.length > 0) {
        const p = proxies[0]
        const holder = allProfiles.find((pr: Profile) => pr.id === p.holder_id) ?? null
        setMyProxy({ ...p, holder })
      }

      setLoading(false)
    }
    load()
  }, [supabase])

  async function handleCreate() {
    if (!selectedHolder) { toast.error('Sélectionnez un parlementaire'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/dashboard/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', holder_id: selectedHolder }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Erreur'); return }
      toast.success('Procuration accordée')
      // Reload
      const holder = profiles.find(p => p.id === selectedHolder) ?? null
      setMyProxy({
        id: data.id ?? 'temp',
        absent_id: currentUser?.id ?? '',
        holder_id: selectedHolder,
        created_at: new Date().toISOString(),
        holder,
      })
      setSelectedHolder('')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRevoke() {
    if (!myProxy) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/dashboard/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', proxy_id: myProxy.id }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Erreur'); return }
      toast.success('Procuration révoquée')
      setMyProxy(null)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div>
      <TopBar title="Procuration" />
      <div className="p-6 text-center text-gray-400">Chargement…</div>
    </div>
  )

  return (
    <div>
      <TopBar title="Procuration" />
      <div className="p-6 max-w-xl space-y-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck size={22} className="text-pel-blue" />
            <h2 className="text-lg font-bold text-pel-blue" style={{ fontFamily: 'var(--font-titre)' }}>
              MA PROCURATION ACTIVE
            </h2>
          </div>

          {myProxy ? (
            <div style={{ background: 'rgba(4,67,154,0.06)', borderRadius: '0.75rem', padding: '1rem' }}>
              <p className="text-sm text-gray-600 mb-1">Vous avez accordé votre procuration à :</p>
              <p className="font-bold text-pel-blue text-lg">
                {myProxy.holder?.first_name} {myProxy.holder?.last_name}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Accordée le {new Date(myProxy.created_at).toLocaleDateString('fr-FR')}
              </p>
              <button
                onClick={handleRevoke}
                disabled={submitting}
                className="btn-outline mt-4 flex items-center gap-2"
                style={{ color: '#dc2626', borderColor: '#dc2626' }}
              >
                <UserX size={16} />
                Révoquer la procuration
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Vous n&apos;avez pas de procuration active.</p>
          )}
        </div>

        {!myProxy && (
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Users size={22} className="text-pel-blue" />
              <h2 className="text-lg font-bold text-pel-blue" style={{ fontFamily: 'var(--font-titre)' }}>
                DONNER UNE PROCURATION
              </h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Sélectionnez le parlementaire qui votera à votre place lors de la prochaine séance.
            </p>
            <label className="label">Déléguer mon vote à :</label>
            <select
              className="input-field w-full mt-1 mb-4"
              value={selectedHolder}
              onChange={e => setSelectedHolder(e.target.value)}
            >
              <option value="">-- Choisissez un parlementaire --</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} ({p.role.replace(/_/g, ' ')})
                </option>
              ))}
            </select>
            <button
              onClick={handleCreate}
              disabled={submitting || !selectedHolder}
              className="btn-primary"
            >
              {submitting ? 'Enregistrement…' : 'Accorder la procuration'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
