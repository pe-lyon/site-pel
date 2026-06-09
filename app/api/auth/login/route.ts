import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

/** Vérifie le token Cloudflare Turnstile côté serveur */
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret || secret === 'CONFIGURE_ME') return true
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
    return true // fail-open si Cloudflare injoignable
  }
}

/**
 * Route de vérification de sécurité UNIQUEMENT.
 * Elle ne fait PAS l'authentification — c'est le client Supabase qui s'en charge
 * ensuite (pour que les cookies SSR soient correctement gérés).
 */
export async function POST(request: Request) {
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
      { status: 429 }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  const { turnstileToken, honeypot } = body

  // ── Honeypot ──
  if (honeypot) {
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

  return NextResponse.json({ ok: true })
}
