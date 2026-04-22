import { unstable_cache } from "next/cache";
import {
  calculatePendlingsPoeng,
  type PendlingsPoengOptions,
  type PendlingsPoengResult,
} from "./pendlings-poeng";
import { resolveWorkCenter } from "./work-centers";

/**
 * Cache-wrapped commute scorer. Entur responses for a given origin→center pair
 * are stable enough that recomputing per request would waste the (rate-limited)
 * upstream. Key uses lat/lon rounded to 4 decimals (~11 m) plus the resolved
 * center id, so moving next door still produces a cache hit but crossing a
 * kommune boundary that flips the center does not.
 */
const ROUND = (n: number) => Math.round(n * 1e4) / 1e4;
const DAY = 60 * 60 * 24;

const cachedCalc = unstable_cache(
  async (
    lat: number,
    lon: number,
    centerId: string,
    kommunenummer: string | null,
  ): Promise<PendlingsPoengResult> => {
    const opts: PendlingsPoengOptions = kommunenummer
      ? { kommunenummer }
      : { center: centerId as PendlingsPoengOptions["center"] };
    return calculatePendlingsPoeng(lat, lon, opts);
  },
  ["pendlings-poeng-v1"],
  { revalidate: DAY },
);

export async function getPendlingsPoengCached(
  lat: number,
  lon: number,
  kommunenummer: string | null,
): Promise<PendlingsPoengResult> {
  const rlat = ROUND(lat);
  const rlon = ROUND(lon);
  const center = resolveWorkCenter(rlat, rlon, kommunenummer);
  return cachedCalc(rlat, rlon, center.id, kommunenummer);
}
