/**
 * Client Supabase simple pour les données publiques (pas besoin de session).
 * Utilisé par les fonctions CMS dans les Server Components avec ISR.
 * N'utilise PAS cookies() — compatible avec revalidate/prerendering.
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
