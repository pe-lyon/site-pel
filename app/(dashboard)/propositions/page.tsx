'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, Plus, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { STATUS_LABELS, STATUS_COLORS, TYPE_LABELS, BillStatus } from '@/types'
import TopBar from '@/components/layout/TopBar'
import toast from 'react-hot-toast'

const ELIGIBLE_ROLES = ['president_groupe', 'ministre', 'president_seance', 'parlementaire']
const PROJET_ROLES = ['president_groupe', 'ministre']

interface Bill {
  id: string
  number: string
  title: string
  description: string | null
  status: BillStatus
  type: string | null
  created_at: string
  profiles: { first_name: string; last_name: string } | null
}

interface Profile {
  id: string
  role: string
  first_name: string
  last_name: string
}

export default function PropositionsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [bills, setBills] = useState<Bill[]>([])
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    type: 'proposition_de_loi' as 'projet_de_loi' | 'proposition_de_loi',
    title: '',
    description: '',
    full_text: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: prof } = await supabase
        .from('profiles')
        .select('id, role, first_name, last_name')
        .eq('id', user.id)
        .single()
      setProfile(prof)

      const { data: billsData } = await supabase
        .from('bills')
        .select('id, number, title, description, status, type, created_at, profiles(first_name, last_name)')
        .order('created_at', { ascending: false })
      setBills((billsData as Bill[]) ?? [])
    }
    load()
  }, [])

  const canSubmit = profile && ELIGIBLE_ROLES.includes(profile.role)
  const canProjet = profile && PROJET_ROLES.includes(profile.role)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSubmitting(true)
    try {
      // Generate number PEL-YYYY-NNN
      const year = new Date().getFullYear()
      const { count } = await supabase
        .from('bills')
        .select('*', { count: 'exact', head: true })
        .like('number', `PEL-${year}-%`)
      const seq = String((count ?? 0) + 1).padStart(3, '0')
      const number = `PEL-${year}-${seq}`

      const { error } = await supabase.from('bills').insert({
        number,
        title: form.title,
        description: form.description || null,
        full_text: form.full_text || null,
        author_id: profile.id,
        status: 'deposee',
        type: form.type,
      })

      if (error) throw error

      toast.success('Proposition déposée avec succès')
      setShowModal(false)
      setForm({ type: 'proposition_de_loi', title: '', description: '', full_text: '' })

      // Reload bills
      const { data: billsData } = await supabase
        .from('bills')
        .select('id, number, title, description, status, type, created_at, profiles(first_name, last_name)')
        .order('created_at', { ascending: false })
      setBills((billsData as Bill[]) ?? [])
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Erreur lors du dépôt')
    } finally {
      setSubmitting(false)
    }
  }

  const statusGroups = [
    'soumise_au_vote', 'en_discussion', 'deposee', 'adoptee', 'rejetee', 'archivee',
  ] as BillStatus[]

  return (
    <div>
      <TopBar title="Propositions de loi" />
      <div className="p-6 space-y-6">

        {/* Actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex flex-wrap gap-3">
            {statusGroups.map(status => {
              const count = bills.filter(b => b.status === status).length
              if (count === 0) return null
              return (
                <span key={status} className={`badge ${STATUS_COLORS[status]} px-3 py-1.5 text-sm`}>
                  {STATUS_LABELS[status]} ({count})
                </span>
              )
            })}
          </div>
          {canSubmit && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              Déposer une proposition
            </button>
          )}
        </div>

        {/* Liste */}
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="section-title">Toutes les propositions</h2>
          </div>

          {bills.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {bills.map((bill) => (
                <Link
                  key={bill.id}
                  href={`/propositions/${bill.id}`}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-pel-blue/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-pel-blue/15 transition-colors">
                    <FileText size={18} className="text-pel-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400 font-mono">{bill.number}</span>
                      <span className={`badge ${STATUS_COLORS[bill.status as BillStatus]}`}>
                        {STATUS_LABELS[bill.status as BillStatus]}
                      </span>
                      {bill.type && (
                        <span className="badge bg-indigo-100 text-indigo-700 text-xs">
                          {TYPE_LABELS[bill.type] ?? bill.type}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mt-1 truncate">{bill.title}</h3>
                    {bill.description && (
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{bill.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                      {bill.profiles && (
                        <span>Par {bill.profiles.first_name} {bill.profiles.last_name}</span>
                      )}
                      <span>Déposée le {formatDate(bill.created_at)}</span>
                    </div>
                  </div>
                  <span className="text-gray-300 group-hover:text-gray-400 text-xl flex-shrink-0">→</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucune proposition de loi</p>
              {canSubmit
                ? <p className="text-sm mt-1">Cliquez sur « Déposer une proposition » pour commencer.</p>
                : <p className="text-sm mt-1">Le président de séance peut en créer depuis l&apos;administration.</p>
              }
            </div>
          )}
        </div>
      </div>

      {/* Modal dépôt */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-pel-blue">Déposer une proposition</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de texte</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-pel-blue/40 transition-colors">
                    <input
                      type="radio"
                      name="type"
                      value="proposition_de_loi"
                      checked={form.type === 'proposition_de_loi'}
                      onChange={() => setForm(f => ({ ...f, type: 'proposition_de_loi' }))}
                      className="accent-pel-blue"
                    />
                    <div>
                      <p className="font-medium text-sm text-gray-900">Proposition de loi</p>
                      <p className="text-xs text-gray-500">Accessible à tous les parlementaires</p>
                    </div>
                  </label>
                  {canProjet && (
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-pel-blue/40 transition-colors">
                      <input
                        type="radio"
                        name="type"
                        value="projet_de_loi"
                        checked={form.type === 'projet_de_loi'}
                        onChange={() => setForm(f => ({ ...f, type: 'projet_de_loi' }))}
                        className="accent-pel-blue"
                      />
                      <div>
                        <p className="font-medium text-sm text-gray-900">Projet de loi</p>
                        <p className="text-xs text-gray-500">Réservé aux présidents de groupe et ministres</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="title">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Titre de la proposition…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pel-blue/60 focus:ring-2 focus:ring-pel-blue/10"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="description">
                  Résumé <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Résumé de la proposition…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pel-blue/60 focus:ring-2 focus:ring-pel-blue/10 resize-none"
                />
              </div>

              {/* Texte complet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="full_text">
                  Texte complet <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                  id="full_text"
                  rows={6}
                  value={form.full_text}
                  onChange={e => setForm(f => ({ ...f, full_text: e.target.value }))}
                  placeholder="Texte complet de la proposition…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pel-blue/60 focus:ring-2 focus:ring-pel-blue/10 resize-y"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary disabled:opacity-60"
                >
                  {submitting ? 'Dépôt en cours…' : 'Déposer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
