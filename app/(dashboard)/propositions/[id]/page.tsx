'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Calendar, User, FileText, Users, PenLine, X,
  Gavel, MessageSquare, Clock, AlertTriangle, CheckCircle,
  XCircle, BookOpen, Mic, MicOff, Zap, ChevronDown, ChevronUp, Plus, Send,
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatDateTime } from '@/lib/utils'
import {
  STATUS_LABELS, STATUS_COLORS, TYPE_LABELS, BillStatus,
  AMENDEMENT_STATUT_LABELS, AMENDEMENT_STATUT_COLORS, MOTION_LABELS,
  MotionType, AmendementStatut,
} from '@/types'
import TopBar from '@/components/layout/TopBar'
import toast from 'react-hot-toast'

const ELIGIBLE_ROLES = ['parlementaire', 'president_groupe', 'president_seance', 'ministre']
const COSIGN_STATUSES: BillStatus[] = ['deposee', 'recevable', 'inscrit_ordre_du_jour', 'en_debat']

interface Profile {
  id: string
  first_name: string
  last_name: string
  role: string
  group_id: string | null
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
  recevabilite: string | null
  motif_irrecevabilite: string | null
  procedure_urgence: boolean
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

interface Amendement {
  id: string
  numero: string
  titre: string
  texte: string
  article_vise: string | null
  statut: AmendementStatut
  created_at: string
  auteur_id: string
  profiles: { first_name: string; last_name: string } | null
}

interface Orateur {
  id: string
  orateur_id: string
  position: number
  a_parle: boolean
  duree_secondes: number | null
  profiles: { first_name: string; last_name: string; group_id: string | null } | null
}

interface Motion {
  id: string
  type: MotionType
  motif: string | null
  statut: string
  created_at: string
  auteur_id: string
  profiles: { first_name: string; last_name: string } | null
}

interface VoteSession {
  id: string
  title: string
  opened_at: string
  closed_at: string | null
  status: string
}

export default function PropositionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [bill, setBill] = useState<Bill | null>(null)
  const [cosignataires, setCosignataires] = useState<Cosignataire[]>([])
  const [sessions, setSessions] = useState<VoteSession[]>([])
  const [amendements, setAmendements] = useState<Amendement[]>([])
  const [orateurs, setOrateurs] = useState<Orateur[]>([])
  const [motions, setMotions] = useState<Motion[]>([])
  const [loading, setLoading] = useState(true)
  const [cosigning, setCosigning] = useState(false)

  // Formulaire amendement
  const [showAmendForm, setShowAmendForm] = useState(false)
  const [amendForm, setAmendForm] = useState({ titre: '', texte: '', article_vise: '' })
  const [savingAmend, setSavingAmend] = useState(false)

  // Motion
  const [showMotionForm, setShowMotionForm] = useState(false)
  const [motionType, setMotionType] = useState<MotionType>('rappel_reglement')
  const [motionMotif, setMotionMotif] = useState('')
  const [savingMotion, setSavingMotion] = useState(false)

  // Accordion
  const [showAmendements, setShowAmendements] = useState(true)
  const [showOrateurs, setShowOrateurs] = useState(true)
  const [showMotions, setShowMotions] = useState(false)

  const isPresSéance = profile?.role === 'president_seance'
  const isEligible = profile ? ELIGIBLE_ROLES.includes(profile.role) : false

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const [profileRes, billRes, cosRes, sessRes] = await Promise.all([
      supabase.from('profiles').select('id, first_name, last_name, role, group_id').eq('id', user.id).single(),
      supabase.from('bills').select('*, profiles(id, first_name, last_name, role, group_id)').eq('id', id).single(),
      supabase.from('bill_cosignataires').select('id, user_id, signed_at, profiles(first_name, last_name, role)').eq('bill_id', id).order('signed_at'),
      supabase.from('vote_sessions').select('id, title, opened_at, closed_at, status').eq('bill_id', id).order('created_at', { ascending: false }),
    ])

    if (billRes.error || !billRes.data) { router.push('/propositions'); return }

    setProfile(profileRes.data)
    setBill(billRes.data as unknown as Bill)
    setCosignataires((cosRes.data as unknown as Cosignataire[]) ?? [])
    setSessions((sessRes.data as VoteSession[]) ?? [])

