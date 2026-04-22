/**
 * Refresh the /pendlings-poeng landing-page data cache.
 *
 * Scores every kommune candidate and comparison address in
 * src/data/pendlings-poeng-candidates.ts, ranks the kommuner by two lists
 * (work-center kommuner, pendler-kommuner around them), and writes to
 * src/data/pendlings-poeng-landing-data.ts.
 *
 * Ranking within each list:
 *   1. total desc
 *   2. population desc (kommune-population.ts) — reflects actual pendler-weight
 *   3. doorToDoorMinutes asc — final accident-breaker
 *
 * Data source: Entur Journey Planner v3 (public, no auth).
 * Rate limit: ~60 req/min. ~30 candidates × 2 requests + 6 comparisons × 2 = 72
 * requests; throttled to 3 concurrent with a small inter-batch delay.
 *
 * Required env vars: NONE.
 *
 * How to run:
 *   npx tsx scripts/refresh-pendlings-poeng-landing.ts
 *
 * Expected output:
 *   Two ranked tables (work-center kommuner + pendler-kommuner), a comparison
 *   table, and a confirmation that the landing data file was written. Exits 0
 *   on success. Exits 1 if Entur fails for more than 2 cases (indicates an
 *   outage; don't overwrite the cached data with a mostly-broken snapshot).
 *
 * Manual refresh / weekly cadence. Not part of CI — CI must not hit Entur.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  calculatePendlingsPoeng,
  type PendlingsPoengResult,
} from "../src/lib/scoring/pendlings-poeng";
import {
  KOMMUNE_CANDIDATES,
  COMPARISON_ADDRESSES,
  type KommuneCandidate,
} from "../src/data/pendlings-poeng-candidates";
import { kommunePopulation } from "../src/data/kommune-population";
import type {
  KommuneScoreRow,
  ComparisonRow,
} from "../src/data/pendlings-poeng-landing-data";
import type { WorkCenterId } from "../src/lib/scoring/work-centers";

const OUTPUT_PATH = resolve(
  process.cwd(),
  "src/data/pendlings-poeng-landing-data.ts",
);

const CONCURRENCY = 3;
const INTER_BATCH_DELAY_MS = 1100; // 3 batches/sec × 2 Entur req each = 6 req/s ceiling

/**
 * The six work-center kommuner are excluded from the "pendler-kommuner" list
 * but rendered in their own "byer med best pendling" grid on the landing
 * page. Matches WORK_CENTERS in src/lib/scoring/work-centers.ts.
 */
const WORK_CENTER_KNR: ReadonlySet<string> = new Set([
  "0301", // Oslo
  "4601", // Bergen
  "5001", // Trondheim
  "1103", // Stavanger
  "5501", // Tromsø
  "4204", // Kristiansand
]);

interface Task<T> {
  label: string;
  run: () => Promise<T>;
}

async function runThrottled<T>(tasks: Task<T>[]): Promise<Array<T | Error>> {
  const results: Array<T | Error> = [];
  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const batch = tasks.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(batch.map((t) => t.run()));
    for (let j = 0; j < settled.length; j++) {
      const s = settled[j];
      if (s.status === "fulfilled") {
        results.push(s.value);
        console.log(`  ✓ ${batch[j].label}`);
      } else {
        const err = s.reason instanceof Error ? s.reason : new Error(String(s.reason));
        results.push(err);
        console.log(`  ✗ ${batch[j].label} — ${err.message}`);
      }
    }
    if (i + CONCURRENCY < tasks.length) {
      await new Promise((r) => setTimeout(r, INTER_BATCH_DELAY_MS));
    }
  }
  return results;
}

function isFailure<T>(v: T | Error): v is Error {
  return v instanceof Error;
}

function pad(s: string | number, n: number): string {
  const str = String(s);
  return str.length >= n ? str : str + " ".repeat(n - str.length);
}

function populationOf(knr: string): number {
  return kommunePopulation[knr]?.population ?? 0;
}

/**
 * Comparator used by both kommune lists. Total score dominates; population
 * breaks ties (reflects real pendler-weight); doorToDoorMinutes is the final
 * tiebreaker if populations also match.
 */
function compareKommune(
  a: [KommuneCandidate, PendlingsPoengResult],
  b: [KommuneCandidate, PendlingsPoengResult],
): number {
  const [ca, ra] = a;
  const [cb, rb] = b;
  if (rb.total !== ra.total) return rb.total - ra.total;
  const popA = populationOf(ca.kommunenummer);
  const popB = populationOf(cb.kommunenummer);
  if (popB !== popA) return popB - popA;
  return ra.components.doorToDoorMinutes - rb.components.doorToDoorMinutes;
}

