/**
 * SSB demographics generator — rebuilds src/data/demographics.ts by joining
 * three SSB tables via PxWebApi v2:
 *
 *   - 07459 — Alders- og kjønnsfordeling i kommuner (population + age buckets +
 *             5-year growth). Latest Tid: 2026 (per 1.1.2026).
 *   - 06944 — Inntekt for husholdninger, Antall og median (median household
 *             gross income, ContentsCode=SamletInntekt). Latest Tid: 2024.
 *   - 09429 — Utdanningsnivå, etter kommune og kjønn (UH-andel, Nivaa=03a+04a,
 *             Kjonn=0, ContentsCode=PersonerProsent). Latest Tid: 2024.
 *
 * The previous demographics.ts cited tables 09817 (immigrants, not income) and
 * 05212 (urban/rural split, not education) — both wrong. This script uses the
 * verified-correct tables. See PR description for the audit.
 *
 * 5-year-growth pre-reform fallback: post-2024 codes (3201 Bærum, 3301 Drammen,
 * etc.) return 0 for Tid=2021 because in 2021 the kommune was coded under its
 * Viken / V&T / T&F predecessor. We fetch both codes for the 2021 snapshot and
 * fall back to the predecessor when the post-reform code returns 0. The
 * mapping mirrors src/__tests__/kommune-codes.test.ts.
 *
 * Year field: dropped from the schema. Population is 2026, income/education
 * are 2024 — there is no single "year" that is honest. Per-source years live
 * in the file header instead.
 *
 * Data source: https://data.ssb.no/api/pxwebapi/v2
 * License: CC BY 4.0. Rate limit: 30 queries/minute per IP (this script
 * issues ≤14 queries).
 *
 * Required env vars: NONE — public API, no authentication.
 *
 * How to run:
 *   npx tsx scripts/test-ssb-demographics.ts
 *
 * Writes src/data/demographics.new.ts (NOT demographics.ts) — manual review +
 * rename is the last step, so the generator is always non-destructive.
 *
 * Expected output:
 *   Success — prints metadata summary, identified codes, sanity values for
 *             Oslo / Bærum / Hjelmeland (small kommune), and a count of
 *             kommuner. Writes src/data/demographics.new.ts. Exit 0.
 *   Failure — prints HTTP status / parse error and exits 1.
 *
 * Manual smoke-test / data regen. Not part of CI. Re-run annually when SSB
 * publishes a new income or education release (typically Q1).
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TODAY = new Date().toISOString().slice(0, 10);
const OUTPUT_PATH = resolve(__dirname, '../src/data/demographics.new.ts');

const TABLE_POP = '07459';
const TABLE_INCOME = '06944';
const TABLE_EDU = '09429';
const BASE = 'https://data.ssb.no/api/pxwebapi/v2/tables';

const GROWTH_WINDOW_YEARS = 5;

// SSB Klass classification 131 = "Standard for kommuneinndeling". The /changes
// endpoint returns every kommunenummer rename between two dates — we use it to
// build the post-reform → pre-reform predecessor map dynamically (no hardcoded
// list of 100+ renames to maintain).
const KLASS_BASE = 'https://data.ssb.no/api/klass/v1';

interface KlassChange {
  oldCode: string;
  newCode: string;
  oldName: string;
  newName: string;
  changeOccurred: string;
}

interface ReformMapping {
  /** Post-reform code → its single pre-reform predecessor. */
  rename: Record<string, string>;
  /** Post-reform codes that resulted from a split (one old → many new). Their
   *  prior-year population can't be looked up cleanly, so we skip 5-year
   *  growth for them (they appear in the skipped log). */
  splitNew: Set<string>;
}

