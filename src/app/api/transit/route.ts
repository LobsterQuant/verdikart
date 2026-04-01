import { NextRequest, NextResponse } from "next/server";

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

interface CityCenter {
  name: string;
  lat: number;
  lon: number;
}

// Major Norwegian city centers — lat/lon of main station or city center
const CITY_CENTERS: CityCenter[] = [
  { name: "Oslo sentrum",        lat: 59.9109, lon: 10.7502 },
  { name: "Bergen sentrum",      lat: 60.3893, lon:  5.3320 },
  { name: "Trondheim sentrum",   lat: 63.4362, lon: 10.3984 },
  { name: "Stavanger sentrum",   lat: 58.9694, lon:  5.7332 },
  { name: "Kristiansand sentrum",lat: 58.1467, lon:  7.9956 },
  { name: "Drammen sentrum",     lat: 59.7440, lon: 10.2045 },
  { name: "Tromsø sentrum",      lat: 69.6489, lon: 18.9551 },
  { name: "Fredrikstad sentrum", lat: 59.2113, lon: 10.9374 },
  { name: "Sandnes sentrum",     lat: 58.8516, lon:  5.7355 },
  { name: "Bodø sentrum",        lat: 67.2804, lon: 14.3750 },
  { name: "Ålesund sentrum",     lat: 62.4722, lon:  6.1549 },
  { name: "Haugesund sentrum",   lat: 59.4133, lon:  5.2680 },
  { name: "Skien sentrum",       lat: 59.2090, lon:  9.6059 },
  { name: "Tønsberg sentrum",    lat: 59.2675, lon: 10.4080 },
  { name: "Moss sentrum",        lat: 59.4344, lon: 10.6576 },
  { name: "Sarpsborg sentrum",   lat: 59.2840, lon: 11.1104 },
  { name: "Lillehammer sentrum", lat: 61.1153, lon: 10.4662 },
  { name: "Hamar sentrum",       lat: 60.7945, lon: 11.0675 },
  { name: "Gjøvik sentrum",      lat: 60.7965, lon: 10.6916 },
  { name: "Kongsberg sentrum",   lat: 59.6633, lon:  9.6476 },
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestCity(lat: number, lon: number): CityCenter {
  let best = CITY_CENTERS[0];
  let bestDist = Infinity;
  for (const city of CITY_CENTERS) {
    const d = haversineKm(lat, lon, city.lat, city.lon);
    if (d < bestDist) {
      bestDist = d;
      best = city;
    }
  }
  return best;
}

export async function GET(request: NextRequest) {
  const fromLat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const fromLon = parseFloat(request.nextUrl.searchParams.get("lon") ?? "");

  if (isNaN(fromLat) || isNaN(fromLon)) {
    return NextResponse.json({ durationMinutes: null, destination: "", legs: [] } satisfies TransitResult);
  }

  const city = nearestCity(fromLat, fromLon);

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

    if (!res.ok) {
      return NextResponse.json({ durationMinutes: null, destination: city.name, legs: [] } satisfies TransitResult);
    }

    const data = await res.json();
    const patterns = data?.data?.trip?.tripPatterns;

    if (!patterns || patterns.length === 0) {
      return NextResponse.json({ durationMinutes: null, destination: city.name, legs: [] } satisfies TransitResult);
    }

    // Take the fastest trip pattern among the returned options
    const pattern = patterns.reduce((best: { duration: number }, p: { duration: number }) =>
      p.duration < best.duration ? p : best, patterns[0]);
    const durationSeconds: number = pattern.duration ?? 0;
    const durationMinutes = Math.round(durationSeconds / 60);

    // Sanity check: if address is within 1.5km of city centre but routing says >30min,
    // Entur is routing the long way. Return null so the client shows "Sentrum".
    const directDistKm = haversineKm(fromLat, fromLon, city.lat, city.lon);
    if (directDistKm < 1.5 && durationMinutes > 30) {
      return NextResponse.json({ durationMinutes: null, destination: city.name, legs: [] } satisfies TransitResult);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const legs: Leg[] = (pattern.legs ?? []).map((leg: any) => ({
      mode: leg.mode,
      from: leg.fromPlace?.name ?? "",
      to: leg.toPlace?.name ?? "",
      duration: leg.duration ? Math.round(leg.duration / 60) : undefined,
      line: leg.line?.publicCode ?? undefined,
    }));

    return NextResponse.json({ durationMinutes, destination: city.name, legs } satisfies TransitResult);
  } catch (err) {
    console.error("[transit] Entur fetch failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ durationMinutes: null, destination: city.name, legs: [] } satisfies TransitResult);
  }
}
