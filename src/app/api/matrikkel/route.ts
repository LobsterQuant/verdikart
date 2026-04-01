import { NextRequest, NextResponse } from "next/server";
import type { MatrikkelData } from "@/lib/types/matrikkel";
import { EMPTY_MATRIKKEL } from "@/lib/types/matrikkel";

/**
 * Matrikkel API stub.
 *
 * When Kartverket Grunnbok API access is granted, replace the fetchMatrikkel
 * function body with actual API calls. The response shape stays the same.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchMatrikkel(_lat: number, _lon: number, _knr: string): Promise<MatrikkelData> {
  // TODO: Replace with actual Kartverket API call when credentials arrive.
  // Expected endpoint pattern:
  //   GET https://api.kartverket.no/grunnbok/v1/matrikkel?kommunenummer={knr}&gaardsnummer=...&bruksnummer=...
  // or:
  //   GET https://api.kartverket.no/grunnbok/v1/matrikkel/punkt?lat={lat}&lon={lon}
  return EMPTY_MATRIKKEL;
}

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lon = parseFloat(request.nextUrl.searchParams.get("lon") ?? "");
  const knr = request.nextUrl.searchParams.get("knr") ?? "";

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(EMPTY_MATRIKKEL);
  }

  const result = await fetchMatrikkel(lat, lon, knr);
  return NextResponse.json(result);
}
