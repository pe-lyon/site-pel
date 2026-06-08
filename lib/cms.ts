/**
 * Fonctions d'accès aux données CMS depuis les pages du site vitrine.
 * Utilise un client public (anon) — pas de cookies, compatible ISR/prerendering.
 */
import { createPublicClient } from '@/lib/supabase/public'

export async function getSetting(key: string): Promise<string> {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase.from('site_settings').select('value').eq('key', key).single()
    return data?.value ?? ''
  } catch { return '' }
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  keys.forEach(k => { result[k] = '' })
  try {
    const supabase = createPublicClient()
    const { data } = await supabase.from('site_settings').select('key, value').in('key', keys)
    ;(data ?? []).forEach((row: any) => { result[row.key] = row.value ?? '' })
  } catch { /* retourne les valeurs par défaut */ }
  return result
}

export async function getEvenements(limit?: number) {
  try {
    const supabase = createPublicClient()
    let q = supabase.from('evenements').select('*').order('date', { ascending: true })
    if (limit) q = q.limit(limit)
    const { data } = await q
    return data ?? []
  } catch { return [] }
}

export async function getActualites(limit?: number, statut = 'publie') {
  try {
    const supabase = createPublicClient()
    let q = supabase.from('actualites').select('*').eq('statut', statut).order('publie_le', { ascending: false })
    if (limit) q = q.limit(limit)
    const { data } = await q
    return data ?? []
  } catch { return [] }
}

export async function getBureauMembres() {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase.from('bureau_membres').select('*').eq('actif', true).order('ordre')
    return data ?? []
  } catch { return [] }
}

export async function getChiffresCles() {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase.from('chiffres_cles').select('*').order('ordre')
    return data ?? []
  } catch { return [] }
}

export async function getTimeline() {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase.from('presentation_timeline').select('*').order('annee', { ascending: true })
    return data ?? []
  } catch { return [] }
}

export async function getRessources() {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase.from('ressources').select('*').order('created_at', { ascending: false })
    return data ?? []
  } catch { return [] }
}
