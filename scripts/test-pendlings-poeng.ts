/**
 * Pendlings-poeng calibration script — runs the scoring engine against 6 known
 * addresses across the country and prints each component breakdown so we can
 * eyeball whether the weights and thresholds produce intuitively-correct
 * numbers. Companion to src/lib/scoring/pendlings-poeng.ts (PR 1 of 4).
 *
 * Data source: Entur Journey Planner v3 (public, no auth).
 * Rate limit: ~60 req/min; this script makes ~12 requests (2 per address).
 *
 * Required env vars: NONE.
 *
 * How to run:
 *   npx tsx scripts/test-pendlings-poeng.ts
 *
 * Expected output:
 *   For each of 6 addresses: the work center chosen, raw component values,
 *   per-component sub-scores, and the composite total. Exits 0 if all 6 fall
 *   within expected ranges; 1 if any case misses by > 10 points (flags a
 *   calibration issue that should be addressed before merging).
 *
 * Manual smoke-test / calibration check. Not part of CI.
 */

import {
  calculatePendlingsPoeng,
  type PendlingsPoengResult,
} from "../src/lib/scoring/pendlings-poeng";

interface CalibrationCase {
  label: string;
  lat: number;
  lon: number;
  kommunenummer?: string;
  expectedMin: number;
  expectedMax: number;
}

const CASES: ReadonlyArray<CalibrationCase> = [
  {
    label: "Karl Johans gate 1, Oslo (right by Oslo S)",
    lat: 59.9127,
    lon: 10.7461,
    kommunenummer: "0301",
    expectedMin: 85,
    expectedMax: 95,
  },
  {
    label: "Holmenkollen Park, Oslo",
    lat: 59.9641,
    lon: 10.6647,
    kommunenummer: "0301",
    expectedMin: 70,
    expectedMax: 85,
  },
  {
    label: "Sandvika stasjon, Bærum",
    lat: 59.8918,
    lon: 10.5234,
    kommunenummer: "3201",
    expectedMin: 75,
    expectedMax: 90,
  },
  {
    label: "Fredrikstad sentrum",
    lat: 59.2168,
    lon: 10.9390,
    kommunenummer: "3107",
    expectedMin: 40,
    expectedMax: 60,
  },
  {
    label: "Geilo sentrum",
    lat: 60.5342,
    lon: 8.2064,
    kommunenummer: "3347", // Hol
    expectedMin: 20,
    expectedMax: 40,
  },
  {
    label: "Unjárga-Nesseby (remote Finnmark)",
    lat: 69.8824,
    lon: 28.8864,
    kommunenummer: "5636",
    expectedMin: 0,
    expectedMax: 15,
  },
];

const TOLERANCE = 10;

function pad(s: string | number, n: number): string {
  const str = String(s);
  return str.length >= n ? str : str + " ".repeat(n - str.length);
}

function formatResult(r: PendlingsPoengResult, c: CalibrationCase): string {
  const { total, center, components: x, rushHourTested } = r;
  const inRange = total >= c.expectedMin && total <= c.expectedMax;
  const miss = inRange
    ? 0
    : total < c.expectedMin
      ? c.expectedMin - total
      : total - c.expectedMax;
  const verdict = inRange ? "OK" : miss <= TOLERANCE ? "WARN" : "MISS";

  const lines = [
    "",
    "━".repeat(72),
    `  ${c.label}`,
    `  center=${center.name}  expected=${c.expectedMin}-${c.expectedMax}  actual=${total}  [${verdict}]`,
    "━".repeat(72),
    `    door-to-door:  ${pad(x.doorToDoorMinutes + " min", 18)}→ score ${x.doorToDoorScore.toFixed(1)}`,
    `    frequency:     ${pad(x.frequencyPerHour.toFixed(1) + " /hr", 18)}→ score ${x.frequencyScore.toFixed(1)}`,
    `    walk to stop:  ${pad(x.walkDistanceMeters + " m", 18)}→ score ${x.walkDistanceScore.toFixed(1)}`,
    `    transfers:     ${pad(x.transfers + "", 18)}→ score ${x.transfersScore.toFixed(1)}`,
    `    månedskort:    ${pad(x.monthlyPriceNok + " NOK", 18)}→ score ${x.monthlyPriceScore.toFixed(1)}`,
    `    rush-hour data: ${rushHourTested ? "yes (Tue 08:00)" : "NO — fell back to midday"}`,
  ];
  return lines.join("\n");
}

async function main() {
  console.log("Pendlings-poeng calibration — hitting Entur live");
  console.log(`Running ${CASES.length} cases; expect ~${CASES.length * 8}s end-to-end.`);

  const results: Array<{
    c: CalibrationCase;
    r: PendlingsPoengResult;
    inRange: boolean;
    miss: number;
  }> = [];

  for (const c of CASES) {
    const r = await calculatePendlingsPoeng(c.lat, c.lon, {
      kommunenummer: c.kommunenummer,
    });
    const inRange = r.total >= c.expectedMin && r.total <= c.expectedMax;
    const miss = inRange
      ? 0
      : r.total < c.expectedMin
        ? c.expectedMin - r.total
        : r.total - c.expectedMax;
    results.push({ c, r, inRange, miss });
    console.log(formatResult(r, c));
  }

  console.log("");
  console.log("═".repeat(72));
  console.log("  SUMMARY");
  console.log("═".repeat(72));
  for (const { c, r, inRange, miss } of results) {
    const tag = inRange ? "OK  " : miss <= TOLERANCE ? "WARN" : "MISS";
    console.log(
      `  [${tag}] ${pad(c.label.slice(0, 45), 47)} expected ${c.expectedMin}-${c.expectedMax}, got ${r.total}${inRange ? "" : ` (off by ${miss})`}`,
    );
  }
  console.log("═".repeat(72));

  const bigMisses = results.filter((r) => !r.inRange && r.miss > TOLERANCE);
  if (bigMisses.length > 0) {
    console.log(
      `\n${bigMisses.length} case(s) off by more than ${TOLERANCE} points — recalibrate before shipping.`,
    );
    process.exit(1);
  }
  const warns = results.filter((r) => !r.inRange && r.miss <= TOLERANCE);
  if (warns.length > 0) {
    console.log(
      `\n${warns.length} case(s) within tolerance but outside expected range — review but OK.`,
    );
  } else {
    console.log("\nAll cases within expected ranges.");
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(2);
});