async function fetchReformMap(fromIso: string, toIso: string): Promise<ReformMapping> {
  const url = `${KLASS_BASE}/classifications/131/changes?from=${fromIso}&to=${toIso}&language=nb`;
  const res = await fetchJson<{ codeChanges: KlassChange[] }>(url);
  const newToOld: Record<string, string[]> = {};
  const oldToNew: Record<string, string[]> = {};
  for (const c of res.codeChanges) {
    if (c.oldCode === c.newCode) continue; // name-only change
    (newToOld[c.newCode] ??= []).push(c.oldCode);
    (oldToNew[c.oldCode] ??= []).push(c.newCode);
  }
  const rename: Record<string, string> = {};
  const splitNew = new Set<string>();
  for (const n of Object.keys(newToOld)) {
    const olds = newToOld[n];
    // 1:1 rename → predecessor is unambiguous.
    if (olds.length === 1 && (oldToNew[olds[0]]?.length ?? 0) === 1) {
      rename[n] = olds[0];
    } else {
      // Either a merge (n new from many olds) or a split component (n is one
      // of multiple new codes from the same old code). Splits leave us
      // without a clean prior-population mapping; flag them.
      splitNew.add(n);
    }
  }
  return { rename, splitNew };
}

interface JsonStat2 {
  value: (number | null)[] | Record<string, number | null>;
  id: string[];
  size: number[];
  dimension: Record<
    string,
    {
      label?: string;
      category: {
        index: Record<string, number>;
        label?: Record<string, string>;
      };
    }
  >;
}

// SSB rate limit is 30 req/min. We sleep between requests to stay under it,
// even on retries. 2.5s ≈ 24 req/min — comfortable buffer.
const REQUEST_INTERVAL_MS = 2500;
let lastRequestAt = 0;

