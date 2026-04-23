/**
 * Refresh the /klima-poeng landing-page data cache.
 *
 * Scores every kommune candidate and city-pair comparison in
 * src/data/klima-poeng-candidates.ts, ranks the kommuner by mean Klima-poeng,
 * and writes the top/bottom-10 + comparison breakdowns to
 * src/data/klima-poeng-landing-data.ts.
 *
 * Ranking within each list:
 *   - Top (trygge):    total desc → population desc → kommunenavn asc
 *   - Bottom (utsatte): total asc  → population desc → kommunenavn asc
 *   Population is the tiebreaker so a 100-point distrikt with 11 000
 *   innbyggere doesn't outrank a 100-point Bergen on the safe-list.
 *
 * Data sources hit per kommune (~10 WMS calls):
 *   - NVE Flomsone1, FlomAktsomhet1                  (2 calls)
 *   - NVE Kvikkleire2                                (1 call)
 *   - NVE JordFlomskredAktsomhet, SkredSteinAktR,
 *     SnoskredAktsomhet                              (3 calls)
 *   - Kartverket stormflo20/200/1000                 (3 calls)
 *   - Radon (static lookup) + Klimaprofil (static)   (no network)
 *
 * Rate limiting: 2 concurrent kommuner × ~9 WMS each = ~18 in-flight; with
 * a 1.2 s inter-batch delay this stays comfortably under the published WMS
 * rate guidance from both NVE and Kartverket.
 *
 * Resumability: progress is checkpointed to .cache/klima-poeng-refresh.json
 * after each batch. Re-running the script picks up where it left off; pass
 * --fresh to wipe the checkpoint and start from zero.
 *
 * Required env vars: NONE.
 *
 * How to run:
 *   npx tsx scripts/refresh-klima-poeng-landing.ts
 *   npx tsx scripts/refresh-klima-poeng-landing.ts --fresh
 *
 * Expected output:
 *   Top 10 + bottom 10 ranked tables, four city-pair breakdowns, and
 *   confirmation that the landing data file was written. Exits 0 on success.
 *   Aborts (exit 1, no overwrite) if more than 8 kommuner failed — likely
 *   indicates an upstream WMS outage rather than a bad coordinate.
 *
 * Manual / monthly cadence. Not part of CI — CI must not hit the WMS
 * services.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  calculateKlimaPoeng,
  type KlimaPoengResult,
} from "../src/lib/scoring/klima-poeng";
import {
  KLIMA_KOMMUNE_CANDIDATES,
  KLIMA_CITY_COMPARISONS,
  type KlimaKommuneCandidate,
  type KlimaCityComparison,
} from "../src/data/klima-poeng-candidates";
import { kommunePopulation } from "../src/data/kommune-population";
import {
  bandForScore,
  skredLabel,
  stormSurgeLabel,
  quickClayLabel,
} from "../src/lib/scoring/klima-poeng-display";

const OUTPUT_PATH = resolve(
  process.cwd(),
  "src/data/klima-poeng-landing-data.ts",
);
const CHECKPOINT_PATH = resolve(
  process.cwd(),
  ".cache/klima-poeng-refresh.json",
);

const CONCURRENCY = 2;
const INTER_BATCH_DELAY_MS = 1200;
const FAILURE_ABORT_THRESHOLD = 8;

const fresh = process.argv.includes("--fresh");

interface ScoredKommune {
  candidate: KlimaKommuneCandidate;
  result: KlimaPoengResult;
}

interface ScoredComparisonPoint {
  kommunenummer: string;
  kommunenavn: string;
  label: string;
  result: KlimaPoengResult;
}

interface Checkpoint {
  startedAt: string;
  /** kommunenummer → serialized result. */
  kommuner: Record<string, KlimaPoengResult>;
  /** `${pairId}:${L|R}` → serialized result. */
  comparisons: Record<string, KlimaPoengResult>;
}

/* ── Checkpoint I/O ────────────────────────────────────────────────────── */

