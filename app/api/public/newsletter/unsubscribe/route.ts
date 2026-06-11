export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

  try {
    await adminClient
      .from('newsletter_subscribers')
      .update({ active: false })
      .eq('email', email.toLowerCase().trim())
  } catch {
    // Fallback: remove from site_settings JSON
    const { data: settings } = await adminClient
      .from('site_settings')
      .select('value')
      .eq('key', 'newsletter_subscribers_json')
      .single()
    if (settings?.value) {
      const subscribers = JSON.parse(settings.value)
        .filter((s: any) => s.email !== email.toLowerCase().trim())
      await adminClient.from('site_settings').upsert({
        key: 'newsletter_subscribers_json',
        value: JSON.stringify(subscribers),
      })
    }
  }

  return NextResponse.json({ message: 'unsubscribed' })
}
