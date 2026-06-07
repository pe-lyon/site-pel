'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import { formatDate } from '@/lib/utils'
import { Calendar, Plus, Pencil, Trash2, ChevronDown, ChevronRight, FileText, Vote, Coffee, Info, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'

async function adminRead(table: string, select = '*', order?: { col: string; asc?: boolean }, filters?: Record<string, string>) {
  const res = await fetch('/api/admin/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, select, order, filters }),
  })
  const result = await res.json()
  return result.data ?? []
}

async function adminWrite(table: string, operation: string, data?: any, filters?: Record<string, string>) {
  const res = await fetch('/api/admin/write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, operation, data, filters }),
  })
  const result = await res.json()
  if (result.error) throw new Error(result.error)
  return result.data
}

const STATUS_LABELS: Record<string, string> = {
  preparation: 'En préparation',
  en_cours: 'En cours',
  terminee: 'Terminée',
}

const STATUS_COLORS: Record<string, string> = {
  preparation: 'bg-gray-100 text-gray-700',
  en_cours: 'bg-blue-100 text-blue-700',
  terminee: 'bg-green-100 text-green-700',
}

const AGENDA_TYPE_ICONS: Record<string, React.ElementType> = {
  texte: FileText,
  scrutin: Vote,
  pause: Coffee,
  information: Info,
}

const AGENDA_TYPE_LABELS: Record<string, string> = {
  texte: 'Texte libre',
  scrutin: 'Scrutin',
  pause: 'Pause',
  information: 'Information',
}

interface Seance {
  id: string
  title: string
  date: string
  status: string
  description: string | null
  president_id: string | null
  created_at: string
}

interface AgendaItem {
  id: string
  seance_id: string
  ordre: number
  type: string
  title: string
  content: string | null
  vote_session_id: string | null
  created_at: string
}

