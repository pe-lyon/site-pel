import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  // Vérifier que l'appelant est président de séance
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

  // Créer l'utilisateur avec la clé service role
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await request.json()
  const { email, password, first_name, last_name, birth_date, role, group_id } = body

  if (!email || !password || !first_name || !last_name) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }

  const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name, last_name, role: role ?? 'parlementaire' },
  })

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 })
  }

  // Mettre à jour le profil avec les infos complètes
  if (newUser?.user) {
    await adminSupabase.from('profiles').update({
      role: role ?? 'parlementaire',
      group_id: group_id || null,
      birth_date: birth_date || null,
    }).eq('id', newUser.user.id)
  }

  // Log de l'action
  await serverSupabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'creation_compte',
    target_type: 'profile',
    target_id: newUser?.user?.id,
    details: { email, first_name, last_name, role },
  })

  return NextResponse.json({ success: true, userId: newUser?.user?.id })
}
