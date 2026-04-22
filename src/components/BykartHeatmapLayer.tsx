// NOTE: must only be imported via next/dynamic with ssr: false — it pulls in
// react-leaflet and the ~605 kB pre-computed heatmap data file.
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Polygon, Tooltip } from "react-leaflet";
import { BYKART_HEATMAP_DATA } from "@/data/bykart-heatmap-data";
import type { WorkCenterId } from "@/lib/scoring/work-centers";
import { heatmapColor, HEATMAP_FILL_OPACITY } from "@/lib/heatmapColor";

interface Props {
  city: WorkCenterId;
}

export default function BykartHeatmapLayer({ city }: Props) {
  const router = useRouter();
  const cells = useMemo(() => {
    const c = BYKART_HEATMAP_DATA.cities[city];
    return c?.cells ?? [];
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
