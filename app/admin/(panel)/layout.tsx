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
    <div className="min-h-screen flex relative" style={{ background: '#eef2ff' }}>
      {/* fond orbs fixe */}
      <div style={{ position:'fixed', inset:0, zIndex:0, overflow:'hidden', pointerEvents:'none',
        background: 'radial-gradient(ellipse 80% 60% at 10% 5%, rgba(4,67,154,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 95%, rgba(178,29,11,0.07) 0%, transparent 60%), #eef2ff'
      }} aria-hidden="true">
        <div className="animate-orb" style={{ position:'absolute', width:600, height:600, top:'-10%', left:'5%', borderRadius:'60% 40% 30% 70% / 60% 30% 70% 40%', filter:'blur(70px)', background:'radial-gradient(circle, rgba(4,67,154,0.15) 0%, transparent 70%)' }} />
        <div className="animate-orb-reverse" style={{ position:'absolute', width:500, height:500, bottom:'5%', right:'-5%', borderRadius:'40% 60% 70% 30% / 40% 70% 30% 60%', filter:'blur(60px)', background:'radial-gradient(circle, rgba(178,29,11,0.10) 0%, transparent 70%)' }} />
      </div>
      <div className="relative z-20">
        <AdminSidebar firstName={profile.first_name ?? ''} lastName={profile.last_name ?? ''} />
      </div>
      <main className="flex-1 min-w-0 p-6 lg:p-10 relative z-10">
        {children}
      </main>
    </div>
  )
}
