import type { NextRequest } from "next/server";

export const runtime = "edge";

const UPSTREAM = "https://ws.geonorge.no/adresser/v1/punktsok";
const EMPTY_BODY = JSON.stringify({ adresser: [] });
const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
};

// Proxy for Kartverket/Geonorge reverse geocode (punktsok). Same CSP
// rationale as /api/adresser/sok — browser fetch to ws.geonorge.no is
// blocked, so NearbyProperties.tsx routes through here.
export async function GET(request: NextRequest) {
  const incoming = request.nextUrl.searchParams;
  const lat = Number(incoming.get("lat"));
  const lon = Number(incoming.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return new Response(EMPTY_BODY, {
      status: 200,
      headers: { ...JSON_HEADERS, ...CACHE_HEADERS },
    });
  }

  const upstream = new URL(UPSTREAM);
  incoming.forEach((v, k) => upstream.searchParams.set(k, v));

  try {
    const res = await fetch(upstream.toString(), {
      signal: AbortSignal.timeout(5000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return new Response(EMPTY_BODY, { status: 502, headers: JSON_HEADERS });
    }
    const body = await res.text();
    return new Response(body, {
      status: 200,
      headers: { ...JSON_HEADERS, ...CACHE_HEADERS },
    });
  } catch {
    return new Response(EMPTY_BODY, { status: 502, headers: JSON_HEADERS });
  }
}
