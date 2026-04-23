/**
 * Health-check every upstream WMS used by Klima-poeng scoring at a known-
 * positive coordinate.
 *
 * Why it exists: NVE silently migrated flom + kvikkleire services from
 * `gis3.nve.no/map` to `kart.nve.no/enterprise` in 2026-Q1 and retired the
 * old host without redirects. The old silent-error handling in `queryNveWms`
 * made the outage look identical to "point outside the zone" for every
 * request, so the breakage shipped for hours before being noticed. This
 * script catches the next such drift in ~15 s instead of on a user report.
 *
 * What it does: for each upstream, issue one GetFeatureInfo at a coordinate
 * that SHOULD return inside-zone today, and assert the hit. Fails loudly
 * (exit 1) on the first miss so it composes with cron/CI.
 *
 * Known-positive reference points (re-verify if any coord drifts into
 * "outside" — likely a data-republish, not a wiring regression):
 *   - Flomsoner2 / Flomsone_200arsflom_klima: Flåm sentrum    (Aurlandselva)
 *   - Flomaktsomhet / Flom_aktsomhetsomrade: Drammen sentrum (Drammenselva)
 *   - SkredKvikkleire2 / KvikkleireFaregrad: Gjerdrum 2020-scar
 *   - JordFlomskredAktsomhet: Vassenden (Jølster 2019-scar)
 *   - SkredSteinAktR: Flåm sentrum (fjord stupbratt)
 *   - SnoskredAktsomhet / S3: Flåm sentrum
 *   - Kartverket stormflo: Bergen Bryggen (inside 200-år 2100)
 *
 * Required env vars: NONE.
 *
 * How to run:
 *   npx tsx scripts/test-klima-endpoints.ts
 *
 * Expected output: a tabular pass/fail per endpoint and exit 0 if all 7
 * return the expected hit. Exit 1 on the first failure, listing the
 * upstream error (HTTP status, ServiceException code, network, etc.).
 *
 * Manual smoke-test per project convention — not CI. A follow-up PR can
 * add a Vercel cron + Slack alert to run this daily.
 */

const NVE_BASE = "https://kart.nve.no/enterprise/services";
const KARTVERKET_WMS = "https://wms.geonorge.no/skwms1/wms.stormflo_havniva";
const TIMEOUT_MS = 6000;

interface NveCheck {
  kind: "nve";
  label: string;
  lat: number;
  lon: number;
  service: string;
  layer: string;
  positive: string; // human description of why we expect YES
}

interface StormfloCheck {
  kind: "stormflo";
  label: string;
  lat: number;
  lon: number;
  layer: string;
  positive: string;
}

const CHECKS: ReadonlyArray<NveCheck | StormfloCheck> = [
  {
    kind: "nve",
    label: "Flomsoner2 / Flomsone_200arsflom_klima",
    lat: 60.8635,
    lon: 7.1138,
    service: "Flomsoner2",
    layer: "Flomsone_200arsflom_klima",
    positive: "Flåm sentrum — Aurlandselva 200-år 2100-sone",
  },
  {
    kind: "nve",
    label: "Flomaktsomhet / Flom_aktsomhetsomrade",
    lat: 59.7440,
    lon: 10.2046,
    service: "Flomaktsomhet",
    layer: "Flom_aktsomhetsomrade",
    positive: "Drammen sentrum — Drammenselva aktsomhetsområde",
  },
  {
    kind: "nve",
    label: "SkredKvikkleire2 / KvikkleireFaregrad",
    lat: 60.0767,
    lon: 11.0586,
    service: "SkredKvikkleire2",
    layer: "KvikkleireFaregrad",
    positive: "Gjerdrum — 2020-skredet, Risikoklasse 3",
  },
  {
    kind: "nve",
    label: "JordFlomskredAktsomhet",
    lat: 61.4789,
    lon: 6.2947,
    service: "JordFlomskredAktsomhet",
    layer: "Jord_flomskred_aktsomhetsomrader",
    positive: "Vassenden (Jølster) — 2019-skredet",
  },
  {
    kind: "nve",
    label: "SkredSteinAktR / Steinsprang",
    lat: 60.8635,
    lon: 7.1138,
    service: "SkredSteinAktR",
    layer: "Steinsprang-AktsomhetOmrader",
    positive: "Flåm sentrum — fjellfot under stupbratt dalside",
  },
  {
    kind: "nve",
    label: "SnoskredAktsomhet / S3",
    lat: 60.8635,
    lon: 7.1138,
    service: "SnoskredAktsomhet",
    layer: "S3_snoskred_Aktsomhetsomrade",
    positive: "Flåm sentrum — S3-aktsomhet",
  },
  {
    kind: "stormflo",
    label: "Kartverket stormflo200ar_klimaar2100",
    lat: 60.3972,
    lon: 5.3244,
    layer: "stormflo200ar_klimaar2100",
    positive: "Bergen Bryggen — 200-år 2100-sone",
  },
];

