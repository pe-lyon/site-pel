import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from './AdminSidebar'

export const dynamic = 'force-dynamic'

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role, first_name, last_name').eq('id', user.id).single()
  if (profile?.role !== 'president_seance') redirect('/admin/login')

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--pel-creme)' }}>
      <AdminSidebar firstName={profile.first_name ?? ''} lastName={profile.last_name ?? ''} />
      <main className="flex-1 min-w-0 p-6 lg:p-10">
        {children}
      </main>
    </div>
  )
}
