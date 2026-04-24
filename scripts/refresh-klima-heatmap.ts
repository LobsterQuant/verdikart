/**
 * Refresh the /bykart Klima-poeng heatmap data cache — 6 Norwegian work
 * centers (Oslo, Bergen, Trondheim, Stavanger, Kristiansand, Tromsø).
 *
 * Mirrors scripts/refresh-bykart-heatmap.ts (Pendlings-poeng) one-for-one —
 * same H3 grid, same water mask, same checkpointing — but swaps the scorer
 * to `calculateKlimaPoeng` and adds a kommune-lookup step so radon and
 * klimaprofil can contribute. Kommunenummer comes from a local
 * point-in-polygon index (scripts/lib/kommune-lookup.ts), not a reverse-
 * geocode, so the refresh issues zero calls to Geonorge.
 *
 * For each city the script:
 *   1. Enumerates an H3 resolution-8 hex grid covering the city's radius.
 *   2. Drops cells whose centroid falls over water (Kartverket N50 mask).
 *   3. Resolves the containing kommunenummer for each remaining cell.
 *   4. Scores via calculateKlimaPoeng and writes per-city files at
 *      src/data/bykart-klima-<city>.ts.
 *
 * Per cell stored: h3, lat, lon, score, boundary. Component breakdown is
 * NOT stored (Phase 5 bundle-size decision) — the heatmap UI only needs the
 * total; deep-dives go to /eiendom pages where the full breakdown is
 * re-computed live.
 *
 * Upstream data sources (per cell ≈ 9 WMS calls):
 *   NVE Flomsone1, FlomAktsomhet1                  (2)
 *   NVE Kvikkleire2                                (1)
 *   NVE JordFlomskred, SkredSteinAktR, SnoskredAkt (3)
 *   Kartverket stormflo 20/200/1000                (3)
 *
 * Throttle: CONCURRENCY × INTER_BATCH_DELAY ≈ 1.3 cell/s ceiling. Slower
 * than Pendlings-heatmap because more upstream hosts are involved — NVE and
 * Kartverket WMS are both smaller than Entur and each cell hits both.
 *
 * Expected sizes (post-water-filter, mirrors Pendlings):
 *   oslo         25 km ≈ 2 600 cells
 *   bergen       20 km ≈ 1 800 cells
 *   stavanger    20 km ≈ 1 800 cells
 *   trondheim    15 km ≈ 1 000 cells
 *   kristiansand 15 km ≈ 1 000 cells
 *   tromso       15 km ≈ 1 000 cells
 *
 * Required env vars: NONE. Requires .cache/kommuner/*.geojson — rebuild with
 * `npx tsx scripts/refresh-kommune-polygons.ts` if missing.
 *
 * How to run:
 *   npx tsx scripts/refresh-klima-heatmap.ts                  # all 6 cities
 *   npx tsx scripts/refresh-klima-heatmap.ts --city oslo      # one city
 *   npx tsx scripts/refresh-klima-heatmap.ts --limit 50       # smoke test
 *   npx tsx scripts/refresh-klima-heatmap.ts --fresh          # ignore checkpoints
 *
 * Checkpointing: JSON checkpoint written to .cache/bykart-klima-<city>.json
 * after every batch; re-runs resume where the previous run stopped.
 *
 * Exits 0 on success. Exits 2 if upstream WMS fails for > 5 % of cells in
 * any city (do not overwrite a cached snapshot with mostly-broken data).
 * A per-city failure is logged and skipped so the remaining cities still
 * refresh; the non-zero exit code surfaces at the end.
 *
 * Manual / weekly cadence. Not part of CI.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import {
  latLngToCell,
  cellToLatLng,
  cellToBoundary,
  gridDisk,
} from "h3-js";
import {
  calculateKlimaPoeng,
  type KlimaPoengResult,
} from "../src/lib/scoring/klima-poeng";
import { getWorkCenter, type WorkCenterId } from "../src/lib/scoring/work-centers";
import { haversineKm } from "../src/lib/geo";
import { isOnLand } from "./lib/water-mask";
import { kommuneAtPoint } from "./lib/kommune-lookup";

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
const CONCURRENCY = 2;
const INTER_BATCH_DELAY_MS = 1500;
const FAILURE_THRESHOLD = 0.05;

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

/* ── H3 grid + water + kommune ───────────────────────────────────────── */

