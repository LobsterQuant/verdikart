import { NextRequest, NextResponse } from "next/server";
import { cachedFetch, TTL } from "@/lib/cache";

export interface ClimateRiskResult {
  floodRisk: "Høy" | "Moderat" | "Lav" | "Ukjent";
  quickClay: boolean;
  stormSurge: boolean;
}

const EMPTY: ClimateRiskResult = {
  floodRisk: "Ukjent",
  quickClay: false,
  stormSurge: false,
};

async function queryWms(lat: number, lon: number, layer: string, baseUrl: string): Promise<boolean> {
  const delta = 0.0005;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;

  const params = new URLSearchParams({
    SERVICE: "WMS",
    VERSION: "1.1.1",
    REQUEST: "GetFeatureInfo",
    LAYERS: layer,
    QUERY_LAYERS: layer,
    INFO_FORMAT: "application/json",
    SRS: "EPSG:4326",
    WIDTH: "101",
    HEIGHT: "101",
    X: "50",
    Y: "50",
    BBOX: bbox,
  });

  try {
    const res = await fetch(`${baseUrl}?${params}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return false;

    const data = await res.json();
    const features = data.features ?? data.Features ?? [];
    return features.length > 0;
  } catch {
    return false;
  }
}

async function fetchClimateRisk(lat: number, lon: number): Promise<ClimateRiskResult> {
  try {
    const [floodHigh, floodMedium, quickClay, stormSurge] = await Promise.all([
      queryWms(lat, lon, "Flomsone", "https://gis3.nve.no/map/services/Flomsone1/MapServer/WMSServer"),
      queryWms(lat, lon, "Aktsomhet", "https://gis3.nve.no/map/services/FlomAktsomhet1/MapServer/WMSServer"),
      queryWms(lat, lon, "KvijointFaresone", "https://gis3.nve.no/map/services/Kvikkleire2/MapServer/WMSServer"),
      queryWms(lat, lon, "Stormflo", "https://gis3.nve.no/map/services/Stormflo1/MapServer/WMSServer"),
    ]);

    let floodRisk: ClimateRiskResult["floodRisk"] = "Lav";
    if (floodHigh) floodRisk = "Høy";
    else if (floodMedium) floodRisk = "Moderat";

    return { floodRisk, quickClay, stormSurge };
  } catch (err) {
    console.error("[climate-risk] NVE fetch failed:", err instanceof Error ? err.message : err);
    return EMPTY;
  }
}

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lon = parseFloat(request.nextUrl.searchParams.get("lon") ?? "");

  if (isNaN(lat) || isNaN(lon)) return NextResponse.json(EMPTY);

  const key = `vk:climate:${lat.toFixed(4)}-${lon.toFixed(4)}`;
  const result = await cachedFetch(key, TTL.ONE_DAY, () => fetchClimateRisk(lat, lon));
  return NextResponse.json(result);
}
