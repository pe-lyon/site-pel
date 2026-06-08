'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, User, FileText, Users, PenLine, X } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatDateTime } from '@/lib/utils'
import { STATUS_LABELS, STATUS_COLORS, TYPE_LABELS, BillStatus } from '@/types'
import TopBar from '@/components/layout/TopBar'
import toast from 'react-hot-toast'

const ELIGIBLE_ROLES = ['parlementaire', 'president_groupe', 'president_seance', 'ministre']
const COSIGN_STATUSES = ['deposee', 'en_discussion']

interface Profile {
  id: string
  first_name: string
  last_name: string
  role: string
}

interface Bill {
  id: string
  number: string
  title: string
  description: string | null
  full_text: string | null
  author_id: string | null
  status: BillStatus
  type: string | null
  created_at: string
  updated_at: string
  profiles: Profile | null
}

interface Cosignataire {
  id: string
  user_id: string
  signed_at: string
  profiles: { first_name: string; last_name: string; role: string } | null
}

interface VoteSession {
  id: string
  title: string
  opened_at: string
  closed_at: string | null
  status: string
}

export default function PropositionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [bill, setBill] = useState<Bill | null>(null)
  const [cosignataires, setCosignataires] = useState<Cosignataire[]>([])
  const [sessions, setSessions] = useState<VoteSession[]>([])
  const [loading, setLoading] = useState(true)
  const [cosigning, setCosigning] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [profileRes, billRes, cosRes, sessRes] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name, role').eq('id', user.id).single(),
        supabase.from('bills').select('*, profiles(id, first_name, last_name, role)').eq('id', id).single(),
        supabase.from('bill_cosignataires').select('id, user_id, signed_at, profiles(first_name, last_name, role)').eq('bill_id', id).order('signed_at'),
        supabase.from('vote_sessions').select('id, title, opened_at, closed_at, status').eq('bill_id', id).order('created_at', { ascending: false }),
      ])

      if (billRes.error || !billRes.data) { router.push('/propositions'); return }

      setProfile(profileRes.data)
      setBill(billRes.data as unknown as Bill)
      setCosignataires((cosRes.data as unknown as Cosignataire[]) ?? [])
      setSessions((sessRes.data as VoteSession[]) ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  const currentUserCosign = profile
    ? cosignataires.find(c => c.user_id === profile.id)
    : null

  const canCosign = profile && bill &&
    bill.author_id !== profile.id &&
    ELIGIBLE_ROLES.includes(profile.role) &&
    COSIGN_STATUSES.includes(bill.status) &&
    !currentUserCosign

  const canRemoveCosign = !!currentUserCosign

  async function handleCosign() {
    if (!profile || !bill) return
    setCosigning(true)
    try {
      const { error } = await supabase.from('bill_cosignataires').insert({
        bill_id: bill.id,
        user_id: profile.id,
      })
      if (error) throw error
      toast.success('Co-signature ajoutée')
      // Refresh cosignataires
      const { data } = await supabase.from('bill_cosignataires').select('id, user_id, signed_at, profiles(first_name, last_name, role)').eq('bill_id', bill.id).order('signed_at')
      setCosignataires((data as unknown as Cosignataire[]) ?? [])
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Erreur')
    } finally {
      setCosigning(false)
    }
  }

  async function handleRemoveCosign() {
    if (!currentUserCosign) return
    setCosigning(true)
    try {
      const { error } = await supabase.from('bill_cosignataires').delete().eq('id', currentUserCosign.id)
      if (error) throw error
      toast.success('Co-signature retirée')
      setCosignataires(cs => cs.filter(c => c.id !== currentUserCosign.id))
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Erreur')
    } finally {
      setCosigning(false)
    }
  }

  if (loading) {
    return (
      <div>
        <TopBar title="Proposition de loi" />
        <div className="p-6 flex items-center justify-center h-64 text-gray-400">Chargement…</div>
      </div>
    )
  }

  if (!bill) return null

  return (
    <div>
      <TopBar title="Proposition de loi" />
      <div className="p-6 max-w-4xl">
        {/* Retour */}
        <Link
          href="/propositions"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-pel-blue transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Retour aux propositions
        </Link>

        {/* En-tête */}
        <div className="card mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-sm font-mono text-gray-400">{bill.number}</span>
                <span className={`badge ${STATUS_COLORS[bill.status as BillStatus]}`}>
                  {STATUS_LABELS[bill.status as BillStatus]}
                </span>
                {bill.type && (
                  <span className="badge bg-indigo-100 text-indigo-700 text-xs">
                    {TYPE_LABELS[bill.type] ?? bill.type}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-pel-blue">{bill.title}</h1>
            </div>
            <div className="w-12 h-12 bg-pel-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText size={22} className="text-pel-blue" />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-500">
            {bill.profiles && (
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {bill.profiles.first_name} {bill.profiles.last_name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              Déposée le {formatDateTime(bill.created_at)}
            </span>
            {bill.updated_at !== bill.created_at && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Modifiée le {formatDateTime(bill.updated_at)}
              </span>
            )}
          </div>

          {/* Boutons co-signature */}
          <div className="mt-5 flex gap-3 flex-wrap">
            {canCosign && (
              <button
                onClick={handleCosign}
                disabled={cosigning}
                className="btn-primary flex items-center gap-2 disabled:opacity-60"
              >
                <PenLine size={15} />
                {cosigning ? 'En cours…' : 'Co-signer cette proposition'}
              </button>
            )}
            {canRemoveCosign && (
              <button
                onClick={handleRemoveCosign}
                disabled={cosigning}
                className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                <X size={15} />
                {cosigning ? 'En cours…' : 'Retirer ma co-signature'}
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {bill.description && (
          <div className="card mb-6">
            <h2 className="section-title mb-3">Résumé</h2>
            <p className="text-gray-700 leading-relaxed">{bill.description}</p>
          </div>
        )}

        {/* Texte complet */}
        {bill.full_text && (
          <div className="card mb-6">
            <h2 className="section-title mb-3">Texte complet</h2>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap border-l-4 border-pel-blue/20 pl-4">
              {bill.full_text}
            </div>
          </div>
        )}

        {/* Co-signataires */}
        <div className="card mb-6">
          <h2 className="section-title mb-3 flex items-center gap-2">
            <Users size={16} className="text-pel-blue" />
            Co-signataires ({cosignataires.length})
          </h2>
          {cosignataires.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {cosignataires.map(cos => (
                <div key={cos.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pel-blue/10 rounded-full flex items-center justify-center">
                      <User size={14} className="text-pel-blue" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {cos.profiles ? `${cos.profiles.first_name} ${cos.profiles.last_name}` : 'Inconnu'}
                      </p>
                      {cos.profiles && (
                        <p className="text-xs text-gray-400 capitalize">{cos.profiles.role.replace(/_/g, ' ')}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(cos.signed_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-2">Aucun co-signataire pour l&apos;instant.</p>
          )}
        </div>

        {/* Scrutins liés */}
        {sessions.length > 0 && (
          <div className="card">
            <h2 className="section-title mb-3">Scrutins associés</h2>
            <div className="space-y-2">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{session.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDateTime(session.opened_at)}
                      {session.closed_at && ` → ${formatDateTime(session.closed_at)}`}
                    </p>
                  </div>
                  <span className={`badge ${session.status === 'ouvert'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                    {session.status === 'ouvert' ? 'En cours' : 'Terminé'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
