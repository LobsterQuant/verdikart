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
  /** Nearest transit stop from Entur nearest-places, null if unavailable. */
  transit: {
    stopName: string;
    /** Norwegian mode label for the primary transport mode at this stop. */
    modeLabel: string;
    /** Walking distance in metres, rounded. */
    distanceM: number;
  } | null;
}

// ---------------------------------------------------------------------------
// SSB price-trend (table 06035, municipality annual, KvPris)
// ---------------------------------------------------------------------------

interface SsbJsonStat2 {
  value?: (number | null)[];
  dimension?: {
    Tid?: { category?: { label?: Record<string, string> } };
  };
}

/**
 * SSB table 06035 is published per housing type (eneboliger / småhus /
 * blokkleiligheter), not as an aggregate. To get a single kommune series we
 * request all three types with both KvPris and Omsetninger, then compute a
 * volume-weighted average per year — same approach as the production
 * /api/price-trend route's fetchKommuneData. Keeping the logic inlined here
 * so the hero helper has zero runtime dependency on the API route.
 */
async function fetchKommunePriceSeries(
  kommunenummer: string
): Promise<{ values: number[]; years: string[] }> {
  const knr = kommunenummer.padStart(4, "0");
  const cacheKey = `hero:ssb:06035:${knr}`;

  const body = {
    query: [
      { code: "Region", selection: { filter: "item", values: [knr] } },
      { code: "Boligtype", selection: { filter: "item", values: ["01", "02", "03"] } },
      { code: "ContentsCode", selection: { filter: "item", values: ["KvPris", "Omsetninger"] } },
      { code: "Tid", selection: { filter: "top", values: ["8"] } },
    ],
    response: { format: "json-stat2" },
  };

  return cachedFetch(cacheKey, TTL.ONE_DAY, async () => {
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
      ) as string[];
      const N = yearLabels.length;
      if (!N || rawValues.length === 0) return { values: [], years: [] };

      // Flat-array layout: rawValues[t*(2*N) + c*N + y] for
      // t ∈ {0,1,2} (type), c ∈ {0,1} (0=KvPris, 1=Omsetninger), y ∈ [0,N).
      const weightedByYear: number[] = [];
      for (let y = 0; y < N; y++) {
        let sumPxV = 0;
        let sumV = 0;
        for (let t = 0; t < 3; t++) {
          const price = rawValues[t * (2 * N) + 0 * N + y];
          const vol = rawValues[t * (2 * N) + 1 * N + y];
          if (
            typeof price === "number" &&
            typeof vol === "number" &&
            vol > 0
          ) {
            sumPxV += price * vol;
            sumV += vol;
          }
        }
        weightedByYear.push(sumV > 0 ? Math.round(sumPxV / sumV) : 0);
      }

      const values: number[] = [];
      const years: string[] = [];
      weightedByYear.forEach((v, i) => {
        if (v > 0) {
          values.push(v);
          years.push(yearLabels[i] ?? "");
        }
      });
      return { values, years };
    } catch {
      return { values: [], years: [] };
    }
  });
}

// ---------------------------------------------------------------------------
// Entur nearest-stop via GraphQL `nearest` — purpose-built for
// "what StopPlaces sit near this coordinate". Much better fit for the hero
// than trip-planner, which returns foot-only patterns when origin and
// destination are already adjacent (e.g. Karl Johans gate 1 → Oslo S).
// ---------------------------------------------------------------------------

const MODE_LABEL: Record<string, string> = {
  rail: "Tog",
  metro: "T-bane",
  bus: "Buss",
  tram: "Trikk",
  water: "Båt",
  funicular: "Kabelbane",
  air: "Fly",
};

// Preferred mode order — pick the "headline" mode when a stop serves many.
const MODE_PRIORITY = ["metro", "rail", "tram", "bus", "water"] as const;

interface EnturNearestNode {
  distance?: number;
  place?: {
    __typename?: string;
    name?: string;
    transportMode?: string[];
  };
}
interface EnturNearestResponse {
  data?: {
    nearest?: {
      edges?: { node?: EnturNearestNode }[];
    };
  };
}

async function fetchNearestTransit(
  lat: number,
  lon: number
): Promise<HeroPropertyData["transit"]> {
  const cacheKey = `hero:entur-nearest:${lat.toFixed(3)}:${lon.toFixed(3)}`;
  const query = `{
    nearest(
      latitude: ${lat}
      longitude: ${lon}
      maximumDistance: 500
      filterByPlaceTypes: [stopPlace]
    ) {
      edges {
        node {
          distance
          place {
            __typename
            ... on StopPlace { name transportMode }
          }
        }
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
      const raw = (await res.json()) as EnturNearestResponse;
      const edges = raw.data?.nearest?.edges ?? [];
      for (const edge of edges) {
        const node = edge.node;
        const modes = node?.place?.transportMode ?? [];
        const name = node?.place?.name;
        if (!name || modes.length === 0) continue;
        const primary =
          MODE_PRIORITY.find((m) => modes.includes(m)) ?? modes[0];
        return {
          stopName: name,
          modeLabel: MODE_LABEL[primary] ?? "Kollektiv",
          distanceM: Math.round(node?.distance ?? 0),
        };
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
}): Promise<HeroPropertyData> {
  const [price, transit] = await Promise.all([
    fetchKommunePriceSeries(input.kommunenummer),
    fetchNearestTransit(input.lat, input.lon),
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