async function fetchJson<T>(url: string): Promise<T> {
  const wait = REQUEST_INTERVAL_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt = Date.now();
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}\n${text.slice(0, 500)}`);
  }
  return res.json() as Promise<T>;
}

function flatIndex(coords: number[], size: number[]): number {
  let idx = 0;
  for (let i = 0; i < coords.length; i++) idx = idx * size[i] + coords[i];
  return idx;
}

function getValue(stat: JsonStat2, coords: Record<string, string>): number | null {
  const idxArr: number[] = [];
  for (const name of stat.id) {
    const code = coords[name];
    const i = stat.dimension[name]?.category.index[code];
    if (i === undefined) return null;
    idxArr.push(i);
  }
  const flat = flatIndex(idxArr, stat.size);
  const v = Array.isArray(stat.value)
    ? stat.value[flat]
    : (stat.value as Record<string, number | null>)[String(flat)];
  return v == null ? null : Number(v);
}

function chunked<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function pickLatestTid(meta: JsonStat2): { code: string; label: string } {
  const tidDim = meta.dimension['Tid'];
  const codes = Object.keys(tidDim.category.index).sort();
  const latest = codes[codes.length - 1];
  return { code: latest, label: tidDim.category.label?.[latest] ?? latest };
}

function pickPriorTid(meta: JsonStat2, yearsBack: number, anchor: string): string | null {
  const tidDim = meta.dimension['Tid'];
  const target = String(Number(anchor) - yearsBack);
  return target in tidDim.category.index ? target : null;
}

async function fetchPopulationTotal(
  kommuneCodes: string[],
  tid: string,
  label: string,
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  const chunks = chunked(kommuneCodes, 100);
  console.log(
    `[ssb] fetching ${TABLE_POP} TOTAL for ${kommuneCodes.length} regions across ${chunks.length} chunk(s) (Tid=${tid}, ${label})…`,
  );
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const qs = [
      'lang=no',
      `valueCodes%5BRegion%5D=${encodeURIComponent(chunk.join(','))}`,
      'valueCodes%5BContentsCode%5D=Personer1',
      `valueCodes%5BTid%5D=${tid}`,
      'outputFormat=json-stat2',
    ].join('&');
    const data = await fetchJson<JsonStat2>(`${BASE}/${TABLE_POP}/data?${qs}`);
    let hits = 0;
    for (const code of chunk) {
      const v = getValue(data, { Region: code, ContentsCode: 'Personer1', Tid: tid });
      if (v != null && v > 0) {
        out.set(code, v);
        hits++;
      }
    }
    console.log(`[ssb]   ${TABLE_POP} ${label} chunk ${i + 1}/${chunks.length} — ${hits}/${chunk.length}`);
  }
  return out;
}

async function fetchPopulationAgeBucket(
  kommuneCodes: string[],
  tid: string,
  alderCodes: string[],
  bucketLabel: string,
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  const chunks = chunked(kommuneCodes, 100);
  console.log(
    `[ssb] fetching ${TABLE_POP} ${bucketLabel} (${alderCodes.length} ages) for ${kommuneCodes.length} kommuner across ${chunks.length} chunk(s)…`,
  );
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const qs = [
      'lang=no',
      `valueCodes%5BRegion%5D=${encodeURIComponent(chunk.join(','))}`,
      `valueCodes%5BAlder%5D=${encodeURIComponent(alderCodes.join(','))}`,
      'valueCodes%5BContentsCode%5D=Personer1',
      `valueCodes%5BTid%5D=${tid}`,
      'outputFormat=json-stat2',
    ].join('&');
    const data = await fetchJson<JsonStat2>(`${BASE}/${TABLE_POP}/data?${qs}`);
    for (const code of chunk) {
      let sum = 0;
      let any = false;
      for (const ac of alderCodes) {
        const v = getValue(data, {
          Region: code,
          Alder: ac,
          ContentsCode: 'Personer1',
          Tid: tid,
        });
        if (v != null) {
          sum += v;
          any = true;
        }
      }
      if (any) out.set(code, sum);
    }
    console.log(`[ssb]   ${TABLE_POP} ${bucketLabel} chunk ${i + 1}/${chunks.length} — done`);
  }
  return out;
}

async function fetchIncome(
  kommuneCodes: string[],
  latestTid: string,
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  const chunks = chunked(kommuneCodes, 200);
  console.log(
    `[ssb] fetching ${TABLE_INCOME} for ${kommuneCodes.length} kommuner across ${chunks.length} chunk(s) (Tid=${latestTid})…`,
  );
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const qs = [
      'lang=no',
      `valueCodes%5BRegion%5D=${encodeURIComponent(chunk.join(','))}`,
      'valueCodes%5BHusholdType%5D=0000',
      'valueCodes%5BContentsCode%5D=SamletInntekt',
      `valueCodes%5BTid%5D=${latestTid}`,
      'outputFormat=json-stat2',
    ].join('&');
    const data = await fetchJson<JsonStat2>(`${BASE}/${TABLE_INCOME}/data?${qs}`);
    let hits = 0;
    for (const code of chunk) {
      const v = getValue(data, {
        Region: code,
        HusholdType: '0000',
        ContentsCode: 'SamletInntekt',
        Tid: latestTid,
      });
      if (v != null && v > 0) {
        out.set(code, Math.round(v));
        hits++;
      }
    }
    console.log(`[ssb]   ${TABLE_INCOME} chunk ${i + 1}/${chunks.length} — ${hits}/${chunk.length} with values`);
  }
  return out;
}

async function fetchEducation(
  kommuneCodes: string[],
  latestTid: string,
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  const chunks = chunked(kommuneCodes, 100);
  console.log(
    `[ssb] fetching ${TABLE_EDU} for ${kommuneCodes.length} kommuner across ${chunks.length} chunk(s) (Tid=${latestTid})…`,
  );
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const qs = [
      'lang=no',
      `valueCodes%5BRegion%5D=${encodeURIComponent(chunk.join(','))}`,
      'valueCodes%5BNivaa%5D=03a,04a',
      'valueCodes%5BKjonn%5D=0',
      'valueCodes%5BContentsCode%5D=PersonerProsent',
      `valueCodes%5BTid%5D=${latestTid}`,
      'outputFormat=json-stat2',
    ].join('&');
    const data = await fetchJson<JsonStat2>(`${BASE}/${TABLE_EDU}/data?${qs}`);
    let hits = 0;
    for (const code of chunk) {
      const kort = getValue(data, {
        Region: code,
        Nivaa: '03a',
        Kjonn: '0',
        ContentsCode: 'PersonerProsent',
        Tid: latestTid,
      });
      const lang = getValue(data, {
        Region: code,
        Nivaa: '04a',
        Kjonn: '0',
        ContentsCode: 'PersonerProsent',
        Tid: latestTid,
      });
      if (kort != null && lang != null) {
        out.set(code, Math.round((kort + lang) * 10) / 10);
        hits++;
      }
    }
    console.log(`[ssb]   ${TABLE_EDU} chunk ${i + 1}/${chunks.length} — ${hits}/${chunk.length} with values`);
  }
  return out;
}

function cleanLabel(s: string): string {
  // SSB returns labels like "Bærum" or "Bærum (-2023)" for defunct codes. Strip
  // trailing year annotations.
  return s.replace(/\s*\(-?\d{4}-?\)\s*$/, '').trim();
}

async function main() {
  // Step 1 — metadata for all three tables.
  console.log(`[ssb] fetching metadata for ${TABLE_POP}, ${TABLE_INCOME}, ${TABLE_EDU}…`);
  const [popMeta, incomeMeta, eduMeta] = await Promise.all([
    fetchJson<JsonStat2>(`${BASE}/${TABLE_POP}/metadata?lang=no&outputFormat=json-stat2`),
    fetchJson<JsonStat2>(`${BASE}/${TABLE_INCOME}/metadata?lang=no&outputFormat=json-stat2`),
    fetchJson<JsonStat2>(`${BASE}/${TABLE_EDU}/metadata?lang=no&outputFormat=json-stat2`),
  ]);

  const popTid = pickLatestTid(popMeta);
  const incomeTid = pickLatestTid(incomeMeta);
  const eduTid = pickLatestTid(eduMeta);
  const priorPopTid = pickPriorTid(popMeta, GROWTH_WINDOW_YEARS, popTid.code);
  if (!priorPopTid) throw new Error(`07459 has no Tid for ${GROWTH_WINDOW_YEARS}-year prior to ${popTid.code}`);

  console.log(`[ssb] ${TABLE_POP} latest Tid: ${popTid.code} ("${popTid.label}"), prior: ${priorPopTid}`);
  console.log(`[ssb] ${TABLE_INCOME} latest Tid: ${incomeTid.code} ("${incomeTid.label}")`);
  console.log(`[ssb] ${TABLE_EDU} latest Tid: ${eduTid.code} ("${eduTid.label}")`);

  // Step 2 — kommune universe from 07459. 4-digit numeric, exclude aggregates,
  // and (Step 3) trim to those with a population value at latest Tid.
  const allRegionCodes = Object.keys(popMeta.dimension['Region'].category.index);
  const candidateKommuner = allRegionCodes
    .filter((c) => /^\d{4}$/.test(c))
    .filter((c) => c !== '0000' && !/99$/.test(c))
    .sort();
  console.log(`[ssb] ${candidateKommuner.length} candidate kommune codes from ${TABLE_POP} metadata`);

  // Step 3 — Alder buckets.
  const alderCodes = Object.keys(popMeta.dimension['Alder'].category.index).sort();
  const childrenCodes = alderCodes.filter((c) => Number(c) <= 17);
  const elderlyCodes = alderCodes.filter((c) => Number(c) >= 67);

  // Step 4a — TOTAL population at latest Tid for ALL 928 candidate codes,
  // to identify which codes are currently-active. Cheap (1 call per chunk).
  const total2026 = await fetchPopulationTotal(candidateKommuner, popTid.code, 'latest');
  const activeKommuner = candidateKommuner.filter((c) => total2026.has(c));
  console.log(
    `[ssb] ${activeKommuner.length} kommuner active at ${popTid.code} (of ${candidateKommuner.length} historical candidates)`,
  );

  // Step 4b — children + elderly age sums at latest Tid, ONLY for active
  // kommuner (massively cheaper than fetching for all 928 candidates).
  const children2026 = await fetchPopulationAgeBucket(
    activeKommuner,
    popTid.code,
    childrenCodes,
    'children (0-17)',
  );
  const elderly2026 = await fetchPopulationAgeBucket(
    activeKommuner,
    popTid.code,
    elderlyCodes,
    'elderly (67+)',
  );

  // Step 4c — prior-year total. We fetch for active kommuner plus every
  // pre-reform predecessor, since post-2024 codes return 0 for Tid=2021 (in
  // 2021 those kommuner were coded under Viken / V&T / T&F predecessors).
  // The reform map comes from SSB Klass /classifications/131/changes. We bound
  // the query to exactly span the 2024-01-01 reform — broader windows pick up
  // spurious Klass entries (e.g. SSB has a 2026-01-01 record claiming 3118
  // Indre Østfold split into Nordre Follo + Vestby, which is geographically
  // impossible — looks like name-change paperwork crossed wires).
  const reformMap = await fetchReformMap('2023-12-31', '2024-01-02');
  const splitNewList = Array.from(reformMap.splitNew);
  console.log(
    `[ssb] reform map: ${Object.keys(reformMap.rename).length} 1:1 renames, ${splitNewList.length} split-new codes (${splitNewList.join(', ')})`,
  );
  const priorSeen = new Set<string>();
  const priorTargets: string[] = [];
  for (const c of activeKommuner) {
    if (!priorSeen.has(c)) { priorSeen.add(c); priorTargets.push(c); }
  }
  for (const c of Object.values(reformMap.rename)) {
    if (!priorSeen.has(c)) { priorSeen.add(c); priorTargets.push(c); }
  }
  const total2021 = await fetchPopulationTotal(priorTargets, priorPopTid, 'prior');

  // Step 5 — income + education for active kommuner only.
  const income = await fetchIncome(activeKommuner, incomeTid.code);
  const edu = await fetchEducation(activeKommuner, eduTid.code);

  // Step 6 — region labels for the output (use 07459 metadata labels).
  const regionLabels = popMeta.dimension['Region'].category.label ?? {};

  // Step 7 — build rows. Skip kommuner missing any of the 4 fields, log which.
  interface Row {
    code: string;
    name: string;
    medianIncome: number;
    higherEducationPct: number;
    childrenPct: number;
    elderlyPct: number;
    populationGrowthPct: number;
  }

  const rows: Row[] = [];
  const skipped: { code: string; name: string; missing: string[] }[] = [];

  for (const code of activeKommuner) {
    const total = total2026.get(code)!;
    const children = children2026.get(code);
    const elderly = elderly2026.get(code);
    const incomeVal = income.get(code);
    const eduVal = edu.get(code);

    let prior = total2021.get(code);
    if ((prior == null || prior === 0) && reformMap.rename[code]) {
      prior = total2021.get(reformMap.rename[code]);
    }

    const missing: string[] = [];
    if (incomeVal == null) missing.push('income');
    if (eduVal == null) missing.push('education');
    if (children == null) missing.push('children');
    if (elderly == null) missing.push('elderly');
    if (prior == null || prior === 0) missing.push('prior-pop');

    const label = cleanLabel(regionLabels[code] ?? '');
    if (missing.length > 0) {
      skipped.push({ code, name: label, missing });
      continue;
    }

    const childrenPct = Math.round((children! / total) * 1000) / 10;
    const elderlyPct = Math.round((elderly! / total) * 1000) / 10;
    const growth = Math.round(((total - prior!) / prior!) * 1000) / 10;

    rows.push({
      code,
      name: label,
      medianIncome: incomeVal!,
      higherEducationPct: eduVal!,
      childrenPct,
      elderlyPct,
      populationGrowthPct: growth,
    });
  }
  rows.sort((a, b) => a.code.localeCompare(b.code));

  // Step 8 — sanity checks.
  const sample = (code: string, oldDesc: string): void => {
    const r = rows.find((x) => x.code === code);
    if (!r) {
      console.warn(`[ssb] sanity — ${code}: NOT FOUND in output (${oldDesc})`);
      return;
    }
    console.log(
      `[ssb] sanity — ${code} ${r.name}: income=${r.medianIncome}, edu=${r.higherEducationPct}%, children=${r.childrenPct}%, elderly=${r.elderlyPct}%, growth=${r.populationGrowthPct}% — ${oldDesc}`,
    );
  };
  sample('0301', 'old: income=672000, edu=52.4, children=18.2, elderly=12.1, growth=3.8');
  sample('3201', 'old: income=842000, edu=62.8, children=22.4, elderly=14.2, growth=1.9');
  sample('1133', 'small kommune (Hjelmeland) — no prior values');

  // Step 9 — write demographics.new.ts.
  const header = `/**
 * Demographic indicators per kommune.
 *
 * Sources:
 *   - SSB table 07459 (population, age buckets, ${GROWTH_WINDOW_YEARS}-year growth) — Tid=${popTid.code}
 *     (compared to Tid=${priorPopTid} for growth, with predecessor-code fallback
 *     for kommuner renamed in the 2024 fylke reform)
 *   - SSB table 06944 (medianinntekt husholdninger, gross — SamletInntekt,
 *     HusholdType=0000) — Tid=${incomeTid.code}
 *   - SSB table 09429 (utdanningsnivå, Nivaa=03a+04a, Kjonn=0,
 *     ContentsCode=PersonerProsent — share of pop 16+ with university or
 *     college education) — Tid=${eduTid.code}
 * License: CC BY 4.0
 * Last refreshed: ${TODAY}
 *
 * Re-run \`npx tsx scripts/test-ssb-demographics.ts\` to regenerate. The
 * 'year' field was dropped from the schema because the three sources publish
 * on different cadences — see the per-source Tid above for what's authoritative.
 */

