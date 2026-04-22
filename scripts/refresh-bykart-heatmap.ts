/**
 * Refresh the /bykart heatmap-overlay data cache.
 *
 * Builds an H3 resolution-8 hex grid covering one or more Norwegian work
 * centers (Oslo only in v1), scores Pendlings-poeng at each hex center via
 * Entur, and writes the resulting cells to src/data/bykart-heatmap-data.ts.
 *
 * Per cell stored:
 *   - h3:       H3 index (res 8, ~1 km across)
 *   - lat/lon:  hex center
 *   - score:    Pendlings-poeng 0-100
 *   - boundary: 6 [lat, lon] pairs forming the polygon (rounded to 5 dp)
 *
 * Boundaries are pre-computed server-side so the client does not have to
 * bundle h3-js (~190 kB minified). The data file is imported lazily by the
 * heatmap layer only when the user activates that view.
 *
 * Data source: Entur Journey Planner v3, shared through calculatePendlingsPoeng.
 * Throttle: CONCURRENCY × 1.1 s batches ≈ 5.4 Entur req/s ceiling.
 * For Oslo at 25 km radius, expect ~2 600 cells ≈ 16 min.
 *
 * Hexes over Oslofjorden (no transit coverage) score 0 — rendered but muted
 * by the UI. No water-masking in v1.
 *
 * Required env vars: NONE.
 *
 * How to run:
 *   npx tsx scripts/refresh-bykart-heatmap.ts
 *   npx tsx scripts/refresh-bykart-heatmap.ts --city oslo     # explicit
 *   npx tsx scripts/refresh-bykart-heatmap.ts --limit 50      # smoke test
 *
 * Checkpointing: the script writes a running JSON checkpoint to
 * .cache/bykart-heatmap-<city>.json after every batch. A re-run picks up
 * where the previous run stopped, so a crash halfway through does not waste
 * the prior 8 min of Entur calls. Pass --fresh to ignore the checkpoint.
 *
 * Exits 0 on success. Exits 1 if Entur fails for more than 5 % of cells
 * (outage — do not overwrite the cached data with a mostly-broken snapshot).
 *
 * Manual refresh / weekly cadence. Not part of CI — CI must not hit Entur.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import {
  latLngToCell,
  cellToLatLng,
  cellToBoundary,
  gridDisk,
} from "h3-js";
import { calculatePendlingsPoeng } from "../src/lib/scoring/pendlings-poeng";
import { getWorkCenter, type WorkCenterId } from "../src/lib/scoring/work-centers";
import { haversineKm } from "../src/lib/geo";

/* ── Config ──────────────────────────────────────────────────────────── */

interface CitySpec {
  id: WorkCenterId;
  radiusKm: number;
  /** Safety margin above π·r²/cellArea — drop cells outside radiusKm anyway. */
  gridK: number;
}

const CITIES: ReadonlyArray<CitySpec> = [
  { id: "oslo", radiusKm: 25, gridK: 32 },
  // Bergen/Trondheim/Stavanger/Tromsø/Kristiansand follow in PR 4b.
];

const H3_RES = 8;
const CONCURRENCY = 3;
const INTER_BATCH_DELAY_MS = 1100;
const FAILURE_THRESHOLD = 0.05; // abort if > 5 % of cells fail

const OUTPUT_PATH = resolve(process.cwd(), "src/data/bykart-heatmap-data.ts");
const CHECKPOINT_DIR = resolve(process.cwd(), ".cache");

/* ── CLI args ────────────────────────────────────────────────────────── */

function parseArgs(argv: string[]): {
  cityFilter: WorkCenterId | null;
  limit: number | null;
  fresh: boolean;
} {
  let cityFilter: WorkCenterId | null = null;
  let limit: number | null = null;
  let fresh = false;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--city") cityFilter = argv[++i] as WorkCenterId;
    else if (a === "--limit") limit = Number(argv[++i]);
    else if (a === "--fresh") fresh = true;
  }
  return { cityFilter, limit, fresh };
}

/* ── Throttled runner (same shape as refresh-pendlings-poeng-landing.ts) */

interface Task<T> {
  label: string;
  run: () => Promise<T>;
}

