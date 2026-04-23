import { unstable_cache } from "next/cache";
import {
  calculateKlimaPoeng,
  type KlimaPoengResult,
} from "./klima-poeng";

/**
 * Cache-wrapped Klima-poeng. The three upstream WMS services (NVE flom, NVE
 * kvikkleire, Kartverket stormflo) are stable — polygons only change on
 * dataset republish (yearly at best), so a 24h TTL comfortably absorbs
 * repeated property-page views. Key uses lat/lon rounded to 4 decimals
 * (~11 m) plus the resolved kommunenummer, matching Pendlings-poeng's cache
 * granularity.
 */
const ROUND = (n: number) => Math.round(n * 1e4) / 1e4;
const DAY = 60 * 60 * 24;

const cachedCalc = unstable_cache(
  async (
    lat: number,
    lon: number,
    kommunenummer: string | null,
  ): Promise<KlimaPoengResult> => {
    return calculateKlimaPoeng(lat, lon, { kommunenummer });
  },
  ["klima-poeng-v1"],
  { revalidate: DAY },
);

export async function getKlimaPoengCached(
  lat: number,
  lon: number,
  kommunenummer: string | null,
): Promise<KlimaPoengResult> {
  const rlat = ROUND(lat);
  const rlon = ROUND(lon);
  return cachedCalc(rlat, rlon, kommunenummer);
}