interface CheckResult {
  label: string;
  positive: string;
  ok: boolean;
  detail: string;
}

function bbox(lat: number, lon: number, delta = 0.0005): string {
  return `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
}

async function checkNve(c: NveCheck): Promise<CheckResult> {
  const params = new URLSearchParams({
    SERVICE: "WMS",
    VERSION: "1.1.1",
    REQUEST: "GetFeatureInfo",
    LAYERS: c.layer,
    QUERY_LAYERS: c.layer,
    INFO_FORMAT: "text/xml",
    SRS: "EPSG:4326",
    WIDTH: "101",
    HEIGHT: "101",
    X: "50",
    Y: "50",
    BBOX: bbox(c.lat, c.lon),
  });
  const url = `${NVE_BASE}/${c.service}/MapServer/WMSServer?${params}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) {
      return { label: c.label, positive: c.positive, ok: false, detail: `HTTP ${res.status}` };
    }
    const body = await res.text();
    if (body.includes("<ServiceException")) {
      const m = body.match(/<ServiceException[^>]*>\s*([^<]+?)\s*<\/ServiceException>/);
      return { label: c.label, positive: c.positive, ok: false, detail: `ServiceException: ${m?.[1]?.trim() ?? "unknown"}` };
    }
    if (/PixelValue="NoData"/.test(body)) {
      return { label: c.label, positive: c.positive, ok: false, detail: "raster miss (NoData)" };
    }
    if (/<FIELDS\s+[A-Za-z]/.test(body)) {
      return { label: c.label, positive: c.positive, ok: true, detail: "FIELDS hit" };
    }
    return { label: c.label, positive: c.positive, ok: false, detail: "empty FeatureInfoResponse (coord drifted?)" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { label: c.label, positive: c.positive, ok: false, detail: `network: ${msg}` };
  }
}

async function checkStormflo(c: StormfloCheck): Promise<CheckResult> {
  const params = new URLSearchParams({
    SERVICE: "WMS",
    VERSION: "1.1.1",
    REQUEST: "GetFeatureInfo",
    LAYERS: c.layer,
    QUERY_LAYERS: c.layer,
    INFO_FORMAT: "text/plain",
    FORMAT: "image/png",
    SRS: "EPSG:4326",
    WIDTH: "101",
    HEIGHT: "101",
    X: "50",
    Y: "50",
    BBOX: bbox(c.lat, c.lon),
  });
  const url = `${KARTVERKET_WMS}?${params}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) {
      return { label: c.label, positive: c.positive, ok: false, detail: `HTTP ${res.status}` };
    }
    const body = await res.text();
    if (body.includes("Feature") && body.includes("objid")) {
      return { label: c.label, positive: c.positive, ok: true, detail: "Feature hit" };
    }
    return { label: c.label, positive: c.positive, ok: false, detail: "no Feature in text/plain body" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { label: c.label, positive: c.positive, ok: false, detail: `network: ${msg}` };
  }
}

async function main() {
  console.log("Klima-poeng endpoint health check — expect all 7 OK\n");
  const results: CheckResult[] = [];
  for (const c of CHECKS) {
    const r = c.kind === "nve" ? await checkNve(c) : await checkStormflo(c);
    const mark = r.ok ? "  OK " : "FAIL";
    console.log(`  ${mark}  ${r.label.padEnd(48)} — ${r.detail}`);
    if (!r.ok) console.log(`        at: ${r.positive}`);
    results.push(r);
  }
  const failed = results.filter((r) => !r.ok);
  console.log(
    `\n${results.length - failed.length}/${results.length} endpoints OK`,
  );
  if (failed.length > 0) {
    console.error(
      `\n${failed.length} endpoint(s) broken. First failure: ${failed[0].label}`,
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
