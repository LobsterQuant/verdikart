import { NextRequest, NextResponse } from "next/server";

interface PriceTrendResult {
  quarters: string[];
  values: number[];
  yoyChange: number | null;
}

export async function GET(request: NextRequest) {
  const kommunenummer = request.nextUrl.searchParams.get("kommunenummer");

  if (!kommunenummer) {
    return NextResponse.json({ quarters: [], values: [], yoyChange: null } satisfies PriceTrendResult);
  }

  // Table 07241 has no Region dimension — shows national quarterly trend
  // Use table 06035 for municipality-level but it's annual only
  // For trend chart: use national quarterly data from 07241
  const body = {
    query: [
      {
        code: "Boligtype",
        selection: { filter: "item", values: ["00"] }, // alle boliger
      },
      {
        code: "ContentsCode",
        selection: { filter: "item", values: ["KvPris"] },
      },
      {
        code: "Tid",
        selection: { filter: "top", values: ["8"] }, // last 8 quarters
      },
    ],
    response: { format: "json-stat2" },
  };

  try {
    const res = await fetch(
      "https://data.ssb.no/api/v0/no/table/07241/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ quarters: [], values: [], yoyChange: null } satisfies PriceTrendResult);
    }

    const data = await res.json();

    const timeDimension = data.dimension?.Tid;
    const quarters: string[] = timeDimension
      ? Object.values(timeDimension.category?.label ?? {}) as string[]
      : [];

    const values: number[] = data.value ?? [];

    let yoyChange: number | null = null;
    if (values.length >= 5) {
      const current = values[values.length - 1];
      const yearAgo = values[values.length - 5];
      if (yearAgo && yearAgo !== 0) {
        yoyChange = parseFloat(
          (((current - yearAgo) / yearAgo) * 100).toFixed(1)
        );
      }
    }

    return NextResponse.json({ quarters, values, yoyChange } satisfies PriceTrendResult);
  } catch {
    return NextResponse.json({ quarters: [], values: [], yoyChange: null } satisfies PriceTrendResult);
  }
}
