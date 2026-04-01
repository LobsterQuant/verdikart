import { NextRequest, NextResponse } from "next/server";

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

// Oslo bydel price index relative to Oslo municipality average (=1.0)
// Source: Eiendom Norge / Finn.no markedsrapport 2024, kr/m² published data
// Oslo kommunesnitt 2024: ~97,979 kr/m² (SSB 06035)
// Indices derived from bydel reports: Frogner ~1.55, Grünerløkka ~1.10, etc.
const OSLO_BYDEL_INDEX: Record<string, { name: string; index: number }> = {
  // Sentrum / Indre Vest
  "0150": { name: "Sentrum",       index: 1.20 },
  "0151": { name: "Sentrum",       index: 1.20 },
  "0152": { name: "Sentrum",       index: 1.20 },
  "0153": { name: "Sentrum",       index: 1.20 },
  "0154": { name: "Sentrum",       index: 1.20 },
  "0155": { name: "Sentrum",       index: 1.20 },
  "0157": { name: "Sentrum",       index: 1.20 },
  "0158": { name: "Sentrum",       index: 1.20 },
  "0159": { name: "Sentrum",       index: 1.20 },
  // Frogner
  "0250": { name: "Frogner",       index: 1.55 },
  "0251": { name: "Frogner",       index: 1.55 },
  "0252": { name: "Frogner",       index: 1.55 },
  "0253": { name: "Frogner",       index: 1.55 },
  "0254": { name: "Frogner",       index: 1.55 },
  "0255": { name: "Frogner",       index: 1.55 },
  "0256": { name: "Frogner",       index: 1.55 },
  "0257": { name: "Frogner",       index: 1.55 },
  "0258": { name: "Frogner",       index: 1.55 },
  "0259": { name: "Frogner",       index: 1.55 },
  "0260": { name: "Frogner",       index: 1.55 },
  "0262": { name: "Frogner",       index: 1.55 },
  "0263": { name: "Frogner",       index: 1.55 },
  "0265": { name: "Frogner",       index: 1.55 },
  "0267": { name: "Frogner",       index: 1.55 },
  "0268": { name: "Frogner",       index: 1.55 },
  // Majorstuen / Ullern
  "0355": { name: "Majorstuen",    index: 1.45 },
  "0356": { name: "Majorstuen",    index: 1.45 },
  "0360": { name: "Majorstuen",    index: 1.45 },
  "0361": { name: "Majorstuen",    index: 1.45 },
  "0362": { name: "Majorstuen",    index: 1.45 },
  "0363": { name: "Majorstuen",    index: 1.45 },
  "0364": { name: "Majorstuen",    index: 1.45 },
  "0365": { name: "Majorstuen",    index: 1.45 },
  "0366": { name: "Majorstuen",    index: 1.45 },
  "0367": { name: "Majorstuen",    index: 1.45 },
  "0368": { name: "Majorstuen",    index: 1.45 },
  "0369": { name: "Majorstuen",    index: 1.45 },
  // Holmenkollen / Vestre Aker
  "0370": { name: "Holmenkollen",  index: 1.70 },
  "0373": { name: "Holmenkollen",  index: 1.70 },
  "0375": { name: "Holmenkollen",  index: 1.70 },
  "0376": { name: "Holmenkollen",  index: 1.70 },
  "0377": { name: "Holmenkollen",  index: 1.70 },
  "0378": { name: "Holmenkollen",  index: 1.70 },
  "0379": { name: "Holmenkollen",  index: 1.70 },
  "0380": { name: "Holmenkollen",  index: 1.70 },
  "0381": { name: "Holmenkollen",  index: 1.70 },
  "0383": { name: "Holmenkollen",  index: 1.70 },
  "0385": { name: "Holmenkollen",  index: 1.70 },
  "0387": { name: "Holmenkollen",  index: 1.70 },
  // Nordre Aker / Nordberg
  "0456": { name: "Nordre Aker",   index: 1.20 },
  "0460": { name: "Nordre Aker",   index: 1.20 },
  "0461": { name: "Nordre Aker",   index: 1.20 },
  "0462": { name: "Nordre Aker",   index: 1.20 },
  "0463": { name: "Nordre Aker",   index: 1.20 },
  "0464": { name: "Nordre Aker",   index: 1.20 },
  "0465": { name: "Nordre Aker",   index: 1.20 },
  "0467": { name: "Nordre Aker",   index: 1.20 },
  "0468": { name: "Nordre Aker",   index: 1.20 },
  // Grünerløkka
  "0171": { name: "Grünerløkka",   index: 1.10 },
  "0172": { name: "Grünerløkka",   index: 1.10 },
  "0173": { name: "Grünerløkka",   index: 1.10 },
  "0174": { name: "Grünerløkka",   index: 1.10 },
  "0175": { name: "Grünerløkka",   index: 1.10 },
  "0176": { name: "Grünerløkka",   index: 1.10 },
  "0177": { name: "Grünerløkka",   index: 1.10 },
  "0178": { name: "Grünerløkka",   index: 1.10 },
  "0179": { name: "Grünerløkka",   index: 1.10 },
  "0183": { name: "Grünerløkka",   index: 1.10 },
  "0187": { name: "Grünerløkka",   index: 1.10 },
  "0188": { name: "Grünerløkka",   index: 1.10 },
  // St. Hanshaugen
  "0165": { name: "St. Hanshaugen",index: 1.15 },
  "0166": { name: "St. Hanshaugen",index: 1.15 },
  "0167": { name: "St. Hanshaugen",index: 1.15 },
  "0168": { name: "St. Hanshaugen",index: 1.15 },
  "0169": { name: "St. Hanshaugen",index: 1.15 },
  "0170": { name: "St. Hanshaugen",index: 1.15 },
  "0182": { name: "St. Hanshaugen",index: 1.15 },
  // Sagene
  "0160": { name: "Sagene",        index: 1.05 },
  "0163": { name: "Sagene",        index: 1.05 },
  "0164": { name: "Sagene",        index: 1.05 },
  "0180": { name: "Sagene",        index: 1.05 },
  "0181": { name: "Sagene",        index: 1.05 },
  // Gamle Oslo
  "0190": { name: "Gamle Oslo",    index: 0.95 },
  "0191": { name: "Gamle Oslo",    index: 0.95 },
  "0192": { name: "Gamle Oslo",    index: 0.95 },
  "0193": { name: "Gamle Oslo",    index: 0.95 },
  "0194": { name: "Gamle Oslo",    index: 0.95 },
  "0195": { name: "Gamle Oslo",    index: 0.95 },
  "0196": { name: "Gamle Oslo",    index: 0.95 },
  "0197": { name: "Gamle Oslo",    index: 0.95 },
  "0198": { name: "Gamle Oslo",    index: 0.95 },
  // Søndre Nordstrand / Søndre Aker
  "1109": { name: "Søndre Nordstrand", index: 0.68 },
  "1112": { name: "Søndre Nordstrand", index: 0.68 },
  "1152": { name: "Søndre Nordstrand", index: 0.68 },
  "1153": { name: "Søndre Nordstrand", index: 0.68 },
  "1158": { name: "Søndre Nordstrand", index: 0.68 },
  "1163": { name: "Søndre Nordstrand", index: 0.68 },
  "1164": { name: "Søndre Nordstrand", index: 0.68 },
  "1166": { name: "Søndre Nordstrand", index: 0.68 },
  "1169": { name: "Søndre Nordstrand", index: 0.68 },
  // Stovner / Alna / Grorud (Øst)
  "0950": { name: "Bjerke",        index: 0.78 },
  "0951": { name: "Bjerke",        index: 0.78 },
  "0953": { name: "Bjerke",        index: 0.78 },
  "0955": { name: "Bjerke",        index: 0.78 },
  "0958": { name: "Bjerke",        index: 0.78 },
  "0960": { name: "Grorud",        index: 0.72 },
  "0963": { name: "Grorud",        index: 0.72 },
  "0970": { name: "Stovner",       index: 0.70 },
  "0971": { name: "Stovner",       index: 0.70 },
  "0972": { name: "Stovner",       index: 0.70 },
  "0975": { name: "Stovner",       index: 0.70 },
  "0976": { name: "Stovner",       index: 0.70 },
  "0977": { name: "Stovner",       index: 0.70 },
  "0978": { name: "Stovner",       index: 0.70 },
  "0980": { name: "Alna",          index: 0.73 },
  "0981": { name: "Alna",          index: 0.73 },
  "0982": { name: "Alna",          index: 0.73 },
  "0983": { name: "Alna",          index: 0.73 },
  "0984": { name: "Alna",          index: 0.73 },
  "0985": { name: "Alna",          index: 0.73 },
  "0986": { name: "Alna",          index: 0.73 },
  "0987": { name: "Alna",          index: 0.73 },
  "0988": { name: "Alna",          index: 0.73 },
  // Østensjø / Nordstrand
  "0658": { name: "Østensjø",      index: 0.90 },
  "0661": { name: "Østensjø",      index: 0.90 },
  "0663": { name: "Østensjø",      index: 0.90 },
  "0664": { name: "Østensjø",      index: 0.90 },
  "0666": { name: "Østensjø",      index: 0.90 },
  "0667": { name: "Østensjø",      index: 0.90 },
  "0668": { name: "Østensjø",      index: 0.90 },
  "0670": { name: "Østensjø",      index: 0.90 },
  "0671": { name: "Østensjø",      index: 0.90 },
  "0672": { name: "Østensjø",      index: 0.90 },
  "0673": { name: "Østensjø",      index: 0.90 },
  "0674": { name: "Østensjø",      index: 0.90 },
  "0750": { name: "Nordstrand",    index: 1.00 },
  "0752": { name: "Nordstrand",    index: 1.00 },
  "0753": { name: "Nordstrand",    index: 1.00 },
  "0754": { name: "Nordstrand",    index: 1.00 },
  "0756": { name: "Nordstrand",    index: 1.00 },
  "0757": { name: "Nordstrand",    index: 1.00 },
  "0760": { name: "Nordstrand",    index: 1.00 },
  "0763": { name: "Nordstrand",    index: 1.00 },
  "0764": { name: "Nordstrand",    index: 1.00 },
  "0770": { name: "Nordstrand",    index: 1.00 },
  // Ullern
  "0270": { name: "Ullern",        index: 1.35 },
  "0271": { name: "Ullern",        index: 1.35 },
  "0273": { name: "Ullern",        index: 1.35 },
  "0274": { name: "Ullern",        index: 1.35 },
  "0275": { name: "Ullern",        index: 1.35 },
  "0276": { name: "Ullern",        index: 1.35 },
  "0277": { name: "Ullern",        index: 1.35 },
  "0278": { name: "Ullern",        index: 1.35 },
  "0280": { name: "Ullern",        index: 1.35 },
  "0281": { name: "Ullern",        index: 1.35 },
  "0282": { name: "Ullern",        index: 1.35 },
  "0283": { name: "Ullern",        index: 1.35 },
  "0284": { name: "Ullern",        index: 1.35 },
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

export async function GET(request: NextRequest) {
  const kommunenummer = request.nextUrl.searchParams.get("kommunenummer") ?? "";
  const postnummer    = request.nextUrl.searchParams.get("postnummer") ?? "";

  if (!kommunenummer) {
    return NextResponse.json(EMPTY satisfies PriceTrendResult);
  }

  try {
    const kommuneData = await fetchKommuneData(kommunenummer);
    if (!kommuneData) {
      const national = await fetchNationalData();
      return NextResponse.json(national satisfies PriceTrendResult);
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
        return NextResponse.json({
          quarters: kommuneData.quarters,
          values: adjustedValues,
          yoyChange,
          source: "bydel",
          sourceLabel: bydel.name,
          lastUpdated: kommuneData.quarters[kommuneData.quarters.length - 1] ?? null,
        } satisfies PriceTrendResult);
      }
    }

    // For other municipalities: return commune data with name label
    kommuneData.sourceLabel = "Kommunesnitt";
    return NextResponse.json(kommuneData satisfies PriceTrendResult);
  } catch (err) {
    console.error("[price-trend] SSB fetch failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(EMPTY satisfies PriceTrendResult);
  }
}
