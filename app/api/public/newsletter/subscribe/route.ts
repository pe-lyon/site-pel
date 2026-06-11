export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, prenom } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    // Check if already subscribed
    const { data: existing } = await adminClient
      .from('newsletter_subscribers')
      .select('id, active')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existing) {
      if (existing.active) {
        return NextResponse.json({ message: 'already_subscribed' })
      } else {
        // Re-activate
        await adminClient
          .from('newsletter_subscribers')
          .update({ active: true, prenom: prenom || null })
          .eq('id', existing.id)
        return NextResponse.json({ message: 'resubscribed' })
      }
    }

    // New subscriber
    const { error } = await adminClient
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase().trim(),
        prenom: prenom || null,
        active: true,
      })

    if (error) {
      // Table might not exist — store in site_settings as fallback
      const { data: settings } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'newsletter_subscribers_json')
        .single()

      const subscribers = settings?.value ? JSON.parse(settings.value) : []
      const already = subscribers.find((s: any) => s.email === email.toLowerCase().trim())
      if (!already) {
        subscribers.push({ email: email.toLowerCase().trim(), prenom: prenom || null, date: new Date().toISOString() })
        await adminClient.from('site_settings').upsert({
          key: 'newsletter_subscribers_json',
          value: JSON.stringify(subscribers),
        })
      }
    }

    // Send welcome email via Resend if configured
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'PEL Actualités <newsletter@assemblee-pel.fr>',
          to: [email.toLowerCase().trim()],
          subject: 'Bienvenue dans la newsletter du PEL !',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #f8faff;">
              <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(4,67,154,0.08);">
                <h1 style="color: #04439a; font-size: 24px; margin-bottom: 8px;">Bienvenue${prenom ? `, ${prenom}` : ''} ! 🎉</h1>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  Tu es maintenant abonné·e à la newsletter du <strong>Parlement des Étudiants de Lyon</strong>.
                </p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  Tu recevras les dernières actualités, les comptes-rendus de séances et les annonces importantes directement dans ta boîte mail.
                </p>
                <div style="margin: 32px 0; text-align: center;">
                  <a href="https://pel.assemblee-pel.fr/actualites" style="background: #04439a; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Voir les actualités →
                  </a>
                </div>
                <p style="color: #9ca3af; font-size: 13px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #f3f4f6;">
                  Pour te désabonner, <a href="https://pel.assemblee-pel.fr/newsletter/unsubscribe?email=${encodeURIComponent(email)}" style="color: #6b7280;">clique ici</a>.
                </p>
              </div>
            </div>
          `,
        }),
      }).catch(() => {}) // don't fail if email sending fails
    }

    return NextResponse.json({ message: 'subscribed' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