export interface DemographicData {
  kommunenummer: string;
  name: string;
  /** Median gross household income per year in NOK (SSB 06944, SamletInntekt). */
  medianIncome: number;
  /** % of population 16+ with higher education (SSB 09429, UH kort + lang). */
  higherEducationPct: number;
  /** % of population aged 0–17 (SSB 07459). */
  childrenPct: number;
  /** % of population aged 67+ (SSB 07459). */
  elderlyPct: number;
  /** Population growth %, ${GROWTH_WINDOW_YEARS}-year window (SSB 07459). */
  populationGrowthPct: number;
}

export const demographicsData: Record<string, DemographicData> = {
`;

  const body = rows
    .map(
      (r) =>
        `  "${r.code}": { kommunenummer: "${r.code}", name: ${JSON.stringify(r.name)}, medianIncome: ${r.medianIncome}, higherEducationPct: ${r.higherEducationPct.toFixed(1)}, childrenPct: ${r.childrenPct.toFixed(1)}, elderlyPct: ${r.elderlyPct.toFixed(1)}, populationGrowthPct: ${r.populationGrowthPct.toFixed(1)} },`,
    )
    .join('\n');

  const footer = `
};

export function getDemographics(kommunenummer: string): DemographicData | undefined {
  return demographicsData[kommunenummer];
}
`;

  writeFileSync(OUTPUT_PATH, header + body + footer, 'utf8');
  console.log(`\n[ssb] ✍️  wrote ${OUTPUT_PATH} (${rows.length} kommuner)`);

  if (skipped.length > 0) {
    console.log(`[ssb] ${skipped.length} kommune(s) skipped (missing one or more fields):`);
    for (const s of skipped.slice(0, 20)) {
      console.log(`  - ${s.code} ${s.name}: missing ${s.missing.join(', ')}`);
    }
    if (skipped.length > 20) console.log(`  (…and ${skipped.length - 20} more)`);
  }

  console.log(
    `\n[ssb] ✅ done. Population Tid=${popTid.code} (vs ${priorPopTid}), Income Tid=${incomeTid.code}, Education Tid=${eduTid.code}.`,
  );
  console.log('[ssb] Next: review demographics.new.ts, then rename to demographics.ts when satisfied.');
  process.exit(0);
}

main().catch((err: unknown) => {
  const e = err as { message?: string; stack?: string };
  console.error(`[ssb] ❌ failed: ${e.message ?? String(err)}`);
  if (e.stack) console.error(e.stack);
  process.exit(1);
});
