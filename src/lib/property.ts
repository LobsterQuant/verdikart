/**
 * Hero-mockup property data helper.
 *
 * Fetches a narrow slice of real property data for the homepage hero mockup
 * (ProductMockup component). Hits SSB and Entur directly via the shared
 * `cachedFetch` helper so the server renders with real, current values under
 * ISR — no client-side waterfall, no layout shift, no hammering upstream.
 *
 * This is intentionally separate from the per-card API routes under
 * /api/price-trend and /api/transit: the hero needs a tiny composed shape
 * (coords + sqm-price + trajectory + nearest stop), not the full per-card
 * payload. The upstream schemas remain the single source of truth.
 */

import { cachedFetch, TTL } from "@/lib/cache";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HeroPropertyData {
  address: string;
  coordinates: { lat: number; lon: number };
  kommunenummer: string;
  /** Latest kr/m² for the kommune from SSB table 06035 (annual). */
  sqmPrice: number | null;
  /** YoY % change (latest vs previous year), null if not enough data. */
  yoyChange: number | null;
  /** Ordered price-trend series — one point per year, newest last. Used for sparkline. */
  priceSeries: number[];
  /** Years corresponding to priceSeries (same length). */
  priceYears: string[];
  /** Nearest/first boarding stop from Entur trip-planner, null if unavailable. */
  transit: {
    stopName: string;
    /** Norwegian mode label: "T-bane", "Buss", "Trikk", "Tog", "Båt". */
    modeLabel: string;
    /** Duration in minutes to the city centre. */
    durationMin: number;
  } | null;
}

// ---------------------------------------------------------------------------
// SSB price-trend (table 06035, municipality annual, KvPris)
// ---------------------------------------------------------------------------

interface SsbJsonStat2 {
  value?: number[];
  dimension?: {
    Tid?: { category?: { label?: Record<string, string> } };
  };
}

async function fetchKommunePriceSeries(
  kommunenummer: string
): Promise<{ values: number[]; years: string[] }> {
  const knr = kommunenummer.padStart(4, "0");
  const cacheKey = `hero:ssb:06035:${knr}`;

  const body = {
    query: [
      { code: "Region", selection: { filter: "item", values: [knr] } },
      { code: "Boligtype", selection: { filter: "item", values: ["00"] } }, // all types
      { code: "ContentsCode", selection: { filter: "item", values: ["KvPris"] } },
      { code: "Tid", selection: { filter: "top", values: ["8"] } },
    ],
    response: { format: "json-stat2" },
  };

  return cachedFetch(
    cacheKey,
    TTL.ONE_DAY,
    async () => {
      try {
        const res = await fetch("https://data.ssb.no/api/v0/no/table/06035/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return { values: [], years: [] };
        const data = (await res.json()) as SsbJsonStat2;
        const rawValues = Array.isArray(data.value) ? data.value : [];
        const yearLabels = Object.values(
          data.dimension?.Tid?.category?.label ?? {}
        );
        // Filter out null/zero (SSB uses nulls for missing cells).
        const values: number[] = [];
        const years: string[] = [];
        rawValues.forEach((v, i) => {
          if (typeof v === "number" && v > 0) {
            values.push(v);
            years.push(String(yearLabels[i] ?? ""));
          }
        });
        return { values, years };
      } catch {
        return { values: [], years: [] };
      }
    }
  );
}

// ---------------------------------------------------------------------------
// Entur nearest-stop via trip-planner (reuses same upstream the /api/transit
// route hits, narrower consumption — we only need the first boarding leg).
// ---------------------------------------------------------------------------

interface EnturTripLeg {
  mode?: string;
  fromPlace?: { name?: string };
  line?: { publicCode?: string };
}
interface EnturTripResponse {
  data?: {
    trip?: {
      tripPatterns?: {
        duration?: number;
        legs?: EnturTripLeg[];
      }[];
    };
  };
}

const MODE_LABEL: Record<string, string> = {
  rail: "Tog",
  metro: "T-bane",
  bus: "Buss",
  tram: "Trikk",
  water: "Båt",
};

async function fetchNearestTransit(
  lat: number,
  lon: number,
  cityCentre: { lat: number; lon: number }
): Promise<HeroPropertyData["transit"]> {
  const cacheKey = `hero:entur:${lat.toFixed(3)}:${lon.toFixed(3)}`;
  const query = `{
    trip(
      from: { coordinates: { latitude: ${lat}, longitude: ${lon} } }
      to: { coordinates: { latitude: ${cityCentre.lat}, longitude: ${cityCentre.lon} } }
      numTripPatterns: 3
      searchWindow: 1800
    ) {
      tripPatterns {
        duration
        legs { mode fromPlace { name } line { publicCode } }
      }
    }
  }`;

  return cachedFetch(cacheKey, TTL.ONE_HOUR, async () => {
    try {
      const res = await fetch(
        "https://api.entur.io/journey-planner/v3/graphql",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ET-Client-Name": "verdikart-mvp",
          },
          body: JSON.stringify({ query }),
          signal: AbortSignal.timeout(8000),
        }
      );
      if (!res.ok) return null;
      const raw = (await res.json()) as EnturTripResponse;
      const patterns = raw.data?.trip?.tripPatterns ?? [];
      if (patterns.length === 0) return null;
      // Pick the pattern whose first non-foot leg has a named stop — that's
      // the stop the user would actually board at.
      for (const pattern of patterns) {
        const firstRide = pattern.legs?.find(
          (l) => l.mode && l.mode !== "foot"
        );
        if (firstRide?.fromPlace?.name) {
          const durationMin = Math.round((pattern.duration ?? 0) / 60);
          const modeLabel = MODE_LABEL[firstRide.mode ?? ""] ?? "Kollektiv";
          return {
            stopName: firstRide.fromPlace.name,
            modeLabel,
            durationMin,
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  });
}

// ---------------------------------------------------------------------------
// Public: composed hero payload
// ---------------------------------------------------------------------------

/**
 * Fetch the hero-mockup payload for a given property.
 * Currently used only by the homepage ProductMockup; fan-out is deliberately
 * narrow (2 upstream calls in parallel) so hero TTFB stays well under 1s.
 */
export async function getHeroPropertyData(input: {
  address: string;
  lat: number;
  lon: number;
  kommunenummer: string;
  cityCentre: { lat: number; lon: number };
}): Promise<HeroPropertyData> {
  const [price, transit] = await Promise.all([
    fetchKommunePriceSeries(input.kommunenummer),
    fetchNearestTransit(input.lat, input.lon, input.cityCentre),
  ]);

  const values = price.values;
  const sqmPrice = values.length > 0 ? values[values.length - 1] : null;
  let yoyChange: number | null = null;
  if (values.length >= 2) {
    const cur = values[values.length - 1];
    const prev = values[values.length - 2];
    if (prev > 0) yoyChange = Math.round(((cur - prev) / prev) * 1000) / 10;
  }

  return {
    address: input.address,
    coordinates: { lat: input.lat, lon: input.lon },
    kommunenummer: input.kommunenummer,
    sqmPrice,
    yoyChange,
    priceSeries: values,
    priceYears: price.years,
    transit,
  };
}