function loadCheckpoint(): Checkpoint {
  if (fresh || !existsSync(CHECKPOINT_PATH)) {
    return { startedAt: new Date().toISOString(), kommuner: {}, comparisons: {} };
  }
  try {
    const raw = readFileSync(CHECKPOINT_PATH, "utf8");
    return JSON.parse(raw) as Checkpoint;
  } catch {
    return { startedAt: new Date().toISOString(), kommuner: {}, comparisons: {} };
  }
}

function saveCheckpoint(cp: Checkpoint): void {
  mkdirSync(dirname(CHECKPOINT_PATH), { recursive: true });
  writeFileSync(CHECKPOINT_PATH, JSON.stringify(cp), "utf8");
}

/* ── Concurrency primitive ─────────────────────────────────────────────── */

interface Task<T> {
  label: string;
  run: () => Promise<T>;
}

async function runThrottled<T>(
  tasks: Task<T>[],
  onBatchComplete?: () => void,
): Promise<Array<T | Error>> {
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
        const err =
          s.reason instanceof Error ? s.reason : new Error(String(s.reason));
        results.push(err);
        console.log(`  ✗ ${batch[j].label} — ${err.message}`);
      }
    }
    onBatchComplete?.();
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

/* ── Sorting ───────────────────────────────────────────────────────────── */

function compareTopSafe(a: ScoredKommune, b: ScoredKommune): number {
  if (b.result.total !== a.result.total) {
    return b.result.total - a.result.total;
  }
  const popDiff =
    populationOf(b.candidate.kommunenummer) -
    populationOf(a.candidate.kommunenummer);
  if (popDiff !== 0) return popDiff;
  return a.candidate.kommunenavn.localeCompare(b.candidate.kommunenavn, "nb");
}

function compareBottomExposed(a: ScoredKommune, b: ScoredKommune): number {
  if (a.result.total !== b.result.total) {
    return a.result.total - b.result.total;
  }
  const popDiff =
    populationOf(b.candidate.kommunenummer) -
    populationOf(a.candidate.kommunenummer);
  if (popDiff !== 0) return popDiff;
  return a.candidate.kommunenavn.localeCompare(b.candidate.kommunenavn, "nb");
}

/* ── Row builders ──────────────────────────────────────────────────────── */

interface KommuneScoreRow {
  rank: number;
  kommunenummer: string;
  kommunenavn: string;
  slug: string;
  total: number;
  band: string;
  centerNote: string;
  population: number;
  fylkesnavn: string | null;
  components: {
    flood: { value: string; score: number };
    quickClay: { value: string; score: number };
    skred: { value: string; score: number };
    stormSurge: { value: string; score: number };
    radon: { value: string; score: number | null; assessed: boolean };
    klimaprofil: { value: string; score: number };
  };
}

interface ComparisonRow {
  pairId: string;
  title: string;
  rationale: string;
  left: ComparisonSide;
  right: ComparisonSide;
}

interface ComparisonSide {
  label: string;
  kommunenavn: string;
  total: number;
  band: string;
  fylkesnavn: string | null;
  components: KommuneScoreRow["components"];
}

function rowFromScored(s: ScoredKommune, rank: number): KommuneScoreRow {
  const c = s.result.components;
  return {
    rank,
    kommunenummer: s.candidate.kommunenummer,
    kommunenavn: s.candidate.kommunenavn,
    slug: s.candidate.slug,
    total: s.result.total,
    band: bandForScore(s.result.total),
    centerNote: s.candidate.centerNote,
    population: populationOf(s.candidate.kommunenummer),
    fylkesnavn: c.klimaprofil?.fylkesnavn ?? null,
    components: {
      flood: { value: c.floodRisk, score: c.floodScore },
      quickClay: {
        value: quickClayLabel(c.quickClay),
        score: c.quickClayScore,
      },
      skred: { value: skredLabel(c.skred), score: c.skredScore },
      stormSurge: {
        value: stormSurgeLabel(c.stormSurge),
        score: c.stormSurgeScore,
      },
      radon: c.radon.assessed
        ? { value: c.radon.level, score: c.radon.score, assessed: true }
        : { value: "Ikke vurdert", score: null, assessed: false },
      klimaprofil: {
        value: c.klimaprofil?.fylkesnavn ?? "Ingen profil",
        score: c.klimaprofilScore,
      },
    },
  };
}

