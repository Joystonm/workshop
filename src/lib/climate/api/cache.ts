// In-memory TTL cache for the climate lab API calls. Each entry has a
// key, a value, and an expiry timestamp. Keeps the lab responsive
// when re-opening an experiment.
//
// Also performs single-flight deduplication: if two callers request the
// same key while the first is still in flight, they share the same
// Promise. Prevents React StrictMode's double-mount from firing two
// upstream requests.

const memCache = new Map<string, { data: unknown; expiresAt: number }>()
const inflight = new Map<string, Promise<unknown>>()

function now() {
  return Date.now()
}

export function cacheGet<T>(key: string): T | null {
  const entry = memCache.get(key)
  if (!entry) return null
  if (entry.expiresAt < now()) {
    memCache.delete(key)
    return null
  }
  return entry.data as T
}

export function cacheSet(key: string, data: unknown, ttlMs: number) {
  memCache.set(key, { data, expiresAt: now() + ttlMs })
  inflight.delete(key)
}

export async function cachedFetch<T>(
  key: string,
  ttlMs: number,
  fetchFn: () => Promise<T>,
): Promise<T> {
  const hit = cacheGet<T>(key)
  if (hit) return hit
  const existing = inflight.get(key) as Promise<T> | undefined
  if (existing) return existing
  const p = fetchFn()
    .then((data) => {
      cacheSet(key, data, ttlMs)
      return data
    })
    .catch((err) => {
      inflight.delete(key)
      throw err
    })
  inflight.set(key, p)
  return p
}

export function cacheClear() {
  memCache.clear()
  inflight.clear()
}