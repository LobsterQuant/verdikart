import { SsbJsonStat2Schema, parseUpstream } from "@/lib/schemas";

export interface KommunePriceIndex {
  // Volume-weighted kr/m² across the three SSB housing types for the latest year.
  value: number;
  // Human-readable kommune label, cleaned of SSB suffixes like "(-2019)".
  kommuneName: string;
  // SSB period string (e.g. "2024").
  period: string;
}

// SSB table 06035: municipality-level, annual, three housing types.
// Volume-weighted average across types for the most recent year.
export async function fetchKommunePriceIndex(
  kommunenummer: string,
): Promise<KommunePriceIndex | null> {
  const knr = kommunenummer.padStart(4, "0");

  const body = {
    query: [
      { code: "Region", selection: { filter: "item", values: [knr] } },
      { code: "Boligtype", selection: { filter: "item", values: ["01", "02", "03"] } },
      { code: "ContentsCode", selection: { filter: "item", values: ["KvPris", "Omsetninger"] } },
      { code: "Tid", selection: { filter: "top", values: ["1"] } },
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

  const raw = await res.json();
  const data = parseUpstream("ssb-06035", SsbJsonStat2Schema, raw);
  if (!data) return null;

  const rawValues: (number | null)[] = data.value ?? [];
  if (rawValues.length < 6) return null;

  // Layout: [type × (price, txns)] for the single year we requested.
  let sumPriceXVol = 0;
  let sumVol = 0;
  for (let t = 0; t < 3; t++) {
    const price = rawValues[t * 2 + 0];
    const vol = rawValues[t * 2 + 1];
    if (price != null && vol != null && vol > 0) {
      sumPriceXVol += price * vol;
      sumVol += vol;
    }
  }
  if (sumVol <= 0) return null;
  const value = Math.round(sumPriceXVol / sumVol);

  const period = (Object.values(data.dimension?.Tid?.category?.label ?? {})[0] as string) ?? "";

  const rawKommuneName =
    (Object.values(data.dimension?.Region?.category?.label ?? {})[0] as string) ?? "";
  const kommuneName = rawKommuneName
    .replace(/\s*\([^)]*\)\s*/g, "")
    .replace(/\s*-\s*.+$/, "")
    .trim();

  return { value, kommuneName, period };
}
