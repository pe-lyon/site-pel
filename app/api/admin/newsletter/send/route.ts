export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return NextResponse.json({ error: 'RESEND_API_KEY non configuré' }, { status: 500 })

  const { articleId } = await request.json()
  if (!articleId) return NextResponse.json({ error: 'articleId requis' }, { status: 400 })

  // Get article
  const { data: article } = await adminClient
    .from('actualites')
    .select('*')
    .eq('id', articleId)
    .single()

  if (!article) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })

  // Get subscribers from site_settings (fallback if table doesn't exist)
  let subscribers: { email: string; prenom?: string }[] = []
  try {
    const { data: rows } = await adminClient
      .from('newsletter_subscribers')
      .select('email, prenom')
      .eq('active', true)
    subscribers = rows ?? []
  } catch {
    const { data: settings } = await adminClient
      .from('site_settings')
      .select('value')
      .eq('key', 'newsletter_subscribers_json')
      .single()
    subscribers = settings?.value ? JSON.parse(settings.value) : []
  }

  if (subscribers.length === 0) {
    return NextResponse.json({ message: 'Aucun abonné', sent: 0 })
  }

  const articleUrl = `https://pel.assemblee-pel.fr/actualites/${article.slug ?? article.id}`
  const coverImg = article.image_url
    ? `<img src="${article.image_url}" alt="" style="width:100%;height:200px;object-fit:cover;border-radius:8px;margin-bottom:24px;" />`
    : ''

  // Send in batches of 50
  let sent = 0
  const batchSize = 50
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize)
    await Promise.all(
      batch.map(async (sub) => {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'PEL Actualités <newsletter@assemblee-pel.fr>',
            to: [sub.email],
            subject: article.titre,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8faff;">
                <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 24px rgba(4,67,154,0.08);">
                  <div style="margin-bottom: 16px;">
                    <span style="background: #04439a; color: white; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase;">
                      ${article.categorie ?? 'Actualités'}
                    </span>
                  </div>
                  ${coverImg}
                  <h1 style="color: #1e3a5f; font-size: 22px; margin: 0 0 16px;">${article.titre}</h1>
                  <p style="color: #374151; font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
                    ${(article.contenu ?? '').replace(/<[^>]+>/g, '').slice(0, 300)}...
                  </p>
                  <a href="${articleUrl}" style="background: #04439a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                    Lire la suite →
                  </a>
                  <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
                    Parlement des Étudiants de Lyon · <a href="https://pel.assemblee-pel.fr/newsletter/unsubscribe?email=${encodeURIComponent(sub.email)}" style="color: #9ca3af;">Se désabonner</a>
                  </p>
                </div>
              </div>
            `,
          }),
        })
        sent++
      })
    )
  }

  // Mark article as newsletter sent
  await adminClient
    .from('actualites')
    .update({ newsletter_sent: true })
    .eq('id', articleId)

  return NextResponse.json({ message: 'Envoi terminé', sent })
}
