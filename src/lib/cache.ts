/**
 * Caching utility with Vercel KV (Upstash Redis) and in-memory fallback.
 *
 * Uses KV when KV_REST_API_URL is configured, otherwise falls back to a
 * simple in-memory Map with TTL — identical behavior, just not persistent.
 */

// ---------------------------------------------------------------------------
// In-memory fallback cache
// ---------------------------------------------------------------------------
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

// Prevent unbounded memory growth
const MAX_MEMORY_ENTRIES = 500;

function memoryGet<T>(key: string): T | null {
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function memorySet<T>(key: string, data: T, ttlSeconds: number): void {
  // Evict oldest entries if we are at capacity
  if (memoryCache.size >= MAX_MEMORY_ENTRIES) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }
  memoryCache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}

// ---------------------------------------------------------------------------
// KV helpers (lazy import so the app works without @vercel/kv configured)
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let kvModule: any = null;
let kvChecked = false;

async function getKv() {
  if (kvChecked) return kvModule;
  kvChecked = true;
  if (!process.env.KV_REST_API_URL) return null;
  try {
    kvModule = await import("@vercel/kv");
    return kvModule;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch data with caching. Tries KV first, falls back to in-memory.
 *
 * @param key     Cache key (e.g. "vk:transit:59.91-10.75")
 * @param ttl     Time-to-live in seconds
 * @param fetcher Async function that produces the data on cache miss
 */
export async function cachedFetch<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  // 1. Try cache
  const kv = await getKv();

  if (kv) {
    try {
      const cached = await kv.kv.get(key) as T | null;
      if (cached !== null && cached !== undefined) return cached;
    } catch {
      // KV read failed — fall through to fetcher
    }
  } else {
    const cached = memoryGet<T>(key);
    if (cached !== null) return cached;
  }

  // 2. Fetch fresh data
  const data = await fetcher();

  // 3. Store in cache (fire-and-forget for KV)
  if (kv) {
    kv.kv.set(key, data, { ex: ttl }).catch(() => {});
  } else {
    memorySet(key, data, ttl);
  }

  return data;
}

/** Cache TTL presets in seconds. */
export const TTL = {
  ONE_HOUR: 3600,
  FOUR_HOURS: 14400,
  TWELVE_HOURS: 43200,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
} as const;
