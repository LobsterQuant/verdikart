/**
 * Refresh the /bykart Pendlings-poeng heatmap data cache — 6 Norwegian work
 * centers (Oslo, Bergen, Trondheim, Stavanger, Kristiansand, Tromsø).
 *
 * For each city the script:
 *   1. Enumerates an H3 resolution-8 hex grid covering the city's scoring
 *      radius (see CITIES below).
 *   2. Drops any hex whose center falls over water, using the Kartverket N50
 *      water mask (src/data/kartverket-n50-coastline.json via
 *      scripts/lib/water-mask.ts). Water hexes never appear in the output.
 *   3. Scores every remaining hex via Entur (calculatePendlingsPoeng) and
 *      writes a per-city data file at src/data/bykart-heatmap-<city>.ts.
 *
 * Per cell stored: h3, lat, lon, score, boundary (pre-computed so the client
 * does not need h3-js at ~190 kB).
 *
 * Data sources:
 *   - Entur Journey Planner v3 (through calculatePendlingsPoeng)
 *   - Kartverket N50 Kartdata Arealdekke (water mask)
 *
 * Throttle: CONCURRENCY × 1.1 s batches ≈ 5.4 Entur req/s ceiling.
 * Expected sizes (post-water-filter):
 *   oslo         25 km ≈ 2 600 cells, 16 min
 *   bergen       20 km ≈ 1 800 cells, 11 min
 *   stavanger    20 km ≈ 1 800 cells, 11 min
 *   trondheim    15 km ≈ 1 000 cells,  6 min
 *   kristiansand 15 km ≈ 1 000 cells,  6 min
 *   tromso       15 km ≈ 1 000 cells,  6 min
 *
 * Required env vars: NONE.
 *
 * How to run:
 *   npx tsx scripts/refresh-bykart-heatmap.ts              # all 6 cities
 *   npx tsx scripts/refresh-bykart-heatmap.ts --city oslo  # one city
 *   npx tsx scripts/refresh-bykart-heatmap.ts --limit 50   # smoke test
 *
 * Checkpointing: JSON checkpoint written to .cache/bykart-heatmap-<city>.json
 * after every batch; re-runs resume where the previous run stopped. Pass
 * --fresh to ignore the checkpoint.
 *
 * Exits 0 on success. Exits 1 if Entur fails for > 5 % of cells in any city
 * (outage — do not overwrite the cached data with a mostly-broken snapshot).
 *
 * Manual refresh / weekly cadence. Not part of CI.
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
import { isOnLand } from "./lib/water-mask";

/* ── Config ──────────────────────────────────────────────────────────── */

interface CitySpec {
  id: WorkCenterId;
  radiusKm: number;
  /** Safety margin above π·r²/cellArea — drop cells outside radiusKm anyway. */
  gridK: number;
}

const CITIES: ReadonlyArray<CitySpec> = [
  { id: "oslo",         radiusKm: 25, gridK: 32 },
  { id: "bergen",       radiusKm: 20, gridK: 26 },
  { id: "stavanger",    radiusKm: 20, gridK: 26 },
  { id: "trondheim",    radiusKm: 15, gridK: 20 },
  { id: "kristiansand", radiusKm: 15, gridK: 20 },
  { id: "tromso",       radiusKm: 15, gridK: 20 },
];

const H3_RES = 8;
const CONCURRENCY = 3;
const INTER_BATCH_DELAY_MS = 1100;
const FAILURE_THRESHOLD = 0.05; // abort if > 5 % of cells fail

const DATA_DIR = resolve(process.cwd(), "src/data");
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

/* ── Throttled runner ────────────────────────────────────────────────── */

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

/* ── H3 grid + water mask ────────────────────────────────────────────── */

function round5(n: number): number {
  return Math.round(n * 1e5) / 1e5;
}

interface HexSeed {
  h3: string;
  lat: number;
  lon: number;
  boundary: Array<[number, number]>;
}

interface GridResult {
  seeds: HexSeed[];
  totalInDisk: number;
  waterFiltered: number;
}

