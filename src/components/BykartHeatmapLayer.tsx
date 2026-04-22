// NOTE: must only be imported via next/dynamic with ssr: false — it pulls in
// react-leaflet and lazy-loads a per-city data chunk (~30–110 kB gzipped each).
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Polygon, Tooltip } from "react-leaflet";
import type { WorkCenterId } from "@/lib/scoring/work-centers";
import { heatmapColor, HEATMAP_FILL_OPACITY } from "@/lib/heatmapColor";

interface BykartHeatmapCell {
  h3: string;
  lat: number;
  lon: number;
  score: number;
  boundary: ReadonlyArray<readonly [number, number]>;
}

// Explicit switch — webpack statically detects each import() call and emits
// one chunk per city. A template-literal import would work at runtime but
// opts out of that guarantee.
async function loadCityCells(
  city: WorkCenterId,
): Promise<ReadonlyArray<BykartHeatmapCell>> {
  switch (city) {
    case "oslo":
      return (await import("@/data/bykart-heatmap-oslo")).BYKART_HEATMAP_CITY
        .cells;
    case "bergen":
      return (await import("@/data/bykart-heatmap-bergen")).BYKART_HEATMAP_CITY
        .cells;
    case "trondheim":
      return (await import("@/data/bykart-heatmap-trondheim"))
        .BYKART_HEATMAP_CITY.cells;
    case "stavanger":
      return (await import("@/data/bykart-heatmap-stavanger"))
        .BYKART_HEATMAP_CITY.cells;
    case "kristiansand":
      return (await import("@/data/bykart-heatmap-kristiansand"))
        .BYKART_HEATMAP_CITY.cells;
    case "tromso":
      return (await import("@/data/bykart-heatmap-tromso")).BYKART_HEATMAP_CITY
        .cells;
  }
}

interface Props {
  city: WorkCenterId;
}

export default function BykartHeatmapLayer({ city }: Props) {
  const router = useRouter();
  const [cells, setCells] = useState<ReadonlyArray<BykartHeatmapCell>>([]);

  useEffect(() => {
    let cancelled = false;
    setCells([]);
    loadCityCells(city).then((next) => {
      if (!cancelled) setCells(next);
    });
    return () => {
      cancelled = true;
    };
  }, [city]);

  return (
    <>
      {cells.map((cell) => (
        <Polygon
          key={cell.h3}
          positions={cell.boundary as Array<[number, number]>}
          pathOptions={{
            color: heatmapColor(cell.score),
            weight: 0,
            fillColor: heatmapColor(cell.score),
            fillOpacity: HEATMAP_FILL_OPACITY,
          }}
          eventHandlers={{
            click: () => router.push("/pendlings-poeng"),
          }}
        >
          <Tooltip direction="top" offset={[0, -2]} opacity={1} sticky>
            <span style={{ color: "#111", fontWeight: 600 }}>
              Pendlings-poeng {cell.score}/100
            </span>
          </Tooltip>
        </Polygon>
      ))}
    </>
  );
}