function round5(n: number): number {
  return Math.round(n * 1e5) / 1e5;
}

interface HexSeed {
  h3: string;
  lat: number;
  lon: number;
  kommunenummer: string | null;
  boundary: Array<[number, number]>;
}

interface GridResult {
  seeds: HexSeed[];
  totalInDisk: number;
  waterFiltered: number;
  kommuneMissing: number;
}

function buildHexGrid(spec: CitySpec): GridResult {
  const center = getWorkCenter(spec.id);
  const originCell = latLngToCell(center.lat, center.lon, H3_RES);
  const disk = gridDisk(originCell, spec.gridK);

  const seeds: HexSeed[] = [];
  let totalInDisk = 0;
  let waterFiltered = 0;
  let kommuneMissing = 0;
  for (const h3 of disk) {
    const [lat, lon] = cellToLatLng(h3);
    const distKm = haversineKm(lat, lon, center.lat, center.lon);
    if (distKm > spec.radiusKm) continue;
    totalInDisk++;
    if (!isOnLand(lat, lon)) {
      waterFiltered++;
      continue;
    }
    // Resolve containing kommune. A null here (fjord edge not caught by the
    // water mask, or out-of-Norway) is kept but scored with kommunenummer
    // = null — radon and klimaprofil then fall back to the non-radon weights
    // and a neutral klimaprofil score.
    const hit = kommuneAtPoint(lat, lon);
    if (!hit) kommuneMissing++;
    const boundary = cellToBoundary(h3) as Array<[number, number]>;
    seeds.push({
      h3,
      lat: round5(lat),
      lon: round5(lon),
      kommunenummer: hit ? hit.kommunenummer : null,
      boundary: boundary.map(([bLat, bLon]) => [round5(bLat), round5(bLon)]),
    });
  }
  return { seeds, totalInDisk, waterFiltered, kommuneMissing };
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
  return resolve(CHECKPOINT_DIR, `bykart-klima-${cityId}.json`);
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

/**
 * Aggregate hit counters gathered while scoring — they let Checkpoint 2
 * answer "is the WMS wiring actually flagging hazards?" without a second
 * pass over the data. Only components scored in this run are counted (cells
 * restored from the checkpoint contribute to the output file but not to
 * these counters, since the checkpoint only preserves totals).
 */
interface ComponentHitCounts {
  scoredNow: number;
  kvikkleireInside: number;
  skredAny: number;
  skredJordflom: number;
  skredSteinsprang: number;
  skredSnoskred: number;
  floodHigh: number;
  floodModerate: number;
  stormSurge20yrNow: number;
  stormSurge200yr2100: number;
  stormSurge1000yr2100: number;
  radonAssessed: number;
  radonHigh: number;
  radonModerate: number;
}

function emptyHitCounts(): ComponentHitCounts {
  return {
    scoredNow: 0,
    kvikkleireInside: 0,
    skredAny: 0,
    skredJordflom: 0,
    skredSteinsprang: 0,
    skredSnoskred: 0,
    floodHigh: 0,
    floodModerate: 0,
    stormSurge20yrNow: 0,
    stormSurge200yr2100: 0,
    stormSurge1000yr2100: 0,
    radonAssessed: 0,
    radonHigh: 0,
    radonModerate: 0,
  };
}

function tallyHit(counts: ComponentHitCounts, r: KlimaPoengResult): void {
  counts.scoredNow++;
  const c = r.components;
  if (c.quickClay) counts.kvikkleireInside++;
  if (c.skred.jordflom || c.skred.steinsprang || c.skred.snoskred) {
    counts.skredAny++;
  }
  if (c.skred.jordflom) counts.skredJordflom++;
  if (c.skred.steinsprang) counts.skredSteinsprang++;
  if (c.skred.snoskred) counts.skredSnoskred++;
  if (c.floodRisk === "Høy") counts.floodHigh++;
  else if (c.floodRisk === "Moderat") counts.floodModerate++;
  if (c.stormSurge.in20YearCurrent) counts.stormSurge20yrNow++;
  if (c.stormSurge.in200Year2100) counts.stormSurge200yr2100++;
  if (c.stormSurge.in1000Year2100) counts.stormSurge1000yr2100++;
  if (c.radon.assessed) {
    counts.radonAssessed++;
    if (c.radon.level === "Høy") counts.radonHigh++;
    else if (c.radon.level === "Moderat") counts.radonModerate++;
  }
}

function formatHitCounts(h: ComponentHitCounts): string {
  if (h.scoredNow === 0) return "  (no cells scored this run — counters N/A)";
  const n = h.scoredNow;
  const pct = (x: number) => `${((x / n) * 100).toFixed(1)}%`;
  return [
    `  component hits (of ${n} cells scored this run):`,
    `    kvikkleire:  ${h.kvikkleireInside} (${pct(h.kvikkleireInside)})`,
    `    skred any:   ${h.skredAny} (${pct(h.skredAny)}) — ` +
      `jordflom ${h.skredJordflom}, steinsprang ${h.skredSteinsprang}, snøskred ${h.skredSnoskred}`,
    `    flom høy:    ${h.floodHigh} (${pct(h.floodHigh)}) — moderat ${h.floodModerate} (${pct(h.floodModerate)})`,
    `    stormflo:    ${h.stormSurge20yrNow} @ 20yr now, ${h.stormSurge200yr2100} @ 200yr 2100, ${h.stormSurge1000yr2100} @ 1000yr 2100`,
    `    radon:       ${h.radonAssessed} assessed — høy ${h.radonHigh}, moderat ${h.radonModerate}`,
  ].join("\n");
}

interface ScoreResult {
  cells: HeatmapCell[];
  totalInDisk: number;
  waterFiltered: number;
  kommuneMissing: number;
  elapsedMs: number;
  hits: ComponentHitCounts;
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
      `${grid.waterFiltered} dropped by water mask ` +
      `(${((grid.waterFiltered / grid.totalInDisk) * 100).toFixed(1)}%), ` +
      `${allSeeds.length} land cells to score ` +
      `(${grid.kommuneMissing} without kommune match)`,
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

  const hits = emptyHitCounts();

  const todo = seeds.filter((s) => !cp.completed[s.h3]);
  if (todo.length === 0) {
    console.log(`  all cells already in checkpoint — skipping WMS calls`);
    const completed = seeds.map((s) => cp.completed[s.h3]).filter(Boolean);
    return {
      cells: completed,
      totalInDisk: grid.totalInDisk,
      waterFiltered: grid.waterFiltered,
      kommuneMissing: grid.kommuneMissing,
      elapsedMs: 0,
      hits,
    };
  }

  const t0 = Date.now();
  const tasks: Task<[HexSeed, KlimaPoengResult]>[] = todo.map((seed) => ({
    label: seed.h3,
    run: () =>
      calculateKlimaPoeng(seed.lat, seed.lon, {
        kommunenummer: seed.kommunenummer,
      }).then<[HexSeed, KlimaPoengResult]>((r) => [seed, r]),
  }));

  let lastLogged = 0;
  let lastTalliedIdx = 0;
  const results = await runThrottled(tasks, (acc, total) => {
    const done = acc.length;
    // Tally any results added since last batch. runThrottled appends to `acc`
    // in order, so slicing from lastTalliedIdx yields exactly the new ones.
    for (let i = lastTalliedIdx; i < acc.length; i++) {
      const r = acc[i];
      if (isFailure(r)) continue;
      tallyHit(hits, r[1]);
    }
    lastTalliedIdx = acc.length;

    if (done - lastLogged < 40 && done !== total) return;
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
      const [seed, result] = r;
      cp.completed[seed.h3] = {
        h3: seed.h3,
        lat: seed.lat,
        lon: seed.lon,
        score: result.total,
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
        `Re-run when upstream WMS recovers (checkpoint preserved).`,
    );
  }

  for (const r of results) {
    if (isFailure(r)) continue;
    const [seed, result] = r;
    cp.completed[seed.h3] = {
      h3: seed.h3,
      lat: seed.lat,
      lon: seed.lon,
      score: result.total,
      boundary: seed.boundary,
    };
  }
  saveCheckpoint(cp);

  const cells = seeds
    .map((s) => cp.completed[s.h3])
    .filter((c): c is HeatmapCell => Boolean(c));

  console.log(formatHitCounts(hits));

  return {
    cells,
    totalInDisk: grid.totalInDisk,
    waterFiltered: grid.waterFiltered,
    kommuneMissing: grid.kommuneMissing,
    elapsedMs: Date.now() - t0,
    hits,
  };
}

/* ── Output files ────────────────────────────────────────────────────── */

function renderCityFile(
  cityId: WorkCenterId,
  radiusKm: number,
  generatedAt: string,
  cells: HeatmapCell[],
): string {
  return `/**
 * Pre-computed /bykart Klima-poeng heatmap cells for ${getWorkCenter(cityId).name}.
 *
 * Regenerated by \`scripts/refresh-klima-heatmap.ts\`. The heatmap layer on
 * /bykart lazy-imports this file when the ${cityId} view is activated in
 * klima mode.
 *
 * Hexes over water (Kartverket N50 Havflate + Innsjø polygons) are excluded
 * entirely — they are dropped before scoring and never appear in this file.
 * Boundaries are pre-computed so the client does not need to bundle h3-js.
 *
 * DO NOT edit manually — re-run the refresh script instead.
 */
import type { WorkCenterId } from "@/lib/scoring/work-centers";

export interface BykartKlimaCell {
  h3: string;
  lat: number;
  lon: number;
  score: number;
  boundary: ReadonlyArray<readonly [number, number]>;
}

export interface BykartKlimaCityData {
  id: WorkCenterId;
  generatedAt: string;
  h3Res: number;
  radiusKm: number;
  cells: ReadonlyArray<BykartKlimaCell>;
}

export const BYKART_KLIMA_CITY: BykartKlimaCityData = {
  id: ${JSON.stringify(cityId)},
  generatedAt: ${JSON.stringify(generatedAt)},
  h3Res: ${H3_RES},
  radiusKm: ${radiusKm},
  cells: ${JSON.stringify(cells)},
};
`;
}

function cityFilePath(cityId: WorkCenterId): string {
  return resolve(DATA_DIR, `bykart-klima-${cityId}.ts`);
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

  console.log("Refreshing /bykart Klima-poeng heatmap data");
  console.log(`H3 resolution: ${H3_RES}`);
  console.log(`Cities: ${cities.map((c) => c.id).join(", ")}`);
  console.log(
    `Throttle: concurrency ${CONCURRENCY}, ${INTER_BATCH_DELAY_MS} ms inter-batch delay`,
  );
  if (args.fresh) console.log("Mode: --fresh (ignoring checkpoints)");

  const t0 = Date.now();
  const summary: Array<{
    id: WorkCenterId;
    cells: number;
    totalInDisk: number;
    waterFiltered: number;
    kommuneMissing: number;
    fileBytes: number;
    elapsedMs: number;
    histogram: string;
    hits: ComponentHitCounts;
  }> = [];
  const failures: Array<{ id: WorkCenterId; error: Error }> = [];

  for (const spec of cities) {
    let result: ScoreResult;
    try {
      result = await scoreCity(spec, { limit: args.limit, fresh: args.fresh });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error(`  ✗ ${spec.id} failed: ${e.message}`);
      failures.push({ id: spec.id, error: e });
      continue;
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
      kommuneMissing: result.kommuneMissing,
      fileBytes,
      elapsedMs: result.elapsedMs,
      histogram: scoreHistogram(result.cells),
      hits: result.hits,
    });
  }

  const totalElapsedMin = (Date.now() - t0) / 60000;
  console.log("\n════════════ SUMMARY ════════════");
  for (const s of summary) {
    console.log(
      `  ${s.id.padEnd(12)} ` +
        `${String(s.cells).padStart(5)} cells ` +
        `(${String(s.totalInDisk).padStart(5)} in disk, ` +
        `${String(s.waterFiltered).padStart(4)} water, ` +
        `${String(s.kommuneMissing).padStart(3)} no-knr) ` +
        `${(s.fileBytes / 1024).toFixed(0).padStart(4)} kB ` +
        `${(s.elapsedMs / 60000).toFixed(1).padStart(5)} min`,
    );
    console.log(`               ${s.histogram}`);
    console.log(formatHitCounts(s.hits));
  }
  if (failures.length > 0) {
    console.log(`\n  ✗ ${failures.length} city/cities failed:`);
    for (const f of failures) {
      console.log(`    - ${f.id}: ${f.error.message}`);
    }
  }
  console.log(`  total time: ${totalElapsedMin.toFixed(1)} min`);
  process.exit(failures.length > 0 ? 2 : 0);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(2);
});
