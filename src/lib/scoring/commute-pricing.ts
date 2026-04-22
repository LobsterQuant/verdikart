/**
 * Monthly-card (månedskort / 30-dagersbillett) prices for the 6 Pendlings-poeng
 * work centers, as of 2026-04.
 *
 * All 6 operators cut fares substantially in early 2026 on the back of state
 * co-funding (Jernbanedirektoratet tilskuddsordning). Prices verified via
 * operator homepages and 2026 press releases. Ruter Sone 1 drops further on
 * 2026-05-03 (805 → 655) — refresh this file after that date.
 *
 * Sources:
 *   - Ruter  https://ruter.no (Nye priser fra 25. januar 2026)
 *   - Skyss  https://www.skyss.no (Nye priser fra 1. februar 2026)
 *   - AtB    https://www.atb.no (1. januar 2026)
 *   - Kolumbus https://www.kolumbus.no (Justerte billettpriser april 2026)
 *   - AKT    https://www.akt.no (Prisjustering 1. februar 2026)
 *   - Svipper https://svipper.no (Troms fylkeskommune, not verified — estimate)
 *
 * The operator's "zone" concept is approximated by straight-line distance from
 * origin to center. Thresholds are tuned per operator against their own zone
 * geometry. This is a proxy — real routes through multiple zones may cost more.
 */
import type { PricingOperator } from "./work-centers";

/**
 * Price per zone-count for the operator's 30-day adult ticket.
 * Index 0 = within-city (1 zone), index 1 = 2 zones, etc.
 * The last entry is used for any higher zone count.
 */
interface OperatorPricing {
  operator: PricingOperator;
  /** NOK per additional zone step, smallest-to-largest. */
  prices: ReadonlyArray<number>;
  /**
   * Straight-line km thresholds from origin to center that bump to the NEXT
   * zone tier. Length = prices.length - 1.
   * Example: [5, 15, 30] with prices [900, 1200, 1580, 2000] means:
   *   d ≤ 5   → 900      (1 zone)
   *   5 < d ≤ 15  → 1200 (2 zones)
   *   15 < d ≤ 30 → 1580 (3 zones)
   *   d > 30  → 2000     (4+ zones)
   */
  zoneKmThresholds: ReadonlyArray<number>;
}

const PRICING: Record<PricingOperator, OperatorPricing> = {
  // Ruter (Oslo + Akershus). 2026-01-25: Sone 1 = 805, each extra zone adds
  // 214 NOK (1019 − 805). Extrapolated upward. Maksimum = alle soner ~ 2000.
  ruter: {
    operator: "ruter",
    prices: [805, 1019, 1233, 1447, 1661, 2000],
    zoneKmThresholds: [7, 18, 35, 60, 90],
  },
  // Skyss (Vestland). 2026-02-01 massive cut — 1 zone 422, hele Vestland
  // estimated ~1200 (not verified beyond 1 zone).
  skyss: {
    operator: "skyss",
    prices: [422, 720, 1200],
    zoneKmThresholds: [10, 40],
  },
  // AtB (Trøndelag). 2026-01-01: 959 per 1 zone, higher zones estimated.
  atb: {
    operator: "atb",
    prices: [959, 1200, 1560],
    zoneKmThresholds: [10, 35],
  },
  // Kolumbus (Rogaland). 2026-04-10 flat-rate "reis som du vil" = 300 NOK
  // across the whole fylke. Single tier.
  kolumbus: {
    operator: "kolumbus",
    prices: [300],
    zoneKmThresholds: [],
  },
  // Svipper (Troms fylkeskommune). 2026 prices NOT verified against operator
  // page — estimated at 720 base / 1120 regional. Refresh when verified.
  svipper: {
    operator: "svipper",
    prices: [720, 1120],
    zoneKmThresholds: [15],
  },
  // AKT (Agder). 2026-02-01: Kristiansand-området 336, regionalt estimated ~900.
  akt: {
    operator: "akt",
    prices: [336, 900],
    zoneKmThresholds: [15],
  },
};

/**
 * Given straight-line km from origin to center, return the monthly-card price
 * for the operator's estimated zone count.
 */
export function estimateMonthlyPriceNok(
  operator: PricingOperator,
  straightLineKm: number,
): number {
  const cfg = PRICING[operator];
  let tierIndex = 0;
  for (const threshold of cfg.zoneKmThresholds) {
    if (straightLineKm <= threshold) break;
    tierIndex += 1;
  }
  return cfg.prices[Math.min(tierIndex, cfg.prices.length - 1)];
}

/** Exposed for tests. */
export function getOperatorPricing(operator: PricingOperator): OperatorPricing {
  return PRICING[operator];
}