export default function SeancesPage() {
  const router = useRouter()
  const [seances, setSeances] = useState<Seance[]>([])
  const [agendaBySeance, setAgendaBySeance] = useState<Record<string, AgendaItem[]>>({})
  const [voteSessions, setVoteSessions] = useState<any[]>([])
  const [expandedSeance, setExpandedSeance] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Form states
  const [showSeanceForm, setShowSeanceForm] = useState(false)
  const [editingSeance, setEditingSeance] = useState<Seance | null>(null)
  const [seanceForm, setSeanceForm] = useState({ title: '', date: '', status: 'preparation', description: '' })

  const [showAgendaForm, setShowAgendaForm] = useState<string | null>(null) // seance_id
  const [agendaForm, setAgendaForm] = useState({ type: 'texte', title: '', content: '', vote_session_id: '' })

  async function loadAll() {
    const [s, v] = await Promise.all([
      adminRead('seances', '*', { col: 'date', asc: false }),
      adminRead('vote_sessions', 'id, title, status', { col: 'opened_at', asc: false }),
    ])
    setSeances(s)
    setVoteSessions(v)
    setLoading(false)
  }

  async function loadAgenda(seanceId: string) {
    const items = await adminRead('seance_agenda', '*', { col: 'ordre', asc: true }, { seance_id: seanceId })
    setAgendaBySeance(prev => ({ ...prev, [seanceId]: items }))
  }

  useEffect(() => { loadAll() }, [])

  function openSeanceForm(seance?: Seance) {
    if (seance) {
      setEditingSeance(seance)
      setSeanceForm({ title: seance.title, date: seance.date, status: seance.status, description: seance.description ?? '' })
    } else {
      setEditingSeance(null)
      setSeanceForm({ title: '', date: new Date().toISOString().split('T')[0], status: 'preparation', description: '' })
    }
    setShowSeanceForm(true)
  }

  async function saveSeance() {
    try {
      const payload = { title: seanceForm.title, date: seanceForm.date, status: seanceForm.status, description: seanceForm.description || null }
      if (editingSeance) {
        await adminWrite('seances', 'update', payload, { id: editingSeance.id })
        toast.success('Séance mise à jour')
      } else {
        await adminWrite('seances', 'insert', payload)
        toast.success('Séance créée')
      }
      setShowSeanceForm(false)
      loadAll()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  async function deleteSeance(id: string) {
    if (!confirm('Supprimer cette séance et tous ses points d\'agenda ?')) return
    try {
      await adminWrite('seances', 'delete', undefined, { id })
      toast.success('Séance supprimée')
      loadAll()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  function toggleExpand(seanceId: string) {
    if (expandedSeance === seanceId) {
      setExpandedSeance(null)
    } else {
      setExpandedSeance(seanceId)
      if (!agendaBySeance[seanceId]) loadAgenda(seanceId)
    }
  }

  async function addAgendaItem(seanceId: string) {
    try {
      const existing = agendaBySeance[seanceId] ?? []
      const maxOrdre = existing.length > 0 ? Math.max(...existing.map(i => i.ordre)) : 0
      const payload: any = {
        seance_id: seanceId,
        ordre: maxOrdre + 1,
        type: agendaForm.type,
        title: agendaForm.title,
        content: agendaForm.content || null,
        vote_session_id: agendaForm.type === 'scrutin' && agendaForm.vote_session_id ? agendaForm.vote_session_id : null,
      }
      await adminWrite('seance_agenda', 'insert', payload)
      toast.success('Point d\'agenda ajouté')
      setShowAgendaForm(null)
      setAgendaForm({ type: 'texte', title: '', content: '', vote_session_id: '' })
      loadAgenda(seanceId)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  async function deleteAgendaItem(id: string, seanceId: string) {
    try {
      await adminWrite('seance_agenda', 'delete', undefined, { id })
      toast.success('Point supprimé')
      loadAgenda(seanceId)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  if (loading) {
    return (
      <div>
        <TopBar title="Séances" />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-pel-blue/30 border-t-pel-blue rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar title="Séances" />
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">{seances.length} séance{seances.length !== 1 ? 's' : ''}</p>
          <button
            onClick={() => openSeanceForm()}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Nouvelle séance
          </button>
        </div>

        {/* Liste des séances */}
        {seances.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <Calendar size={40} className="mx-auto mb-3 opacity-40" />
            <p>Aucune séance enregistrée.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {seances.map(seance => {
              const isExpanded = expandedSeance === seance.id
              const agenda = agendaBySeance[seance.id] ?? []
              return (
                <div key={seance.id} className="card p-0 overflow-hidden">
                  {/* En-tête séance */}
                  <div className="p-4 flex items-center gap-3">
                    <button
                      onClick={() => toggleExpand(seance.id)}
                      className="flex-1 flex items-center gap-3 text-left"
                    >
                      {isExpanded ? <ChevronDown size={18} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{seance.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[seance.status]}`}>
                            {STATUS_LABELS[seance.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span>{formatDate(seance.date)}</span>
                          {seance.description && <span className="truncate">{seance.description}</span>}
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => router.push(`/administration/seances/${seance.id}/compte-rendu`)}
                        className="p-2 text-gray-400 hover:text-pel-blue hover:bg-blue-50 rounded-lg transition-colors"
                        title="Générer le compte rendu"
                      >
                        <ClipboardList size={16} />
                      </button>
                      <button
                        onClick={() => openSeanceForm(seance)}
                        className="p-2 text-gray-400 hover:text-pel-blue hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => deleteSeance(seance.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Agenda */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Points d&apos;agenda</span>
                        <button
                          onClick={() => { setShowAgendaForm(seance.id); setAgendaForm({ type: 'texte', title: '', content: '', vote_session_id: '' }) }}
                          className="text-xs text-pel-blue flex items-center gap-1 hover:underline"
                        >
                          <Plus size={13} /> Ajouter un point
                        </button>
                      </div>

                      {showAgendaForm === seance.id && (
                        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                              <select
                                value={agendaForm.type}
                                onChange={e => setAgendaForm(f => ({ ...f, type: e.target.value }))}
                                className="input text-sm"
                              >
                                {Object.entries(AGENDA_TYPE_LABELS).map(([v, l]) => (
                                  <option key={v} value={v}>{l}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Titre *</label>
                              <input
                                type="text"
                                value={agendaForm.title}
                                onChange={e => setAgendaForm(f => ({ ...f, title: e.target.value }))}
                                className="input text-sm"
                                placeholder="Titre du point"
                              />
                            </div>
                          </div>
                          {agendaForm.type === 'scrutin' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Scrutin associé</label>
                              <select
                                value={agendaForm.vote_session_id}
                                onChange={e => setAgendaForm(f => ({ ...f, vote_session_id: e.target.value }))}
                                className="input text-sm"
                              >
                                <option value="">— Sélectionner un scrutin —</option>
                                {voteSessions.map(vs => (
                                  <option key={vs.id} value={vs.id}>{vs.title}</option>
                                ))}
                              </select>
                            </div>
                          )}
                          {agendaForm.type !== 'pause' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Contenu</label>
                              <textarea
                                value={agendaForm.content}
                                onChange={e => setAgendaForm(f => ({ ...f, content: e.target.value }))}
                                className="input text-sm"
                                rows={3}
                                placeholder="Contenu ou description..."
                              />
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => addAgendaItem(seance.id)}
                              disabled={!agendaForm.title}
                              className="btn-primary text-xs px-3 py-1.5"
                            >
                              Ajouter
                            </button>
                            <button
                              onClick={() => setShowAgendaForm(null)}
                              className="btn-secondary text-xs px-3 py-1.5"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}

                      {agenda.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-gray-400">Aucun point d&apos;agenda pour cette séance.</p>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {agenda.map((item, idx) => {
                            const Icon = AGENDA_TYPE_ICONS[item.type] ?? FileText
                            return (
                              <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                                <span className="text-xs text-gray-400 w-5 pt-0.5 flex-shrink-0">{idx + 1}.</span>
                                <Icon size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-800">{item.title}</span>
                                    <span className="text-xs text-gray-400">({AGENDA_TYPE_LABELS[item.type]})</span>
                                  </div>
                                  {item.content && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.content}</p>}
                                </div>
                                <button
                                  onClick={() => deleteAgendaItem(item.id, seance.id)}
                                  className="p-1 text-gray-300 hover:text-red-500 flex-shrink-0"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-right">
                        <button
                          onClick={() => router.push(`/administration/seances/${seance.id}/compte-rendu`)}
                          className="text-xs text-pel-blue hover:underline flex items-center gap-1 ml-auto"
                        >
                          <ClipboardList size={13} /> Générer le compte rendu
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal séance */}
      {showSeanceForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              {editingSeance ? 'Modifier la séance' : 'Nouvelle séance'}
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                type="text"
                value={seanceForm.title}
                onChange={e => setSeanceForm(f => ({ ...f, title: e.target.value }))}
                className="input"
                placeholder="Ex: Séance plénière du 7 juin 2026"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={seanceForm.date}
                  onChange={e => setSeanceForm(f => ({ ...f, date: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={seanceForm.status}
                  onChange={e => setSeanceForm(f => ({ ...f, status: e.target.value }))}
                  className="input"
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={seanceForm.description}
                onChange={e => setSeanceForm(f => ({ ...f, description: e.target.value }))}
                className="input"
                rows={3}
                placeholder="Description optionnelle..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={saveSeance}
                disabled={!seanceForm.title || !seanceForm.date}
                className="btn-primary flex-1"
              >
                {editingSeance ? 'Mettre à jour' : 'Créer la séance'}
              </button>
              <button
                onClick={() => setShowSeanceForm(false)}
                className="btn-secondary flex-1"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
