/**
 * Water mask: is a lat/lon on land?
 *
 * Backed by Kartverket N50 Kartdata (Arealdekke layer) — Havflate (sea) and
 * Innsjø (lake) polygons for the kommuner that overlap the 6 Pendlings-poeng
 * work-center regions. A point is *on water* if it falls inside any Havflate
 * or Innsjø polygon; everything else is *on land*.
 *
 * This is the inverse of a land mask. It works for our case because the refresh
 * script only queries points inside the 25 km scoring radius of a work-center,
 * where the water polygons are densely populated. Points far outside these
 * regions will incorrectly report "land" — callers must not query them.
 *
 * Source: Kartverket N50 Kartdata via Geonorge.no, CC BY 4.0. Rebuilt by
 * scripts/refresh-water-mask.ts, which downloads the N50 GML per kommune,
 * extracts Havflate + Innsjø, reprojects to WGS84, and clips to each
 * work-center's 25 km bbox. See that script's header for details.
 *
 * Resolution: N50 = 1:50 000, roughly 10–50 m precision along the coastline.
 * Handles Norway's fjords and small islands correctly — verified against known
 * points (see scripts/test-water-mask.ts).
 *
 * Script-only module. Do not import from client code.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import type { Feature, MultiPolygon, Polygon } from "geojson";

interface PolygonBbox {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

interface PreparedFeature {
  feature: Feature<Polygon | MultiPolygon>;
  bbox: PolygonBbox;
}

let cache: PreparedFeature[] | null = null;

function loadFeatures(): PreparedFeature[] {
  if (cache) return cache;
  const path = resolve(process.cwd(), "src/data/kartverket-n50-coastline.json");
  const raw = JSON.parse(readFileSync(path, "utf8")) as {
    type: "FeatureCollection";
    features: Array<Feature<Polygon | MultiPolygon>>;
  };

  cache = raw.features.map((feature) => {
    let minLon = Infinity,
      maxLon = -Infinity,
      minLat = Infinity,
      maxLat = -Infinity;
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
    return { feature, bbox: { minLon, maxLon, minLat, maxLat } };
  });
  return cache;
}

/**
 * True if (lat, lon) is on land — i.e., not inside any Kartverket N50
 * Havflate (sea) or Innsjø (lake) polygon in the indexed regions.
 *
 * Only meaningful for points within 25 km of one of the 6 Pendlings-poeng
 * work-centers. Points outside these regions lack water-polygon coverage
 * and will incorrectly report true.
 */
export function isOnLand(lat: number, lon: number): boolean {
  const features = loadFeatures();
  const pt = point([lon, lat]);
  for (const { feature, bbox } of features) {
    if (lon < bbox.minLon || lon > bbox.maxLon) continue;
    if (lat < bbox.minLat || lat > bbox.maxLat) continue;
    if (booleanPointInPolygon(pt, feature)) return false;
  }
  return true;
}
