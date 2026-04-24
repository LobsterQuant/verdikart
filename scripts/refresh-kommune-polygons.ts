/**
 * Download the nationwide Kartverket kommune polygon dataset into `.cache/`.
 *
 * Consumed by `scripts/lib/kommune-lookup.ts` (point-in-polygon lookup for
 * heatmap refresh scripts). The file is 32 MB, so it stays in `.cache/` and
 * is never committed — this script repopulates it from Geonorge's open
 * download API.
 *
 * Source: Kartverket Basisdata — Administrative enheter. CC BY 4.0.
 * Dataset id: 041f1e6e-bdbc-4091-b48f-8a5990f3cc5b (Kommuner).
 *
 * How to run:
 *   npx tsx scripts/refresh-kommune-polygons.ts
 *
 * Required env vars: NONE. Exits 0 on success.
 */
import { createWriteStream, existsSync, mkdirSync, renameSync } from "node:fs";
import { resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const URL =
  "https://nedlasting.geonorge.no/geonorge/Basisdata/Administrative_enheter/GeoJSON/Basisdata_0000_Norge_4258_Kommune_GeoJSON.zip";

const CACHE_DIR = resolve(process.cwd(), ".cache/kommuner");
const ZIP_PATH = resolve(CACHE_DIR, "kommuner.zip");
const GEOJSON_PATH = resolve(
  CACHE_DIR,
  "Basisdata_0000_Norge_4258_Kommune_GeoJSON.geojson",
);

async function main() {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });

  console.log(`Downloading kommune polygons from ${URL} …`);
  const res = await fetch(URL);
  if (!res.ok || !res.body) {
    throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  }
  const tmp = `${ZIP_PATH}.part`;
  await pipeline(Readable.fromWeb(res.body as never), createWriteStream(tmp));
  renameSync(tmp, ZIP_PATH);
  console.log(`  wrote ${ZIP_PATH}`);

  // Shell-out to `unzip` keeps the script dependency-free. macOS + Linux ship
  // with it; if this ever needs Windows support, swap for adm-zip.
  const { execFileSync } = await import("node:child_process");
  console.log(`Unzipping into ${CACHE_DIR} …`);
  execFileSync("unzip", ["-o", ZIP_PATH, "-d", CACHE_DIR], {
    stdio: "inherit",
  });
  if (!existsSync(GEOJSON_PATH)) {
    throw new Error(
      `Expected ${GEOJSON_PATH} after unzip — archive layout changed?`,
    );
  }
  console.log(`Ready: ${GEOJSON_PATH}`);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
