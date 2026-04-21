/**
 * SSB crime-statistics data generator — rebuilds src/data/crime.ts from
 * SSB table 08487 (two-year average reported crime rate per 1 000 innbyggere)
 * via PxWebApi v2. Acts as both a smoke-test and the single source of truth
 * for kommune-level crime data in the app.
 *
 * Data source: https://data.ssb.no/api/pxwebapi/v2/tables/08487/data
 * License: CC BY 4.0. Rate limit: 30 queries/minute per IP (this script uses 3).
 *
 * Required env vars: NONE — public API, no authentication.
 *
 * How to run:
 *   npx tsx scripts/test-ssb-crime.ts
 *
 * Writes src/data/crime.new.ts (NOT crime.ts) — manual review + rename is the
 * last step, so the generator is always non-destructive.
 *
 * Expected output:
 *   Success — prints metadata summary, identified codes, the latest Tid period,
 *             an Oslo sanity value, national average, and a count of kommuner.
 *             Writes src/data/crime.new.ts. Exit 0.
 *   Failure — prints HTTP status / parse error and exits 1.
 *
 * Manual smoke-test / data regen. Not part of CI. Re-run once a year when a new
 * two-year SSB period is published to refresh kommune crime rates.
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TABLE = '08487';
const BASE = `https://data.ssb.no/api/pxwebapi/v2/tables/${TABLE}`;
const TODAY = new Date().toISOString().slice(0, 10);
const OUTPUT_PATH = resolve(__dirname, '../src/data/crime.new.ts');

interface JsonStat2 {
  value: (number | null)[] | Record<string, number | null>;
  id: string[];
  size: number[];
  dimension: Record<string, {
    label?: string;
    category: {
      index: Record<string, number>;
      label?: Record<string, string>;
    };
  }>;
}

async function fetchJson<T>(url: string): Promise<T> {
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

async function main() {
  // Step 1 — metadata: discover variable names + codes.
  console.log(`[ssb] fetching metadata for table ${TABLE}…`);
  const meta = await fetchJson<JsonStat2>(`${BASE}/metadata?lang=no&outputFormat=json-stat2`);
  console.log(`[ssb] variables: ${meta.id.join(', ')}`);
  for (const name of meta.id) {
    const dim = meta.dimension[name];
    const codes = Object.keys(dim.category.index);
    console.log(`  - ${name} (${dim.label ?? name}): ${codes.length} values`);
  }

  // Step 2 — ContentsCode: "Lovbrudd anmeldt per 1000 innbyggere".
  const ccDim = meta.dimension['ContentsCode'];
  const ccCodes = Object.keys(ccDim.category.index);
  const ccLabels = ccDim.category.label ?? {};
  const rateCode =
    ccCodes.find(c => /per\s*1\s*000|per\s*1000/i.test(ccLabels[c] ?? '')) ??
    ccCodes.find(c => /P(er)?1000/i.test(c));
  if (!rateCode) throw new Error('could not identify per-1000 ContentsCode');
  console.log(`[ssb] ContentsCode=${rateCode} (${ccLabels[rateCode] ?? ''})`);

  // Step 3 — Lovbruddsgruppe total ("Alle lovbruddsgrupper").
  const lovDimName = meta.id.find(n => /lovbrudd/i.test(n));
  if (!lovDimName) throw new Error('no Lovbrudd* dimension found');
  const lovDim = meta.dimension[lovDimName];
  const lovLabels = lovDim.category.label ?? {};
  const lovCodes = Object.keys(lovDim.category.index);
  // Prefer code label starting with "Alle lovbruddsgrupper" (not "¬ …" subcategories).
  // SSB has two matching codes — "01" (older 7-group tree) and "1AAAAA-9ZZZZz"
  // (newer 6-group tree). We take the newer one since it aligns with the 2023-2024
  // period's primary breakdown.
  const totalCode =
    lovCodes.find(c => /^Alle lovbruddsgrupper$/i.test(lovLabels[c] ?? '') && c !== '01') ??
    lovCodes.find(c => /^Alle lovbruddsgrupper$/i.test(lovLabels[c] ?? '')) ??
    lovCodes.find(c => /i alt/i.test(lovLabels[c] ?? ''));
  if (!totalCode) throw new Error('could not identify Alle-lovbruddsgrupper code');
  console.log(`[ssb] ${lovDimName}=${totalCode} (${lovLabels[totalCode] ?? ''})`);

  // Step 4 — region variable name (08487 uses "Gjerningssted", other tables vary).
  const regionDimName =
    meta.id.find(n => /region|gjerningssted|kommune/i.test(n)) ?? meta.id[0];
  const regionDimMeta = meta.dimension[regionDimName];
  const regionLabelsMeta = regionDimMeta.category.label ?? {};
  console.log(`[ssb] region dimension: ${regionDimName}`);

  // Step 5 — latest Tid period.
  const tidDim = meta.dimension['Tid'];
  const tidCodes = Object.keys(tidDim.category.index).sort();
  const latestTid = tidCodes[tidCodes.length - 1];
  const tidLabels = tidDim.category.label ?? {};
  const periodLabel = tidLabels[latestTid] ?? latestTid;
  console.log(`[ssb] latest period: ${latestTid} ("${periodLabel}")`);

  // Derive endpoint year for the { year } field.
  const yearMatches = (periodLabel.match(/\d{4}/g) ?? []).map(Number);
  const endYear = yearMatches.length ? yearMatches[yearMatches.length - 1] : new Date().getFullYear();

  // Step 6 — filter to real kommune codes. 4-digit numeric, excluding:
  //   - "0000" (Alle kommuner aggregate)
  //   - codes ending in "99" ("Uoppgitt i fylke XX" aggregates)
  //   - "9999" (Uoppgitt kommune)
  const allRegionCodes = Object.keys(regionDimMeta.category.index);
  const kommuneCodes = allRegionCodes
    .filter(c => /^\d{4}$/.test(c))
    .filter(c => c !== '0000' && !/99$/.test(c))
    .sort();
  console.log(`[ssb] found ${kommuneCodes.length} kommune codes (of ${allRegionCodes.length} total regions)`);

  // Step 7 — fetch data in chunks. SSB runs on IIS and 404s URLs >~4 KB;
  // with 875 historical+current kommune codes encoded, we'd blow that limit.
  // 150 codes/chunk → ~750 B Region param → safe, well under the 30/min limit.
  const CHUNK_SIZE = 150;
  const chunks: string[][] = [];
  for (let i = 0; i < kommuneCodes.length; i += CHUNK_SIZE) {
    chunks.push(kommuneCodes.slice(i, i + CHUNK_SIZE));
  }
  console.log(`\n[ssb] requesting data for ${kommuneCodes.length} kommuner in ${chunks.length} chunks of ≤${CHUNK_SIZE}…`);

  const rows: Array<{ code: string; rate: number; label: string }> = [];
  const missing: string[] = [];
  for (let ci = 0; ci < chunks.length; ci++) {
    const chunk = chunks[ci];
    const qs = [
      'lang=no',
      `valueCodes%5B${regionDimName}%5D=${encodeURIComponent(chunk.join(','))}`,
      `valueCodes%5B${lovDimName}%5D=${encodeURIComponent(totalCode)}`,
      `valueCodes%5BContentsCode%5D=${encodeURIComponent(rateCode)}`,
      `valueCodes%5BTid%5D=${encodeURIComponent(latestTid)}`,
      'outputFormat=json-stat2',
    ].join('&');
    const data = await fetchJson<JsonStat2>(`${BASE}/data?${qs}`);
    const regionDim = data.dimension[regionDimName];
    const regionLabels = regionDim.category.label ?? {};
    const returnedCodes = new Set(Object.keys(regionDim.category.index));
    let chunkHits = 0;
    for (const code of chunk) {
      if (!returnedCodes.has(code)) { missing.push(code); continue; }
      const v = getValue(data, {
        [regionDimName]: code,
        [lovDimName]: totalCode,
        ContentsCode: rateCode,
        Tid: latestTid,
      });
      if (v == null) { missing.push(code); continue; }
      rows.push({
        code,
        rate: Math.round(v * 10) / 10,
        label: regionLabels[code] ?? regionLabelsMeta[code] ?? '',
      });
      chunkHits++;
    }
    console.log(`[ssb]   chunk ${ci + 1}/${chunks.length}: ${chunkHits}/${chunk.length} with values`);
  }
  rows.sort((a, b) => a.code.localeCompare(b.code));
  console.log(`[ssb] ${rows.length} kommuner with values, ${missing.length} without (defunct/no-data)`);

  // Step 9 — Oslo sanity + national average (Gjerningssted=0 = hele landet).
  const oslo = rows.find(r => r.code === '0301');
  console.log(`[ssb] sanity — Oslo (0301): ${oslo?.rate ?? 'N/A'} per 1000 (prior baseline 93.2)`);
  if (!oslo || oslo.rate < 40 || oslo.rate > 200) {
    console.warn(`[ssb] ⚠️  Oslo rate looks off — review codes above`);
  }

  const natUrl = `${BASE}/data?lang=no&` + [
    `valueCodes%5B${regionDimName}%5D=0`,
    `valueCodes%5B${lovDimName}%5D=${encodeURIComponent(totalCode)}`,
    `valueCodes%5BContentsCode%5D=${encodeURIComponent(rateCode)}`,
    `valueCodes%5BTid%5D=${encodeURIComponent(latestTid)}`,
    'outputFormat=json-stat2',
  ].join('&');
  const natData = await fetchJson<JsonStat2>(natUrl);
  const natValue = getValue(natData, {
    [regionDimName]: '0',
    [lovDimName]: totalCode,
    ContentsCode: rateCode,
    Tid: latestTid,
  });
  if (natValue == null) throw new Error('national average (Region=0) returned null');
  const nationalAvg = Math.round(natValue * 10) / 10;
  console.log(`[ssb] national avg (${regionDimName}=0): ${nationalAvg} per 1000 (prior baseline 57.4)`);

  // Step 10 — write src/data/crime.new.ts.
  const highUrban = ['0301', '4601', '5001', '1103']; // Oslo, Bergen, Trondheim, Stavanger
  const highUrbanPresent = highUrban.filter(c => rows.some(r => r.code === c));

  const header = `/**
 * Kommune-level crime rates.
 *
 * Source: SSB table 08487 — Lovbrudd anmeldt etter utvalgte lovbruddsgrupper
 * og gjerningssted (kommune). To års gjennomsnitt. Antall og per 1 000 innbyggere.
 * Period: ${periodLabel} (2-year average). License: CC BY 4.0.
 * Last refreshed: ${TODAY}
 *
 * Re-run \`npx tsx scripts/test-ssb-crime.ts\` to regenerate with newer data.
 */

