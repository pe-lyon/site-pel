/**
 * Rate limiter en mémoire.
 * Suffit pour un site à faible trafic (chaque instance Vercel gère ses propres compteurs).
 * Pour un trafic élevé, remplacer par Upstash Redis (@upstash/ratelimit).
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Nettoyage périodique des entrées expirées
setInterval(() => {
  const now = Date.now()
  store.forEach((entry, key) => {
    if (entry.resetAt < now) store.delete(key)
  })
}, 60_000)

/**
 * Vérifie si une clé (IP + action) dépasse la limite.
 * @param key      Identifiant unique (ex: `login:${ip}`)
 * @param max      Nombre max de tentatives dans la fenêtre
 * @param windowMs Durée de la fenêtre en ms (défaut : 15 min)
 * @returns `{ allowed: boolean, remaining: number, resetIn: number }`
 */
export function rateLimit(key: string, max: number, windowMs = 15 * 60 * 1000) {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1, resetIn: windowMs }
  }

  entry.count++
  const remaining = Math.max(0, max - entry.count)
  const resetIn = entry.resetAt - now

  return { allowed: entry.count <= max, remaining, resetIn }
}
