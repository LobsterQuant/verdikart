/**
 * Back-compat shim — exposes the old `BYKART_HEATMAP_DATA` interface backed
 * by the new per-city data files. Remove this file once BykartHeatmapLayer
 * switches to dynamic per-city imports.
 */
import {
  BYKART_HEATMAP_CITY as OSLO_CITY,
  type BykartHeatmapCell,
} from "./bykart-heatmap-oslo";
import type { WorkCenterId } from "@/lib/scoring/work-centers";

export type { BykartHeatmapCell };

export interface BykartHeatmapCity {
  radiusKm: number;
  cells: ReadonlyArray<BykartHeatmapCell>;
}

export interface BykartHeatmapData {
  generatedAt: string;
  h3Res: number;
  cities: Partial<Record<WorkCenterId, BykartHeatmapCity>>;
}

export const BYKART_HEATMAP_DATA: BykartHeatmapData = {
  generatedAt: OSLO_CITY.generatedAt,
  h3Res: OSLO_CITY.h3Res,
  cities: {
    oslo: { radiusKm: OSLO_CITY.radiusKm, cells: OSLO_CITY.cells },
  },
};
