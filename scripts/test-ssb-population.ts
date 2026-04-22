/**
 * SSB population data generator — rebuilds src/data/kommune-population.ts from
 * SSB table 07459 (Alders- og kjønnsfordeling i kommuner, fylker og hele
 * landets befolkning) via PxWebApi v2. Acts as both a smoke-test and the
 * single source of truth for kommune-level population data in the app.
 *
 * Data source: https://data.ssb.no/api/pxwebapi/v2/tables/07459/data
 * License: CC BY 4.0. Rate limit: 30 queries/minute per IP (this script uses
 * one query per chunk of ≤100 kommuner — typically ≤4 chunks).
 *
 * Aggregation trick: 07459 has Kjonn (2) and Alder (106) dimensions, but the
 * PxWebApi v2 aggregates across any dimension we omit from valueCodes. So we
 * only request Region + ContentsCode + Tid, and the server sums Kjonn × Alder
 * for us — returning one population number per kommune per year.
 *
 * Required env vars: NONE — public API, no authentication.
 *
 * How to run:
 *   npx tsx scripts/test-ssb-population.ts
 *
 * Writes src/data/kommune-population.new.ts (NOT kommune-population.ts) —
 * manual review + rename is the last step, so the generator is always
 * non-destructive.
 *
 * Expected output:
 *   Success — prints metadata summary, latest Tid, Oslo sanity value, total
 *             kommune count, and count above the 10,000-pop threshold.
 *             Writes src/data/kommune-population.new.ts. Exit 0.
 *   Failure — prints HTTP status / parse error and exits 1.
 *
 * Manual smoke-test / data regen. Not part of CI. Re-run once a year when a
 * new 1. januar population snapshot is published.
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TABLE = '07459';
const BASE = `https://data.ssb.no/api/pxwebapi/v2/tables/${TABLE}`;
const TODAY = new Date().toISOString().slice(0, 10);
const OUTPUT_PATH = resolve(__dirname, '../src/data/kommune-population.new.ts');

// Kommuner below this threshold are treated as "distrikt" by monthly-cost's
// category function and never need a population lookup. Keeping them out
// keeps the file small and unambiguous.
const MIN_POPULATION = 10_000;

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

  // Step 2 — ContentsCode: "Personer" (population count).
  const ccDim = meta.dimension['ContentsCode'];
  const ccCodes = Object.keys(ccDim.category.index);
  const ccLabels = ccDim.category.label ?? {};
  const personCode =
    ccCodes.find(c => /person/i.test(ccLabels[c] ?? '')) ??
    ccCodes.find(c => /person/i.test(c)) ??
    ccCodes[0];
  if (!personCode) throw new Error('could not identify Personer ContentsCode');
  console.log(`[ssb] ContentsCode=${personCode} (${ccLabels[personCode] ?? ''})`);

  // Step 3 — Region variable.
  const regionDimName =
    meta.id.find(n => /region|kommune/i.test(n)) ?? meta.id[0];
  const regionDimMeta = meta.dimension[regionDimName];
  const regionLabelsMeta = regionDimMeta.category.label ?? {};
  console.log(`[ssb] region dimension: ${regionDimName}`);

  // Step 4 — latest Tid period.
  const tidDim = meta.dimension['Tid'];
  const tidCodes = Object.keys(tidDim.category.index).sort();
  const latestTid = tidCodes[tidCodes.length - 1];
  const tidLabels = tidDim.category.label ?? {};
  const periodLabel = tidLabels[latestTid] ?? latestTid;
  console.log(`[ssb] latest period: ${latestTid} ("${periodLabel}")`);

  // Step 5 — filter to real kommune codes. 4-digit numeric, excluding:
  //   - "0000" (Hele landet)
  //   - codes ending in "99" ("Uoppgitt i fylke XX" aggregates)
  //   - "9999" (Uoppgitt kommune)
  // 07459 historical region list includes defunct kommuner — SSB returns null
  // for them in the data call, so we drop them in Step 7.
  const allRegionCodes = Object.keys(regionDimMeta.category.index);
  const kommuneCodes = allRegionCodes
    .filter(c => /^\d{4}$/.test(c))
    .filter(c => c !== '0000' && !/99$/.test(c))
    .sort();
  console.log(`[ssb] found ${kommuneCodes.length} kommune codes (of ${allRegionCodes.length} total regions)`);

  // Step 6 — fetch data in chunks. Same URL-length constraint as the crime
  // script — 100 codes/chunk keeps the Region param well under the IIS limit.
  // Omitting Kjonn/Alder causes SSB to aggregate — so we get one value per
  // kommune per year (not 2 × 106 = 212 values).
  const CHUNK_SIZE = 100;
  const chunks: string[][] = [];
  for (let i = 0; i < kommuneCodes.length; i += CHUNK_SIZE) {
    chunks.push(kommuneCodes.slice(i, i + CHUNK_SIZE));
  }
  console.log(`\n[ssb] requesting data for ${kommuneCodes.length} kommuner in ${chunks.length} chunks of ≤${CHUNK_SIZE}…`);

  const rows: Array<{ code: string; pop: number; label: string }> = [];
  const missing: string[] = [];
  for (let ci = 0; ci < chunks.length; ci++) {
    const chunk = chunks[ci];
    const qs = [
      'lang=no',
      `valueCodes%5B${regionDimName}%5D=${encodeURIComponent(chunk.join(','))}`,
      `valueCodes%5BContentsCode%5D=${encodeURIComponent(personCode)}`,
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
        ContentsCode: personCode,
        Tid: latestTid,
      });
      if (v == null) { missing.push(code); continue; }
      rows.push({
        code,
        pop: Math.round(v),
        label: regionLabels[code] ?? regionLabelsMeta[code] ?? '',
      });
      chunkHits++;
    }
    console.log(`[ssb]   chunk ${ci + 1}/${chunks.length}: ${chunkHits}/${chunk.length} with values`);
  }
  rows.sort((a, b) => a.code.localeCompare(b.code));
  console.log(`[ssb] ${rows.length} kommuner with values, ${missing.length} without (defunct/no-data)`);

  // Step 7 — sanity checks + filter.
  const oslo = rows.find(r => r.code === '0301');
  console.log(`[ssb] sanity — Oslo (0301): ${oslo?.pop ?? 'N/A'} (prior baseline 717710)`);
  if (!oslo || oslo.pop < 500_000 || oslo.pop > 1_000_000) {
    console.warn(`[ssb] ⚠️  Oslo pop looks off — review codes above`);
  }
  const baerum = rows.find(r => r.code === '3201');
  console.log(`[ssb] sanity — Bærum (3201): ${baerum?.pop ?? 'N/A'} (prior baseline 131572)`);
  const tromso = rows.find(r => r.code === '5501');
  console.log(`[ssb] sanity — Tromsø (5501): ${tromso?.pop ?? 'N/A'} (prior baseline 78867)`);

  // Strip the label — SSB returns e.g. "Oslo (-2019)" for pre-reform code,
  // "Oslo" for current. Clean kommune name is label with any trailing "(…)"
  // year annotation removed.
  const cleanLabel = (s: string) => s.replace(/\s*\(-?\d{4}-?\)\s*$/, '').trim();

  const filtered = rows
    .filter(r => r.pop >= MIN_POPULATION)
    .sort((a, b) => b.pop - a.pop); // descending by population
  console.log(`[ssb] ${filtered.length} kommuner at or above the ${MIN_POPULATION.toLocaleString('nb-NO')} threshold`);

  // Step 8 — write src/data/kommune-population.new.ts.
  const header = `// SSB tabell 07459 — kommune population (${periodLabel} figures,
// Jan 1 snapshot, aggregated across all Alder × Kjonn cells).
// Source: https://data.ssb.no/api/pxwebapi/v2/tables/07459
// License: CC BY 4.0. Last refreshed: ${TODAY}.
//
// Only kommuner with population ≥ ${MIN_POPULATION.toLocaleString('en-US').replace(',', ' ')} are listed; below that the
// monthly-cost category function treats the kommune as distrikt and no
// lookup is needed. All codes are post-reform (2024+).
//
// Re-run \`npx tsx scripts/test-ssb-population.ts\` to regenerate.

export interface KommunePopulationEntry {
  kommunenummer: string;
  name: string;
  population: number;
}

export const kommunePopulation: Record<string, KommunePopulationEntry> = {
`;

  const body = filtered
    .map(r => `  "${r.code}": { kommunenummer: "${r.code}", name: "${cleanLabel(r.label)}", population: ${r.pop} },`)
    .join('\n');

  const footer = `
};

export function getKommunePopulation(kommunenummer: string): number | null {
  return kommunePopulation[kommunenummer]?.population ?? null;
}
`;

  const content = header + body + footer;
  writeFileSync(OUTPUT_PATH, content, 'utf8');
  console.log(`\n[ssb] ✍️  wrote ${OUTPUT_PATH} (${filtered.length} kommuner ≥ ${MIN_POPULATION.toLocaleString('nb-NO')})`);

  if (missing.length) {
    console.log(`[ssb] ${missing.length} kommune code(s) in metadata had no data for ${periodLabel}:`);
    for (const c of missing.slice(0, 10)) console.log(`  - ${c}`);
    if (missing.length > 10) console.log(`  (…and ${missing.length - 10} more)`);
  }

  console.log(`\n[ssb] ✅ done. Period="${periodLabel}", ContentsCode=${personCode}, Region var=${regionDimName}.`);
  console.log('[ssb] Next: review kommune-population.new.ts, then rename to kommune-population.ts when satisfied.');
  process.exit(0);
}

main().catch((err: unknown) => {
  const e = err as { message?: string; stack?: string };
  console.error(`[ssb] ❌ failed: ${e.message ?? String(err)}`);
  if (e.stack) console.error(e.stack);
  process.exit(1);
});
