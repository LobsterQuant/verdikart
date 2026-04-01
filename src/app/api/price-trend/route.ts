import { NextRequest, NextResponse } from "next/server";
import { OSLO_BYDEL_INDEX } from "@/lib/oslo-bydeler";
import { cachedFetch, TTL } from "@/lib/cache";

interface PriceTrendResult {
  quarters: string[];
  values: number[];
  yoyChange: number | null;
  source: "bydel" | "kommune" | "national";
  sourceLabel: string;
  lastUpdated: string | null;
}

const EMPTY: PriceTrendResult = {
  quarters: [],
  values: [],
  yoyChange: null,
  source: "national",
  sourceLabel: "Nasjonalt snitt",
  lastUpdated: null,
};

// SSB table 06035: municipality-level, annual, three housing types
async function fetchKommuneData(kommunenummer: string): Promise<PriceTrendResult | null> {
  const knr = kommunenummer.padStart(4, "0");

  const body = {
    query: [
      { code: "Region",       selection: { filter: "item",   values: [knr] } },
      { code: "Boligtype",    selection: { filter: "item",   values: ["01", "02", "03"] } },
      { code: "ContentsCode", selection: { filter: "item",   values: ["KvPris", "Omsetninger"] } },
      { code: "Tid",          selection: { filter: "top",    values: ["8"] } },
    ],
    response: { format: "json-stat2" },
  };

  const res = await fetch("https://data.ssb.no/api/v0/no/table/06035/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const rawValues: (number | null)[] = data.value ?? [];
  if (!rawValues.length) return null;

  const timeDim = data.dimension?.Tid;
  const years: string[] = timeDim
    ? (Object.values(timeDim.category?.label ?? {}) as string[])
    : [];

  const N = years.length;
  if (!N) return null;

  const weightedAvgByYear: number[] = [];
  for (let y = 0; y < N; y++) {
    let sumPriceXVol = 0, sumVol = 0;
    for (let t = 0; t < 3; t++) {
      const price = rawValues[t * (2 * N) + 0 * N + y];
      const vol   = rawValues[t * (2 * N) + 1 * N + y];
      if (price != null && vol != null && vol > 0) {
        sumPriceXVol += price * vol;
        sumVol += vol;
      }
    }
    weightedAvgByYear.push(sumVol > 0 ? Math.round(sumPriceXVol / sumVol) : 0);
  }

  const validPairs = years
    .map((q, i) => ({ q, v: weightedAvgByYear[i] }))
    .filter((p) => p.v > 0);

  if (validPairs.length < 2) return null;

  const quarters = validPairs.map((p) => p.q);
  const values   = validPairs.map((p) => p.v);

  let yoyChange: number | null = null;
  if (values.length >= 2) {
    const cur = values[values.length - 1], prev = values[values.length - 2];
    if (prev > 0) yoyChange = parseFloat((((cur - prev) / prev) * 100).toFixed(1));
  }

  return { quarters, values, yoyChange, source: "kommune", sourceLabel: "", lastUpdated: quarters[quarters.length - 1] ?? null };
}

async function fetchNationalData(): Promise<PriceTrendResult> {
  const body = {
    query: [
      { code: "Boligtype",    selection: { filter: "item", values: ["00"] } },
      { code: "ContentsCode", selection: { filter: "item", values: ["KvPris"] } },
      { code: "Tid",          selection: { filter: "top",  values: ["8"] } },
    ],
    response: { format: "json-stat2" },
  };

  const res = await fetch("https://data.ssb.no/api/v0/no/table/07241/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return EMPTY;

  const data = await res.json();
  const timeDimension = data.dimension?.Tid;
  const quarters: string[] = timeDimension
    ? (Object.values(timeDimension.category?.label ?? {}) as string[])
    : [];
  const values: number[] = (data.value ?? []).map((v: number | null) => v ?? 0);

  let yoyChange: number | null = null;
  if (values.length >= 5) {
    const current = values[values.length - 1];
    const yearAgo = values[values.length - 5];
    if (yearAgo > 0) yoyChange = parseFloat((((current - yearAgo) / yearAgo) * 100).toFixed(1));
  }

  return { quarters, values, yoyChange, source: "national", sourceLabel: "Nasjonalt snitt", lastUpdated: quarters[quarters.length - 1] ?? null };
}

async function fetchPriceTrend(kommunenummer: string, postnummer: string): Promise<PriceTrendResult> {
  const kommuneData = await fetchKommuneData(kommunenummer);
  if (!kommuneData) {
    return fetchNationalData();
  }

  // For Oslo (0301): apply bydel index if postnummer is known
  const knr = kommunenummer.padStart(4, "0");
  if (knr === "0301" && postnummer) {
    const bydel = OSLO_BYDEL_INDEX[postnummer];
    if (bydel) {
      const adjustedValues = kommuneData.values.map((v) =>
        Math.round(v * bydel.index)
      );
      let yoyChange: number | null = null;
      if (adjustedValues.length >= 2) {
        const cur = adjustedValues[adjustedValues.length - 1];
        const prev = adjustedValues[adjustedValues.length - 2];
        if (prev > 0) yoyChange = parseFloat((((cur - prev) / prev) * 100).toFixed(1));
      }
      return {
        quarters: kommuneData.quarters,
        values: adjustedValues,
        yoyChange,
        source: "bydel",
        sourceLabel: bydel.name,
        lastUpdated: kommuneData.quarters[kommuneData.quarters.length - 1] ?? null,
      };
    }
  }

  kommuneData.sourceLabel = "Kommunesnitt";
  return kommuneData;
}

export async function GET(request: NextRequest) {
  const kommunenummer = request.nextUrl.searchParams.get("kommunenummer") ?? "";
  const postnummer    = request.nextUrl.searchParams.get("postnummer") ?? "";

  if (!kommunenummer) {
    return NextResponse.json(EMPTY satisfies PriceTrendResult);
  }

  try {
    const key = `vk:price:${kommunenummer}-${postnummer}`;
    const result = await cachedFetch(key, TTL.ONE_DAY, () => fetchPriceTrend(kommunenummer, postnummer));
    return NextResponse.json(result);
  } catch (err) {
    console.error("[price-trend] SSB fetch failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(EMPTY satisfies PriceTrendResult);
  }
}