async function runThrottled<T>(
  tasks: Task<T>[],
  onBatchComplete?: (results: Array<T | Error>, total: number) => void,
): Promise<Array<T | Error>> {
  const results: Array<T | Error> = [];
  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const batch = tasks.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(batch.map((t) => t.run()));
    for (const s of settled) {
      if (s.status === "fulfilled") results.push(s.value);
      else {
        const err = s.reason instanceof Error ? s.reason : new Error(String(s.reason));
        results.push(err);
      }
    }
    if (onBatchComplete) onBatchComplete(results, tasks.length);
    if (i + CONCURRENCY < tasks.length) {
      await new Promise((r) => setTimeout(r, INTER_BATCH_DELAY_MS));
    }
  }
  return results;
}

function isFailure<T>(v: T | Error): v is Error {
  return v instanceof Error;
}

/* ── H3 grid ─────────────────────────────────────────────────────────── */

function round5(n: number): number {
  return Math.round(n * 1e5) / 1e5;
}

interface HexSeed {
  h3: string;
  lat: number;
  lon: number;
  boundary: Array<[number, number]>;
}

function buildHexGrid(spec: CitySpec): HexSeed[] {
  const center = getWorkCenter(spec.id);
  const originCell = latLngToCell(center.lat, center.lon, H3_RES);
  const disk = gridDisk(originCell, spec.gridK);

  const seeds: HexSeed[] = [];
  for (const h3 of disk) {
    const [lat, lon] = cellToLatLng(h3);
    const distKm = haversineKm(lat, lon, center.lat, center.lon);
    if (distKm > spec.radiusKm) continue;
    const boundary = cellToBoundary(h3) as Array<[number, number]>;
    seeds.push({
      h3,
      lat: round5(lat),
      lon: round5(lon),
      boundary: boundary.map(([bLat, bLon]) => [round5(bLat), round5(bLon)]),
    });
  }
  return seeds;
}

/* ── Checkpointing ───────────────────────────────────────────────────── */

interface HeatmapCell {
  h3: string;
  lat: number;
  lon: number;
  score: number;
  boundary: Array<[number, number]>;
}

interface Checkpoint {
  city: WorkCenterId;
  h3Res: number;
  radiusKm: number;
  completed: Record<string, HeatmapCell>;
}

function checkpointPath(cityId: WorkCenterId): string {
  return resolve(CHECKPOINT_DIR, `bykart-heatmap-${cityId}.json`);
}

function loadCheckpoint(cityId: WorkCenterId): Checkpoint | null {
  const p = checkpointPath(cityId);
  if (!existsSync(p)) return null;
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as Checkpoint;
    if (raw.city !== cityId) return null;
    return raw;
  } catch {
    return null;
  }
}

function saveCheckpoint(cp: Checkpoint): void {
  mkdirSync(dirname(checkpointPath(cp.city)), { recursive: true });
  writeFileSync(checkpointPath(cp.city), JSON.stringify(cp), "utf8");
}

/* ── Per-city run ────────────────────────────────────────────────────── */

