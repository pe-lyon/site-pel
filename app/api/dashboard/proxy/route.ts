import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as any))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json()
  const { action } = body

  if (action === 'create') {
    const { holder_id } = body
    if (!holder_id) {
      return NextResponse.json({ error: 'holder_id manquant' }, { status: 400 })
    }
    if (holder_id === user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous déléguer à vous-même' }, { status: 400 })
    }

    // Vérifier qu'il n'y a pas déjà une procuration active
    const { data: existing } = await adminClient
      .from('proxies')
      .select('id')
      .eq('absent_id', user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Vous avez déjà une procuration active. Révoquez-la d\'abord.' }, { status: 409 })
    }

    const { error } = await adminClient
      .from('proxies')
      .insert({ absent_id: user.id, holder_id })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'delete') {
    const { proxy_id } = body
    if (!proxy_id) {
      return NextResponse.json({ error: 'proxy_id manquant' }, { status: 400 })
    }

    // Vérifier que cette procuration appartient à l'utilisateur
    const { data: proxy } = await adminClient
      .from('proxies')
      .select('id, absent_id')
      .eq('id', proxy_id)
      .maybeSingle()

    if (!proxy || proxy.absent_id !== user.id) {
      return NextResponse.json({ error: 'Procuration introuvable ou non autorisé' }, { status: 403 })
    }

    const { error } = await adminClient.from('proxies').delete().eq('id', proxy_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}
