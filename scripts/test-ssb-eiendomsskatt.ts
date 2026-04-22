/**
 * SSB eiendomsskatt generator — rebuilds src/data/eiendomsskatt.ts from a
 * single SSB table via PxWebApi v2:
 *
 *   - 14674 — Eiendomsskatt (K). Per-kommune promille, bunnfradrag,
 *             and scope (hele kommunen / bare byvis / bare næring / …).
 *             Latest Tid: 2026 (published 2026-03-16).
 *
 * The previous eiendomsskatt.ts had no source annotation and 19 hand-curated
 * entries; spot-checks vs SSB showed several materially wrong promille values
 * (Stavanger 2.0→1.0, Bergen 2.8→2.6, Trondheim 2.0→2.65, Tromsø 3.0→4.0,
 * Fredrikstad 2.5→3.2). Oslo was the only entry that matched.
 *
 * NB: the kommune-data-audit-2026-04-22 doc cited SSB tables 12842/12843 —
 * neither exists. 14674 is the correct per-kommune table; 14155 is the
 * national aggregate.
 *
 * Bolig-rate selection rule (from 14674 ContentsCode semantics):
 *   1. KOShareskatt0000 == 0                                    → hasTax=false
 *   2. KOSbareallnaerin0000 == 1 or KOSbareverkogbru0000 == 1   → hasTax=false
 *      (kommune taxes only næring/kraft, not boliger — e.g. Sandnes 1108)
 *   3. KOSdiffskatt0000 populated → hasTax=true, promille=diffskatt
 *      (differentiated rate for boliger+fritidsboliger)
 *   4. KOSgenskatt0000 populated  → hasTax=true, promille=genskatt
 *      (kommune applies the general rate to boliger too)
 *   5. otherwise → hasTax=false
 *
 * reductionFactor: when KOSskattformue0000 == 1 the kommune uses Skatteetaten's
 * formuesgrunnlag and the reduction factor is set nationally at 0.7 by
 * eigedomsskattelova §8 C-1 (primærbolig). When 0, the kommune does its own
 * taksering with no single "factor", so we omit the field.
 *
 * bunnfradrag: KOSbunnfradrag0000 gives size in kr when KOSharbunnfradra0000==1.
 *
 * Data source: https://data.ssb.no/api/pxwebapi/v2
 * License: CC BY 4.0. Rate limit: 30 queries/minute per IP (this script
 * issues ≤6 queries).
 *
 * Required env vars: NONE — public API, no authentication.
 *
 * How to run:
 *   npx tsx scripts/test-ssb-eiendomsskatt.ts
 *
 * Writes src/data/eiendomsskatt.new.ts (NOT eiendomsskatt.ts) — manual review
 * + rename is the last step, so the generator is always non-destructive.
 *
 * Expected output:
 *   Success — prints metadata summary, latest Tid, sanity values for
 *             Oslo / Bærum / Bergen / Sandnes (næring-only edge case) /
 *             Stavanger, and a count of kommuner. Writes
 *             src/data/eiendomsskatt.new.ts. Exit 0.
 *   Failure — prints HTTP status / parse error and exits 1.
 *
 * Manual smoke-test / data regen. Not part of CI. Re-run annually when SSB
 * publishes a new vintage (typically Q1 for the current budget year).
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TODAY = new Date().toISOString().slice(0, 10);
const OUTPUT_PATH = resolve(__dirname, '../src/data/eiendomsskatt.new.ts');

const TABLE = '14674';
const BASE = 'https://data.ssb.no/api/pxwebapi/v2/tables';
const REGION_DIM = 'KOKkommuneregion0000';

const CONTENTS = {
  hasTax: 'KOShareskatt0000',
  bareNaering: 'KOSbareallnaerin0000',
  bareVerk: 'KOSbareverkogbru0000',
  genskatt: 'KOSgenskatt0000',
  diffskatt: 'KOSdiffskatt0000',
  harBunnfradrag: 'KOSharbunnfradra0000',
  bunnfradrag: 'KOSbunnfradrag0000',
  formuesgrunnlag: 'KOSskattformue0000',
} as const;

const CONTENTS_CODES = Object.values(CONTENTS);

/** Reduction factor set nationally when formuesgrunnlag is used (primærbolig). */
const FORMUESGRUNNLAG_REDUCTION = 0.7;

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

function cleanLabel(s: string): string {
  return s.replace(/\s*\(-?\d{4}-?\)\s*$/, '').trim();
}

