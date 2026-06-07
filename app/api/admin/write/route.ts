import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyPresident() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'president_seance') return null
  return user
}

export async function POST(request: Request) {
  const user = await verifyPresident()
  if (!user) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { table, operation, data, filters } = await request.json()

  const ALLOWED_TABLES = ['profiles', 'political_groups', 'bills', 'vote_sessions', 'proxies', 'audit_logs', 'seances', 'seance_agenda', 'site_settings', 'bureau_membres', 'anciens_presidents', 'actualites', 'actualites_categories', 'evenements', 'ressources', 'presentation_timeline', 'chiffres_cles', 'ordre_du_jour', 'amendements', 'messages_groupe']
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Table non autorisée' }, { status: 400 })
  }

  try {
    let result: any
    let q = adminClient.from(table)

    if (operation === 'insert') {
      result = await q.insert(data).select()
    } else if (operation === 'update') {
      let uq = q.update(data)
      for (const [col, val] of Object.entries(filters ?? {})) {
        uq = uq.eq(col, val as string)
      }
      result = await uq.select()
    } else if (operation === 'delete') {
      let dq = (q as any).delete()
      for (const [col, val] of Object.entries(filters ?? {})) {
        dq = dq.eq(col, val as string)
      }
      result = await dq
    } else if (operation === 'upsert') {
      result = await q.upsert(data).select()
    } else {
      return NextResponse.json({ error: 'Opération invalide' }, { status: 400 })
    }

    if (result.error) throw result.error
    return NextResponse.json({ data: result.data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
