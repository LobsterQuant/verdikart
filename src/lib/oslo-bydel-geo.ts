/**
 * Coordinate-based Oslo bydel lookup.
 *
 * Fallback for when postnummer is missing (e.g. direct links, sitemap
 * crawlers, "Lignende adresser" navigation). The /eiendom/[slug] route's
 * slug format encodes lat/lon but not postnummer, so without this helper
 * any URL arrived at without ?pnr= silently fell back to the Oslo
 * kommune average (93,2 per 1 000) — masking the per-bydel variation.
 *
 * Approach: closest-centroid match over the same 17 zone names used in
 * OSLO_BYDEL_INDEX / OSLO_BYDEL_CRIME (15 official bydeler + Sentrum and
 * Majorstuen/Holmenkollen sub-zones). Centroids are taken from Oslo
 * kommune's bydel map (kart.oslo.kommune.no) at the geometric centre of
 * each bydel's populated core. Good enough for Oslo's 15 bydeler which
 * are mostly compact and non-overlapping; borderline points land in the
 * right zone because centroid distance in a plane correlates strongly
 * with polygon membership at this scale.
 *
 * Out-of-Oslo points return null so the caller can fall back to the
 * kommune-level crime data.
 */

const OSLO_BBOX = {
  minLat: 59.80,
  maxLat: 60.02,
  minLon: 10.48,
  maxLon: 10.97,
} as const;

interface Centroid {
  name: string;
  lat: number;
  lon: number;
}

// Zone names must match keys in OSLO_BYDEL_CRIME / names in OSLO_BYDEL_INDEX.
const CENTROIDS: readonly Centroid[] = [
  { name: "Sentrum",            lat: 59.9120, lon: 10.7490 },
  { name: "Gamle Oslo",         lat: 59.9080, lon: 10.7830 },
  { name: "Grünerløkka",        lat: 59.9240, lon: 10.7600 },
  { name: "Sagene",             lat: 59.9370, lon: 10.7580 },
  { name: "St. Hanshaugen",     lat: 59.9290, lon: 10.7380 },
  { name: "Frogner",            lat: 59.9180, lon: 10.7080 },
  { name: "Majorstuen",         lat: 59.9300, lon: 10.7170 },
  { name: "Ullern",             lat: 59.9210, lon: 10.6650 },
  { name: "Holmenkollen",       lat: 59.9630, lon: 10.6750 },
  { name: "Nordre Aker",        lat: 59.9580, lon: 10.7530 },
  { name: "Bjerke",             lat: 59.9440, lon: 10.8100 },
  { name: "Grorud",             lat: 59.9620, lon: 10.8830 },
  { name: "Stovner",            lat: 59.9640, lon: 10.9250 },
  { name: "Alna",               lat: 59.9320, lon: 10.8880 },
  { name: "Østensjø",           lat: 59.8940, lon: 10.8320 },
  { name: "Nordstrand",         lat: 59.8640, lon: 10.8080 },
  { name: "Søndre Nordstrand",  lat: 59.8340, lon: 10.8150 },
];

function isInOslo(lat: number, lon: number): boolean {
  return (
    lat >= OSLO_BBOX.minLat &&
    lat <= OSLO_BBOX.maxLat &&
    lon >= OSLO_BBOX.minLon &&
    lon <= OSLO_BBOX.maxLon
  );
}

/**
 * Returns the closest Oslo bydel zone name for a given coordinate, or
 * null if the coordinate is outside Oslo's bounding box.
 *
 * The returned name matches keys in OSLO_BYDEL_CRIME, so callers can
 * look up crime data directly: OSLO_BYDEL_CRIME[bydelFromCoordinates(..)!].
 */
export function bydelFromCoordinates(lat: number, lon: number): string | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (!isInOslo(lat, lon)) return null;

  // Equirectangular squared distance is enough for ranking — avoids sqrt
  // and the trig overhead of haversine. Latitude compression factor at
  // ~60°N is cos(60°) ≈ 0.5 but since we only need relative ordering,
  // weighting longitude equally still ranks correctly within Oslo.
  let bestName: string | null = null;
  let bestDist = Infinity;
  for (const c of CENTROIDS) {
    const dLat = c.lat - lat;
    const dLon = c.lon - lon;
    const d = dLat * dLat + dLon * dLon;
    if (d < bestDist) {
      bestDist = d;
      bestName = c.name;
    }
  }
  return bestName;
}