function toScoreRow(
  c: KommuneCandidate,
  r: PendlingsPoengResult,
  rank: number,
): KommuneScoreRow {
  return {
    rank,
    kommunenummer: c.kommunenummer,
    kommunenavn: c.kommunenavn,
    slug: c.slug,
    total: r.total,
    centerName: r.center.name,
    centerId: r.center.id as WorkCenterId,
    centerNote: c.centerNote,
    doorToDoorMinutes: r.components.doorToDoorMinutes,
    frequencyPerHour: Number(r.components.frequencyPerHour.toFixed(1)),
    monthlyPriceNok: r.components.monthlyPriceNok,
    rushHourTested: r.rushHourTested,
    population: populationOf(c.kommunenummer),
  };
}

async function main() {
  console.log("Refreshing /pendlings-poeng landing data (Entur live)\n");
  console.log(`Kommune candidates: ${KOMMUNE_CANDIDATES.length}`);
  console.log(`Comparison addresses: ${COMPARISON_ADDRESSES.length}\n`);

  console.log("── Scoring kommuner ──");
  const kommuneResults = await runThrottled(
    KOMMUNE_CANDIDATES.map((c) => ({
      label: `${c.kommunenavn} (${c.centerNote})`,
      run: () =>
        calculatePendlingsPoeng(c.lat, c.lon, {
          kommunenummer: c.kommunenummer,
        }).then<[KommuneCandidate, PendlingsPoengResult]>((r) => [c, r]),
    })),
  );

  console.log("\n── Scoring comparison addresses ──");
  const comparisonResults = await runThrottled(
    COMPARISON_ADDRESSES.map((c) => ({
      label: c.label,
      run: () =>
        calculatePendlingsPoeng(c.lat, c.lon, {
          kommunenummer: c.kommunenummer,
        }).then<[(typeof COMPARISON_ADDRESSES)[number], PendlingsPoengResult]>(
          (r) => [c, r],
        ),
    })),
  );

  const totalFails =
    kommuneResults.filter(isFailure).length +
    comparisonResults.filter(isFailure).length;
  if (totalFails > 2) {
    console.error(
      `\n${totalFails} Entur failures — refusing to overwrite cache. Re-run when upstream recovers.`,
    );
    process.exit(1);
  }

  const kommuneRows: Array<[KommuneCandidate, PendlingsPoengResult]> =
    kommuneResults.filter(
      (v): v is [KommuneCandidate, PendlingsPoengResult] => !isFailure(v),
    );

  const comparisonRowsRaw: Array<
    [(typeof COMPARISON_ADDRESSES)[number], PendlingsPoengResult]
  > = comparisonResults.filter(
    (v): v is [(typeof COMPARISON_ADDRESSES)[number], PendlingsPoengResult] =>
      !isFailure(v),
  );

  kommuneRows.sort(compareKommune);

  // Flag any kommuner whose resolved center disagreed with the expected one.
  console.log("\n── Work-center check ──");
  const misrouted: string[] = [];
  for (const [c, r] of kommuneRows) {
    if (r.center.id !== c.expectedCenter) {
      console.log(
        `  ⚠ ${c.kommunenavn}: expected center=${c.expectedCenter}, got ${r.center.id}`,
      );
      misrouted.push(`${c.kommunenavn} → ${r.center.id}`);
    }
  }
  if (misrouted.length === 0) {
    console.log("  All kommuner routed to expected work center.");
  }

  const workCenterPairs = kommuneRows.filter(([c]) =>
    WORK_CENTER_KNR.has(c.kommunenummer),
  );
  const pendlerPairs = kommuneRows.filter(
    ([c]) => !WORK_CENTER_KNR.has(c.kommunenummer),
  );

  const workCenterKommuner: KommuneScoreRow[] = workCenterPairs.map(
    ([c, r], i) => toScoreRow(c, r, i + 1),
  );
  const topPendlerKommuner: KommuneScoreRow[] = pendlerPairs
    .slice(0, 10)
    .map(([c, r], i) => toScoreRow(c, r, i + 1));

  const comparisons: ComparisonRow[] = comparisonRowsRaw.map(
    ([c, r]): ComparisonRow => ({
      label: c.label,
      kommunenavn: c.kommunenavn,
      total: r.total,
      centerName: r.center.name,
      centerId: r.center.id as WorkCenterId,
      context: c.context,
      doorToDoorMinutes: r.components.doorToDoorMinutes,
      frequencyPerHour: Number(r.components.frequencyPerHour.toFixed(1)),
      monthlyPriceNok: r.components.monthlyPriceNok,
      rushHourTested: r.rushHourTested,
    }),
  );

  console.log("\n── WORK-CENTER KOMMUNER ──");
  console.log(pad("#", 4) + pad("Kommune", 20) + pad("Score", 8) + pad("Pop", 10) + "D2D");
  for (const row of workCenterKommuner) {
    console.log(
      pad(row.rank.toString(), 4) +
        pad(row.kommunenavn, 20) +
        pad(row.total.toString(), 8) +
        pad(row.population.toLocaleString("nb-NO"), 10) +
        row.doorToDoorMinutes + "m",
    );
  }

  console.log("\n── TOP 10 PENDLER-KOMMUNER (utenfor storby-sentrene) ──");
  console.log(pad("#", 4) + pad("Kommune", 20) + pad("Score", 8) + pad("Pop", 10) + "D2D");
  for (const row of topPendlerKommuner) {
    console.log(
      pad(row.rank.toString(), 4) +
        pad(row.kommunenavn, 20) +
        pad(row.total.toString(), 8) +
        pad(row.population.toLocaleString("nb-NO"), 10) +
        row.doorToDoorMinutes + "m",
    );
  }

  console.log("\n── FULL RANKING (for review) ──");
  kommuneRows.forEach(([c, r], i) => {
    const tag = WORK_CENTER_KNR.has(c.kommunenummer) ? "[WC]" : "    ";
    const flag = r.center.id !== c.expectedCenter ? " ⚠" : "";
    console.log(
      `  ${pad((i + 1).toString(), 3)} ${tag} ${pad(c.kommunenavn, 22)} ${pad(
        r.total.toString(),
        5,
      )} pop=${pad(populationOf(c.kommunenummer).toString(), 8)} → ${r.center.id}${flag}`,
    );
  });

  console.log("\n── COMPARISON ADDRESSES ──");
  for (const row of comparisons) {
    console.log(
      pad(row.label, 26) +
        pad(row.total.toString(), 6) +
        pad(row.centerId, 8) +
        pad(row.doorToDoorMinutes + "m", 6) +
        pad(row.frequencyPerHour + "/hr", 8),
    );
  }

  const generatedAt = new Date().toISOString();
  const fileContent = renderLandingFile({
    generatedAt,
    workCenterKommuner,
    topPendlerKommuner,
    comparisons,
  });
  writeFileSync(OUTPUT_PATH, fileContent, "utf8");
  console.log(`\nWrote ${OUTPUT_PATH}`);
  console.log(`Generated at: ${generatedAt}`);
  if (misrouted.length > 0) {
    console.log(`\n⚠ ${misrouted.length} kommune(s) routed to an unexpected center:`);
    for (const m of misrouted) console.log(`  ${m}`);
  }
  if (totalFails > 0) {
    console.log(
      `\n⚠ ${totalFails} case(s) failed but below the abort threshold; data still written.`,
    );
  }
  process.exit(0);
}

