import { kv } from "@vercel/kv";

/**
 * IP-based fixed-window rate limiter.
 *
 * Uses Vercel KV (Upstash Redis) via atomic INCR when KV_REST_API_URL is
 * configured — so limits persist across serverless cold starts and across
 * regions. Falls back to an in-memory Map for local dev (which resets on
 * restart but is fine for a single-process `next dev`).
 *
 * Window is fixed at 1 minute. Key shape: `rl:{ip}:{minuteEpoch}`.
 */

const WINDOW_SECONDS = 60;

const hasKv = !!process.env.KV_REST_API_URL;

// Local dev fallback
const memoryCounts = new Map<string, { count: number; resetAt: number }>();

export async function isRateLimited(
  ip: string,
  maxPerMinute: number,
): Promise<boolean> {
  const minute = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  const key = `rl:${ip}:${minute}`;

  if (hasKv) {
    try {
      const count = (await kv.incr(key)) ?? 0;
      if (count === 1) {
        // Set expiry once, on the first increment of this window
        await kv.expire(key, WINDOW_SECONDS + 10);
      }
      return count > maxPerMinute;
    } catch {
      // Fall through to memory if KV is unreachable
    }
  }

  const now = Date.now();
  const entry = memoryCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    memoryCounts.set(ip, { count: 1, resetAt: now + WINDOW_SECONDS * 1000 });
    return false;
  }
  entry.count++;
  return entry.count > maxPerMinute;
}