function comparisonSideFromResult(
  label: string,
  kommunenavn: string,
  result: KlimaPoengResult,
): ComparisonSide {
  const c = result.components;
  return {
    label,
    kommunenavn,
    total: result.total,
    band: bandForScore(result.total),
    fylkesnavn: c.klimaprofil?.fylkesnavn ?? null,
    components: {
      flood: { value: c.floodRisk, score: c.floodScore },
      quickClay: {
        value: quickClayLabel(c.quickClay),
        score: c.quickClayScore,
      },
      skred: { value: skredLabel(c.skred), score: c.skredScore },
      stormSurge: {
        value: stormSurgeLabel(c.stormSurge),
        score: c.stormSurgeScore,
      },
      radon: c.radon.assessed
        ? { value: c.radon.level, score: c.radon.score, assessed: true }
        : { value: "Ikke vurdert", score: null, assessed: false },
      klimaprofil: {
        value: c.klimaprofil?.fylkesnavn ?? "Ingen profil",
        score: c.klimaprofilScore,
      },
    },
  };
}

/* ── Main ──────────────────────────────────────────────────────────────── */

async function main() {
  console.log("Refreshing /klima-poeng landing data (NVE + Kartverket WMS)\n");
  console.log(`Kommune candidates:  ${KLIMA_KOMMUNE_CANDIDATES.length}`);
  console.log(`Comparison pairs:    ${KLIMA_CITY_COMPARISONS.length}`);
  console.log(`Concurrency:         ${CONCURRENCY}`);
  console.log(`Checkpoint:          ${CHECKPOINT_PATH}`);
  if (fresh) console.log("Mode:                --fresh (ignoring any existing checkpoint)\n");
  else console.log();

  const checkpoint = loadCheckpoint();
  const cachedCount = Object.keys(checkpoint.kommuner).length;
  if (cachedCount > 0) {
    console.log(`Resuming with ${cachedCount} kommuner already scored from prior run.\n`);
  }

  const t0 = Date.now();

  // ── Score kommuner ──────────────────────────────────────────────────
  console.log("── Scoring kommuner ──");
  const kommuneTasks = KLIMA_KOMMUNE_CANDIDATES.filter(
    (c) => !checkpoint.kommuner[c.kommunenummer],
  ).map<Task<ScoredKommune>>((c) => ({
    label: `${c.kommunenavn} (${c.centerNote})`,
    run: async () => {
      const result = await calculateKlimaPoeng(c.lat, c.lon, {
        kommunenummer: c.kommunenummer,
      });
      return { candidate: c, result };
    },
  }));

  if (kommuneTasks.length > 0) {
    const kommuneSettled = await runThrottled(kommuneTasks, () => {
      saveCheckpoint(checkpoint);
    });
    for (const r of kommuneSettled) {
      if (!isFailure(r)) {
        checkpoint.kommuner[r.candidate.kommunenummer] = r.result;
      }
    }
    saveCheckpoint(checkpoint);
  } else {
    console.log("  (all kommuner already in checkpoint)");
  }

  // ── Score comparison points ────────────────────────────────────────
  console.log("\n── Scoring comparison points ──");
  const comparisonTasks: Task<ScoredComparisonPoint & { side: "L" | "R"; pairId: string }>[] = [];
  for (const pair of KLIMA_CITY_COMPARISONS) {
    for (const [side, point] of [["L", pair.left], ["R", pair.right]] as const) {
      const cacheKey = `${pair.pairId}:${side}`;
      if (checkpoint.comparisons[cacheKey]) continue;
      comparisonTasks.push({
        label: `${pair.pairId} ${side} ${point.label}`,
        run: async () => {
          const result = await calculateKlimaPoeng(point.lat, point.lon, {
            kommunenummer: point.kommunenummer,
          });
          return {
            kommunenummer: point.kommunenummer,
            kommunenavn: point.kommunenavn,
            label: point.label,
            result,
            side,
            pairId: pair.pairId,
          };
        },
      });
    }
  }

  if (comparisonTasks.length > 0) {
    const compSettled = await runThrottled(comparisonTasks, () => {
      saveCheckpoint(checkpoint);
    });
    for (const r of compSettled) {
      if (!isFailure(r)) {
        checkpoint.comparisons[`${r.pairId}:${r.side}`] = r.result;
      }
    }
    saveCheckpoint(checkpoint);
  } else {
    console.log("  (all comparisons already in checkpoint)");
  }

  // ── Audit ──────────────────────────────────────────────────────────
  const totalKommuneFails =
    KLIMA_KOMMUNE_CANDIDATES.length -
    Object.keys(checkpoint.kommuner).length;
  if (totalKommuneFails > FAILURE_ABORT_THRESHOLD) {
    console.error(
      `\n${totalKommuneFails} kommune scoring failures (threshold ${FAILURE_ABORT_THRESHOLD}). ` +
        "Refusing to overwrite cache. Re-run when upstream recovers (checkpoint preserved).",
    );
    process.exit(1);
  }

  // ── Build score rows ───────────────────────────────────────────────
  const scoredKommuner: ScoredKommune[] = KLIMA_KOMMUNE_CANDIDATES.flatMap(
    (c) => {
      const result = checkpoint.kommuner[c.kommunenummer];
      if (!result) return [];
      return [{ candidate: c, result }];
    },
  );

  const topSafe = [...scoredKommuner].sort(compareTopSafe).slice(0, 10);
  const bottomExposed = [...scoredKommuner]
    .sort(compareBottomExposed)
    .slice(0, 10);

  const topRows: KommuneScoreRow[] = topSafe.map((s, i) =>
    rowFromScored(s, i + 1),
  );
  const bottomRows: KommuneScoreRow[] = bottomExposed.map((s, i) =>
    rowFromScored(s, i + 1),
  );

  // ── Build comparisons ──────────────────────────────────────────────
  const comparisons: ComparisonRow[] = KLIMA_CITY_COMPARISONS.flatMap(
    (pair): ComparisonRow[] => {
      const leftRes = checkpoint.comparisons[`${pair.pairId}:L`];
      const rightRes = checkpoint.comparisons[`${pair.pairId}:R`];
      if (!leftRes || !rightRes) return [];
      return [
        {
          pairId: pair.pairId,
          title: pair.title,
          rationale: pair.rationale,
          left: comparisonSideFromResult(
            pair.left.label,
            pair.left.kommunenavn,
            leftRes,
          ),
          right: comparisonSideFromResult(
            pair.right.label,
            pair.right.kommunenavn,
            rightRes,
          ),
        },
      ];
    },
  );

  // ── Pretty-print summaries ─────────────────────────────────────────
  console.log("\n── TOP 10 (tryggest) ──");
  console.log(
    pad("#", 4) + pad("Kommune", 22) + pad("Score", 8) + pad("Pop", 12) + "Fylke",
  );
  for (const row of topRows) {
    console.log(
      pad(row.rank.toString(), 4) +
        pad(row.kommunenavn, 22) +
        pad(row.total.toString(), 8) +
        pad(row.population.toLocaleString("nb-NO"), 12) +
        (row.fylkesnavn ?? "—"),
    );
  }

  console.log("\n── BOTTOM 10 (mest utsatt) ──");
  console.log(
    pad("#", 4) + pad("Kommune", 22) + pad("Score", 8) + pad("Pop", 12) + "Fylke",
  );
  for (const row of bottomRows) {
    console.log(
      pad(row.rank.toString(), 4) +
        pad(row.kommunenavn, 22) +
        pad(row.total.toString(), 8) +
        pad(row.population.toLocaleString("nb-NO"), 12) +
        (row.fylkesnavn ?? "—"),
    );
  }

  console.log("\n── COMPARISONS ──");
  for (const c of comparisons) {
    console.log(
      `  ${pad(c.title, 36)} ${pad(c.left.label, 28)} ${c.left.total}` +
        ` vs. ${pad(c.right.label, 28)} ${c.right.total}`,
    );
  }

  // ── Write file ─────────────────────────────────────────────────────
  const generatedAt = new Date().toISOString();
  const fileContent = renderLandingFile({
    generatedAt,
    candidatesScored: scoredKommuner.length,
    candidatesTotal: KLIMA_KOMMUNE_CANDIDATES.length,
    topSafe: topRows,
    bottomExposed: bottomRows,
    comparisons,
  });
  writeFileSync(OUTPUT_PATH, fileContent, "utf8");
  console.log(`\nWrote ${OUTPUT_PATH}`);
  console.log(`Generated at: ${generatedAt}`);
  console.log(
    `Scored ${scoredKommuner.length}/${KLIMA_KOMMUNE_CANDIDATES.length} kommuner ` +
      `in ${((Date.now() - t0) / 1000).toFixed(1)} s.`,
  );
  if (totalKommuneFails > 0) {
    console.log(
      `\n⚠ ${totalKommuneFails} kommune(s) failed but below the abort threshold; ` +
        "data still written. Re-run to retry the missing ones (checkpoint preserved).",
    );
  }
  process.exit(0);
}