    // Nouvelles tables (requièrent la migration — silencieuses si absentes)
    try {
      const [amendRes, oratRes, motRes] = await Promise.all([
        supabase.from('amendements').select('*, profiles(first_name, last_name)').eq('bill_id', id).order('created_at'),
        supabase.from('liste_orateurs').select('*, profiles(first_name, last_name, group_id)').eq('bill_id', id).order('position'),
        supabase.from('motions_procedure').select('*, profiles(first_name, last_name)').eq('bill_id', id).order('created_at', { ascending: false }),
      ])
      if (!amendRes.error) setAmendements((amendRes.data as unknown as Amendement[]) ?? [])
      if (!oratRes.error) setOrateurs((oratRes.data as unknown as Orateur[]) ?? [])
      if (!motRes.error) setMotions((motRes.data as unknown as Motion[]) ?? [])
    } catch { /* tables pas encore créées */ }

    setLoading(false)
  }, [id, supabase, router])

  useEffect(() => { load() }, [load])

  // Realtime
  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(`bill-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bills', filter: `id=eq.${id}` }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id, supabase, load])

  const currentUserCosign = profile ? cosignataires.find(c => c.user_id === profile.id) : null
  const canCosign = profile && bill &&
    bill.author_id !== profile.id &&
    isEligible &&
    COSIGN_STATUSES.includes(bill.status) &&
    !currentUserCosign

  const isInscritOrateur = profile ? orateurs.find(o => o.orateur_id === profile.id) : null
  const canSInscrireOrateur = profile && bill && bill.status === 'en_debat' && !isInscritOrateur && isEligible

  async function handleCosign() {
    if (!profile || !bill) return
    setCosigning(true)
    try {
      const { error } = await supabase.from('bill_cosignataires').insert({ bill_id: bill.id, user_id: profile.id })
      if (error) throw error
      toast.success('Co-signature ajoutée')
      load()
    } catch (err: unknown) { toast.error((err as Error).message ?? 'Erreur') }
    finally { setCosigning(false) }
  }

  async function handleRemoveCosign() {
    if (!currentUserCosign) return
    setCosigning(true)
    try {
      const { error } = await supabase.from('bill_cosignataires').delete().eq('id', currentUserCosign.id)
      if (error) throw error
      toast.success('Co-signature retirée')
      load()
    } catch (err: unknown) { toast.error((err as Error).message ?? 'Erreur') }
    finally { setCosigning(false) }
  }

  async function handleSubmitAmendement() {
    if (!profile || !bill) return
    if (!amendForm.titre.trim() || !amendForm.texte.trim()) {
      toast.error('Titre et texte obligatoires')
      return
    }
    setSavingAmend(true)
    try {
      const count = amendements.length + 1
      const numero = `AMD-${bill.number}-${String(count).padStart(2, '0')}`
      const { error } = await supabase.from('amendements').insert({
        bill_id: bill.id,
        auteur_id: profile.id,
        numero,
        titre: amendForm.titre.trim(),
        texte: amendForm.texte.trim(),
        article_vise: amendForm.article_vise.trim() || null,
      })
      if (error) throw error
      toast.success('Amendement déposé')
      setAmendForm({ titre: '', texte: '', article_vise: '' })
      setShowAmendForm(false)
      load()
    } catch (err: unknown) { toast.error((err as Error).message ?? 'Erreur') }
    finally { setSavingAmend(false) }
  }

  async function handleAmendStatut(amendId: string, statut: AmendementStatut) {
    const { error } = await supabase.from('amendements').update({
      statut,
      traite_par: profile?.id,
      traite_le: new Date().toISOString(),
    }).eq('id', amendId)
    if (error) { toast.error('Erreur'); return }
    toast.success(`Amendement : ${AMENDEMENT_STATUT_LABELS[statut]}`)
    load()
  }

  async function handleSInscrireOrateur() {
    if (!profile || !bill) return
    const pos = orateurs.length + 1
    const { error } = await supabase.from('liste_orateurs').insert({
      bill_id: bill.id,
      orateur_id: profile.id,
      position: pos,
    })
    if (error) { toast.error(error.message); return }
    toast.success('Inscrit sur la liste des orateurs')
    load()
  }

  async function handleSeDesinscrireOrateur() {
    if (!isInscritOrateur) return
    const { error } = await supabase.from('liste_orateurs').delete().eq('id', isInscritOrateur.id)
    if (error) { toast.error('Erreur'); return }
    toast.success('Désinscrit de la liste')
    load()
  }

  async function handleOrateurAParle(orateurId: string) {
    if (!isPresSéance || !bill) return
    const { error } = await supabase.from('liste_orateurs').update({ a_parle: true }).eq('id', orateurId)
    if (error) { toast.error('Erreur'); return }
    load()
  }

  async function handleSubmitMotion() {
    if (!profile || !bill) return
    setSavingMotion(true)
    try {
      const { error } = await supabase.from('motions_procedure').insert({
        bill_id: bill.id,
        auteur_id: profile.id,
        type: motionType,
        motif: motionMotif.trim() || null,
      })
      if (error) throw error
      toast.success('Motion soumise au président de séance')
      setMotionMotif('')
      setShowMotionForm(false)
      load()
    } catch (err: unknown) { toast.error((err as Error).message ?? 'Erreur') }
    finally { setSavingMotion(false) }
  }

  async function handleMotionStatut(motionId: string, statut: 'acceptee' | 'refusee') {
    const { error } = await supabase.from('motions_procedure').update({
      statut,
      traite_par: profile?.id,
      traite_le: new Date().toISOString(),
    }).eq('id', motionId)
    if (error) { toast.error('Erreur'); return }
    toast.success(statut === 'acceptee' ? 'Motion acceptée' : 'Motion refusée')
    load()
  }

  // Président: avancer le statut
  async function handleAdvanceStatus(newStatus: BillStatus) {
    if (!isPresSéance || !bill) return
    const updates: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'inscrit_ordre_du_jour') updates.inscrit_odj_le = new Date().toISOString()
    if (newStatus === 'en_debat') updates.debat_ouvert_le = new Date().toISOString()
    if (newStatus === 'soumis_au_vote') updates.debat_clos_le = new Date().toISOString()
    const { error } = await supabase.from('bills').update(updates).eq('id', bill.id)
    if (error) { toast.error('Erreur'); return }
    toast.success(`Statut : ${STATUS_LABELS[newStatus]}`)
    load()
  }

  async function handleUrgence() {
    if (!isPresSéance || !bill) return
    const { error } = await supabase.from('bills').update({
      procedure_urgence: !bill.procedure_urgence,
      urgence_demandee_par: profile?.id,
      urgence_le: new Date().toISOString(),
    }).eq('id', bill.id)
    if (error) { toast.error('Erreur'); return }
    toast.success(bill.procedure_urgence ? 'Procédure d\'urgence levée' : 'Procédure d\'urgence activée')
    load()
  }

  if (loading) return (
    <div>
      <TopBar title="Proposition de loi" />
      <div className="p-6 flex items-center justify-center h-64 text-gray-400">Chargement…</div>
    </div>
  )

  if (!bill) return null

  const pendingMotions = motions.filter(m => m.statut === 'en_attente')

  return (
    <div>
      <TopBar title="Proposition de loi" />
      <div className="p-6 max-w-4xl space-y-6">
        <Link href="/propositions" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-pel-blue transition-colors">
          <ArrowLeft size={16} />
          Retour aux propositions
        </Link>

        {/* En-tête */}
        <div className="card">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-sm font-mono text-gray-400">{bill.number}</span>
                <span className={`badge ${STATUS_COLORS[bill.status]}`}>{STATUS_LABELS[bill.status]}</span>
                {bill.type && <span className="badge bg-indigo-100 text-indigo-700 text-xs">{TYPE_LABELS[bill.type] ?? bill.type}</span>}
                {bill.procedure_urgence && (
                  <span className="badge bg-orange-100 text-orange-700 text-xs flex items-center gap-1">
                    <Zap size={11} />
                    Procédure d&apos;urgence
                  </span>
                )}
                {bill.recevabilite === 'irrecevable' && (
                  <span className="badge bg-red-100 text-red-700 text-xs flex items-center gap-1">
                    <XCircle size={11} />
                    Irrecevable
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-pel-blue">{bill.title}</h1>
            </div>
            <div className="w-12 h-12 bg-pel-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText size={22} className="text-pel-blue" />
            </div>
          </div>

          <div className="flex flex-wrap gap-5 mt-4 text-sm text-gray-500">
            {bill.profiles && (
              <span className="flex items-center gap-1.5"><User size={14} />{bill.profiles.first_name} {bill.profiles.last_name}</span>
            )}
            <span className="flex items-center gap-1.5"><Calendar size={14} />Déposée le {formatDateTime(bill.created_at)}</span>
          </div>

          {bill.motif_irrecevabilite && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
              <strong>Motif d&apos;irrecevabilité :</strong> {bill.motif_irrecevabilite}
            </div>
          )}

          {/* Actions co-signature */}
          <div className="mt-5 flex gap-3 flex-wrap">
            {canCosign && (
              <button onClick={handleCosign} disabled={cosigning} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                <PenLine size={15} />
                {cosigning ? 'En cours…' : 'Co-signer cette proposition'}
              </button>
            )}
            {currentUserCosign && (
              <button onClick={handleRemoveCosign} disabled={cosigning} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors disabled:opacity-60">
                <X size={15} />
                {cosigning ? 'En cours…' : 'Retirer ma co-signature'}
              </button>
            )}
          </div>

          {/* Boutons président de séance */}
          {isPresSéance && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Gavel size={13} />
                Pouvoirs du Président de séance
              </p>
              <div className="flex flex-wrap gap-2">
                {bill.status === 'recevable' && (
                  <button onClick={() => handleAdvanceStatus('inscrit_ordre_du_jour')} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
                    <BookOpen size={13} />
                    Inscrire à l&apos;ordre du jour
                  </button>
                )}
                {bill.status === 'inscrit_ordre_du_jour' && (
                  <button onClick={() => handleAdvanceStatus('en_debat')} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
                    <MessageSquare size={13} />
                    Ouvrir le débat
                  </button>
                )}
                {bill.status === 'en_debat' && (
                  <>
                    <button onClick={() => handleAdvanceStatus('soumis_au_vote')} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
                      <Gavel size={13} />
                      Clore le débat → Vote
                    </button>
                    <button onClick={() => handleAdvanceStatus('renvoyee')} className="text-xs py-1.5 px-3 flex items-center gap-1.5 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-50">
                      <ArrowLeft size={13} />
                      Renvoyer
                    </button>
                  </>
                )}
                {bill.status === 'soumis_au_vote' && (
                  <>
                    <button onClick={() => handleAdvanceStatus('adoptee')} className="text-xs py-1.5 px-3 flex items-center gap-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      <CheckCircle size={13} />
                      Adoptée
                    </button>
                    <button onClick={() => handleAdvanceStatus('rejetee')} className="text-xs py-1.5 px-3 flex items-center gap-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700">
                      <XCircle size={13} />
                      Rejetée
                    </button>
                  </>
                )}
                {['inscrit_ordre_du_jour', 'en_debat', 'recevable'].includes(bill.status) && (
                  <button onClick={handleUrgence} className={`text-xs py-1.5 px-3 flex items-center gap-1.5 border rounded-lg transition-colors ${bill.procedure_urgence ? 'border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100' : 'border-gray-200 text-gray-600 hover:border-orange-200 hover:text-orange-600'}`}>
                    <Zap size={13} />
                    {bill.procedure_urgence ? 'Lever l\'urgence' : 'Procédure d\'urgence'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Alertes motions en attente (pour président) */}
        {isPresSéance && pendingMotions.length > 0 && (
          <div className="card border-amber-200 bg-amber-50">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber-600" />
              <h3 className="font-semibold text-amber-800 text-sm">
                {pendingMotions.length} motion(s) en attente de traitement
              </h3>
            </div>
            <div className="space-y-2">
              {pendingMotions.map(m => (
                <div key={m.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-100">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{MOTION_LABELS[m.type]}</p>
                    <p className="text-xs text-gray-500">
                      par {m.profiles ? `${m.profiles.first_name} ${m.profiles.last_name}` : 'Inconnu'}
                      {m.motif && ` — ${m.motif}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleMotionStatut(m.id, 'acceptee')} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200">
                      <CheckCircle size={14} />
                    </button>
                    <button onClick={() => handleMotionStatut(m.id, 'refusee')} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200">
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {bill.description && (
          <div className="card">
            <h2 className="section-title mb-3">Résumé</h2>
            <p className="text-gray-700 leading-relaxed">{bill.description}</p>
          </div>
        )}

        {/* Texte complet */}
        {bill.full_text && (
          <div className="card">
            <h2 className="section-title mb-3">Texte complet</h2>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap border-l-4 border-pel-blue/20 pl-4">
              {bill.full_text}
            </div>
          </div>
        )}

        {/* Amendements */}
        <div className="card">
          <button
            onClick={() => setShowAmendements(!showAmendements)}
            className="w-full flex items-center justify-between"
          >
            <h2 className="section-title flex items-center gap-2">
              <Gavel size={16} className="text-pel-blue" />
              Amendements ({amendements.length})
            </h2>
            {showAmendements ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>

          {showAmendements && (
            <div className="mt-4 space-y-3">
              {/* Liste amendements */}
              {amendements.map(am => (
                <div key={am.id} className={`p-3 rounded-lg border ${am.statut === 'adopte' ? 'border-green-200 bg-green-50' : am.statut === 'rejete' || am.statut === 'irrecevable' ? 'border-red-100 bg-red-50/40' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">{am.numero}</span>
                        <span className={`badge text-xs ${AMENDEMENT_STATUT_COLORS[am.statut]}`}>
                          {AMENDEMENT_STATUT_LABELS[am.statut]}
                        </span>
                        {am.article_vise && <span className="text-xs text-gray-400">Art. {am.article_vise}</span>}
                      </div>
                      <p className="text-sm font-medium text-gray-800">{am.titre}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        par {am.profiles ? `${am.profiles.first_name} ${am.profiles.last_name}` : 'Inconnu'} · {formatDate(am.created_at)}
                      </p>
                      <p className="text-sm text-gray-700 mt-2 leading-relaxed">{am.texte}</p>
                    </div>
                    {isPresSéance && am.statut === 'depose' && (
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button onClick={() => handleAmendStatut(am.id, 'recevable')} className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200" title="Recevable">
                          <CheckCircle size={14} />
                        </button>
                        <button onClick={() => handleAmendStatut(am.id, 'irrecevable')} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Irrecevable">
                          <XCircle size={14} />
                        </button>
                      </div>
                    )}
                    {isPresSéance && am.statut === 'recevable' && (
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button onClick={() => handleAmendStatut(am.id, 'adopte')} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Adopté">
                          <CheckCircle size={14} />
                        </button>
                        <button onClick={() => handleAmendStatut(am.id, 'rejete')} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Rejeté">
                          <XCircle size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {amendements.length === 0 && !showAmendForm && (
                <p className="text-sm text-gray-400 py-2">Aucun amendement déposé.</p>
              )}

              {/* Formulaire amendement */}
              {showAmendForm ? (
                <div className="border border-pel-blue/20 rounded-lg p-4 bg-blue-50/30 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Déposer un amendement</h4>
                  <input
                    type="text"
                    placeholder="Titre de l'amendement *"
                    value={amendForm.titre}
                    onChange={e => setAmendForm({ ...amendForm, titre: e.target.value })}
                    className="input-field text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Article visé (ex : Art. 3) — optionnel"
                    value={amendForm.article_vise}
                    onChange={e => setAmendForm({ ...amendForm, article_vise: e.target.value })}
                    className="input-field text-sm"
                  />
                  <textarea
                    placeholder="Texte de l'amendement *"
                    value={amendForm.texte}
                    onChange={e => setAmendForm({ ...amendForm, texte: e.target.value })}
                    className="input-field text-sm resize-none"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSubmitAmendement} disabled={savingAmend} className="btn-primary text-sm flex items-center gap-1.5">
                      <Send size={13} />
                      {savingAmend ? 'Dépôt…' : 'Déposer'}
                    </button>
                    <button onClick={() => setShowAmendForm(false)} className="btn-secondary text-sm">Annuler</button>
                  </div>
                </div>
              ) : (
                isEligible && ['en_debat', 'inscrit_ordre_du_jour', 'recevable'].includes(bill.status) && (
                  <button onClick={() => setShowAmendForm(true)} className="btn-secondary text-sm flex items-center gap-1.5">
                    <Plus size={14} />
                    Déposer un amendement
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Liste des orateurs */}
        {['en_debat', 'inscrit_ordre_du_jour'].includes(bill.status) && (
          <div className="card">
            <button
              onClick={() => setShowOrateurs(!showOrateurs)}
              className="w-full flex items-center justify-between"
            >
              <h2 className="section-title flex items-center gap-2">
                <Mic size={16} className="text-pel-blue" />
                Liste des orateurs ({orateurs.filter(o => !o.a_parle).length} en attente)
              </h2>
              {showOrateurs ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>

            {showOrateurs && (
              <div className="mt-4 space-y-2">
                {orateurs.length === 0 && (
                  <p className="text-sm text-gray-400 py-1">Aucun orateur inscrit.</p>
                )}
                {orateurs.map((o, i) => (
                  <div key={o.id} className={`flex items-center justify-between p-3 rounded-lg border ${o.a_parle ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-blue-100 bg-blue-50/40'}`}>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-pel-blue/10 text-pel-blue text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {o.profiles ? `${o.profiles.first_name} ${o.profiles.last_name}` : 'Inconnu'}
                        </p>
                        {o.duree_secondes && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={11} />
                            {Math.floor(o.duree_secondes / 60)}:{String(o.duree_secondes % 60).padStart(2, '0')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {o.a_parle && <span className="text-xs text-gray-400 flex items-center gap-1"><MicOff size={12} />A parlé</span>}
                      {isPresSéance && !o.a_parle && (
                        <button onClick={() => handleOrateurAParle(o.id)} className="text-xs py-1 px-2.5 bg-green-100 text-green-700 rounded hover:bg-green-200">
                          ✓ A parlé
                        </button>
                      )}
                      {o.orateur_id === profile?.id && !o.a_parle && (
                        <button onClick={handleSeDesinscrireOrateur} className="text-xs py-1 px-2.5 border border-red-200 text-red-600 rounded hover:bg-red-50">
                          Se désinscrire
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {canSInscrireOrateur && (
                  <button onClick={handleSInscrireOrateur} className="btn-secondary text-sm flex items-center gap-1.5">
                    <Mic size={14} />
                    S&apos;inscrire pour prendre la parole
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Motions de procédure */}
        {isEligible && bill.status === 'en_debat' && (
          <div className="card">
            <button
              onClick={() => setShowMotions(!showMotions)}
              className="w-full flex items-center justify-between"
            >
              <h2 className="section-title flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600" />
                Motions de procédure ({motions.length})
              </h2>
              {showMotions ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>

            {showMotions && (
              <div className="mt-4 space-y-3">
                {motions.map(m => (
                  <div key={m.id} className={`p-3 rounded-lg border ${m.statut === 'acceptee' ? 'border-green-200 bg-green-50' : m.statut === 'refusee' ? 'border-red-100 bg-red-50/40' : 'border-amber-200 bg-amber-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{MOTION_LABELS[m.type]}</p>
                        <p className="text-xs text-gray-500">
                          par {m.profiles ? `${m.profiles.first_name} ${m.profiles.last_name}` : 'Inconnu'} · {formatDate(m.created_at)}
                          {m.motif && ` — ${m.motif}`}
                        </p>
                      </div>
                      <span className={`badge text-xs ${m.statut === 'acceptee' ? 'bg-green-100 text-green-700' : m.statut === 'refusee' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                        {m.statut === 'en_attente' ? 'En attente' : m.statut === 'acceptee' ? 'Acceptée' : 'Refusée'}
                      </span>
                    </div>
                  </div>
                ))}

                {!showMotionForm ? (
                  <button onClick={() => setShowMotionForm(true)} className="btn-secondary text-sm flex items-center gap-1.5">
                    <Plus size={14} />
                    Soumettre une motion
                  </button>
                ) : (
                  <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/40 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">Soumettre une motion de procédure</h4>
                    <select
                      value={motionType}
                      onChange={e => setMotionType(e.target.value as MotionType)}
                      className="input-field text-sm"
                    >
                      {Object.entries(MOTION_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    <textarea
                      placeholder="Motif (optionnel)"
                      value={motionMotif}
                      onChange={e => setMotionMotif(e.target.value)}
                      className="input-field text-sm resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSubmitMotion} disabled={savingMotion} className="btn-primary text-sm flex items-center gap-1.5">
                        <Send size={13} />
                        {savingMotion ? 'Envoi…' : 'Soumettre'}
                      </button>
                      <button onClick={() => setShowMotionForm(false)} className="btn-secondary text-sm">Annuler</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Co-signataires */}
        <div className="card">
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
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{session.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDateTime(session.opened_at)}
                      {session.closed_at && ` → ${formatDateTime(session.closed_at)}`}
                    </p>
                  </div>
                  <span className={`badge ${session.status === 'ouvert' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
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
