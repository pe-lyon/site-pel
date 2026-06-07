export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'president_seance') {
    redirect('/dashboard')
  }

  return (
    <DashboardShell
      role={profile.role}
      firstName={profile.first_name}
      lastName={profile.last_name}
    >
      {children}
    </DashboardShell>
  )
}
