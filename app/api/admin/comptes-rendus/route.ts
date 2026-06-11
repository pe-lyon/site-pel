export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getCompteRendus() {
  const { data } = await adminClient
    .from('site_settings')
    .select('value')
    .eq('key', 'comptes_rendus_json')
    .single()
  return data?.value ? JSON.parse(data.value) : []
}

async function saveCompteRendus(list: any[]) {
  await adminClient.from('site_settings').upsert({
    key: 'comptes_rendus_json',
    value: JSON.stringify(list),
  })
  revalidatePath('/seances')
}

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const list = await getCompteRendus()
  return NextResponse.json({ data: list })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await request.json()
  const { seance_id, seance_titre, date, pdf_url, nom } = body
  if (!pdf_url || !seance_titre) {
    return NextResponse.json({ error: 'pdf_url et seance_titre requis' }, { status: 400 })
  }

  const list = await getCompteRendus()
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    seance_id: seance_id ?? null,
    seance_titre,
    date: date ?? new Date().toISOString(),
    pdf_url,
    nom: nom ?? `Compte-rendu — ${seance_titre}`,
    created_at: new Date().toISOString(),
  }
  list.unshift(entry)
  await saveCompteRendus(list)
  return NextResponse.json({ data: entry })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { id } = await request.json()
  const list = (await getCompteRendus()).filter((c: any) => c.id !== id)
  await saveCompteRendus(list)
  return NextResponse.json({ ok: true })
}
