import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  // Vérifier que l'utilisateur est authentifié ET a le rôle président de séance
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'president_seance') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { table, select, order, filters } = await request.json()

  const ALLOWED_TABLES = ['profiles', 'political_groups', 'bills', 'vote_sessions', 'proxies', 'audit_logs', 'votes', 'seances', 'seance_agenda', 'site_settings', 'bureau_membres', 'anciens_presidents', 'actualites', 'actualites_categories', 'evenements', 'ressources', 'presentation_timeline', 'chiffres_cles', 'ordre_du_jour', 'amendements', 'messages_groupe']
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Table non autorisée' }, { status: 400 })
  }

  try {
    let q = adminClient.from(table).select(select ?? '*')
    for (const [col, val] of Object.entries(filters ?? {})) {
      q = (q as any).eq(col, val)
    }
    if (order) q = (q as any).order(order.col, { ascending: order.asc ?? true })
    const { data, error } = await q
    if (error) throw error
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
