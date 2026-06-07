/**
 * Fonctions d'accès aux données CMS depuis les pages du site vitrine.
 * Utilise le client Supabase anonyme (données publiques uniquement).
 */
import { createClient } from '@/lib/supabase/server'

export async function getSetting(key: string): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase.from('site_settings').select('value').eq('key', key).single()
  return data?.value ?? ''
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const supabase = await createClient()
  const { data } = await supabase.from('site_settings').select('key, value').in('key', keys)
  const result: Record<string, string> = {}
  keys.forEach(k => { result[k] = '' })
  ;(data ?? []).forEach((row: any) => { result[row.key] = row.value ?? '' })
  return result
}

export async function getEvenements(limit?: number) {
  const supabase = await createClient()
  let q = supabase.from('evenements').select('*').order('date', { ascending: true })
  if (limit) q = q.limit(limit)
  const { data } = await q
  return data ?? []
}

export async function getActualites(limit?: number, statut = 'publie') {
  const supabase = await createClient()
  let q = supabase.from('actualites').select('*, actualites_categories(nom, couleur)').eq('statut', statut).order('publie_le', { ascending: false })
  if (limit) q = q.limit(limit)
  const { data } = await q
  return data ?? []
}

export async function getBureauMembres() {
  const supabase = await createClient()
  const { data } = await supabase.from('bureau_membres').select('*').eq('actif', true).order('ordre')
  return data ?? []
}

export async function getChiffresCles() {
  const supabase = await createClient()
  const { data } = await supabase.from('chiffres_cles').select('*').order('ordre')
  return data ?? []
}

export async function getTimeline() {
  const supabase = await createClient()
  const { data } = await supabase.from('presentation_timeline').select('*').order('annee', { ascending: true })
  return data ?? []
}

export async function getRessources() {
  const supabase = await createClient()
  const { data } = await supabase.from('ressources').select('*').order('created_at', { ascending: false })
  return data ?? []
}
