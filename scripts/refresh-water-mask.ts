/**
 * Refresh src/data/kartverket-n50-coastline.json from Kartverket N50 Kartdata.
 *
 * Downloads the N50 Arealdekke GML files per kommune, extracts the Havflate
 * (sea) and Innsjø (lake) polygons, reprojects to WGS84, clips to each
 * Pendlings-poeng work-center's 25 km bbox, and writes the result as a single
 * GeoJSON. The resulting file drives scripts/lib/water-mask.ts, which the
 * /bykart heatmap refresh script uses to skip hexes over water.
 *
 * Data source:  Kartverket N50 Kartdata (Arealdekke layer) via Geonorge ATOM
 *               feed. CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/
 * Resolution:   1:50 000 (~10–50 m along coastline). Resolves fjords and
 *               small islands correctly, unlike Natural Earth 10m.
 * File size:    ~10 MB committed. Script-only — never imported by client code.
 *
 * Required tools: ogr2ogr (GDAL). Install via `brew install gdal`.
 *
 * How to run:
 *   npx tsx scripts/refresh-water-mask.ts            # incremental (skips
 *                                                    # downloads that already
 *                                                    # exist in .cache/)
 *   npx tsx scripts/refresh-water-mask.ts --fresh    # force re-download
 *
 * The kommune list below covers the 6 work-centers + immediate coastal
 * neighbors within the 25 km scoring radius. Adding a new work-center or
 * enlarging a radius means extending KOMMUNER.
 *
 * Manual refresh — not in CI. Kartverket N50 updates weekly; we only re-run
 * when the /bykart heatmap refresh shows coastal artifacts.
 */

import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { WORK_CENTERS } from "../src/lib/scoring/work-centers";

/* ── Config ──────────────────────────────────────────────────────────── */

/**
 * Kommune entries for download. The name must match the Geonorge ATOM-feed
 * URL exactly (ASCII transliteration of Norwegian characters — "Bærum" is
 * "Berum", "Tromsø" is "Tromso", "Indre Fosen" uses an underscore).
 *
 * Coverage targets: the 6 work-center kommuner, plus coastal neighbors
 * inside each 25 km scoring radius that contain water polygons we need.
 */
const KOMMUNER: ReadonlyArray<{ number: string; name: string }> = [
  // Oslo-area
  { number: "0301", name: "Oslo" },
  { number: "3201", name: "Berum" },        // Bærum (Oslofjord west, inner)
  { number: "3212", name: "Nesodden" },     // Oslofjord east bank
  { number: "3214", name: "Frogn" },        // Oslofjord west bank, south
  // Bergen-area
  { number: "4601", name: "Bergen" },
  { number: "4627", name: "Askoy" },        // Askøy (island NW of Bergen)
  // Trondheim-area
  { number: "5001", name: "Trondheim" },
  { number: "5031", name: "Malvik" },       // east of Trondheim
  { number: "5054", name: "Indre_Fosen" },  // north across Trondheimsfjord
  // Stavanger-area
  { number: "1103", name: "Stavanger" },
  { number: "1108", name: "Sandnes" },
  { number: "1124", name: "Sola" },
  { number: "1127", name: "Randaberg" },
  // Kristiansand
  { number: "4204", name: "Kristiansand" },
  // Tromsø (one kommune covers the full 25 km radius — very large)
  { number: "5501", name: "Tromso" },
];

/** Which N50 Arealdekke polygon classes to treat as water. */
const WATER_LAYERS = ["Havflate", "Innsjø"] as const;

/** Bbox pad beyond the 25 km radius so polygons straddling the edge survive. */
const BBOX_PAD_KM = 2;

/** Rounded coordinate precision in output (5 decimals ≈ 1.1 m at lat 60°). */
const COORD_DECIMALS = 5;

const CACHE_DIR = resolve(process.cwd(), ".cache/N50");
const OUT_PATH = resolve(
  process.cwd(),
  "src/data/kartverket-n50-coastline.json",
);
const BASE_URL =
  "https://nedlasting.geonorge.no/geonorge/Basisdata/N50Kartdata/GML";

/* ── CLI ─────────────────────────────────────────────────────────────── */

function parseArgs(argv: string[]): { fresh: boolean } {
  return { fresh: argv.includes("--fresh") };
}

/* ── Download ────────────────────────────────────────────────────────── */

function downloadKommune(k: { number: string; name: string }, fresh: boolean) {
  const zipPath = resolve(CACHE_DIR, `${k.number}_${k.name}.zip`);
  const dirPath = resolve(CACHE_DIR, `${k.number}_${k.name}`);

  if (!fresh && existsSync(dirPath)) return dirPath;

  mkdirSync(CACHE_DIR, { recursive: true });
  const url = `${BASE_URL}/Basisdata_${k.number}_${k.name}_25833_N50Kartdata_GML.zip`;
  console.log(`  ↓ ${k.number} ${k.name}`);
  execSync(`curl -sfL -o "${zipPath}" "${url}"`);
  execSync(`unzip -oq "${zipPath}" -d "${dirPath}"`);
  return dirPath;
}

/* ── GML → GeoJSON via ogr2ogr ──────────────────────────────────────── */

interface Feature {
  type: "Feature";
  properties: { kind: "sea" | "lake" };
  geometry: GeoJsonGeom;
}
type GeoJsonGeom =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

