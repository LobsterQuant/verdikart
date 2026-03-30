import { NextRequest, NextResponse } from "next/server";

interface PriceTrendResult {
  quarters: string[];
  values: number[];
  yoyChange: number | null;
  source: "kommune" | "national";
}

const EMPTY: PriceTrendResult = {
  quarters: [],
  values: [],
  yoyChange: null,
  source: "national",
};

// SSB table 06035: municipality-level, annual, three housing types (01/02/03)
// Returns weighted-average kr/m² across all types by summing (price × transactions).
async function fetchKommuneData(kommunenummer: string): Promise<PriceTrendResult | null> {
  // Pad to 4 digits if needed (some sources return "301" for Oslo)
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
  });

  if (!res.ok) return null;

  const data = await res.json();
  const rawValues: (number | null)[] = data.value ?? [];
  if (!rawValues.length) return null;

  // Dimension order: Region × Boligtype × ContentsCode × Tid
  // With 1 region, 3 types, 2 contents, N years → shape [1, 3, 2, N]
  const timeDim = data.dimension?.Tid;
  const years: string[] = timeDim
    ? (Object.values(timeDim.category?.label ?? {}) as string[])
    : [];

  const N = years.length;
  if (!N) return null;

  // Layout: for each type t in [0,1,2], contents c in [0=KvPris, 1=Omsetninger], year y in [0..N-1]
  // flat index = t*(2*N) + c*N + y
  const weightedAvgByYear: number[] = [];

  for (let y = 0; y < N; y++) {
    let sumPriceXVol = 0;
    let sumVol = 0;
    for (let t = 0; t < 3; t++) {
      const priceIdx = t * (2 * N) + 0 * N + y;
      const volIdx   = t * (2 * N) + 1 * N + y;
      const price = rawValues[priceIdx];
      const vol   = rawValues[volIdx];
      if (price != null && vol != null && vol > 0) {
        sumPriceXVol += price * vol;
        sumVol += vol;
      }
    }
    weightedAvgByYear.push(sumVol > 0 ? Math.round(sumPriceXVol / sumVol) : 0);
  }

  // Drop years with 0 (insufficient data for this kommune)
  const validPairs = years
    .map((q, i) => ({ q, v: weightedAvgByYear[i] }))
    .filter((p) => p.v > 0);

  if (validPairs.length < 2) return null;

  const quarters = validPairs.map((p) => p.q);
  const values   = validPairs.map((p) => p.v);

  let yoyChange: number | null = null;
  if (values.length >= 2) {
    const cur  = values[values.length - 1];
    const prev = values[values.length - 2];
    if (prev > 0) yoyChange = parseFloat((((cur - prev) / prev) * 100).toFixed(1));
  }

  return { quarters, values, yoyChange, source: "kommune" };
}

// SSB table 07241: national quarterly data — fallback
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

  return { quarters, values, yoyChange, source: "national" };
}

export async function GET(request: NextRequest) {
  const kommunenummer = request.nextUrl.searchParams.get("kommunenummer") ?? "";

  if (!kommunenummer) {
    return NextResponse.json(EMPTY satisfies PriceTrendResult);
  }

  try {
    const kommuneData = await fetchKommuneData(kommunenummer);
    if (kommuneData) {
      return NextResponse.json(kommuneData satisfies PriceTrendResult);
    }
    // Fallback to national if kommune has insufficient data
    const national = await fetchNationalData();
    return NextResponse.json(national satisfies PriceTrendResult);
  } catch {
    return NextResponse.json(EMPTY satisfies PriceTrendResult);
  }
}
