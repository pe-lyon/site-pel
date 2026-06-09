'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { formatDate, formatDateTime } from '@/lib/utils'
import {
  Gavel, CheckCircle, XCircle, Eye, Clock, FileText, AlertTriangle,
  BookOpen, MessageSquare, Zap, ChevronRight, Mic, Users,
} from 'lucide-react'
import Link from 'next/link'
import { STATUS_LABELS, STATUS_COLORS, TYPE_LABELS, BillStatus, MOTION_LABELS, MotionType } from '@/types'
import TopBar from '@/components/layout/TopBar'
import toast from 'react-hot-toast'

interface Bill {
  id: string
  number: string
  title: string
  description: string | null
  status: BillStatus
  type: string | null
  recevabilite: string | null
  procedure_urgence: boolean
  created_at: string
  profiles: { first_name: string; last_name: string } | null
}

interface Motion {
  id: string
  type: MotionType
  motif: string | null
  statut: string
  created_at: string
  bill_id: string
  profiles: { first_name: string; last_name: string } | null
  bills: { title: string; number: string } | null
}

interface Amendement {
  id: string
  numero: string
  titre: string
  statut: string
  bill_id: string
  created_at: string
  profiles: { first_name: string; last_name: string } | null
  bills: { title: string; number: string } | null
}

interface Orateur {
  id: string
  position: number
  a_parle: boolean
  bill_id: string
  profiles: { first_name: string; last_name: string } | null
  bills: { title: string; number: string } | null
}