function extractLayer(
  gmlPath: string,
  layerName: string,
): Array<{ type: "Feature"; properties: unknown; geometry: GeoJsonGeom }> {
  const outPath = `/tmp/n50_${layerName}_${Date.now()}.geojson`;
  execSync(
    `ogr2ogr -f GeoJSON -t_srs EPSG:4326 "${outPath}" "${gmlPath}" "${layerName}"`,
    { stdio: ["pipe", "pipe", "pipe"] },
  );
  let raw = readFileSync(outPath, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const data = JSON.parse(raw) as {
    features: Array<{
      type: "Feature";
      properties: unknown;
      geometry: GeoJsonGeom;
    }>;
  };
  try {
    execSync(`rm "${outPath}"`);
  } catch {}
  return data.features;
}

/* ── Bbox + clip ─────────────────────────────────────────────────────── */

interface Bbox {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

function featureBbox(f: Feature): Bbox {
  let minLon = Infinity,
    maxLon = -Infinity,
    minLat = Infinity,
    maxLat = -Infinity;
  const polys =
    f.geometry.type === "MultiPolygon"
      ? f.geometry.coordinates
      : [f.geometry.coordinates];
  for (const poly of polys) {
    for (const [lon, lat] of poly[0]) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return { minLon, maxLon, minLat, maxLat };
}

function bboxIntersects(a: Bbox, b: Bbox): boolean {
  return (
    a.minLon <= b.maxLon &&
    a.maxLon >= b.minLon &&
    a.minLat <= b.maxLat &&
    a.maxLat >= b.minLat
  );
}

function buildCityBboxes(): Bbox[] {
  return WORK_CENTERS.map((w) => {
    const radius = 25 + BBOX_PAD_KM;
    const dLat = radius / 111.0;
    const dLon = radius / (111.0 * Math.cos((w.lat * Math.PI) / 180));
    return {
      minLat: w.lat - dLat,
      maxLat: w.lat + dLat,
      minLon: w.lon - dLon,
      maxLon: w.lon + dLon,
    };
  });
}

/* ── Coordinate rounding ─────────────────────────────────────────────── */

const POW = 10 ** COORD_DECIMALS;
function round(n: number): number {
  return Math.round(n * POW) / POW;
}

function roundGeom(g: GeoJsonGeom): GeoJsonGeom {
  if (g.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: g.coordinates.map((ring) =>
        ring.map((c) => [round(c[0]), round(c[1])]),
      ),
    };
  }
  return {
    type: "MultiPolygon",
    coordinates: g.coordinates.map((poly) =>
      poly.map((ring) => ring.map((c) => [round(c[0]), round(c[1])])),
    ),
  };
}

/* ── Main ────────────────────────────────────────────────────────────── */

async function main() {
  const { fresh } = parseArgs(process.argv);

  console.log("Refreshing Kartverket N50 water mask");
  console.log(
    `Kommuner: ${KOMMUNER.length} × ~10 MB = ~${(KOMMUNER.length * 10) / 1000} GB raw (cached)`,
  );

  // Sanity-check required binaries
  try {
    execSync("ogr2ogr --version", { stdio: "ignore" });
  } catch {
    console.error(
      "ogr2ogr not found. Install GDAL: brew install gdal (takes several minutes).",
    );
    process.exit(1);
  }

  const cityBboxes = buildCityBboxes();
  const allFeatures: Feature[] = [];

  for (const k of KOMMUNER) {
    const dir = downloadKommune(k, fresh);
    const files = readdirSync(dir);
    const gml = files.find((f) => f.includes("Arealdekke_GML.gml"));
    if (!gml) {
      console.warn(`  ${k.number} ${k.name}: no Arealdekke GML, skipping`);
      continue;
    }
    const gmlPath = resolve(dir, gml);

    for (const layer of WATER_LAYERS) {
      const kind = layer === "Havflate" ? "sea" : "lake";
      const feats = extractLayer(gmlPath, layer);
      for (const f of feats) {
        allFeatures.push({
          type: "Feature",
          properties: { kind },
          geometry: f.geometry,
        });
      }
      console.log(`    ${k.number} ${layer}: ${feats.length} features`);
    }
  }

  console.log(`\nCollected ${allFeatures.length} features (pre-clip)`);

  // Clip: keep only features whose bbox overlaps any work-center bbox
  const clipped = allFeatures.filter((f) => {
    const bb = featureBbox(f);
    return cityBboxes.some((cb) => bboxIntersects(bb, cb));
  });
  console.log(`After clip to work-center bboxes: ${clipped.length} features`);

  // Round coordinates
  const out = {
    type: "FeatureCollection" as const,
    features: clipped.map((f) => ({
      type: "Feature" as const,
      properties: f.properties,
      geometry: roundGeom(f.geometry),
    })),
  };

  const outStr = JSON.stringify(out);
  writeFileSync(OUT_PATH, outStr, "utf8");
  const kb = Buffer.byteLength(outStr, "utf8") / 1024;
  console.log(`\nWrote ${OUT_PATH} (${(kb / 1024).toFixed(2)} MB)`);

  // Summary histogram
  const sea = out.features.filter((f) => f.properties.kind === "sea").length;
  const lake = out.features.filter((f) => f.properties.kind === "lake").length;
  console.log(`  sea polygons:  ${sea}`);
  console.log(`  lake polygons: ${lake}`);
}

main().catch((err) => {
  console.error("refresh-water-mask failed:", err);
  process.exit(2);
});
