import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: actualites } = await supabase
    .from('actualites')
    .select('id, titre, slug, extrait, publie_le, auteur, categorie, contenu')
    .eq('publie', true)
    .order('publie_le', { ascending: false })
    .limit(50)

  const items = (actualites ?? []).map((a: any) => {
    const description = a.extrait ?? (a.contenu?.texte ? String(a.contenu.texte).slice(0, 300) : '')
    const pubDate = a.publie_le ? new Date(a.publie_le).toUTCString() : ''
    const link = `https://assemblee-pel.fr/actualites/${a.slug}`
    return `
    <item>
      <title><![CDATA[${a.titre ?? ''}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${description}]]></description>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
      ${a.auteur ? `<author><![CDATA[${a.auteur}]]></author>` : ''}
      ${a.categorie ? `<category><![CDATA[${a.categorie}]]></category>` : ''}
    </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Actualités — Parlement des Étudiants de Lyon</title>
    <link>https://assemblee-pel.fr</link>
    <description>Les dernières actualités du Parlement des Étudiants de Lyon</description>
    <language>fr</language>
    <atom:link href="https://assemblee-pel.fr/api/public/rss" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900, stale-while-revalidate=1800',
    },
  })
}
