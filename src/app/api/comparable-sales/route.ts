import { NextRequest, NextResponse } from "next/server";
import { cachedFetch, TTL } from "@/lib/cache";

export interface HousingTypeRow {
  type: string;       // "Eneboliger" | "Småhus" | "Blokkleiligheter"
  pricePerSqm: number;
  transactions: number;
}

export interface ComparableSalesResult {
  kommuneAvg: number | null;       // weighted average across all types
  totalTransactions: number | null;
  byType: HousingTypeRow[];
  period: string;
  kommuneName: string;
}

const EMPTY: ComparableSalesResult = {
  kommuneAvg: null,
  totalTransactions: null,
  byType: [],
  period: "",
  kommuneName: "",
};

// Boligtype 01=Eneboliger 02=Småhus 03=Blokkleiligheter
const TYPES: Record<string, string> = {
  "01": "Eneboliger",
  "02": "Småhus",
  "03": "Blokkleiligheter",
};

async function fetchComparableSales(knr: string): Promise<ComparableSalesResult> {
  const body = {
    query: [
      { code: "Region",       selection: { filter: "item", values: [knr] } },
      { code: "Boligtype",    selection: { filter: "item", values: ["01", "02", "03"] } },
      { code: "ContentsCode", selection: { filter: "item", values: ["KvPris", "Omsetninger"] } },
      { code: "Tid",          selection: { filter: "top",  values: ["1"] } }, // latest year only
    ],
    response: { format: "json-stat2" },
  };

  try {
    const res = await fetch("https://data.ssb.no/api/v0/no/table/06035/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return EMPTY;

    const data = await res.json();
    const rawValues: (number | null)[] = data.value ?? [];

    // Dimension order: Boligtype(3) × ContentsCode(2) × Tid(1)
    // idx = btIdx*2 + ccIdx  (Tid has 1 slot)
    // KvPris=idx0, Omsetninger=idx1 per boligtype
    const byType: HousingTypeRow[] = [];
    const btCodes = ["01", "02", "03"];

    for (let i = 0; i < btCodes.length; i++) {
      const price = rawValues[i * 2 + 0];
      const txns  = rawValues[i * 2 + 1];
      if (price != null && price > 0) {
        byType.push({
          type: TYPES[btCodes[i]],
          pricePerSqm: Math.round(price),
          transactions: txns ?? 0,
        });
      }
    }

    if (byType.length === 0) return EMPTY;

    // Weighted average
    const totalTxns = byType.reduce((s, r) => s + r.transactions, 0);
    const kommuneAvg = totalTxns > 0
      ? Math.round(byType.reduce((s, r) => s + r.pricePerSqm * r.transactions, 0) / totalTxns)
      : Math.round(byType.reduce((s, r) => s + r.pricePerSqm, 0) / byType.length);

    const rawPeriod = Object.values(
      data.dimension?.Tid?.category?.label ?? {}
    ).join("");
    // Format as "Årsgjennomsnitt 2024" — SSB table 06035 is annual, not quarterly
    const period = rawPeriod ? `Årsgjennomsnitt ${rawPeriod}` : "";

    // Kommune name from dimension label
    const kommuneName = Object.values(
      data.dimension?.Region?.category?.label ?? {}
    )[0] as string ?? "";

    return {
      kommuneAvg,
      totalTransactions: totalTxns || null,
      byType,
      period,
      kommuneName,
    };
  } catch (err) {
    console.error("[comparable-sales] SSB fetch failed:", err instanceof Error ? err.message : err);
    return EMPTY;
  }
}

export async function GET(request: NextRequest) {
  const kommunenummer = request.nextUrl.searchParams.get("kommunenummer");
  if (!kommunenummer) return NextResponse.json(EMPTY);

  const knr = kommunenummer.padStart(4, "0");
  const key = `vk:comparable:${knr}`;
  const result = await cachedFetch(key, TTL.ONE_DAY, () => fetchComparableSales(knr));
  return NextResponse.json(result);
}
