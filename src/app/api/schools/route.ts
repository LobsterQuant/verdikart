import { NextRequest, NextResponse } from "next/server";

export interface School {
  name: string;
  lat: number;
  lon: number;
  type: string;          // "Skole" | "Barnehage"
  distance: number;
  isPrivate: boolean;
  levelLabel: string | null;  // "1–7 Barneskole" | "8–10 Ungdomsskole" | "1–10" | null
  pupils: number | null;
  url: string | null;
  nsrId: number | null;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// NSR NACE codes for schools (grunnskole + videregående)
const SCHOOL_NACE = new Set(["85.201", "85.202", "85.203", "85.209"]);

interface NsrListEntry {
  NSRId: number;
  Navn: string;
  NaceKode1: string;
  NaceKode2: string;
  NaceKode3: string;
  Breddegrad: number;
  Lengdegrad: number;
  Kommunenr: string;
}

interface NsrDetailEntry {
  NSRId: number;
  Navn: string;
  Url?: string;
  Elevtall?: number;
  SkoleTrinnFra?: number;
  SkoleTrinnTil?: number;
  ErPrivatSkole?: boolean;
  ErOffentligSkole?: boolean;
  ErGrunnSkole?: boolean;
  ErVideregaaendeSkole?: boolean;
  ErAktiv?: boolean;
  Breddegrad?: number;
  Lengdegrad?: number;
}

async function fetchNsrDetail(nsrId: number): Promise<NsrDetailEntry | null> {
  try {
    const res = await fetch(`https://data-nsr.udir.no/enhet/${nsrId}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function buildLevelLabel(from: number | undefined, to: number | undefined): string | null {
  if (from == null || to == null) return null;
  if (from === 1 && to === 7) return "1–7 Barneskole";
  if (from === 1 && to === 10) return "1–10";
  if (from === 5 && to === 10) return "5–10";
  if (from === 8 && to === 10) return "8–10 Ungdomsskole";
  if (from >= 11) return "Videregående";
  return `${from}–${to}`;
}

async function fetchSchoolsFromNsr(lat: number, lon: number, kommunenr: string): Promise<School[]> {
  // Fetch all schools in the kommune from NSR list endpoint
  const res = await fetch(`https://data-nsr.udir.no/enheter/kommune/${kommunenr.padStart(4, "0")}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return [];

  const all: NsrListEntry[] = await res.json();

  // Filter to schools within 1km
  const nearby = all
    .filter(s => {
      const nace = s.NaceKode1 ?? "";
      return (SCHOOL_NACE.has(nace) || SCHOOL_NACE.has(s.NaceKode2) || SCHOOL_NACE.has(s.NaceKode3))
        && s.Breddegrad && s.Lengdegrad;
    })
    .map(s => ({ ...s, _dist: haversine(lat, lon, s.Breddegrad, s.Lengdegrad) }))
    .filter(s => s._dist < 1000)
    .sort((a, b) => a._dist - b._dist)
    .slice(0, 6);

  if (nearby.length === 0) return [];

  // Fetch full detail for each nearby school in parallel (capped at 6)
  const details = await Promise.all(nearby.map(s => fetchNsrDetail(s.NSRId)));

  return nearby.map((s, i) => {
    const d = details[i];
    // Skip inactive or non-school entities
    if (d && d.ErAktiv === false) return null;
    // Filter out companies that happen to have school NACE but aren't schools
    if (d && !d.ErGrunnSkole && !d.ErVideregaaendeSkole) return null;

    const isPrivate = d?.ErPrivatSkole ?? false;
    const levelLabel = buildLevelLabel(d?.SkoleTrinnFra, d?.SkoleTrinnTil);
    const url = d?.Url ? (d.Url.startsWith("http") ? d.Url : `https://${d.Url}`) : null;

    return {
      name: d?.Navn ?? s.Navn,
      lat: s.Breddegrad,
      lon: s.Lengdegrad,
      type: "Skole",
      distance: Math.round(s._dist),
      isPrivate,
      levelLabel,
      pupils: d?.Elevtall ?? null,
      url,
      nsrId: s.NSRId,
    } satisfies School;
  }).filter(Boolean) as School[];
}

async function fetchKindergartensFromOsm(lat: number, lon: number): Promise<School[]> {
  const query = `
[out:json][timeout:8];
(
  node["amenity"="kindergarten"](around:800,${lat},${lon});
  way["amenity"="kindergarten"](around:800,${lat},${lon});
);
out center 10;
  `.trim();

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { "Content-Type": "text/plain" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const data = await res.json();
    return (data.elements ?? [])
      .map((el: { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }) => {
        const elLat = el.lat ?? el.center?.lat ?? null;
        const elLon = el.lon ?? el.center?.lon ?? null;
        if (!elLat || !elLon) return null;
        const tags = el.tags ?? {};
        const name = tags.name ?? tags["name:no"] ?? "Barnehage";
        const isPrivate = tags.operator_type === "private" || tags.fee === "yes";
        return {
          name,
          lat: elLat,
          lon: elLon,
          type: "Barnehage",
          distance: Math.round(haversine(lat, lon, elLat, elLon)),
          isPrivate,
          levelLabel: null,
          pupils: null,
          url: null,
          nsrId: null,
        } satisfies School;
      })
      .filter(Boolean) as School[];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lon = parseFloat(request.nextUrl.searchParams.get("lon") ?? "");
  const knr = request.nextUrl.searchParams.get("knr") ?? request.nextUrl.searchParams.get("kommunenummer") ?? "";

  if (isNaN(lat) || isNaN(lon)) return NextResponse.json({ schools: [] });

  // Derive kommunenr from knr param or from reverse-lookup via Kartverket
  let kommunenr = knr.replace(/^0+/, "").padStart(4, "0");
  if (!kommunenr || kommunenr === "0000") {
    // Fallback: use Overpass for schools too
    kommunenr = "";
  }

  const [nsrSchools, osmKindergartens] = await Promise.allSettled([
    kommunenr ? fetchSchoolsFromNsr(lat, lon, kommunenr) : Promise.resolve([] as School[]),
    fetchKindergartensFromOsm(lat, lon),
  ]);

  const schools: School[] = [
    ...(nsrSchools.status === "fulfilled" ? nsrSchools.value : []),
    ...(osmKindergartens.status === "fulfilled" ? osmKindergartens.value : []),
  ].sort((a, b) => a.distance - b.distance);

  // If NSR returned nothing (no kommunenr or empty result), fallback to OSM for schools too
  const hasNsrSchools = nsrSchools.status === "fulfilled" && nsrSchools.value.length > 0;
  if (!hasNsrSchools) {
    // OSM fallback for schools
    const osmQuery = `
[out:json][timeout:8];
(
  node["amenity"="school"](around:1000,${lat},${lon});
  way["amenity"="school"](around:1000,${lat},${lon});
);
out center 8;
    `.trim();
    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: osmQuery,
        headers: { "Content-Type": "text/plain" },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = await res.json();
        const osmSchools: School[] = (data.elements ?? []).map((el: { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }) => {
          const elLat = el.lat ?? el.center?.lat ?? null;
          const elLon = el.lon ?? el.center?.lon ?? null;
          if (!elLat || !elLon) return null;
          const tags = el.tags ?? {};
          return {
            name: tags.name ?? tags["name:no"] ?? "Skole",
            lat: elLat, lon: elLon, type: "Skole",
            distance: Math.round(haversine(lat, lon, elLat, elLon)),
            isPrivate: tags.operator_type === "private",
            levelLabel: null, pupils: null, url: null, nsrId: null,
          } satisfies School;
        }).filter(Boolean) as School[];
        schools.push(...osmSchools);
        schools.sort((a, b) => a.distance - b.distance);
      }
    } catch (err) {
      console.error("[schools] OSM fallback failed:", err instanceof Error ? err.message : err);
    }
  }

  return NextResponse.json({ schools: schools.slice(0, 10) });
}
