export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'
import TopBar from '@/components/layout/TopBar'
import VotePanel from '@/components/vote/VotePanel'

export default async function ScrutinPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('vote_sessions')
    .select('*, bills(*), profiles(first_name, last_name)')
    .eq('id', id)
    .single()

  if (!session) notFound()

  return (
    <div>
      <TopBar title="Scrutin" />
      <div className="p-6 max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-pel-blue transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Retour au tableau de bord
        </Link>

        {/* En-tête du scrutin */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`badge ${session.status === 'ouvert'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
            }`}>
              {session.status === 'ouvert' ? '● Scrutin ouvert' : 'Scrutin clos'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-pel-blue">{session.title}</h1>
          {session.bills && (
            <p className="text-sm text-gray-500 mt-1">
              Proposition : {session.bills.number} — {session.bills.title}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Ouvert le {formatDateTime(session.opened_at)}
            {session.closed_at && ` · Clos le ${formatDateTime(session.closed_at)}`}
          </p>
        </div>

        {/* Panel de vote */}
        <VotePanel sessionId={id} userId={user.id} />
      </div>
    </div>
  )
}