async function scoreCity(
  spec: CitySpec,
  opts: { limit: number | null; fresh: boolean },
): Promise<HeatmapCell[]> {
  const center = getWorkCenter(spec.id);
  const allSeeds = buildHexGrid(spec);
  const seeds = opts.limit ? allSeeds.slice(0, opts.limit) : allSeeds;

  console.log(
    `\n── ${center.name} (${spec.radiusKm} km, res ${H3_RES}) ──`,
  );
  console.log(`  grid: ${allSeeds.length} cells (from k=${spec.gridK} disk)`);
  if (opts.limit) console.log(`  limit: ${opts.limit}`);

  const cp: Checkpoint = opts.fresh
    ? { city: spec.id, h3Res: H3_RES, radiusKm: spec.radiusKm, completed: {} }
    : loadCheckpoint(spec.id) ?? {
        city: spec.id,
        h3Res: H3_RES,
        radiusKm: spec.radiusKm,
        completed: {},
      };

  const priorDone = Object.keys(cp.completed).length;
  if (priorDone > 0) {
    console.log(`  checkpoint: resuming with ${priorDone} cells already scored`);
  }

  const todo = seeds.filter((s) => !cp.completed[s.h3]);
  if (todo.length === 0) {
    console.log(`  all cells already in checkpoint — skipping Entur calls`);
    return seeds.map((s) => cp.completed[s.h3]).filter(Boolean);
  }

  const t0 = Date.now();
  const tasks: Task<[HexSeed, number]>[] = todo.map((seed) => ({
    label: seed.h3,
    run: () =>
      calculatePendlingsPoeng(seed.lat, seed.lon, {
        center: spec.id,
      }).then<[HexSeed, number]>((r) => [seed, r.total]),
  }));

  let lastLogged = 0;
  const results = await runThrottled(tasks, (acc, total) => {
    const done = acc.length;
    if (done - lastLogged < 60 && done !== total) return;
    const elapsedMin = (Date.now() - t0) / 60000;
    const rate = done / elapsedMin;
    const remainingMin = (total - done) / (rate || 1);
    console.log(
      `  ${done}/${total} (${((done / total) * 100).toFixed(1)}%) — ` +
        `${elapsedMin.toFixed(1)} min elapsed, ~${remainingMin.toFixed(1)} min remaining`,
    );
    lastLogged = done;

    // Flush checkpoint every log interval.
    for (const r of acc) {
      if (isFailure(r)) continue;
      const [seed, score] = r;
      cp.completed[seed.h3] = {
        h3: seed.h3,
        lat: seed.lat,
        lon: seed.lon,
        score,
        boundary: seed.boundary,
      };
    }
    saveCheckpoint(cp);
  });

  const failures = results.filter(isFailure).length;
  const attempted = results.length;
  const failRate = failures / attempted;
  console.log(
    `  done: ${attempted - failures}/${attempted} succeeded, ` +
      `${failures} failures (${(failRate * 100).toFixed(1)}%)`,
  );
  if (failRate > FAILURE_THRESHOLD) {
    throw new Error(
      `${(failRate * 100).toFixed(1)}% of ${spec.id} cells failed — refusing to write. ` +
        `Re-run when Entur recovers (checkpoint preserved).`,
    );
  }

  // Final checkpoint flush.
  for (const r of results) {
    if (isFailure(r)) continue;
    const [seed, score] = r;
    cp.completed[seed.h3] = {
      h3: seed.h3,
      lat: seed.lat,
      lon: seed.lon,
      score,
      boundary: seed.boundary,
    };
  }
  saveCheckpoint(cp);

  return seeds
    .map((s) => cp.completed[s.h3])
    .filter((c): c is HeatmapCell => Boolean(c));
}

/* ── Post-processing ─────────────────────────────────────────────────── */

/**
 * Entur returns "no trip" when the origin is within ~200 m of the destination,
 * and `calculatePendlingsPoeng` treats "no trip" as "no transit coverage"
 * (score 0 — the right answer for a hex in the fjord or a mountain). For
 * hexes that sit on top of the work-center lat/lon the correct answer is
 * "already there" (score 100), but the scoring engine has no short-circuit
 * for that today. Without this override the heatmap shows a cluster of red
 * cells right where it should be the greenest patch on the map.
 *
 * Override rule: any cell within ORIGIN_CELL_RADIUS_KM of the work-center
 * centroid whose raw score is 0 is promoted to 100. Only applies to genuine
 * zero-scorers — cells in that radius that scored normally are left alone.
 *
 * Remove this function once pendlings-poeng.ts short-circuits when the
 * origin is effectively at the destination.
 */
const ORIGIN_CELL_RADIUS_KM = 1.0;

function applyWorkCenterOverride(
  cells: HeatmapCell[],
  cityId: WorkCenterId,
): { overridden: number; total: number } {
  const center = getWorkCenter(cityId);
  let overridden = 0;
  for (const cell of cells) {
    if (cell.score !== 0) continue;
    const distKm = haversineKm(cell.lat, cell.lon, center.lat, center.lon);
    if (distKm > ORIGIN_CELL_RADIUS_KM) continue;
    cell.score = 100;
    overridden++;
  }
  return { overridden, total: cells.length };
}

/* ── Output file ─────────────────────────────────────────────────────── */

