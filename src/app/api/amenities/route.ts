import { NextRequest, NextResponse } from "next/server";
import { haversineM } from "@/lib/geo";
import { cachedFetch, TTL } from "@/lib/cache";

export interface Amenity {
  name: string;
  type: string;
  category: string;
  distance: number;
  lat: number;
  lon: number;
}

export interface AmenitiesResult {
  amenities: Amenity[];
  summary: Record<string, number>;
}

const EMPTY: AmenitiesResult = { amenities: [], summary: {} };

const CATEGORY_MAP: Record<string, string> = {
  supermarket: "Dagligvare",
  convenience: "Nærbutikk",
  pharmacy: "Apotek",
  cafe: "Kafé",
  restaurant: "Restaurant",
  bar: "Bar",
  park: "Park",
  fitness_centre: "Treningssenter",
  dentist: "Tannlege",
  doctors: "Lege",
  library: "Bibliotek",
  post_office: "Postkontor",
};

async function fetchAmenities(lat: number, lon: number): Promise<AmenitiesResult> {
  const query = `
[out:json][timeout:10];
(
  node["shop"="supermarket"](around:1000,${lat},${lon});
  node["shop"="convenience"](around:800,${lat},${lon});
  node["amenity"="pharmacy"](around:1000,${lat},${lon});
  node["amenity"="cafe"](around:800,${lat},${lon});
  node["amenity"="restaurant"](around:800,${lat},${lon});
  node["leisure"="park"](around:1000,${lat},${lon});
  way["leisure"="park"](around:1000,${lat},${lon});
  node["leisure"="fitness_centre"](around:1000,${lat},${lon});
  node["amenity"="dentist"](around:1000,${lat},${lon});
  node["amenity"="doctors"](around:1000,${lat},${lon});
  node["amenity"="library"](around:1000,${lat},${lon});
);
out center 40;
  `.trim();

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { "Content-Type": "text/plain" },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) return EMPTY;

    const data = await res.json();
    const elements = data.elements ?? [];

    const amenities: Amenity[] = [];

    for (const el of elements) {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (!elLat || !elLon) continue;

      const tags = el.tags ?? {};
      const name = tags.name ?? tags["name:no"] ?? "";
      if (!name) continue;

      // Determine type
      const amenityType = tags.amenity ?? tags.shop ?? tags.leisure ?? "";
      const category = CATEGORY_MAP[amenityType] ?? amenityType;
      if (!category) continue;

      const distance = Math.round(haversineM(lat, lon, elLat, elLon));

      amenities.push({
        name,
        type: amenityType,
        category,
        distance,
        lat: elLat,
        lon: elLon,
      });
    }

    // Sort by distance
    amenities.sort((a, b) => a.distance - b.distance);

    // Build summary: count per category
    const summary: Record<string, number> = {};
    for (const a of amenities) {
      summary[a.category] = (summary[a.category] ?? 0) + 1;
    }

    return { amenities: amenities.slice(0, 30), summary };
  } catch (err) {
    console.error("[amenities] Overpass fetch failed:", err instanceof Error ? err.message : err);
    return EMPTY;
  }
}

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lon = parseFloat(request.nextUrl.searchParams.get("lon") ?? "");

  if (isNaN(lat) || isNaN(lon)) return NextResponse.json(EMPTY);

  const key = `vk:amenities:${lat.toFixed(4)}-${lon.toFixed(4)}`;
  const result = await cachedFetch(key, TTL.ONE_WEEK, () => fetchAmenities(lat, lon));
  return NextResponse.json(result);
}
