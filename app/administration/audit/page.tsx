export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'
import TopBar from '@/components/layout/TopBar'
import { Shield } from 'lucide-react'

const ACTION_LABELS: Record<string, string> = {
  creation_compte: '👤 Création de compte',
  suppression_compte: '🗑️ Suppression de compte',
  ouverture_scrutin: '🗳️ Ouverture de scrutin',
  fermeture_scrutin: '🔒 Clôture de scrutin',
  vote: '✅ Vote enregistré',
  creation_proposition: '📝 Création de proposition',
  modification_proposition: '✏️ Modification de proposition',
  suppression_proposition: '🗑️ Suppression de proposition',
  creation_procuration: '🤝 Création de procuration',
  suppression_procuration: '❌ Suppression de procuration',
}

export default async function AuditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'president_seance') redirect('/dashboard')

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*, profiles(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div>
      <TopBar title="Journal d'audit" />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-pel-blue" />
          <p className="text-gray-500 text-sm">{logs?.length ?? 0} entrées — 200 dernières actions</p>
        </div>

        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Action</th>
                <th className="table-header hidden md:table-cell">Acteur</th>
                <th className="table-header hidden lg:table-cell">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs?.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 text-sm">
                  <td className="table-cell text-xs text-gray-400 whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="table-cell font-medium text-gray-800">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </td>
                  <td className="table-cell hidden md:table-cell text-gray-500">
                    {log.profiles ? `${(log.profiles as any).first_name} ${(log.profiles as any).last_name}` : '—'}
                  </td>
                  <td className="table-cell hidden lg:table-cell text-xs text-gray-400">
                    {log.details ? JSON.stringify(log.details).slice(0, 60) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!logs || logs.length === 0) && (
            <p className="text-center text-gray-400 py-12">Aucune entrée dans le journal</p>
          )}
        </div>
      </div>
    </div>
  )
}
