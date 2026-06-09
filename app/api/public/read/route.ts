import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Client avec service role — contourne RLS pour les données publiques
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Tables autorisées en lecture publique (strictement non-sensibles)
const PUBLIC_TABLES = [
  'political_groups',   // groupes politiques — info publique
  'bills',              // propositions de loi — publiques après adoption
  'vote_sessions',      // sessions de vote — résultats publics
  'votes',              // votes — publics pour scrutins publics
  'seances',            // séances — publiques
  'bureau_membres',     // membres du bureau — info publique
  'actualites',         // articles — publiés
  'actualites_categories',
  'evenements',         // événements — agenda public
  'ressources',         // documents — publics
  'presentation_timeline',
  'chiffres_cles',
  // NOTE: 'profiles' retiré — données personnelles (email, rôle, etc.)
  // Utiliser un select explicite de colonnes publiques si nécessaire
]

export async function POST(request: Request) {
  try {
    const { table, select, order, filters, limit } = await request.json()

    if (!PUBLIC_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Table non autorisée' }, { status: 400 })
    }

    let query = adminClient.from(table).select(select ?? '*')

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else {
          query = (query as any).eq(key, value)
        }
      }
    }

    if (order) {
      query = query.order(order.col, { ascending: order.asc ?? true })
    }

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('[public/read]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[public/read] exception', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