export interface KommuneCrime {
  rate: number;
  year: number;
}

export const KOMMUNE_CRIME: Record<string, KommuneCrime> = {
`;

  const body = rows
    .map(r => `  "${r.code}": { rate: ${r.rate.toFixed(1)}, year: ${endYear} }, // ${r.label}`)
    .join('\n');

  const footer = `
};

export const NATIONAL_CRIME_AVG = ${nationalAvg.toFixed(1)};

/** Large cities always read "over snitt" due to urban density — flagged as urban
    context so UI can soften the label. */
export const HIGH_URBAN_COMMUNES = new Set([${highUrbanPresent.map(c => `"${c}"`).join(', ')}]);
`;

  const content = header + body + footer;
  writeFileSync(OUTPUT_PATH, content, 'utf8');
  console.log(`\n[ssb] ✍️  wrote ${OUTPUT_PATH} (${rows.length} kommuner)`);

  if (missing.length) {
    console.log(`[ssb] ${missing.length} kommune code(s) in metadata had no data for ${periodLabel}:`);
    for (const c of missing.slice(0, 10)) console.log(`  - ${c}`);
    if (missing.length > 10) console.log(`  (…and ${missing.length - 10} more)`);
  }

  console.log(`\n[ssb] ✅ done. Period="${periodLabel}", ContentsCode=${rateCode}, Region var=${regionDimName}.`);
  console.log('[ssb] Next: review crime.new.ts, then rename to crime.ts when satisfied.');
  process.exit(0);
}

main().catch((err: unknown) => {
  const e = err as { message?: string; stack?: string };
  console.error(`[ssb] ❌ failed: ${e.message ?? String(err)}`);
  if (e.stack) console.error(e.stack);
  process.exit(1);
});
