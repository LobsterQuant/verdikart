import { NextRequest, NextResponse } from "next/server";

interface ComparableSalesResult {
  averagePricePerSqm: number | null;
  period: string;
}

export async function GET(request: NextRequest) {
  const kommunenummer = request.nextUrl.searchParams.get("kommunenummer");

  if (!kommunenummer) {
    return NextResponse.json({
      averagePricePerSqm: null,
      period: "",
    } satisfies ComparableSalesResult);
  }

  const body = {
    query: [
      {
        code: "Region",
        selection: { filter: "item", values: [kommunenummer] },
      },
      {
        code: "Boligtype",
        selection: { filter: "item", values: ["01"] }, // 01 = alle boliger
      },
      {
        code: "ContentsCode",
        selection: { filter: "item", values: ["KvPris"] },
      },
      {
        code: "Tid",
        selection: { filter: "top", values: ["3"] }, // last 3 years
      },
    ],
    response: { format: "json-stat2" },
  };

  try {
    const res = await fetch(
      "https://data.ssb.no/api/v0/no/table/06035/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      return NextResponse.json({
        averagePricePerSqm: null,
        period: "",
      } satisfies ComparableSalesResult);
    }

    const data = await res.json();

    const values: number[] = data.value ?? [];
    const timeDimension = data.dimension?.Tid;
    const quarterLabels: string[] = timeDimension
      ? (Object.values(timeDimension.category?.label ?? {}) as string[])
      : [];

    const validValues = values.filter((v) => v !== null && v !== 0);
    const averagePricePerSqm =
      validValues.length > 0
        ? Math.round(
            validValues.reduce((sum, v) => sum + v, 0) / validValues.length
          )
        : null;

    const period =
      quarterLabels.length > 0
        ? `${quarterLabels[0]} - ${quarterLabels[quarterLabels.length - 1]}`
        : "";

    return NextResponse.json({
      averagePricePerSqm,
      period,
    } satisfies ComparableSalesResult);
  } catch {
    return NextResponse.json({
      averagePricePerSqm: null,
      period: "",
    } satisfies ComparableSalesResult);
  }
}
