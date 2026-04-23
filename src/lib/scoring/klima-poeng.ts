/**
 * Klima-poeng — a 0-100 composite climate/risk score per address, measuring
 * how exposed the location is to physical climate hazards (today and by 2100).
 * Second composite score after Pendlings-poeng; same architectural pattern.
 *
 * Six weighted components (high score = low risk = safe):
 *   - Flom          20%  NVE WMS (aktsomhetsområde + flomsone)
 *   - Kvikkleire    20%  NVE WMS (faresone)
 *   - Skred         20%  NVE WMS (jord-/flomskred + snøskred S3 + steinsprang)
 *   - Stormflo 2100 15%  Kartverket WMS (20-år nå, 200-år og 1000-år år 2100)
 *   - Radon         10%  Static per-kommune lookup (DSA / NGU summary)
 *   - Klimaprofil   15%  Static per-fylke Norsk Klimaservicesenter profile
 *
 * Skred is a composite binary flag across three NVE aktsomhetskart. Each
 * layer is yes/no at the point; the combined score drops with the number of
 * hits (0→100, 1→50, 2+→20). Urban addresses almost never hit these, so a
 * hit is a real signal rather than noise.
 *
 * Scope notes:
 *   - Skogbrann deferred to later PR (needs proximity to forest, not FWI).
 *   - Luftkvalitet-trend dropped; no historical NILU data.
 *   - Radon is kommune-resolution; point-level API not publicly available.
 *   - Klimaprofil is fylke-resolution on pre-2024 structure (KSS not yet
 *     republished for the 15-fylker reform).
 */
import { environmentalRiskData, type RiskLevel } from "@/data/environmentalRisk";
import { klimaprofilByFylke, type KlimaprofilValue } from "@/data/klimaprofil";
import { resolveKlimaprofilKey, type KlimaprofilKey } from "@/data/fylke-mapping";

/* ── Public types ──────────────────────────────────────────────────────── */

export interface StormSurgeZones {
  /** Currently in 20-year storm-surge zone — already at flood risk today. */
  in20YearCurrent: boolean;
  /** Within projected 200-year 2100 storm-surge zone. */
  in200Year2100: boolean;
  /** Within projected 1000-year 2100 (extreme tail) zone. */
  in1000Year2100: boolean;
}

export interface SkredLayers {
  /** Aktsomhetsområde jord- og flomskred (NVE 2025). */
  jordflom: boolean;
  /** Aktsomhetsområde steinsprang (NVE SkredSteinAktR). */
  steinsprang: boolean;
  /** Aktsomhetsområde snøskred S3 (NVE/NGI SnoskredAktsomhet). */
  snoskred: boolean;
}

/** Known-level radon assessment, or an explicit "not assessed" signal. */
export type AssessedRadonLevel = Exclude<RiskLevel, "Ukjent">;
export type RadonAssessment =
  | { assessed: false }
  | { assessed: true; level: AssessedRadonLevel; score: number };

export interface KlimaPoengComponents {
  floodRisk: RiskLevel;
  floodScore: number;
  quickClay: boolean;
  quickClayScore: number;
  skred: SkredLayers;
  skredScore: number;
  stormSurge: StormSurgeZones;
  stormSurgeScore: number;
  /**
   * Discriminated union. When `assessed: false`, the radon weight (0.10) is
   * redistributed across the other 5 components instead of imputing a neutral
   * score — ~95% of Norwegian kommuner fall outside our static table, and
   * pretending to measure absent data would mislead.
   */
  radon: RadonAssessment;
  klimaprofil: KlimaprofilValue | null;
  klimaprofilScore: number;
}

export interface KlimaPoengWeights {
  flood: 0.20;
  quickClay: 0.20;
  skred: 0.20;
  stormSurge: 0.15;
  radon: 0.10;
  klimaprofil: 0.15;
}

export interface KlimaPoengWeightsNoRadon {
  flood: 0.22;
  quickClay: 0.22;
  skred: 0.22;
  stormSurge: 0.17;
  klimaprofil: 0.17;
}

