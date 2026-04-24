/**
 * Silent-failure canary for the NVE Kvikkleire2 WMS layer.
 *
 * Run before the /bykart Klima-poeng heatmap refresh to confirm the kvikkleire
 * layer is still returning `inside=true` at coordinates that are provably
 * inside a mapped faresone polygon. If all three points return false, the
 * WMS wiring is broken (endpoint down, GetFeatureInfo shape changed, parser
 * regression) and the refresh would silently paint every city green.
 *
 * Coord selection: centroids of real KvikkleireFaregrad polygons, pulled from
 * kart.nve.no ArcGIS REST (/SkredKvikkleire2/MapServer/0). Gjerdrum is the
 * baseline known-YES from PR #84; Skjetten and Prestegård are both inside
 * Oslo's 25 km heatmap disk, chosen so the canary also covers the same disk
 * the refresh will score. If NVE retires or reshapes any of these polygons
 * the centroid can fall back outside — re-query the REST layer if failures
 * appear across all three.
 *
 * Data sources (live): NVE Kvikkleire2 (primary), plus flood/skred/stormflo
 * readings printed for visual sanity alongside the pass/fail.
 *
 * Required env vars: NONE.
 *
 * How to run:
 *   npx tsx scripts/test-klima-spotcheck.ts
 *
 * Exits 0 if ≥ 1 of 3 points returns kvikkleire=true. Exits 1 if all three
 * return false (likely wiring regression — do NOT run the refresh until the
 * Kvikkleire2 WMS path is re-verified).
 *
 * Manual smoke-test, not CI.
 */
import { calculateKlimaPoeng } from "../src/lib/scoring/klima-poeng";

interface SpotPoint {
  label: string;
  lat: number;
  lon: number;
  kommunenummer: string;
  expectKvikkleire: boolean;
}

const POINTS: ReadonlyArray<SpotPoint> = [
  { label: "Gjerdrum faresone",   lat: 60.0767, lon: 11.0586, kommunenummer: "3230", expectKvikkleire: true },
  { label: "Skjetten faresone",   lat: 59.9616, lon: 11.0028, kommunenummer: "3205", expectKvikkleire: true },
  { label: "Prestegård faresone", lat: 60.0020, lon: 10.9609, kommunenummer: "3205", expectKvikkleire: true },
];

async function main() {
  console.log(
    "Klima-poeng spot-check — verifying WMS wiring at documented kvikkleire zones\n",
  );

  const rows: Array<{
    label: string;
    score: number;
    kvikkleire: boolean;
    skredAny: boolean;
    flood: string;
    storm20: boolean;
    storm200: boolean;
    storm1000: boolean;
  }> = [];

  for (const p of POINTS) {
    const r = await calculateKlimaPoeng(p.lat, p.lon, {
      kommunenummer: p.kommunenummer,
    });
    const c = r.components;
    const skredAny = c.skred.jordflom || c.skred.steinsprang || c.skred.snoskred;
    rows.push({
      label: p.label,
      score: r.total,
      kvikkleire: c.quickClay,
      skredAny,
      flood: c.floodRisk,
      storm20: c.stormSurge.in20YearCurrent,
      storm200: c.stormSurge.in200Year2100,
      storm1000: c.stormSurge.in1000Year2100,
    });
    console.log(
      `  ${p.label.padEnd(22)} ` +
        `score=${String(r.total).padStart(3)} ` +
        `kvikkleire=${c.quickClay ? "YES" : "no "} ` +
        `skred=${skredAny ? "YES" : "no "} (j=${c.skred.jordflom?1:0} s=${c.skred.steinsprang?1:0} n=${c.skred.snoskred?1:0}) ` +
        `flom=${c.floodRisk.padEnd(7)} ` +
        `stormflo 20/200/1000=${c.stormSurge.in20YearCurrent?1:0}/${c.stormSurge.in200Year2100?1:0}/${c.stormSurge.in1000Year2100?1:0}`,
    );
    if (r.meta.warnings.length > 0) {
      for (const w of r.meta.warnings) console.log(`    warn: ${w}`);
    }
  }

  const kvikkleireHits = rows.filter((r) => r.kvikkleire).length;
  console.log(
    `\nSummary: ${kvikkleireHits}/${rows.length} points returned kvikkleire=true`,
  );

  if (kvikkleireHits === 0) {
    console.error(
      "\n✗ All three documented kvikkleire points returned false. " +
        "Likely causes: NVE Kvikkleire2 WMS down, or the queryNveWms parser " +
        "needs re-checking against the current GetFeatureInfo JSON shape. " +
        "Do NOT run the full heatmap refresh until this is resolved.",
    );
    process.exit(1);
  }

  console.log("\nOK — WMS wiring is detecting inside-zone cases. Safe to run the full heatmap refresh.");
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
