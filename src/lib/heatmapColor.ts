/**
 * Discrete colour scale for the /bykart Pendlings-poeng heatmap overlay.
 * Five buckets matching the product spec for PR 4 of the Pendlings-poeng
 * series. Keep these in sync with the legend copy in CityOverviewMapInner.
 */

export interface HeatmapBucket {
  min: number;
  max: number;
  color: string;
  label: string;
}

export const HEATMAP_BUCKETS: ReadonlyArray<HeatmapBucket> = [
  { min: 85, max: 100, color: "#15803d", label: "85-100" },
  { min: 70, max: 84,  color: "#14b8a6", label: "70-84"  },
  { min: 55, max: 69,  color: "#facc15", label: "55-69"  },
  { min: 35, max: 54,  color: "#fb923c", label: "35-54"  },
  { min: 0,  max: 34,  color: "#ef4444", label: "0-34"   },
];

export function heatmapColor(score: number): string {
  for (const b of HEATMAP_BUCKETS) {
    if (score >= b.min && score <= b.max) return b.color;
  }
  return HEATMAP_BUCKETS[HEATMAP_BUCKETS.length - 1].color;
}

export const HEATMAP_FILL_OPACITY = 0.55;
