/**
 * Lecture publique de données via la route /api/public/read
 * Utilise la clé service role côté serveur → contourne RLS
 * Accessible sans authentification
 */
export async function publicRead(
  table: string,
  select = '*',
  options?: { order?: { col: string; asc?: boolean }; filters?: Record<string, any>; limit?: number }
): Promise<any[]> {
  try {
    const res = await fetch('/api/public/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, select, ...options }),
    })
    const json = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}
