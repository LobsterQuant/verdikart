import { NextRequest, NextResponse } from "next/server";

interface StopResult {
  name: string;
  distance: number;
  coordinates: [number, number];
}

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lon = request.nextUrl.searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `https://api.entur.io/geocoder/v1/reverse?point.lat=${encodeURIComponent(lat)}&point.lon=${encodeURIComponent(lon)}&layers=venue&size=5`,
      {
        headers: {
          "ET-Client-Name": "verdikart-mvp",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = await res.json();
    const features = data?.features ?? [];

    const results: StopResult[] = features.map(
      (f: {
        properties?: { name?: string; distance?: number };
        geometry?: { coordinates?: [number, number] };
      }) => ({
        name: f.properties?.name ?? "",
        distance: f.properties?.distance ?? 0,
        coordinates: f.geometry?.coordinates ?? [0, 0],
      })
    );

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
