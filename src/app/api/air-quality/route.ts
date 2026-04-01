import { NextRequest, NextResponse } from "next/server";
import { cachedFetch, TTL } from "@/lib/cache";

export interface AirQualityResult {
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  aqi: "God" | "Moderat" | "Dårlig" | "Svært dårlig" | "Ukjent";
  nearestStation: string | null;
  distanceKm: number | null;
}

const EMPTY: AirQualityResult = {
  pm25: null,
  pm10: null,
  no2: null,
  aqi: "Ukjent",
  nearestStation: null,
  distanceKm: null,
};

function classifyAqi(pm25: number | null, pm10: number | null, no2: number | null): AirQualityResult["aqi"] {
  const vals = [pm25, pm10, no2].filter((v): v is number => v !== null);
  if (vals.length === 0) return "Ukjent";

  // Norwegian air quality index thresholds (Luftkvalitet.info)
  if (pm25 !== null && pm25 > 25) return "Svært dårlig";
  if (pm10 !== null && pm10 > 50) return "Svært dårlig";
  if (no2 !== null && no2 > 200) return "Svært dårlig";

  if (pm25 !== null && pm25 > 15) return "Dårlig";
  if (pm10 !== null && pm10 > 30) return "Dårlig";
  if (no2 !== null && no2 > 100) return "Dårlig";

  if (pm25 !== null && pm25 > 5) return "Moderat";
  if (pm10 !== null && pm10 > 15) return "Moderat";
  if (no2 !== null && no2 > 40) return "Moderat";

  return "God";
}

async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityResult> {
  try {
    const url = `https://api.nilu.no/aq/utd?lat=${lat}&lon=${lon}&rad=20&components=PM2.5;PM10;NO2`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return EMPTY;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return EMPTY;

    let pm25: number | null = null;
    let pm10: number | null = null;
    let no2: number | null = null;
    let nearestStation: string | null = null;
    let distanceKm: number | null = null;

    for (const entry of data) {
      const component = (entry.component ?? "").toUpperCase().replace(/\./g, "");
      const value = parseFloat(entry.value);
      if (isNaN(value) || value < 0) continue;

      if (!nearestStation && entry.station) {
        nearestStation = entry.station;
        // NILU returns latitude/longitude of station
        if (entry.latitude && entry.longitude) {
          const R = 6371;
          const dLat = ((entry.latitude - lat) * Math.PI) / 180;
          const dLon = ((entry.longitude - lon) * Math.PI) / 180;
          const a = Math.sin(dLat / 2) ** 2 +
            Math.cos((lat * Math.PI) / 180) * Math.cos((entry.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
          distanceKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
        }
      }

      if (component === "PM25" || component === "PM2,5") pm25 = Math.round(value * 10) / 10;
      else if (component === "PM10") pm10 = Math.round(value * 10) / 10;
      else if (component === "NO2") no2 = Math.round(value * 10) / 10;
    }

    const aqi = classifyAqi(pm25, pm10, no2);
    return { pm25, pm10, no2, aqi, nearestStation, distanceKm };
  } catch (err) {
    console.error("[air-quality] NILU fetch failed:", err instanceof Error ? err.message : err);
    return EMPTY;
  }
}

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lon = parseFloat(request.nextUrl.searchParams.get("lon") ?? "");

  if (isNaN(lat) || isNaN(lon)) return NextResponse.json(EMPTY);

  const key = `vk:air:${lat.toFixed(3)}-${lon.toFixed(3)}`;
  const result = await cachedFetch(key, TTL.ONE_HOUR, () => fetchAirQuality(lat, lon));
  return NextResponse.json(result);
}
