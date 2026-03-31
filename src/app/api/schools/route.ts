import { NextRequest, NextResponse } from "next/server";

interface School {
  name: string;
  lat: number;
  lon: number;
  type: string;
  distance?: number;
  isPrivate?: boolean;
  levelLabel?: string | null;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lon = parseFloat(request.nextUrl.searchParams.get("lon") ?? "");

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ schools: [] });
  }

  const radius = 1000; // metres

  // Overpass API — fetch schools and kindergartens within radius
  const query = `
[out:json][timeout:10];
(
  node["amenity"="school"](around:${radius},${lat},${lon});
  node["amenity"="kindergarten"](around:${radius},${lat},${lon});
  way["amenity"="school"](around:${radius},${lat},${lon});
  way["amenity"="kindergarten"](around:${radius},${lat},${lon});
);
out center 20;
  `.trim();

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { "Content-Type": "text/plain" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ schools: [] });
    }

    const data = await res.json();
    const elements = data.elements ?? [];

    const schools: School[] = elements
      .map((el: { type: string; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }) => {
        const elLat = el.lat ?? el.center?.lat ?? null;
        const elLon = el.lon ?? el.center?.lon ?? null;
        if (!elLat || !elLon) return null;
        const tags = el.tags ?? {};
        const name = tags.name ?? tags["name:no"] ?? (tags.amenity === "kindergarten" ? "Barnehage" : "Skole");
        const type = tags.amenity === "kindergarten" ? "Barnehage" : "Skole";
        const distance = Math.round(haversine(lat, lon, elLat, elLon));
        // Enrich: school level + operator type from OSM tags
        const isPrivate = tags.operator_type === "private" || tags.fee === "yes";
        const schoolLevel = tags["isced:level"] ?? tags.school ?? null; // "1"=primary,"2"=secondary
        const levelLabel =
          schoolLevel === "1" || schoolLevel === "primary" ? "Barneskole" :
          schoolLevel === "2" || schoolLevel === "secondary" ? "Ungdomsskole" :
          schoolLevel === "1-3" ? "1–10" :
          type === "Barnehage" ? null : null;
        return { name, lat: elLat, lon: elLon, type, distance, isPrivate, levelLabel };
      })
      .filter(Boolean)
      .sort((a: School, b: School) => (a.distance ?? 0) - (b.distance ?? 0))
      .slice(0, 8);

    return NextResponse.json({ schools });
  } catch {
    return NextResponse.json({ schools: [] });
  }
}
