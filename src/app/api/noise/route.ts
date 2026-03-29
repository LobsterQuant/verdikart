import { NextRequest, NextResponse } from "next/server";

interface NoiseResult {
  veinoise: number | null;
  flynoise: number | null;
  jernbanenoise: number | null;
}

async function fetchNoiseLayer(
  lat: number,
  lon: number,
  layer: string
): Promise<number | null> {
  const minx = lon - 0.001;
  const miny = lat - 0.001;
  const maxx = lon + 0.001;
  const maxy = lat + 0.001;
  const bbox = `${minx},${miny},${maxx},${maxy}`;

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

  const url = `https://wms.geonorge.no/skwms1/wms.stoy?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  const features = data.features;

  if (!features || features.length === 0) {
    return null;
  }

  const value = features[0]?.properties?.gray_index
    ?? features[0]?.properties?.GRAY_INDEX
    ?? features[0]?.properties?.value
    ?? features[0]?.properties?.VALUE;

  return typeof value === "number" ? value : null;
}

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lon = parseFloat(request.nextUrl.searchParams.get("lon") ?? "");

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      { veinoise: null, flynoise: null, jernbanenoise: null } satisfies NoiseResult
    );
  }

  try {
    const [veinoise, flynoise, jernbanenoise] = await Promise.all([
      fetchNoiseLayer(lat, lon, "Veg_Lden"),
      fetchNoiseLayer(lat, lon, "Fly_Lden"),
      fetchNoiseLayer(lat, lon, "Jernbane_Lden"),
    ]);

    const result: NoiseResult = { veinoise, flynoise, jernbanenoise };
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { veinoise: null, flynoise: null, jernbanenoise: null } satisfies NoiseResult
    );
  }
}
