export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Search } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { STATUS_LABELS, STATUS_COLORS, BillStatus } from '@/types'
import TopBar from '@/components/layout/TopBar'

export default async function PropositionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bills } = await supabase
    .from('bills')
    .select('*, profiles(first_name, last_name)')
    .order('created_at', { ascending: false })

  const statusGroups = [
    'soumise_au_vote',
    'en_discussion',
    'deposee',
    'adoptee',
    'rejetee',
    'archivee',
  ] as BillStatus[]

  return (
    <div>
      <TopBar title="Propositions de loi" />
      <div className="p-6 space-y-6">
        {/* Stats rapides */}
        <div className="flex flex-wrap gap-3">
          {statusGroups.map(status => {
            const count = bills?.filter(b => b.status === status).length ?? 0
            if (count === 0) return null
            return (
              <span key={status} className={`badge ${STATUS_COLORS[status]} px-3 py-1.5 text-sm`}>
                {STATUS_LABELS[status]} ({count})
              </span>
            )
          })}
        </div>

        {/* Liste des propositions */}
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="section-title">Toutes les propositions</h2>
          </div>

          {bills && bills.length > 0 ? (
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
              <p className="text-sm mt-1">Le président de séance peut en créer depuis l&apos;administration.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