async function fetchData(
  kommuneCodes: string[],
  tid: string,
): Promise<Record<string, Record<string, number | null>>> {
  const out: Record<string, Record<string, number | null>> = {};
  const chunks = chunked(kommuneCodes, 100);
  console.log(
    `[ssb] fetching ${TABLE} (${CONTENTS_CODES.length} fields) for ${kommuneCodes.length} kommuner across ${chunks.length} chunk(s) (Tid=${tid})…`,
  );
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const qs = [
      'lang=no',
      `valueCodes%5B${REGION_DIM}%5D=${encodeURIComponent(chunk.join(','))}`,
      `valueCodes%5BContentsCode%5D=${encodeURIComponent(CONTENTS_CODES.join(','))}`,
      `valueCodes%5BTid%5D=${tid}`,
      'outputFormat=json-stat2',
    ].join('&');
    const data = await fetchJson<JsonStat2>(`${BASE}/${TABLE}/data?${qs}`);
    for (const code of chunk) {
      const row: Record<string, number | null> = {};
      for (const cc of CONTENTS_CODES) {
        row[cc] = getValue(data, {
          [REGION_DIM]: code,
          ContentsCode: cc,
          Tid: tid,
        });
      }
      out[code] = row;
    }
    console.log(`[ssb]   ${TABLE} chunk ${i + 1}/${chunks.length} — done`);
  }
  return out;
}

interface Row {
  kommunenummer: string;
  name: string;
  hasTax: boolean;
  promille?: number;
  bunnfradrag?: number;
  reductionFactor?: number;
}

function resolveRow(code: string, name: string, raw: Record<string, number | null>): Row {
  const hasAny = raw[CONTENTS.hasTax];
  if (hasAny !== 1) {
    return { kommunenummer: code, name, hasTax: false };
  }
  const onlyNaering =
    raw[CONTENTS.bareNaering] === 1 || raw[CONTENTS.bareVerk] === 1;
  if (onlyNaering) {
    return { kommunenummer: code, name, hasTax: false };
  }
  const diff = raw[CONTENTS.diffskatt];
  const gen = raw[CONTENTS.genskatt];
  const promille = diff != null ? diff : gen != null ? gen : null;
  if (promille == null) {
    return { kommunenummer: code, name, hasTax: false };
  }
  const row: Row = {
    kommunenummer: code,
    name,
    hasTax: true,
    promille,
  };
  if (raw[CONTENTS.harBunnfradrag] === 1 && raw[CONTENTS.bunnfradrag] != null) {
    row.bunnfradrag = raw[CONTENTS.bunnfradrag] ?? undefined;
  }
  if (raw[CONTENTS.formuesgrunnlag] === 1) {
    row.reductionFactor = FORMUESGRUNNLAG_REDUCTION;
  }
  return row;
}

function formatRow(r: Row): string {
  const parts: string[] = [
    `kommunenummer: "${r.kommunenummer}"`,
    `name: ${JSON.stringify(r.name)}`,
    `hasTax: ${r.hasTax}`,
  ];
  if (r.promille != null) parts.push(`promille: ${r.promille}`);
  if (r.bunnfradrag != null) parts.push(`bunnfradrag: ${r.bunnfradrag}`);
  if (r.reductionFactor != null) parts.push(`reductionFactor: ${r.reductionFactor}`);
  return `  "${r.kommunenummer}": { ${parts.join(', ')} },`;
}

