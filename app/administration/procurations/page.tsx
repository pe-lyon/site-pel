'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile, Proxy } from '@/types'
import { getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Plus, Trash2, X, Save, UserCheck, ArrowRight } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'

export default function ProcurationsPage() {
  const supabase = createClient()
  const [proxies, setProxies] = useState<Proxy[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [absentId, setAbsentId] = useState('')
  const [holderId, setHolderId] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    const [{ data: p }, { data: pr }] = await Promise.all([
      supabase.from('profiles').select('*, political_groups!profiles_group_id_fkey(name, color)').order('last_name'),
      supabase.from('proxies').select(`
        *,
        absent:profiles!absent_id(id, first_name, last_name, political_groups!profiles_group_id_fkey(name, color)),
        holder:profiles!holder_id(id, first_name, last_name, political_groups!profiles_group_id_fkey(name, color))
      `),
    ])
    setProfiles(p ?? [])
    setProxies(pr ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
    const channel = supabase
      .channel('proxies-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proxies' }, fetchData)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchData, supabase])

  // Filtre : absents disponibles (pas déjà absents dans une procuration)
  const absentIds = proxies.map(p => p.absent_id)
  const holderIds = proxies.map(p => p.holder_id)

  const availableAbsents = profiles.filter(p => !absentIds.includes(p.id))
  const availableHolders = profiles.filter(p => !holderIds.includes(p.id) && p.id !== absentId)

  async function handleCreate() {
    if (!absentId || !holderId) {
      toast.error('Sélectionnez les deux parlementaires')
      return
    }
    if (absentId === holderId) {
      toast.error('Un parlementaire ne peut pas se donner procuration à lui-même')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('proxies').insert({
      absent_id: absentId,
      holder_id: holderId,
    })
    if (error) {
      toast.error(error.message.includes('unique') ? 'Procuration déjà existante pour ce parlementaire' : 'Erreur')
    } else {
      toast.success('Procuration créée')
      setShowForm(false)
      setAbsentId('')
      setHolderId('')
      fetchData()
    }
    setSaving(false)
  }

  async function handleDelete(proxy: Proxy) {
    if (!confirm('Supprimer cette procuration ?')) return
    const { error } = await supabase.from('proxies').delete().eq('id', proxy.id)
    if (error) {
      toast.error('Erreur')
    } else {
      toast.success('Procuration supprimée')
      fetchData()
    }
  }

  if (loading) {
    return (
      <div>
        <TopBar title="Procurations" />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-pel-blue/30 border-t-pel-blue rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar title="Gestion des procurations" />
      <div className="p-6 space-y-6">
        {/* Info règles */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Règles des procurations</p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-700">
            <li>Un parlementaire absent ne peut donner qu&apos;une seule procuration</li>
            <li>Un parlementaire titulaire ne peut détenir qu&apos;une seule procuration</li>
            <li>Le titulaire votera pour lui-même et pour l&apos;absent (2 voix)</li>
          </ul>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-gray-500 text-sm">{proxies.length} procuration(s) active(s)</p>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Nouvelle procuration
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="card border-2 border-pel-blue/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="section-title flex items-center gap-2">
                <UserCheck size={18} className="text-pel-blue" />
                Nouvelle procuration
              </h3>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Parlementaire absent (donne procuration)</label>
                <select
                  value={absentId}
                  onChange={e => setAbsentId(e.target.value)}
                  className="input-field"
                >
                  <option value="">— Sélectionner —</option>
                  {availableAbsents.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Parlementaire titulaire (reçoit la procuration)</label>
                <select
                  value={holderId}
                  onChange={e => setHolderId(e.target.value)}
                  className="input-field"
                  disabled={!absentId}
                >
                  <option value="">— Sélectionner —</option>
                  {availableHolders.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleCreate} disabled={saving} className="btn-primary flex items-center gap-2">
                <Save size={16} />
                {saving ? 'Création...' : 'Créer la procuration'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
            </div>
          </div>
        )}

        {/* Liste */}
        <div className="card p-0 overflow-hidden">
          {proxies.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {proxies.map(proxy => (
                <div key={proxy.id} className="flex items-center gap-4 px-6 py-4">
                  {/* Absent */}
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: (proxy.absent as any)?.political_groups?.color ?? '#94a3b8' }}
                    >
                      {proxy.absent && getInitials((proxy.absent as any).first_name, (proxy.absent as any).last_name)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {(proxy.absent as any)?.first_name} {(proxy.absent as any)?.last_name}
                      </p>
                      <p className="text-xs text-gray-400">Absent</p>
                    </div>
                  </div>

                  {/* Flèche */}
                  <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />

                  {/* Titulaire */}
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: (proxy.holder as any)?.political_groups?.color ?? '#94a3b8' }}
                    >
                      {proxy.holder && getInitials((proxy.holder as any).first_name, (proxy.holder as any).last_name)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {(proxy.holder as any)?.first_name} {(proxy.holder as any)?.last_name}
                      </p>
                      <p className="text-xs text-amber-600 font-medium">Titulaire (2 voix)</p>
                    </div>
                  </div>

                  {/* Supprimer */}
                  <button
                    onClick={() => handleDelete(proxy)}
                    className="p-1.5 text-gray-400 hover:text-pel-red hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <UserCheck size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucune procuration active</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
