export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Calendar, User, FileText } from 'lucide-react'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'
import { STATUS_LABELS, STATUS_COLORS, BillStatus } from '@/types'
import TopBar from '@/components/layout/TopBar'

export default async function PropositionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bill } = await supabase
    .from('bills')
    .select('*, profiles(first_name, last_name, role)')
    .eq('id', id)
    .single()

  if (!bill) notFound()

  // Scrutins liés à cette proposition
  const { data: sessions } = await supabase
    .from('vote_sessions')
    .select('*')
    .eq('bill_id', id)
    .order('created_at', { ascending: false })

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
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono text-gray-400">{bill.number}</span>
                <span className={`badge ${STATUS_COLORS[bill.status as BillStatus]}`}>
                  {STATUS_LABELS[bill.status as BillStatus]}
                </span>
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

        {/* Scrutins liés */}
        {sessions && sessions.length > 0 && (
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