export interface KlimaPoengResult {
  total: number;
  components: KlimaPoengComponents;
  /** The weight schedule actually used — reflects radon assessment path. */
  weights: KlimaPoengWeights | KlimaPoengWeightsNoRadon;
  dataSource: {
    flood: "nve" | "none";
    quickClay: "nve" | "none";
    skred: "nve" | "none";
    stormSurge: "kartverket" | "none";
    radon: "static-kommune" | "ikke-vurdert";
    klimaprofil: "kss-2021" | "none";
  };
  meta: {
    kommunenummer: string | null;
    fylkesprofil: KlimaprofilKey | null;
    warnings: string[];
  };
  calculatedAt: string;
}

export interface KlimaPoengOptions {
  kommunenummer?: string | null;
  /** Injected for tests; defaults to global fetch. */
  fetchFn?: typeof fetch;
}

export const WEIGHTS: KlimaPoengWeights = {
  flood: 0.20,
  quickClay: 0.20,
  skred: 0.20,
  stormSurge: 0.15,
  radon: 0.10,
  klimaprofil: 0.15,
};

/**
 * Weights used when radon is not assessed. Radon's 0.10 spread roughly evenly
 * (+0.02 each) across the remaining 5 components, producing clean numbers
 * that still sum to 1.0.
 */
export const WEIGHTS_NO_RADON: KlimaPoengWeightsNoRadon = {
  flood: 0.22,
  quickClay: 0.22,
  skred: 0.22,
  stormSurge: 0.17,
  klimaprofil: 0.17,
};

/* ── Shared primitives ─────────────────────────────────────────────────── */