function buildHexGrid(spec: CitySpec): GridResult {
  const center = getWorkCenter(spec.id);
  const originCell = latLngToCell(center.lat, center.lon, H3_RES);
  const disk = gridDisk(originCell, spec.gridK);

  const seeds: HexSeed[] = [];
  let totalInDisk = 0;
  let waterFiltered = 0;
  for (const h3 of disk) {
    const [lat, lon] = cellToLatLng(h3);
    const distKm = haversineKm(lat, lon, center.lat, center.lon);
    if (distKm > spec.radiusKm) continue;
    totalInDisk++;
    if (!isOnLand(lat, lon)) {
      waterFiltered++;
      continue;
    }
    const boundary = cellToBoundary(h3) as Array<[number, number]>;
    seeds.push({
      h3,
      lat: round5(lat),
      lon: round5(lon),
      boundary: boundary.map(([bLat, bLon]) => [round5(bLat), round5(bLon)]),
    });
  }
  return { seeds, totalInDisk, waterFiltered };
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

interface ScoreResult {
  cells: HeatmapCell[];
  totalInDisk: number;
  waterFiltered: number;
  elapsedMs: number;
}

async function scoreCity(
  spec: CitySpec,
  opts: { limit: number | null; fresh: boolean },
): Promise<ScoreResult> {
  const center = getWorkCenter(spec.id);
  const grid = buildHexGrid(spec);
  const allSeeds = grid.seeds;
  const seeds = opts.limit ? allSeeds.slice(0, opts.limit) : allSeeds;

  console.log(
    `\n── ${center.name} (${spec.radiusKm} km, res ${H3_RES}) ──`,
  );
  console.log(
    `  grid: ${grid.totalInDisk} cells in ${spec.radiusKm} km disk, ` +
      `${grid.waterFiltered} dropped by water mask (${((grid.waterFiltered / grid.totalInDisk) * 100).toFixed(1)}%), ` +
      `${allSeeds.length} land cells to score`,
  );
  if (opts.limit) console.log(`  limit: ${opts.limit}`);

  const cp: Checkpoint = opts.fresh
    ? { city: spec.id, h3Res: H3_RES, radiusKm: spec.radiusKm, completed: {} }
    : loadCheckpoint(spec.id) ?? {
        city: spec.id,
        h3Res: H3_RES,
        radiusKm: spec.radiusKm,
        completed: {},
      };

  // Drop any checkpointed cells that are no longer in the seed set (e.g.
  // after a radius change or water-mask update).
  const seedIds = new Set(allSeeds.map((s) => s.h3));
  for (const h3 of Object.keys(cp.completed)) {
    if (!seedIds.has(h3)) delete cp.completed[h3];
  }

  const priorDone = Object.keys(cp.completed).length;
  if (priorDone > 0) {
    console.log(`  checkpoint: resuming with ${priorDone} cells already scored`);
  }

  const todo = seeds.filter((s) => !cp.completed[s.h3]);
  if (todo.length === 0) {
    console.log(`  all cells already in checkpoint — skipping Entur calls`);
    const completed = seeds.map((s) => cp.completed[s.h3]).filter(Boolean);
    return {
      cells: completed,
      totalInDisk: grid.totalInDisk,
      waterFiltered: grid.waterFiltered,
      elapsedMs: 0,
    };
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

  const cells = seeds
    .map((s) => cp.completed[s.h3])
    .filter((c): c is HeatmapCell => Boolean(c));

  return {
    cells,
    totalInDisk: grid.totalInDisk,
    waterFiltered: grid.waterFiltered,
    elapsedMs: Date.now() - t0,
  };
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

/* ── Output files ────────────────────────────────────────────────────── */

function renderCityFile(
  cityId: WorkCenterId,
  radiusKm: number,
  generatedAt: string,
  cells: HeatmapCell[],
): string {
  return `/**
 * Pre-computed /bykart Pendlings-poeng heatmap cells for ${getWorkCenter(cityId).name}.
 *
 * Regenerated by \`scripts/refresh-bykart-heatmap.ts\`. The heatmap layer on
 * /bykart lazy-imports this file when the ${cityId} view is activated.
 *
 * Hexes over water (Kartverket N50 Havflate + Innsjø polygons) are excluded
 * entirely — they are dropped before scoring and never appear in this file.
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

export interface BykartHeatmapCityData {
  id: WorkCenterId;
  generatedAt: string;
  h3Res: number;
  radiusKm: number;
  cells: ReadonlyArray<BykartHeatmapCell>;
}

export const BYKART_HEATMAP_CITY: BykartHeatmapCityData = {
  id: ${JSON.stringify(cityId)},
  generatedAt: ${JSON.stringify(generatedAt)},
  h3Res: ${H3_RES},
  radiusKm: ${radiusKm},
  cells: ${JSON.stringify(cells)},
};
`;
}

/**
 * Back-compat shim at the old path — `BykartHeatmapLayer.tsx` still imports
 * from `@/data/bykart-heatmap-data` and expects the legacy
 * `BYKART_HEATMAP_DATA.cities[city].cells` shape. Delete this file once the
 * UI switches to dynamic per-city imports (Phase 4 of PR 4b).
 */
function renderCompatShim(): string {
  return `/**
 * Back-compat shim — exposes the old \`BYKART_HEATMAP_DATA\` interface backed
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
`;
}

function cityFilePath(cityId: WorkCenterId): string {
  return resolve(DATA_DIR, `bykart-heatmap-${cityId}.ts`);
}

function compatFilePath(): string {
  return resolve(DATA_DIR, `bykart-heatmap-data.ts`);
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

  console.log("Refreshing /bykart heatmap data (Entur live + N50 water mask)");
  console.log(`H3 resolution: ${H3_RES}`);
  console.log(`Cities: ${cities.map((c) => c.id).join(", ")}`);
  if (args.fresh) console.log("Mode: --fresh (ignoring checkpoints)");

  const t0 = Date.now();
  const summary: Array<{
    id: WorkCenterId;
    cells: number;
    totalInDisk: number;
    waterFiltered: number;
    fileBytes: number;
    elapsedMs: number;
    histogram: string;
  }> = [];

  for (const spec of cities) {
    const result = await scoreCity(spec, { limit: args.limit, fresh: args.fresh });
    const { overridden } = applyWorkCenterOverride(result.cells, spec.id);
    if (overridden > 0) {
      console.log(
        `  work-center override: promoted ${overridden} score-0 cells within ${ORIGIN_CELL_RADIUS_KM} km of ${spec.id} sentrum to 100`,
      );
    }

    const generatedAt = new Date().toISOString();
    const fileContent = renderCityFile(
      spec.id,
      spec.radiusKm,
      generatedAt,
      result.cells,
    );
    const outPath = cityFilePath(spec.id);
    writeFileSync(outPath, fileContent, "utf8");
    const fileBytes = Buffer.byteLength(fileContent, "utf8");
    console.log(
      `  wrote ${outPath} — ${(fileBytes / 1024).toFixed(1)} kB, ${result.cells.length} cells`,
    );
    console.log(`  score distribution — ${scoreHistogram(result.cells)}`);

    summary.push({
      id: spec.id,
      cells: result.cells.length,
      totalInDisk: result.totalInDisk,
      waterFiltered: result.waterFiltered,
      fileBytes,
      elapsedMs: result.elapsedMs,
      histogram: scoreHistogram(result.cells),
    });
  }

  // Update the back-compat shim (only needed while BykartHeatmapLayer still
  // does a static import from bykart-heatmap-data.ts).
  if (cities.some((c) => c.id === "oslo")) {
    writeFileSync(compatFilePath(), renderCompatShim(), "utf8");
    console.log(`  refreshed ${compatFilePath()} (legacy compat shim)`);
  }

  // ── Final summary ────────────────────────────────────────────────
  const totalElapsedMin = (Date.now() - t0) / 60000;
  console.log("\n════════════ SUMMARY ════════════");
  for (const s of summary) {
    console.log(
      `  ${s.id.padEnd(12)} ` +
        `${String(s.cells).padStart(5)} cells ` +
        `(${String(s.totalInDisk).padStart(5)} in disk, ` +
        `${String(s.waterFiltered).padStart(4)} water) ` +
        `${(s.fileBytes / 1024).toFixed(0).padStart(4)} kB ` +
        `${(s.elapsedMs / 60000).toFixed(1).padStart(5)} min`,
    );
    console.log(`               ${s.histogram}`);
  }
  console.log(`  total time: ${totalElapsedMin.toFixed(1)} min`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(2);
});
