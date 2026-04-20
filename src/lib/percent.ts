/**
 * Round a percentage for CSS width/inline-style use. Raw floating-point
 * ratios (`data.childrenPct / 35 * 100` → `87.12500000000001`) leak into
 * SSR HTML and look broken in view-source.
 */
export function roundBarWidth(percent: number): number {
  if (!Number.isFinite(percent)) return 0;
  return Math.round(percent * 10) / 10;
}