function piecewise(anchors: ReadonlyArray<readonly [number, number]>, x: number): number {
  if (x <= anchors[0][0]) return anchors[0][1];
  const last = anchors[anchors.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 0; i < anchors.length - 1; i++) {
    const [x0, y0] = anchors[i];
    const [x1, y1] = anchors[i + 1];
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return last[1];
}

const clamp100 = (v: number) => Math.max(0, Math.min(100, v));

/* ── Pure component scorers ────────────────────────────────────────────── */

/** Lav→100, Ukjent→60 (neutral), Moderat→40, Høy→0. */
export function scoreFlom(level: RiskLevel): number {
  switch (level) {
    case "Lav": return 100;
    case "Moderat": return 40;
    case "Høy": return 0;
    case "Ukjent": return 60;
  }
}

/** Binary: inside faresone → 0, outside → 100. */
export function scoreKvikkleire(inside: boolean): number {
  return inside ? 0 : 100;
}

/**
 * Composite of three aktsomhetskart (jord-/flomskred, steinsprang, snøskred).
 * "Inside" means any one layer flags the point. Scoring reflects cumulative
 * hits so a single-layer brush-up doesn't dominate a radon-clean address,
 * but multiple hits (a genuine slope-foot location) pull the component hard.
 */
export function scoreSkred(layers: SkredLayers): number {
  const count =
    (layers.jordflom ? 1 : 0) +
    (layers.steinsprang ? 1 : 0) +
    (layers.snoskred ? 1 : 0);
  if (count === 0) return 100;
  if (count === 1) return 50;
  return 20;
}

/**
 * Graded by how imminent the flood exposure is:
 *   - In 20-year current zone → 0  (floods in normal storms today)
 *   - Else in 200-year 2100    → 50 (typical storm-surge by 2100)
 *   - Else in 1000-year 2100   → 70 (extreme tail by 2100)
 *   - Else                     → 100 (outside all modeled zones)
 * 1000-yr contains 200-yr contains 20-yr, so priority order matters.
 */
export function scoreStormflo(zones: StormSurgeZones): number {
  if (zones.in20YearCurrent) return 0;
  if (zones.in200Year2100) return 50;
  if (zones.in1000Year2100) return 70;
  return 100;
}

/**
 * Radon scorer — only called when the level is actually known. "Ukjent"
 * kommuner don't flow through here; they flip the composite to the no-radon
 * weight schedule via the RadonAssessment discriminated union.
 */
export function scoreRadon(level: AssessedRadonLevel): number {
  switch (level) {
    case "Lav": return 100;
    case "Moderat": return 60;
    case "Høy": return 20;
  }
}

/** Piecewise: 3.0°C→100 … 6.0°C→10 (steeper at high end). */
export function scoreTemperaturendring(celsius: number): number {
  return clamp100(
    piecewise(
      [
        [3.0, 100],
        [3.5, 85],
        [4.0, 70],
        [4.5, 55],
        [5.0, 40],
        [5.5, 25],
        [6.0, 10],
      ],
      celsius,
    ),
  );
}

/** Piecewise: 5%→100 … 30%→20. */
export function scoreNedbørendring(percent: number): number {
  return clamp100(
    piecewise(
      [
        [5, 100],
        [10, 85],
        [15, 70],
        [20, 55],
        [25, 35],
        [30, 20],
      ],
      percent,
    ),
  );
}

/** Three-level bucket: lav→100, moderat→60, høy→30. */
export function scoreRisikoBucket(level: "lav" | "moderat" | "høy"): number {
  switch (level) {
    case "lav": return 100;
    case "moderat": return 60;
    case "høy": return 30;
  }
}

/**
 * Fylke-level climate-projection composite. Null profile (mapping failed)
 * returns neutral 60 rather than penalising absence of data.
 */
export function scoreKlimaprofil(profile: KlimaprofilValue | null): number {
  if (!profile) return 60;
  const subscores = [
    scoreTemperaturendring(profile.temperaturendring2100),
    scoreNedbørendring(profile.nedbørendring2100),
    scoreRisikoBucket(profile.flomendring),
    scoreRisikoBucket(profile.tørkeendring),
    scoreRisikoBucket(profile.skredøkning),
  ];
  const avg = subscores.reduce((a, b) => a + b, 0) / subscores.length;
  return Math.round(clamp100(avg));
}

export function composeTotal(c: KlimaPoengComponents): number {
  if (c.radon.assessed) {
    const weighted =
      WEIGHTS.flood * c.floodScore +
      WEIGHTS.quickClay * c.quickClayScore +
      WEIGHTS.skred * c.skredScore +
      WEIGHTS.stormSurge * c.stormSurgeScore +
      WEIGHTS.radon * c.radon.score +
      WEIGHTS.klimaprofil * c.klimaprofilScore;
    return Math.round(clamp100(weighted));
  }
  const weighted =
    WEIGHTS_NO_RADON.flood * c.floodScore +
    WEIGHTS_NO_RADON.quickClay * c.quickClayScore +
    WEIGHTS_NO_RADON.skred * c.skredScore +
    WEIGHTS_NO_RADON.stormSurge * c.stormSurgeScore +
    WEIGHTS_NO_RADON.klimaprofil * c.klimaprofilScore;
  return Math.round(clamp100(weighted));
}

/* ── Upstream WMS fetchers ─────────────────────────────────────────────── */

/**
 * NVE consolidated their map services on kart.nve.no/enterprise; the old
 * gis3.nve.no/map host was retired without redirects. Every service we hit
 * (flom-aktsomhet, flom-sone, kvikkleire-faresone, jord-/flomskred,
 * steinsprang, snøskred) now lives under this single base.
 */
const NVE_BASE = "https://kart.nve.no/enterprise/services";
const KARTVERKET_WMS = "https://wms.geonorge.no/skwms1/wms.stormflo_havniva";
const WMS_TIMEOUT_MS = 6000;

/**
 * Thrown by `queryNveWms` on any outcome that is NOT "valid empty response
 * from the WMS". Callers catch at the component-fetcher boundary
 * (fetchFlood / fetchQuickClay / fetchSkred) and translate to
 * `dataSource.X = "none"` + a user-visible warning. The old silent-false
 * path (any error → "outside zone") is gone: it masked a host-migration
 * outage for hours without anyone noticing.
 */
export class NveWmsError extends Error {
  constructor(
    public readonly kind: "http" | "service" | "network",
    public readonly detail: string,
    public readonly url: string,
  ) {
    super(`NVE WMS ${kind}: ${detail}`);
    this.name = "NveWmsError";
  }
}

/**
 * NVE GetFeatureInfo. All services on kart.nve.no/enterprise serve ESRI's
 * `FeatureInfoResponse` XML regardless of requested `INFO_FORMAT`, so we
 * request text/xml and parse with one detector.
 *
 * Response shapes we recognise:
 *   - Vector hit:   `<FIELDS OBJECTID="…" objType="…" …/>`
 *   - Raster hit:   `<FIELDS UniqueValue.PixelValue="2" Raster.objectid="…"/>`
 *   - Raster miss:  `<FIELDS UniqueValue.PixelValue="NoData"/>`
 *   - Empty:        `<FeatureInfoResponse …/>` (self-closing, no FIELDS)
 *   - Error:        `<ServiceExceptionReport>…</ServiceExceptionReport>`
 *                   (returned with HTTP 200 for things like LayerNotDefined)
 *
 * Throws on HTTP 4xx/5xx, ServiceException, and network/timeout errors so
 * an outage no longer looks identical to "the point is outside the zone".
 * Returns false only for validly-empty FeatureInfoResponse payloads.
 */
async function queryNveWms(
  lat: number,
  lon: number,
  layer: string,
  serviceUrl: string,
  fetchFn: typeof fetch,
): Promise<boolean> {
  const delta = 0.0005;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const params = new URLSearchParams({
    SERVICE: "WMS",
    VERSION: "1.1.1",
    REQUEST: "GetFeatureInfo",
    LAYERS: layer,
    QUERY_LAYERS: layer,
    INFO_FORMAT: "text/xml",
    SRS: "EPSG:4326",
    WIDTH: "101",
    HEIGHT: "101",
    X: "50",
    Y: "50",
    BBOX: bbox,
  });
  const url = `${serviceUrl}?${params}`;
  let res: Response;
  try {
    res = await fetchFn(url, { signal: AbortSignal.timeout(WMS_TIMEOUT_MS) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new NveWmsError("network", msg, url);
  }
  if (!res.ok) {
    throw new NveWmsError("http", `status ${res.status}`, url);
  }
  const body = await res.text();
  // ArcGIS occasionally returns HTTP 200 with a ServiceExceptionReport body
  // (e.g., LayerNotDefined for a service that still exists but renamed its
  // layers). This must fail loudly — it would otherwise look like "empty".
  if (body.includes("<ServiceException")) {
    const match = body.match(/<ServiceException[^>]*>\s*([^<]+?)\s*<\/ServiceException>/);
    const detail = match?.[1]?.trim() ?? "unspecified";
    throw new NveWmsError("service", detail, url);
  }
  // Require a recognisable FeatureInfoResponse envelope. Anything else (HTML
  // login page, JSON shape from a rewritten service, empty body, etc.) is a
  // wiring regression — refuse to guess at "outside zone".
  if (!body.includes("<FeatureInfoResponse")) {
    throw new NveWmsError("service", "unrecognised response body", url);
  }
  if (/PixelValue="NoData"/.test(body)) return false;
  if (/<FIELDS\s+[A-Za-z]/.test(body)) return true;
  return false;
}

/**
 * Kartverket stormflo WMS does NOT support application/json for
 * GetFeatureInfo — only text/plain, text/html, application/vnd.ogc.gml.
 * We use text/plain and treat any response containing a "Feature" block
 * with an "objid" as a hit (Search returned no results → miss).
 */
async function queryKartverketStormflo(
  lat: number,
  lon: number,
  layer: string,
  fetchFn: typeof fetch,
): Promise<boolean> {
  const delta = 0.0005;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const params = new URLSearchParams({
    SERVICE: "WMS",
    VERSION: "1.1.1",
    REQUEST: "GetFeatureInfo",
    LAYERS: layer,
    QUERY_LAYERS: layer,
    INFO_FORMAT: "text/plain",
    FORMAT: "image/png",
    SRS: "EPSG:4326",
    WIDTH: "101",
    HEIGHT: "101",
    X: "50",
    Y: "50",
    BBOX: bbox,
  });
  try {
    const res = await fetchFn(`${KARTVERKET_WMS}?${params}`, {
      signal: AbortSignal.timeout(WMS_TIMEOUT_MS),
    });
    if (!res.ok) return false;
    const body = await res.text();
    return body.includes("Feature") && body.includes("objid");
  } catch {
    return false;
  }
}

interface FloodRaw { high: boolean; medium: boolean }

/**
 * Flood exposure = two overlapping NVE surfaces:
 *   - Flomsoner2 / `Flomsone_200arsflom_klima` — modelled 200-year storm
 *     zones under 2100 climate projections. Sparse nationally (only studied
 *     watercourses), but authoritative when present. Matches this score's
 *     2100 horizon.
 *   - Flomaktsomhet / `Flom_aktsomhetsomrade` — terrain-derived aktsomhets-
 *     områder. Broader national coverage; lower positional accuracy.
 * "High" = inside the 200-year-klima sone; "Moderate" = only in the
 * aktsomhet polygon.
 */
async function fetchFlood(
  lat: number,
  lon: number,
  fetchFn: typeof fetch,
): Promise<{ result: FloodRaw; ok: boolean }> {
  try {
    const [high, medium] = await Promise.all([
      queryNveWms(
        lat,
        lon,
        "Flomsone_200arsflom_klima",
        `${NVE_BASE}/Flomsoner2/MapServer/WMSServer`,
        fetchFn,
      ),
      queryNveWms(
        lat,
        lon,
        "Flom_aktsomhetsomrade",
        `${NVE_BASE}/Flomaktsomhet/MapServer/WMSServer`,
        fetchFn,
      ),
    ]);
    return { result: { high, medium }, ok: true };
  } catch {
    return { result: { high: false, medium: false }, ok: false };
  }
}

/**
 * Kvikkleire faresone — binary "inside a classified faregrad polygon".
 * A future refinement could parse the `faregrad` attribute on the returned
 * FIELDS element ("Lav" / "Middels" / "Høy") for a graded score, but the
 * binary semantics match the legacy Kvikkleire2 behaviour.
 */
async function fetchQuickClay(
  lat: number,
  lon: number,
  fetchFn: typeof fetch,
): Promise<{ inside: boolean; ok: boolean }> {
  try {
    const inside = await queryNveWms(
      lat,
      lon,
      "KvikkleireFaregrad",
      `${NVE_BASE}/SkredKvikkleire2/MapServer/WMSServer`,
      fetchFn,
    );
    return { inside, ok: true };
  } catch {
    return { inside: false, ok: false };
  }
}

/**
 * Three aktsomhetskart, each on the same NVE host:
 *   - Jord-/flomskred:  raster `<FIELDS UniqueValue.PixelValue="…"/>`
 *     ("NoData" = outside).
 *   - Steinsprang:      raster, same shape.
 *   - Snøskred S3:      mixed — vector `<FIELDS OBJECTID=… sikkerhetsklasse=…/>`
 *     for inside, self-closing FeatureInfoResponse for outside.
 * queryNveWms handles all three shapes uniformly.
 */
async function fetchSkred(
  lat: number,
  lon: number,
  fetchFn: typeof fetch,
): Promise<{ layers: SkredLayers; ok: boolean }> {
  try {
    const [jordflom, steinsprang, snoskred] = await Promise.all([
      queryNveWms(
        lat,
        lon,
        "Jord_flomskred_aktsomhetsomrader",
        `${NVE_BASE}/JordFlomskredAktsomhet/MapServer/WMSServer`,
        fetchFn,
      ),
      queryNveWms(
        lat,
        lon,
        "Steinsprang-AktsomhetOmrader",
        `${NVE_BASE}/SkredSteinAktR/MapServer/WMSServer`,
        fetchFn,
      ),
      queryNveWms(
        lat,
        lon,
        "S3_snoskred_Aktsomhetsomrade",
        `${NVE_BASE}/SnoskredAktsomhet/MapServer/WMSServer`,
        fetchFn,
      ),
    ]);
    return { layers: { jordflom, steinsprang, snoskred }, ok: true };
  } catch {
    return {
      layers: { jordflom: false, steinsprang: false, snoskred: false },
      ok: false,
    };
  }
}

async function fetchStormSurge(
  lat: number,
  lon: number,
  fetchFn: typeof fetch,
): Promise<{ zones: StormSurgeZones; ok: boolean }> {
  try {
    const [in20YearCurrent, in200Year2100, in1000Year2100] = await Promise.all([
      queryKartverketStormflo(lat, lon, "stormflo20ar_klimaarna", fetchFn),
      queryKartverketStormflo(lat, lon, "stormflo200ar_klimaar2100", fetchFn),
      queryKartverketStormflo(lat, lon, "stormflo1000ar_klimaar2100", fetchFn),
    ]);
    return {
      zones: { in20YearCurrent, in200Year2100, in1000Year2100 },
      ok: true,
    };
  } catch {
    return {
      zones: { in20YearCurrent: false, in200Year2100: false, in1000Year2100: false },
      ok: false,
    };
  }
}

/* ── Main entry point ──────────────────────────────────────────────────── */

export async function calculateKlimaPoeng(
  lat: number,
  lon: number,
  options: KlimaPoengOptions = {},
): Promise<KlimaPoengResult> {
  const fetchFn = options.fetchFn ?? fetch;
  const kommunenummer = options.kommunenummer ?? null;
  const warnings: string[] = [];

  const [floodRaw, quickClayRaw, skredRaw, stormSurgeRaw] = await Promise.all([
    fetchFlood(lat, lon, fetchFn),
    fetchQuickClay(lat, lon, fetchFn),
    fetchSkred(lat, lon, fetchFn),
    fetchStormSurge(lat, lon, fetchFn),
  ]);

  if (!floodRaw.ok) warnings.push("NVE flom-data utilgjengelig");
  if (!quickClayRaw.ok) warnings.push("NVE kvikkleire-data utilgjengelig");
  if (!skredRaw.ok) warnings.push("NVE skred-data utilgjengelig");
  if (!stormSurgeRaw.ok) warnings.push("Kartverket stormflo-data utilgjengelig");

  let floodRisk: RiskLevel = "Lav";
  if (floodRaw.result.high) floodRisk = "Høy";
  else if (floodRaw.result.medium) floodRisk = "Moderat";

  // Radon: per-kommune static table. Absent kommune → flip to no-radon weight
  // schedule instead of imputing a neutral score.
  const radonEntry = kommunenummer ? environmentalRiskData[kommunenummer] : undefined;
  const radonAssessed = radonEntry?.radonRisk && radonEntry.radonRisk !== "Ukjent";
  const radon: RadonAssessment = radonAssessed
    ? {
        assessed: true,
        level: radonEntry.radonRisk as AssessedRadonLevel,
        score: scoreRadon(radonEntry.radonRisk as AssessedRadonLevel),
      }
    : { assessed: false };
  if (!radonAssessed && kommunenummer) {
    warnings.push(
      `Ingen radondata for kommune ${kommunenummer} (vekt redistribuert til øvrige komponenter)`,
    );
  }

  // Klimaprofil: resolve modern kommunenummer → old KSS fylke → profile.
  const fylkesprofil = resolveKlimaprofilKey(kommunenummer);
  const klimaprofil = fylkesprofil ? klimaprofilByFylke[fylkesprofil] : null;
  if (!klimaprofil && kommunenummer) {
    warnings.push(`Ingen klimaprofil for kommune ${kommunenummer} (nøytral verdi brukt)`);
  }

  const components: KlimaPoengComponents = {
    floodRisk,
    floodScore: scoreFlom(floodRisk),
    quickClay: quickClayRaw.inside,
    quickClayScore: scoreKvikkleire(quickClayRaw.inside),
    skred: skredRaw.layers,
    skredScore: scoreSkred(skredRaw.layers),
    stormSurge: stormSurgeRaw.zones,
    stormSurgeScore: scoreStormflo(stormSurgeRaw.zones),
    radon,
    klimaprofil,
    klimaprofilScore: scoreKlimaprofil(klimaprofil),
  };

  return {
    total: composeTotal(components),
    components,
    weights: radon.assessed ? WEIGHTS : WEIGHTS_NO_RADON,
    dataSource: {
      flood: floodRaw.ok ? "nve" : "none",
      quickClay: quickClayRaw.ok ? "nve" : "none",
      skred: skredRaw.ok ? "nve" : "none",
      stormSurge: stormSurgeRaw.ok ? "kartverket" : "none",
      radon: radon.assessed ? "static-kommune" : "ikke-vurdert",
      klimaprofil: klimaprofil ? "kss-2021" : "none",
    },
    meta: {
      kommunenummer,
      fylkesprofil,
      warnings,
    },
    calculatedAt: new Date().toISOString(),
  };
}
