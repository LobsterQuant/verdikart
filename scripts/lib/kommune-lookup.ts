/**
 * Point-in-polygon kommune lookup for refresh scripts.
 *
 * Backed by Kartverket's nationwide kommune GeoJSON (Basisdata_0000_Norge_4258
 * _Kommune_GeoJSON) — 357 MultiPolygon features keyed by kommunenummer, EPSG
 * 4258 (≈ WGS 84 for leaf-level precision). We prefer a local PIP over a
 * Geonorge `punktsok` reverse-geocode because heatmap refreshes issue ~10 k
 * lookups; a local index keeps them free and deterministic.
 *
 * The source file lives in `.cache/kommuner/` and is NOT committed (32 MB).
 * It is populated by `scripts/refresh-kommune-polygons.ts`, which downloads
 * the official dataset from Geonorge. If the file is missing,
 * `kommuneAtPoint` throws with a pointer to that script.
 *
 * Script-only module. Do not import from client code.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import type { Feature, MultiPolygon, Polygon } from "geojson";

const SOURCE_PATH = resolve(
  process.cwd(),
  ".cache/kommuner/Basisdata_0000_Norge_4258_Kommune_GeoJSON.geojson",
);

interface Bbox {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

interface PreparedKommune {
  kommunenummer: string;
  kommunenavn: string;
  feature: Feature<Polygon | MultiPolygon>;
  bbox: Bbox;
}

let cache: PreparedKommune[] | null = null;

function loadKommuner(): PreparedKommune[] {
  if (cache) return cache;
  if (!existsSync(SOURCE_PATH)) {
    throw new Error(
      `Kommune polygons missing at ${SOURCE_PATH}. ` +
        `Run \`npx tsx scripts/refresh-kommune-polygons.ts\` to download them from Geonorge.`,
    );
  }
  // Kartverket ships the file with a UTF-8 BOM.
  const raw = readFileSync(SOURCE_PATH, "utf8").replace(/^﻿/, "");
  const json = JSON.parse(raw) as {
    features: Array<Feature<Polygon | MultiPolygon> & {
      properties?: { kommunenummer?: string; kommunenavn?: string };
    }>;
  };

  cache = json.features
    .filter((f) => typeof f.properties?.kommunenummer === "string")
    .map((feature) => {
      let minLon = Infinity, maxLon = -Infinity;
      let minLat = Infinity, maxLat = -Infinity;
      const polys =
        feature.geometry.type === "MultiPolygon"
          ? feature.geometry.coordinates
          : [feature.geometry.coordinates];
      for (const poly of polys) {
        for (const [lon, lat] of poly[0]) {
          if (lon < minLon) minLon = lon;
          if (lon > maxLon) maxLon = lon;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }
      }
      return {
        kommunenummer: feature.properties!.kommunenummer!,
        kommunenavn: feature.properties?.kommunenavn ?? "",
        feature,
        bbox: { minLon, maxLon, minLat, maxLat },
      };
    });
  return cache;
}

export interface KommuneHit {
  kommunenummer: string;
  kommunenavn: string;
}

/**
 * Returns the kommune containing (lat, lon), or null if the point falls in
 * the sea (outside every kommune polygon). Heatmap callers should drop sea
 * cells via the water mask first — a null here is either a fjord cell the
 * water mask missed or an out-of-Norway coordinate.
 */
export function kommuneAtPoint(lat: number, lon: number): KommuneHit | null {
  const pt = point([lon, lat]);
  for (const k of loadKommuner()) {
    if (lon < k.bbox.minLon || lon > k.bbox.maxLon) continue;
    if (lat < k.bbox.minLat || lat > k.bbox.maxLat) continue;
    if (booleanPointInPolygon(pt, k.feature)) {
      return { kommunenummer: k.kommunenummer, kommunenavn: k.kommunenavn };
    }
  }
  return null;
}

export function kommuneSourcePath(): string {
  return SOURCE_PATH;
}
