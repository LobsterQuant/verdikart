import { NextRequest, NextResponse } from "next/server";
import { cachedFetch, TTL } from "@/lib/cache";

export interface BroadbandResult {
  maxDownload: number | null;
  maxUpload: number | null;
  fiberAvailable: boolean;
  providers: string[];
  coverageSource: string | null;
}

const EMPTY: BroadbandResult = {
  maxDownload: null,
  maxUpload: null,
  fiberAvailable: false,
  providers: [],
  coverageSource: null,
};

async function fetchBroadband(lat: number, lon: number): Promise<BroadbandResult> {
  // Nkom Dekningskart API — public GeoJSON endpoint
  // Queries fixed broadband coverage for a coordinate
  try {
    const url = `https://dekningskart-api.nkom.no/api/v2/coverage?lat=${lat}&lon=${lon}&type=fixed`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      // Fallback: try the older Nkom endpoint
      return await fetchBroadbandFallback(lat, lon);
    }

    const data = await res.json();

    if (!data || (!Array.isArray(data) && !data.coverages)) {
      return await fetchBroadbandFallback(lat, lon);
    }

    const coverages = Array.isArray(data) ? data : data.coverages ?? [];

    let maxDownload = 0;
    let maxUpload = 0;
    let fiberAvailable = false;
    const providerSet = new Set<string>();

    for (const c of coverages) {
      const down = c.downloadSpeed ?? c.download ?? c.maxDownload ?? 0;
      const up = c.uploadSpeed ?? c.upload ?? c.maxUpload ?? 0;
      const tech = (c.technology ?? c.type ?? "").toLowerCase();
      const provider = c.provider ?? c.operator ?? c.providerName ?? "";

      if (down > maxDownload) maxDownload = down;
      if (up > maxUpload) maxUpload = up;
      if (tech.includes("fiber") || tech.includes("ftth") || tech.includes("fttb")) {
        fiberAvailable = true;
      }
      if (provider) providerSet.add(provider);
    }

    return {
      maxDownload: maxDownload > 0 ? maxDownload : null,
      maxUpload: maxUpload > 0 ? maxUpload : null,
      fiberAvailable,
      providers: Array.from(providerSet).slice(0, 5),
      coverageSource: "Nkom Dekningskart",
    };
  } catch (err) {
    console.error("[broadband] Nkom fetch failed:", err instanceof Error ? err.message : err);
    return await fetchBroadbandFallback(lat, lon);
  }
}

async function fetchBroadbandFallback(lat: number, lon: number): Promise<BroadbandResult> {
  // Alternative: use Nkom's WMS feature info
  try {
    const delta = 0.001;
    const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
    const params = new URLSearchParams({
      SERVICE: "WMS",
      VERSION: "1.1.1",
      REQUEST: "GetFeatureInfo",
      LAYERS: "bredband_nedlasting",
      QUERY_LAYERS: "bredband_nedlasting",
      INFO_FORMAT: "application/json",
      SRS: "EPSG:4326",
      WIDTH: "101",
      HEIGHT: "101",
      X: "50",
      Y: "50",
      BBOX: bbox,
    });

    const res = await fetch(
      `https://wms.geonorge.no/skwms1/wms.bredbandsdekning?${params}`,
      { signal: AbortSignal.timeout(6000) }
    );

    if (!res.ok) return EMPTY;

    const data = await res.json();
    const features = data.features ?? [];
    if (features.length === 0) return EMPTY;

    const props = features[0]?.properties ?? {};
    const speed = props.gray_index ?? props.GRAY_INDEX ?? props.value ?? null;

    // WMS returns speed category as a gray index (1-5 scale)
    const speedMap: Record<number, number> = {
      1: 4,    // < 4 Mbps
      2: 30,   // 4-30 Mbps
      3: 100,  // 30-100 Mbps
      4: 300,  // 100-300 Mbps
      5: 1000, // > 300 Mbps
    };

    const estimatedSpeed = speed ? speedMap[speed] ?? null : null;

    return {
      maxDownload: estimatedSpeed,
      maxUpload: estimatedSpeed ? Math.round(estimatedSpeed / 5) : null,
      fiberAvailable: (speed ?? 0) >= 4,
      providers: [],
      coverageSource: "Nkom / Geonorge",
    };
  } catch {
    return EMPTY;
  }
}

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lon = parseFloat(request.nextUrl.searchParams.get("lon") ?? "");

  if (isNaN(lat) || isNaN(lon)) return NextResponse.json(EMPTY);

  const key = `vk:broadband:${lat.toFixed(4)}-${lon.toFixed(4)}`;
  const result = await cachedFetch(key, TTL.ONE_WEEK, () => fetchBroadband(lat, lon));
  return NextResponse.json(result);
}
