import { NextRequest, NextResponse } from "next/server";
import { haversineKm } from "@/lib/geo";
import { nearestCity } from "@/lib/cities";
import { cachedFetch, TTL } from "@/lib/cache";
import { EnturResponseSchema, parseUpstream } from "@/lib/schemas";

interface Leg {
  mode: string;
  from: string;
  to: string;
  duration?: number;
  line?: string;
}

interface TransitResult {
  durationMinutes: number | null;
  destination: string;
  legs: Leg[];
}

async function fetchTransit(fromLat: number, fromLon: number): Promise<TransitResult> {
  const city = nearestCity(fromLat, fromLon);
  const empty: TransitResult = { durationMinutes: null, destination: city.name, legs: [] };

  const query = `
{
  trip(
    from: { coordinates: { latitude: ${fromLat}, longitude: ${fromLon} } }
    to: { coordinates: { latitude: ${city.lat}, longitude: ${city.lon} } }
    numTripPatterns: 3
    searchWindow: 1800
  ) {
    tripPatterns {
      duration
      legs {
        mode
        duration
        fromPlace { name }
        toPlace { name }
        line { publicCode }
      }
    }
  }
}`;

  try {
    const res = await fetch(
      "https://api.entur.io/journey-planner/v3/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ET-Client-Name": "verdikart-mvp",
        },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) return empty;

    const raw = await res.json();
    const data = parseUpstream("entur", EnturResponseSchema, raw);
    if (!data) return empty;

    const patterns = data.data?.trip?.tripPatterns;
    if (!patterns || patterns.length === 0) return empty;

    const pattern = patterns.reduce(
      (best, p) => ((p.duration ?? Infinity) < (best.duration ?? Infinity) ? p : best),
      patterns[0],
    );
    const durationSeconds = pattern.duration ?? 0;
    const durationMinutes = Math.round(durationSeconds / 60);

    const directDistKm = haversineKm(fromLat, fromLon, city.lat, city.lon);
    if (directDistKm < 1.5 && durationMinutes > 30) return empty;

    const legs: Leg[] = (pattern.legs ?? []).map((leg) => ({
      mode: leg.mode,
      from: leg.fromPlace?.name ?? "",
      to: leg.toPlace?.name ?? "",
      duration: leg.duration ? Math.round(leg.duration / 60) : undefined,
      line: leg.line?.publicCode ?? undefined,
    }));

    return { durationMinutes, destination: city.name, legs };
  } catch (err) {
    console.error("[transit] Entur fetch failed:", err instanceof Error ? err.message : err);
    return empty;
  }
}

export async function GET(request: NextRequest) {
  const fromLat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const fromLon = parseFloat(request.nextUrl.searchParams.get("lon") ?? "");

  if (isNaN(fromLat) || isNaN(fromLon)) {
    return NextResponse.json({ durationMinutes: null, destination: "", legs: [] } satisfies TransitResult);
  }

  const key = `vk:transit:${fromLat.toFixed(4)}-${fromLon.toFixed(4)}`;
  const result = await cachedFetch(key, TTL.ONE_HOUR, () => fetchTransit(fromLat, fromLon));
  return NextResponse.json(result);
}
