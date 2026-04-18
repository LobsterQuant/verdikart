import { NextRequest, NextResponse } from "next/server";
import { GeonorgeResponseSchema, parseUpstream } from "@/lib/schemas";

interface AddressResult {
  adressetekst: string;
  lat: number;
  lon: number;
  kommunenummer: string;
  postnummer: string;
  poststed: string;
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (!q || q.length < 3) return NextResponse.json([]);

  const results = await searchGeonorge(q, false);
  // Fallback to fuzzy if exact returns nothing
  const final = results.length > 0 ? results : await searchGeonorge(q, true);
  return NextResponse.json(final);
}

async function searchGeonorge(q: string, fuzzy: boolean): Promise<AddressResult[]> {
  try {
    const url = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(q)}&fuzzy=${fuzzy}&treffPerSide=8&utkoordsys=4258`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];

    const raw = await res.json();
    const data = parseUpstream("geonorge-sok", GeonorgeResponseSchema, raw);
    if (!data) return [];
    const adresser = data.adresser ?? [];

    // Score results: boost those whose poststed appears in the query
    const qLower = q.toLowerCase();
    const scored = adresser.map((a) => {
      const poststed = (a.poststed ?? "").toLowerCase();
      // Boost: poststed/city in query string = more relevant result
      const boost = qLower.includes(poststed) && poststed.length > 2 ? 1 : 0;
      return { a, boost };
    });

    // Sort: boosted first, then by original order
    scored.sort((x, y) => y.boost - x.boost);

    return scored.slice(0, 5).map(({ a }) => ({
      adressetekst: a.adressetekst,
      lat: a.representasjonspunkt?.lat ?? 0,
      lon: a.representasjonspunkt?.lon ?? 0,
      kommunenummer: a.kommunenummer ?? "",
      postnummer: a.postnummer ?? "",
      poststed: a.poststed ?? "",
    })).filter((r) => r.lat !== 0 && r.lon !== 0);
  } catch (err) {
    console.error("[address/search] Geonorge fetch failed:", err instanceof Error ? err.message : err);
    return [];
  }
}
