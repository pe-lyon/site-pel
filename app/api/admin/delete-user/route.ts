import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function DELETE(request: Request) {
  const serverSupabase = await createServerClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: profile } = await serverSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'president_seance') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { userId } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId manquant' }, { status: 400 })

  // Empêcher la suppression de son propre compte
  if (userId === user.id) {
    return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte' }, { status: 400 })
  }

  const { error } = await adminSupabase.auth.admin.deleteUser(userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await serverSupabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'suppression_compte',
    target_type: 'profile',
    target_id: userId,
  })

  return NextResponse.json({ success: true })
}
