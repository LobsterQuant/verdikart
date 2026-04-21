import { kv } from "@vercel/kv";

/**
 * Daily AI-summary quota.
 *
 * Uses Vercel KV (Upstash Redis) via atomic INCR when KV_REST_API_URL is
 * configured, with a TTL set to seconds-until-next-UTC-midnight. Falls back
 * to an in-memory Map for local dev (single-process `next dev`).
 *
 * Keys are date-partitioned: `ai-summary:{type}:{id}:{YYYY-MM-DD}`.
 */

const DAILY_CAP_AUTHENTICATED = 50;
const DAILY_CAP_ANONYMOUS = 20;

const hasKv = !!process.env.KV_REST_API_URL;

const memoryCounts = new Map<string, { count: number; resetAt: number }>();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function secondsUntilMidnightUTC(): number {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return Math.ceil((tomorrow.getTime() - now.getTime()) / 1000);
}

export type AiQuotaIdentifier =
  | { type: "user"; id: string }
  | { type: "ip"; ip: string };

/**
 * Returns true if the caller has already exceeded today's cap (request should be denied).
 * Authenticated users: 50/day (keyed by userId). Anonymous: 20/day (keyed by IP).
 */
export async function isAiQuotaExceeded(identifier: AiQuotaIdentifier): Promise<boolean> {
  const cap = identifier.type === "user" ? DAILY_CAP_AUTHENTICATED : DAILY_CAP_ANONYMOUS;
  const id = identifier.type === "user" ? identifier.id : identifier.ip;
  const key = `ai-summary:${identifier.type}:${id}:${todayKey()}`;

  if (hasKv) {
    try {
      const count = (await kv.incr(key)) ?? 0;
      if (count === 1) {
        await kv.expire(key, secondsUntilMidnightUTC() + 60);
      }
      return count > cap;
    } catch {
      // Fall through to memory
    }
  }

  const now = Date.now();
  const entry = memoryCounts.get(key);
  if (!entry || now > entry.resetAt) {
    memoryCounts.set(key, { count: 1, resetAt: now + secondsUntilMidnightUTC() * 1000 });
    return false;
  }
  entry.count++;
  return entry.count > cap;
}
