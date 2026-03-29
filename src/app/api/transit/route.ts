import { NextRequest, NextResponse } from "next/server";

interface Leg {
  mode: string;
  from: string;
  to: string;
  duration?: number;
  line?: string;
}

interface TransitResult {
  durationMinutes: number | null;
  legs: Leg[];
}

export async function GET(request: NextRequest) {
  const fromLat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const fromLon = parseFloat(request.nextUrl.searchParams.get("lon") ?? "");

  if (isNaN(fromLat) || isNaN(fromLon)) {
    return NextResponse.json({ durationMinutes: null, legs: [] } satisfies TransitResult);
  }

  const query = `
{
  trip(
    from: { coordinates: { latitude: ${fromLat}, longitude: ${fromLon} } }
    to: { place: "NSR:StopPlace:59872" }
    numTripPatterns: 1
  ) {
    tripPatterns {
      duration
      legs {
        mode
        duration
        fromPlace { name }
        toPlace { name }
        line { publicCode }
      }
    }
  }
}`;

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
      }
    );

    if (!res.ok) {
      return NextResponse.json({ durationMinutes: null, legs: [] } satisfies TransitResult);
    }

    const data = await res.json();
    const patterns = data?.data?.trip?.tripPatterns;

    if (!patterns || patterns.length === 0) {
      return NextResponse.json({ durationMinutes: null, legs: [] } satisfies TransitResult);
    }

    const pattern = patterns[0];
    const durationSeconds: number = pattern.duration ?? 0;
    const durationMinutes = Math.round(durationSeconds / 60);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const legs: Leg[] = (pattern.legs ?? []).map((leg: any) => ({
      mode: leg.mode,
      from: leg.fromPlace?.name ?? "",
      to: leg.toPlace?.name ?? "",
      duration: leg.duration ? Math.round(leg.duration / 60) : undefined,
      line: leg.line?.publicCode ?? undefined,
    }));

    return NextResponse.json({ durationMinutes, legs } satisfies TransitResult);
  } catch {
    return NextResponse.json({ durationMinutes: null, legs: [] } satisfies TransitResult);
  }
}