/* ── File renderer ─────────────────────────────────────────────────────── */

function renderLandingFile(data: {
  generatedAt: string;
  candidatesScored: number;
  candidatesTotal: number;
  topSafe: KommuneScoreRow[];
  bottomExposed: KommuneScoreRow[];
  comparisons: ComparisonRow[];
}): string {
  return `/**
 * Pre-computed landing-page data for /klima-poeng.
 *
 * Regenerated by \`scripts/refresh-klima-poeng-landing.ts\`, which hits
 * NVE + Kartverket WMS for each kommune candidate (sentrum coord) and city
 * comparison point, then writes back the top-10 (safest) and bottom-10
 * (most exposed) kommune rankings + side-by-side comparison breakdowns.
 *
 * Ranking within each list:
 *   - Top:    total desc → population desc → kommunenavn asc
 *   - Bottom: total asc  → population desc → kommunenavn asc
 *
 * The page reads this file at build time. Refresh monthly, or after a
 * material change to NVE/Kartverket WMS layers (rare; aktsomhetskart are
 * republished yearly at most).
 *
 * DO NOT edit manually — re-run the refresh script instead.
 */

export interface KlimaComponentBar {
  value: string;
  score: number;
}

export interface KlimaRadonBar {
  value: string;
  score: number | null;
  assessed: boolean;
}

export interface KlimaComponentBars {
  flood: KlimaComponentBar;
  quickClay: KlimaComponentBar;
  skred: KlimaComponentBar;
  stormSurge: KlimaComponentBar;
  radon: KlimaRadonBar;
  klimaprofil: KlimaComponentBar;
}

export interface KlimaKommuneScoreRow {
  rank: number;
  kommunenummer: string;
  kommunenavn: string;
  slug: string;
  total: number;
  band: string;
  centerNote: string;
  population: number;
  fylkesnavn: string | null;
  components: KlimaComponentBars;
}

export interface KlimaComparisonSide {
  label: string;
  kommunenavn: string;
  total: number;
  band: string;
  fylkesnavn: string | null;
  components: KlimaComponentBars;
}

export interface KlimaComparisonRow {
  pairId: string;
  title: string;
  rationale: string;
  left: KlimaComparisonSide;
  right: KlimaComparisonSide;
}

export interface KlimaPoengLandingData {
  generatedAt: string;
  /** Number of kommuner successfully scored, of total candidates. */
  candidatesScored: number;
  candidatesTotal: number;
  /** Top 10 kommuner by mean Klima-poeng — the safest. */
  topSafe: ReadonlyArray<KlimaKommuneScoreRow>;
  /** Bottom 10 kommuner — the most climate-exposed of the candidate list. */
  bottomExposed: ReadonlyArray<KlimaKommuneScoreRow>;
  comparisons: ReadonlyArray<KlimaComparisonRow>;
}

export const KLIMA_POENG_LANDING_DATA: KlimaPoengLandingData = {
  generatedAt: ${JSON.stringify(data.generatedAt)},
  candidatesScored: ${data.candidatesScored},
  candidatesTotal: ${data.candidatesTotal},
  topSafe: ${JSON.stringify(data.topSafe, null, 2)},
  bottomExposed: ${JSON.stringify(data.bottomExposed, null, 2)},
  comparisons: ${JSON.stringify(data.comparisons, null, 2)},
};
`;
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(2);
});
