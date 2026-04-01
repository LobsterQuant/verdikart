import { NextRequest, NextResponse } from "next/server";

interface LineInfo {
  code: string;
  mode: string;
}

export interface StopResult {
  name: string;
  distance: number;
  lines: LineInfo[];
  departuresPerHour: number;
}

const MODE_PRIORITY: Record<string, number> = {
  metro: 0,
  rail: 1,
  tram: 2,
  bus: 3,
  water: 4,
  air: 5,
};

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lon = request.nextUrl.searchParams.get("lon");

  if (!lat || !lon) return NextResponse.json([]);

  const query = `{
    nearest(
      latitude: ${lat}
      longitude: ${lon}
      maximumDistance: 600
      maximumResults: 5
      filterByPlaceTypes: [stopPlace]
    ) {
      edges {
        node {
          distance
          place {
            id
            ... on StopPlace {
              name
              transportMode
              estimatedCalls(timeRange: 3600 numberOfDepartures: 60) {
                serviceJourney {
                  line { publicCode transportMode }
                }
              }
            }
          }
        }
      }
    }
  }`;

  try {
    const res = await fetch("https://api.entur.io/journey-planner/v3/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ET-Client-Name": "verdikart-mvp",
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return NextResponse.json([]);

    const data = await res.json();
    const edges: {
      node: {
        distance: number;
        place: {
          name?: string;
          transportMode?: string;
          estimatedCalls?: { serviceJourney?: { line?: { publicCode?: string; transportMode?: string } } }[];
        };
      };
    }[] = data?.data?.nearest?.edges ?? [];

    const stops: StopResult[] = edges
      .map(({ node }) => {
        const calls = node.place.estimatedCalls ?? [];

        // Unique lines (deduplicated by code)
        const lineMap = new Map<string, LineInfo>();
        for (const call of calls) {
          const line = call.serviceJourney?.line;
          if (line?.publicCode) {
            lineMap.set(line.publicCode, {
              code: line.publicCode,
              mode: line.transportMode ?? node.place.transportMode ?? "bus",
            });
          }
        }

        // Sort lines: metro first, then rail, tram, bus; then numerically
        const lines = Array.from(lineMap.values()).sort((a, b) => {
          const pa = MODE_PRIORITY[a.mode] ?? 9;
          const pb = MODE_PRIORITY[b.mode] ?? 9;
          if (pa !== pb) return pa - pb;
          return a.code.localeCompare(b.code, "no", { numeric: true });
        });

        return {
          name: node.place.name ?? "",
          distance: Math.round(node.distance),
          lines,
          departuresPerHour: calls.length,
        };
      })
      .filter((s) => s.name && s.departuresPerHour > 0); // drop stops with no live data

    return NextResponse.json(stops satisfies StopResult[]);
  } catch (err) {
    console.error("[transit/stops] Entur stops fetch failed:", err instanceof Error ? err.message : err);
    return NextResponse.json([]);
  }
}