export default function PresidentRecevabilitePage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [bills, setBills] = useState<Bill[]>([])
  const [motions, setMotions] = useState<Motion[]>([])
  const [amendements, setAmendements] = useState<Amendement[]>([])
  const [orateurs, setOrateurs] = useState<Orateur[]>([])
  const [motifMap, setMotifMap] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'president_seance') { router.push('/'); return }

    const [billsRes, motionsRes, amendsRes, oratRes] = await Promise.all([
      supabase.from('bills')
        .select('*, profiles(first_name, last_name)')
        .in('status', ['deposee', 'recevable', 'inscrit_ordre_du_jour', 'en_debat'])
        .order('created_at', { ascending: false }),
      supabase.from('motions_procedure')
        .select('*, profiles(first_name, last_name), bills(title, number)')
        .eq('statut', 'en_attente')
        .order('created_at'),
      supabase.from('amendements')
        .select('*, profiles(first_name, last_name), bills(title, number)')
        .eq('statut', 'depose')
        .order('created_at'),
      supabase.from('liste_orateurs')
        .select('*, profiles(first_name, last_name), bills(title, number)')
        .eq('a_parle', false)
        .order('position'),
    ])

    setBills((billsRes.data ?? []) as unknown as Bill[])
    setMotions((motionsRes.data ?? []) as unknown as Motion[])
    setAmendements((amendsRes.data ?? []) as unknown as Amendement[])
    setOrateurs((oratRes.data ?? []) as unknown as Orateur[])
    setLoading(false)
  }, [supabase, router])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const channel = supabase
      .channel('president-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bills' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'motions_procedure' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'amendements' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'liste_orateurs' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, load])

  async function handleRecevabilite(bill: Bill, recevabilite: 'recevable' | 'irrecevable') {
    const { data: { user } } = await supabase.auth.getUser()
    const motif = motifMap[bill.id] || null
    const { error } = await supabase.from('bills').update({
      recevabilite,
      recevabilite_par: user?.id,
      recevabilite_le: new Date().toISOString(),
      status: recevabilite === 'recevable' ? 'recevable' : 'irrecevable',
      ...(recevabilite === 'irrecevable' && motif ? { motif_irrecevabilite: motif } : {}),
    }).eq('id', bill.id)
    if (error) { toast.error(error.message); return }
    toast.success(recevabilite === 'recevable' ? '✅ Déclarée recevable' : '❌ Déclarée irrecevable')
    setMotifMap(prev => { const n = { ...prev }; delete n[bill.id]; return n })
    load()
  }

  async function handleAdvance(billId: string, newStatus: BillStatus) {
    const updates: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'inscrit_ordre_du_jour') updates.inscrit_odj_le = new Date().toISOString()
    if (newStatus === 'en_debat') updates.debat_ouvert_le = new Date().toISOString()
    if (newStatus === 'soumis_au_vote') updates.debat_clos_le = new Date().toISOString()
    const { error } = await supabase.from('bills').update(updates).eq('id', billId)
    if (error) { toast.error(error.message); return }
    toast.success(`Statut : ${STATUS_LABELS[newStatus]}`)
    load()
  }

  async function handleUrgence(bill: Bill) {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('bills').update({
      procedure_urgence: !bill.procedure_urgence,
      urgence_demandee_par: user?.id,
      urgence_le: new Date().toISOString(),
    }).eq('id', bill.id)
    if (error) { toast.error(error.message); return }
    toast.success(bill.procedure_urgence ? 'Procédure d\'urgence levée' : 'Procédure d\'urgence activée ⚡')
    load()
  }

  async function handleMotion(id: string, statut: 'acceptee' | 'refusee') {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('motions_procedure').update({
      statut,
      traite_par: user?.id,
      traite_le: new Date().toISOString(),
    }).eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success(statut === 'acceptee' ? 'Motion acceptée' : 'Motion refusée')
    load()
  }

  async function handleAmendement(id: string, statut: 'recevable' | 'irrecevable') {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('amendements').update({
      statut,
      traite_par: user?.id,
      traite_le: new Date().toISOString(),
    }).eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success(statut === 'recevable' ? 'Amendement recevable' : 'Amendement irrecevable')
    load()
  }

  async function handleOrateurAParle(id: string) {
    const { error } = await supabase.from('liste_orateurs').update({ a_parle: true }).eq('id', id)
    if (error) { toast.error(error.message); return }
    load()
  }

  const pendingRecevabilite = bills.filter(b => b.status === 'deposee')
  const enCours = bills.filter(b => b.status !== 'deposee')

  if (loading) return (
    <div>
      <TopBar title="Bureau du Président de séance" />
      <div className="p-6 flex items-center justify-center h-64 text-gray-400">Chargement…</div>
    </div>
  )

  return (
    <div>
      <TopBar title="Bureau du Président de séance" />
      <div className="p-6 max-w-5xl space-y-8">

        {/* Compteurs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'En attente recevabilité', value: pendingRecevabilite.length, color: 'bg-amber-50 border-amber-200 text-amber-700', icon: <Clock size={20} /> },
            { label: 'Motions en attente', value: motions.length, color: 'bg-red-50 border-red-200 text-red-700', icon: <AlertTriangle size={20} /> },
            { label: 'Amendements à traiter', value: amendements.length, color: 'bg-blue-50 border-blue-200 text-blue-700', icon: <Gavel size={20} /> },
            { label: 'Orateurs inscrits', value: orateurs.length, color: 'bg-indigo-50 border-indigo-200 text-indigo-700', icon: <Mic size={20} /> },
          ].map((stat, i) => (
            <div key={i} className={`rounded-xl border p-4 ${stat.color}`}>
              <div className="flex items-center justify-between mb-1">
                {stat.icon}
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="text-xs font-medium opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recevabilité */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-pel-blue" />
            <h2 className="text-lg font-bold text-gray-800">Examen de recevabilité</h2>
            {pendingRecevabilite.length > 0 && (
              <span className="bg-amber-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">{pendingRecevabilite.length}</span>
            )}
          </div>

          {pendingRecevabilite.length === 0 ? (
            <div className="card text-center py-8">
              <CheckCircle size={28} className="mx-auto mb-2 text-green-400" />
              <p className="text-gray-500 text-sm">Aucune proposition en attente d&apos;examen.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRecevabilite.map(bill => (
                <div key={bill.id} className="card border-l-4 border-amber-400">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">{bill.number}</span>
                        {bill.type && <span className="badge bg-indigo-100 text-indigo-700 text-xs">{TYPE_LABELS[bill.type] ?? bill.type}</span>}
                        {bill.procedure_urgence && <span className="badge bg-orange-100 text-orange-700 text-xs flex items-center gap-1"><Zap size={10} />Urgence</span>}
                      </div>
                      <h3 className="font-semibold text-gray-900">{bill.title}</h3>
                      {bill.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{bill.description}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        {bill.profiles ? `${bill.profiles.first_name} ${bill.profiles.last_name}` : 'Inconnu'} · {formatDate(bill.created_at)}
                      </p>
                    </div>
                    <Link href={`/propositions/${bill.id}`} className="p-2 text-gray-400 hover:text-pel-blue hover:bg-pel-blue/5 rounded-lg flex-shrink-0" title="Voir le texte">
                      <Eye size={16} />
                    </Link>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      placeholder="Motif d'irrecevabilité (si refus)"
                      value={motifMap[bill.id] ?? ''}
                      onChange={e => setMotifMap(prev => ({ ...prev, [bill.id]: e.target.value }))}
                      className="input-field text-sm flex-1 min-w-0"
                    />
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleRecevabilite(bill, 'recevable')} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                        <CheckCircle size={14} />
                        Recevable
                      </button>
                      <button onClick={() => handleRecevabilite(bill, 'irrecevable')} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                        <XCircle size={14} />
                        Irrecevable
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Motions en attente */}
        {motions.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-amber-600" />
              <h2 className="text-lg font-bold text-gray-800">Motions de procédure</h2>
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">{motions.length}</span>
            </div>
            <div className="space-y-3">
              {motions.map(m => (
                <div key={m.id} className="card border-red-100 bg-red-50/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="badge bg-red-100 text-red-700 text-xs">{MOTION_LABELS[m.type]}</span>
                        {m.bills && <span className="text-xs text-gray-500">{m.bills.number} — {m.bills.title}</span>}
                      </div>
                      <p className="text-sm font-medium text-gray-800">
                        par {m.profiles ? `${m.profiles.first_name} ${m.profiles.last_name}` : 'Inconnu'}
                      </p>
                      {m.motif && <p className="text-sm text-gray-600 mt-1 italic">&laquo; {m.motif} &raquo;</p>}
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(m.created_at)}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleMotion(m.id, 'acceptee')} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" title="Accepter">
                        <CheckCircle size={16} />
                      </button>
                      <button onClick={() => handleMotion(m.id, 'refusee')} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Refuser">
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Amendements à traiter */}
        {amendements.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Gavel size={18} className="text-pel-blue" />
              <h2 className="text-lg font-bold text-gray-800">Amendements déposés</h2>
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">{amendements.length}</span>
            </div>
            <div className="space-y-3">
              {amendements.map(am => (
                <div key={am.id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">{am.numero}</span>
                        {am.bills && (
                          <span className="text-xs text-gray-500">{am.bills.number} — {am.bills.title}</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{am.titre}</p>
                      <p className="text-xs text-gray-400">
                        par {am.profiles ? `${am.profiles.first_name} ${am.profiles.last_name}` : 'Inconnu'} · {formatDate(am.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleAmendement(am.id, 'recevable')} className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200" title="Recevable">
                        <CheckCircle size={16} />
                      </button>
                      <button onClick={() => handleAmendement(am.id, 'irrecevable')} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Irrecevable">
                        <XCircle size={16} />
                      </button>
                      {am.bills && (
                        <Link href={`/propositions/${am.bill_id}`} className="p-2 text-gray-400 hover:text-pel-blue rounded-lg">
                          <Eye size={16} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Liste des orateurs */}
        {orateurs.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Mic size={18} className="text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-800">Liste des orateurs</h2>
            </div>
            <div className="card space-y-2">
              {orateurs.map((o, i) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border border-indigo-100 bg-indigo-50/30">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-pel-blue text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {o.profiles ? `${o.profiles.first_name} ${o.profiles.last_name}` : 'Inconnu'}
                      </p>
                      {o.bills && <p className="text-xs text-gray-400">{o.bills.number} — {o.bills.title}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleOrateurAParle(o.id)}
                    className="text-xs py-1.5 px-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    ✓ A parlé
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Navigation rapide */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Textes en cours</h2>
          {enCours.length === 0 ? (
            <p className="text-sm text-gray-400">Aucun texte en cours de procédure.</p>
          ) : (
            <div className="space-y-2">
              {enCours.map(bill => (
                <Link
                  key={bill.id}
                  href={`/propositions/${bill.id}`}
                  className="card flex items-center justify-between hover:border-pel-blue/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`badge ${STATUS_COLORS[bill.status]} text-xs`}>{STATUS_LABELS[bill.status]}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{bill.title}</p>
                      <p className="text-xs text-gray-400 font-mono">{bill.number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {bill.procedure_urgence && <Zap size={14} className="text-orange-500" />}
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Avancement rapide */}
        {enCours.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Avancement de procédure</h2>
            <div className="space-y-3">
              {enCours.filter(b => ['recevable', 'inscrit_ordre_du_jour', 'en_debat'].includes(b.status)).map(bill => (
                <div key={bill.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{bill.title}</p>
                      <span className={`badge text-xs ${STATUS_COLORS[bill.status]}`}>{STATUS_LABELS[bill.status]}</span>
                    </div>
                    <button
                      onClick={() => handleUrgence(bill)}
                      className={`text-xs py-1 px-2.5 flex items-center gap-1 border rounded-lg transition-colors ${bill.procedure_urgence ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:border-orange-200 hover:text-orange-600'}`}
                    >
                      <Zap size={12} />
                      {bill.procedure_urgence ? 'Lever urgence' : 'Urgence'}
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {bill.status === 'recevable' && (
                      <button onClick={() => handleAdvance(bill.id, 'inscrit_ordre_du_jour')} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
                        <BookOpen size={12} />Inscrire à l&apos;ODJ
                      </button>
                    )}
                    {bill.status === 'inscrit_ordre_du_jour' && (
                      <button onClick={() => handleAdvance(bill.id, 'en_debat')} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
                        <MessageSquare size={12} />Ouvrir le débat
                      </button>
                    )}
                    {bill.status === 'en_debat' && (
                      <>
                        <button onClick={() => handleAdvance(bill.id, 'soumis_au_vote')} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
                          <Gavel size={12} />Clore → Vote
                        </button>
                        <button onClick={() => handleAdvance(bill.id, 'renvoyee')} className="text-xs py-1.5 px-3 flex items-center gap-1.5 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-50">
                          Renvoyer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
