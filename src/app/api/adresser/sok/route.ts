import type { NextRequest } from "next/server";

export const runtime = "edge";

const UPSTREAM = "https://ws.geonorge.no/adresser/v1/sok";
const EMPTY_BODY = JSON.stringify({ adresser: [] });
const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
};

// Proxy for Kartverket/Geonorge address search. Client-side fetch to
// ws.geonorge.no is blocked by our CSP connect-src allowlist, so
// AddressSearch.tsx routes through this endpoint instead.
export async function GET(request: NextRequest) {
  const incoming = request.nextUrl.searchParams;
  const sok = (incoming.get("sok") ?? "").trim();

  if (sok.length < 3) {
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