interface HeatmapData {
  generatedAt: string;
  h3Res: number;
  cities: Record<string, { radiusKm: number; cells: HeatmapCell[] }>;
}

function renderDataFile(data: HeatmapData): string {
  // JSON.stringify with no whitespace inside arrays — keeps the file compact
  // while still readable at the top-level city keys.
  const cityLines = Object.entries(data.cities)
    .map(
      ([id, { radiusKm, cells }]) =>
        `  ${JSON.stringify(id)}: {\n    radiusKm: ${radiusKm},\n    cells: ${JSON.stringify(cells)},\n  }`,
    )
    .join(",\n");

  return `/**
 * Pre-computed /bykart Pendlings-poeng heatmap cells.
 *
 * Regenerated by \`scripts/refresh-bykart-heatmap.ts\`, which builds an H3
 * resolution-8 hex grid per city, queries Entur at each hex center, and writes
 * the results here. The heatmap layer on /bykart lazy-imports this file only
 * when a city view is activated.
 *
 * Boundaries are pre-computed so the client does not need to bundle h3-js.
 *
 * DO NOT edit manually — re-run the refresh script instead.
 */
import type { WorkCenterId } from "@/lib/scoring/work-centers";

export interface BykartHeatmapCell {
  h3: string;
  lat: number;
  lon: number;
  score: number;
  boundary: ReadonlyArray<readonly [number, number]>;
}

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
  generatedAt: ${JSON.stringify(data.generatedAt)},
  h3Res: ${data.h3Res},
  cities: {
${cityLines},
  },
};
`;
}

/* ── Entry point ─────────────────────────────────────────────────────── */

function scoreHistogram(cells: HeatmapCell[]): string {
  const buckets = [0, 35, 55, 70, 85, 101];
  const labels = ["0-34", "35-54", "55-69", "70-84", "85+"];
  const counts = labels.map(() => 0);
  for (const c of cells) {
    for (let i = 0; i < labels.length; i++) {
      if (c.score >= buckets[i] && c.score < buckets[i + 1]) {
        counts[i]++;
        break;
      }
    }
  }
  return labels
    .map((l, i) => `${l}: ${counts[i]} (${((counts[i] / cells.length) * 100).toFixed(1)}%)`)
    .join(", ");
}

async function main() {
  const args = parseArgs(process.argv);
  const cities = args.cityFilter
    ? CITIES.filter((c) => c.id === args.cityFilter)
    : CITIES;
  if (cities.length === 0) {
    console.error(`No cities match filter ${args.cityFilter}`);
    process.exit(1);
  }

  console.log("Refreshing /bykart heatmap data (Entur live)");
  console.log(`H3 resolution: ${H3_RES}`);
  console.log(`Cities: ${cities.map((c) => c.id).join(", ")}`);
  if (args.fresh) console.log("Mode: --fresh (ignoring checkpoints)");

  const t0 = Date.now();
  const cityResults: HeatmapData["cities"] = {};

  for (const spec of cities) {
    const cells = await scoreCity(spec, { limit: args.limit, fresh: args.fresh });
    const { overridden, total } = applyWorkCenterOverride(cells, spec.id);
    if (overridden > 0) {
      console.log(
        `  work-center override: promoted ${overridden}/${total} score-0 cells within ${ORIGIN_CELL_RADIUS_KM} km of ${spec.id} sentrum to 100`,
      );
    }
    cityResults[spec.id] = { radiusKm: spec.radiusKm, cells };
    console.log(`  ${spec.id} score distribution — ${scoreHistogram(cells)}`);
  }

  const generatedAt = new Date().toISOString();
  const data: HeatmapData = { generatedAt, h3Res: H3_RES, cities: cityResults };
  const fileContent = renderDataFile(data);
  writeFileSync(OUTPUT_PATH, fileContent, "utf8");

  const elapsedMin = (Date.now() - t0) / 60000;
  const fileBytes = Buffer.byteLength(fileContent, "utf8");
  console.log(
    `\nWrote ${OUTPUT_PATH} (${(fileBytes / 1024).toFixed(1)} kB)`,
  );
  console.log(`Total time: ${elapsedMin.toFixed(1)} min`);
  console.log(`Generated at: ${generatedAt}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(2);
});
