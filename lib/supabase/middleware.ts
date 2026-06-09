import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Routes entièrement publiques (site vitrine + séance publique)
  const publicPrefixes = [
    '/', '/presentation', '/bureau', '/groupes',
    '/actualites', '/agenda', '/ressources', '/contact',
    '/journal-officiel', '/loi', '/parlementaires', '/resultats',
    '/seance', '/login', '/admin/login', '/auth/callback', '/mot-de-passe-oublie',
    '/api/auth', '/api/public',
  ]
  const isPublic = publicPrefixes.some(prefix =>
    pathname === prefix || (prefix !== '/' && pathname.startsWith(prefix + '/'))
  )

  if (isPublic) {
    // Si connecté et sur /login → rediriger vers la destination voulue ou dashboard
    if (user && pathname === '/login') {
      const next = request.nextUrl.searchParams.get('next') ?? '/dashboard'
      return NextResponse.redirect(new URL(next, request.url))
    }
    return supabaseResponse
  }

  // Routes protégées (dashboard, administration, profil, scrutin, etc.)
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}