function renderLandingFile(data: {
  generatedAt: string;
  workCenterKommuner: KommuneScoreRow[];
  topPendlerKommuner: KommuneScoreRow[];
  comparisons: ComparisonRow[];
}): string {
  return `/**
 * Pre-computed landing-page data for /pendlings-poeng.
 *
 * Regenerated by \`scripts/refresh-pendlings-poeng-landing.ts\`, which hits
 * Entur for each kommune candidate + comparison address and writes back two
 * ranked lists (the six work-center kommuner, and the top 10 pendler-kommuner
 * around them) plus all comparison results. The page reads this file at build
 * time; revalidates via ISR every 24 hours (page.tsx). Refresh the data file
 * weekly, or when thresholds/weights change.
 *
 * Ranking order within each list: total desc → population desc (from
 * kommune-population.ts) → doorToDoorMinutes asc. Population as the primary
 * tiebreaker reflects actual pendler-relevance (more pendlers live in larger
 * kommuner) so scores-of-100 sort by size, not by a 1-minute travel-time
 * accident.
 *
 * DO NOT edit manually — re-run the refresh script instead.
 */
import type { WorkCenterId } from "@/lib/scoring/work-centers";

export interface KommuneScoreRow {
  rank: number;
  kommunenummer: string;
  kommunenavn: string;
  slug: string;
  total: number;
  centerName: string;
  centerId: WorkCenterId;
  centerNote: string;
  doorToDoorMinutes: number;
  frequencyPerHour: number;
  monthlyPriceNok: number;
  rushHourTested: boolean;
  population: number;
}

export interface ComparisonRow {
  label: string;
  kommunenavn: string;
  total: number;
  centerName: string;
  centerId: WorkCenterId;
  context: string;
  doorToDoorMinutes: number;
  frequencyPerHour: number;
  monthlyPriceNok: number;
  rushHourTested: boolean;
}

export interface PendlingsPoengLandingData {
  generatedAt: string;
  /** The six work-center kommuner (Oslo, Bergen, Trondheim, Stavanger, Tromsø, Kristiansand), each scored against its own work-center. */
  workCenterKommuner: ReadonlyArray<KommuneScoreRow>;
  /** Top 10 kommuner excluding the six work-center cities. The real pendler-kommuner around the big city cores. */
  topPendlerKommuner: ReadonlyArray<KommuneScoreRow>;
  comparisons: ReadonlyArray<ComparisonRow>;
}

export const PENDLINGS_POENG_LANDING_DATA: PendlingsPoengLandingData = {
  generatedAt: ${JSON.stringify(data.generatedAt)},
  workCenterKommuner: ${JSON.stringify(data.workCenterKommuner, null, 2)},
  topPendlerKommuner: ${JSON.stringify(data.topPendlerKommuner, null, 2)},
  comparisons: ${JSON.stringify(data.comparisons, null, 2)},
};
`;
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(2);
});
