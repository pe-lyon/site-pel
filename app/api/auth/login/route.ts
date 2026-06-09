import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'

// La clé anon est requise pour signInWithPassword (la service role ne fonctionne pas pour l'auth)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DOMAIN = '@assemblee-pel.fr'
const toEmail = (id: string) =>
  id.includes('@') ? id : `${id.trim().toLowerCase()}${DOMAIN}`

/** Vérifie le token Cloudflare Turnstile côté serveur */
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  // Si la clé n'est pas configurée, on passe (dev / clé non encore activée)
  if (!secret || secret === 'CONFIGURE_ME') return true
  // Token vide → toujours refusé en prod
  if (!token) return false

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    })
    const json = await res.json()
    return json.success === true
  } catch {
    // En cas d'erreur réseau on laisse passer (fail-open)
    return true
  }
}

export async function POST(request: Request) {
  // Récupération de l'IP (Vercel forwarde dans x-forwarded-for)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  // ── Rate limiting : 5 tentatives / 15 min par IP ──
  const rl = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000)
  if (!rl.allowed) {
    const minutes = Math.ceil(rl.resetIn / 60_000)
    return NextResponse.json(
      { error: `Trop de tentatives. Réessayez dans ${minutes} minute(s).` },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rl.resetIn / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { identifiant, password, turnstileToken, honeypot } = body

  // ── Honeypot : si rempli → c'est un bot ──
  if (honeypot) {
    // On simule une réponse normale pour ne pas alerter le bot
    await new Promise(r => setTimeout(r, 500))
    return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
  }

  // ── Vérification Turnstile ──
  const turnstileOk = await verifyTurnstile(turnstileToken ?? '', ip)
  if (!turnstileOk) {
    return NextResponse.json(
      { error: 'Vérification de sécurité échouée. Veuillez réessayer.' },
      { status: 403 }
    )
  }

  if (!identifiant || !password) {
    return NextResponse.json({ error: 'Identifiant et mot de passe requis' }, { status: 400 })
  }

  // ── Authentification Supabase ──
  const email = toEmail(identifiant)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
  }

  return NextResponse.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: data.user,
  })
}