async function main() {
  console.log(`[ssb] fetching metadata for ${TABLE}…`);
  const meta = await fetchJson<JsonStat2>(
    `${BASE}/${TABLE}/metadata?lang=no&outputFormat=json-stat2`,
  );
  const tid = pickLatestTid(meta);
  const tidCodes = Object.keys(meta.dimension['Tid'].category.index).sort();
  const priorTid = tidCodes[tidCodes.length - 2];
  console.log(
    `[ssb] ${TABLE} latest Tid: ${tid.code} ("${tid.label}"), fallback Tid: ${priorTid}`,
  );

  const allRegionCodes = Object.keys(meta.dimension[REGION_DIM].category.index);
  const candidateKommuner = allRegionCodes
    .filter((c) => /^\d{4}$/.test(c))
    .filter((c) => c !== '0000' && !/99$/.test(c))
    .sort();
  console.log(
    `[ssb] ${candidateKommuner.length} candidate kommune codes from ${TABLE} metadata`,
  );

  const regionLabels = meta.dimension[REGION_DIM].category.label ?? {};
  const rawLatest = await fetchData(candidateKommuner, tid.code);

  // Kommuner that return all-null at the latest Tid haven't reported yet.
  // Fall back to priorTid (typically the most recent finalized year).
  const missingAtLatest = candidateKommuner.filter(
    (c) => !CONTENTS_CODES.some((cc) => rawLatest[c][cc] != null),
  );
  console.log(
    `[ssb] ${missingAtLatest.length} kommuner all-null at ${tid.code} — fetching ${priorTid} fallback`,
  );
  const rawFallback = missingAtLatest.length
    ? await fetchData(missingAtLatest, priorTid)
    : {};

  const rows: Row[] = [];
  const fromFallback: string[] = [];
  const stillMissing: string[] = [];
  for (const code of candidateKommuner) {
    const primary = rawLatest[code];
    const hasPrimary = CONTENTS_CODES.some((cc) => primary[cc] != null);
    let raw = primary;
    if (!hasPrimary) {
      const fb = rawFallback[code];
      const hasFallback = fb && CONTENTS_CODES.some((cc) => fb[cc] != null);
      if (!hasFallback) {
        stillMissing.push(code);
        continue;
      }
      raw = fb;
      fromFallback.push(code);
    }
    const name = cleanLabel(regionLabels[code] ?? code);
    rows.push(resolveRow(code, name, raw));
  }
  rows.sort((a, b) => a.kommunenummer.localeCompare(b.kommunenummer));
  console.log(
    `[ssb] ${rows.length} kommuner total: ${rows.length - fromFallback.length} @ Tid=${tid.code}, ${fromFallback.length} @ Tid=${priorTid} fallback, ${stillMissing.length} with no data at all`,
  );
  if (fromFallback.length) {
    console.log(`[ssb] fallback kommuner: ${fromFallback.join(', ')}`);
  }

  // Sanity checks vs audit expectations.
  const sample = (code: string, expected: string): void => {
    const r = rows.find((x) => x.kommunenummer === code);
    if (!r) {
      console.warn(`[ssb] sanity — ${code}: NOT FOUND (${expected})`);
      return;
    }
    console.log(
      `[ssb] sanity — ${code} ${r.name}: hasTax=${r.hasTax}, promille=${r.promille ?? '-'}, bunnfradrag=${r.bunnfradrag ?? '-'}, redFactor=${r.reductionFactor ?? '-'} | expected: ${expected}`,
    );
  };
  sample('0301', 'hasTax=true, promille=1.7, bunnfradrag=4900000, reductionFactor=0.7');
  sample('4601', 'hasTax=true, promille=2.6, bunnfradrag=750000, reductionFactor=0.7');
  sample('5001', 'hasTax=true, promille=2.65, bunnfradrag=700000');
  sample('1103', 'hasTax=true, promille=1.0 (halved from old 2.0)');
  sample('3107', 'hasTax=true, promille=3.2, bunnfradrag=1000000');
  sample('1108', 'hasTax=false (Sandnes taxes only næring, not boliger)');
  sample('3201', 'hasTax=false (Bærum)');
  sample('3301', 'hasTax=false (Drammen removed 2024)');

  const taxing = rows.filter((r) => r.hasTax).length;
  const withBunnfradrag = rows.filter((r) => r.bunnfradrag != null).length;
  const withRedFactor = rows.filter((r) => r.reductionFactor != null).length;
  console.log(
    `[ssb] summary: ${taxing}/${rows.length} levy on boliger; ${withBunnfradrag} with bunnfradrag; ${withRedFactor} using formuesgrunnlag (reductionFactor=0.7)`,
  );

  const header = `/**
 * Property tax (eiendomsskatt) configuration per kommune.
 *
 * Source: SSB table 14674 — Eiendomsskatt (K), Tid=${tid.code} (${tid.label})
 *   with Tid=${priorTid} fallback for ${fromFallback.length} kommuner not yet
 *   reporting ${tid.code} at publication time.
 *   - hasTax: KOShareskatt0000, modulated by KOSbareallnaerin0000 /
 *     KOSbareverkogbru0000 (kommuner that levy only on næring are treated
 *     as hasTax=false for boliger).
 *   - promille: KOSdiffskatt0000 (differentiated rate for boliger) when
 *     available, else KOSgenskatt0000 (general rate).
 *   - bunnfradrag: KOSbunnfradrag0000 when KOSharbunnfradra0000=1.
 *   - reductionFactor: 0.7 (eigedomsskattelova §8 C-1, primærbolig) when
 *     KOSskattformue0000=1 (kommune uses formuesgrunnlag). Omitted for
 *     kommuner using local taksering, where no single factor applies.
 * License: CC BY 4.0
 * Last refreshed: ${TODAY}
 *
 * Re-run \`npx tsx scripts/test-ssb-eiendomsskatt.ts\` to regenerate. The
 * 'note' field is hand-maintained and preserved across regenerations; it
 * is not present in SSB.
 */

export interface EiendomsskattData {
  kommunenummer: string;
  name: string;
  hasTax: boolean;
  promille?: number;
  /** Bunnfradrag in NOK subtracted from skattegrunnlag before tax applies. */
  bunnfradrag?: number;
  /** Obligatorisk reduksjonsfaktor — market value × this = skattegrunnlag (before bunnfradrag). */
  reductionFactor?: number;
  note?: string;
}

export const eiendomsskattData: Record<string, EiendomsskattData> = {
`;

  const body = rows.map(formatRow).join('\n');

  const footer = `
};

export function getEiendomsskatt(kommunenummer: string): EiendomsskattData | undefined {
  return eiendomsskattData[kommunenummer];
}
`;

  writeFileSync(OUTPUT_PATH, header + body + footer, 'utf8');
  console.log(`\n[ssb] ✍️  wrote ${OUTPUT_PATH} (${rows.length} kommuner)`);
  console.log(
    `\n[ssb] ✅ done. Tid=${tid.code}. Next: review eiendomsskatt.new.ts, then rename to eiendomsskatt.ts when satisfied.`,
  );
  process.exit(0);
}

main().catch((err: unknown) => {
  const e = err as { message?: string; stack?: string };
  console.error(`[ssb] ❌ failed: ${e.message ?? String(err)}`);
  if (e.stack) console.error(e.stack);
  process.exit(1);
});
