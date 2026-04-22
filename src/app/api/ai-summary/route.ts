import { NextRequest } from "next/server";
import { kv } from "@vercel/kv";
import { auth } from "@/lib/auth";
import { isAiQuotaExceeded, secondsUntilMidnightUTC } from "@/lib/ai-quota";
import {
  buildPrompt,
  buildFallbackSummary,
  type ContextData,
} from "@/lib/ai-summary-prompt";
import { parseEiendomSlug } from "@/lib/eiendom-slug";

export const runtime = "edge";
export const maxDuration = 30;

// Per-address cache: first visitor to an address pays the ~1-3s LLM latency,
// every subsequent visitor gets an instant KV GET. 30-day TTL — address facts
// don't move faster than that, and upstream rate-limit data is independently
// cached. Bump the version prefix to invalidate (e.g. if the prompt changes).
const CACHE_VERSION = "v2";
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const hasKv = !!process.env.KV_REST_API_URL;

function cacheKey(slug: string): string {
  // Slug comes straight from params.slug — already URL-safe, but we strip
  // anything unexpected defensively before using it as a KV key.
  const safe = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 200);
  return `ai-summary:${CACHE_VERSION}:${safe}`;
}

async function getCached(slug: string): Promise<string | null> {
  if (!hasKv) return null;
  try {
    return (await kv.get<string>(cacheKey(slug))) ?? null;
  } catch {
    return null;
  }
}

async function putCached(slug: string, value: string): Promise<void> {
  if (!hasKv) return;
  try {
    await kv.set(cacheKey(slug), value, { ex: CACHE_TTL_SECONDS });
  } catch {
    /* swallow — cache writes are best-effort */
  }
}

// Resolve a display address from trusted slug coordinates via Kartverket's
// punktsok. Falls back to a lossy slug-decode — mirrors the behaviour of
// src/app/eiendom/[slug]/page.tsx so the LLM summary references the same
// address string the page header shows.
async function resolveAddressFromSlug(
  slug: string,
  lat: number,
  lon: number,
): Promise<string> {
  try {
    const url = `https://ws.geonorge.no/adresser/v1/punktsok?lat=${lat}&lon=${lon}&radius=50&utkoordsys=4258&treffPerSide=1`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (res.ok) {
      const data = await res.json();
      const hit = data?.adresser?.[0];
      if (hit) {
        const parts = [hit.adressetekst, hit.poststed].filter(Boolean);
        if (parts.length) return parts.join(", ");
      }
    }
  } catch {
    /* fall through to slug decode */
  }
  return decodeURIComponent(slug)
    .replace(/--\d+-\d+-\d{4}$/, "")
    .replace(/-+/g, " ")
    .trim();
}

function getOrigin(req: NextRequest): string {
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function fetchContext(
  origin: string,
  kommunenummer: string,
  lat: number,
  lon: number,
): Promise<ContextData> {
  const ctx: ContextData = {};
  try {
    const [priceRes, transitRes] = await Promise.allSettled([
      fetch(
        `${origin}/api/price-trend?kommunenummer=${encodeURIComponent(kommunenummer)}`,
      ),
      fetch(`${origin}/api/transit?lat=${lat}&lon=${lon}`),
    ]);
    if (priceRes.status === "fulfilled" && priceRes.value.ok) {
      const p = await priceRes.value.json();
      if (Array.isArray(p.values) && p.values.length) {
        ctx.sqmPrice = Math.round(p.values[p.values.length - 1]);
      }
      if (p.yoyChange != null) ctx.yoyChange = p.yoyChange;
      if (p.sourceLabel) ctx.priceLabel = p.sourceLabel;
    }
    if (transitRes.status === "fulfilled" && transitRes.value.ok) {
      const t = await transitRes.value.json();
      ctx.transitMinutes = t.durationMinutes ?? null;
      ctx.transitDestination = t.destination ?? "";
    }
  } catch {
    /* context is best-effort — prompt handles empty ctx cleanly */
  }
  return ctx;
}

async function callLlm(prompt: string): Promise<string | null> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 160,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = (data.choices?.[0]?.message?.content ?? "").trim();
        if (text) return text;
      }
    } catch {
      /* fall through */
    }
  }

  if (openRouterKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://verdikart.no",
          "X-Title": "Verdikart",
        },
        body: JSON.stringify({
          model: "anthropic/claude-haiku-4-5",
          stream: false,
          max_tokens: 160,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = (data.choices?.[0]?.message?.content ?? "").trim();
        if (text) return text;
      }
    } catch {
      /* fall through */
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { slug } = body as { slug?: string };

  // Only the slug is trusted. lat/lon/kommunenummer/address are all derived
  // server-side from the slug suffix so a crafted body cannot poison the
  // per-slug KV cache entry with attacker-controlled prose — the cache key
  // is the slug, so the inputs to the prompt must be too.
  const parsed = slug ? parseEiendomSlug(slug) : null;
  if (!slug || !parsed) {
    return new Response(JSON.stringify({ error: "Bad request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. Cache hit → return immediately without touching rate limiter. A cached
  //    read is free compute for us and instant for the user.
  const cached = await getCached(slug);
  if (cached) {
    return new Response(JSON.stringify({ summary: cached, cached: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  // 2. Generation path — subject to per-user/IP daily quota so a hostile
  //    caller can't churn through unique addresses to burn budget.
  const session = await auth();
  const userId = session?.user?.id;
  const identifier = userId
    ? { type: "user" as const, id: userId }
    : {
        type: "ip" as const,
        ip:
          req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ??
          req.headers.get("x-real-ip") ??
          "unknown",
      };

  if (await isAiQuotaExceeded(identifier)) {
    return new Response(
      JSON.stringify({
        error: "Daglig grense for AI-oppsummering er nådd. Prøv igjen i morgen.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(secondsUntilMidnightUTC()),
        },
      },
    );
  }

  // 3. Fetch context (price trend + transit) server-side using the request
  //    origin — avoids a separate client-side waterfall from AISummary.
  const { lat, lon, kommunenummer } = parsed;
  const address = await resolveAddressFromSlug(slug, lat, lon);
  const origin = getOrigin(req);
  const ctx = await fetchContext(origin, kommunenummer, lat, lon);
  const prompt = buildPrompt(address, ctx);

  const generated = await callLlm(prompt);

  // Cache only genuine LLM output. A fallback summary means the upstream was
  // unreachable or unconfigured — we want the next request to retry, not to
  // pin 30 days of deterministic prose into the cache. Awaited because this
  // route runs on the edge: a fire-and-forget promise can be terminated with
  // the isolate before the Upstash HTTP write completes. putCached swallows
  // errors internally, so awaiting it cannot fail the response.
  if (generated) await putCached(slug, generated);

  const summary = generated ?? buildFallbackSummary(address, ctx);

  return new Response(JSON.stringify({ summary, cached: false }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
