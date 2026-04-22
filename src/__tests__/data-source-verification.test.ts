import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import {
  scanCitations,
  scanAllCitations,
  listDataFiles,
  LEGACY_CITATION_DIRECTIVE,
} from "./ssb-citations";

/**
 * Guards against fabricated SSB-table citations in src/data/**.
 *
 * Context: PRs #66 (crime.ts), #67 (kommune-population.ts), #72
 * (demographics.ts), and #73 (eiendomsskatt.ts) each revealed that previous
 * versions of those files cited SSB tables that either didn't exist or
 * contained different datasets than claimed — values appearing SSB-sourced
 * were actually hand-curated estimates. This check prevents that specific
 * regression.
 *
 * What this check validates:
 *   - Every `SSB table XXXXX` / `tabell XXXXX` / `tables/XXXXX` / `SSB XXXXX`
 *     citation in a data file refers to a table that exists on SSB PxWebApi
 *     (metadata endpoint returns 200).
 *
 * What this check does NOT validate (human review still required):
 *   - Whether the values in the file actually came from the cited table.
 *   - Whether the table contains the semantic content claimed (e.g. that
 *     `medianinntekt` from 06944 is household vs person median).
 *   - Non-SSB citations (Enova, Kartverket, NVE, etc.) — SSB-only for v1.
 *
 * Cache strategy:
 *   We assert against a committed fixture (ssb-metadata-cache.json) rather
 *   than hitting SSB on every test run. This keeps local runs fast (no
 *   network dependency) and deterministic (no transient failures). Refresh
 *   manually when citations change or at least yearly:
 *     npx tsx scripts/refresh-ssb-metadata-cache.ts
 *
 * Legacy escape hatch:
 *   A line containing `// legacy-citation: {reason}` is skipped — useful when
 *   a historical reference to a retired SSB table must be retained for audit
 *   purposes. Include the reason inline so future readers understand why.
 */

const CACHE_PATH = resolve(__dirname, "fixtures", "ssb-metadata-cache.json");
const SRC_DIR = resolve(__dirname, "..");

interface CacheEntry {
  exists: boolean;
  title: string;
  lastVerified: string;
}

const cache: Record<string, CacheEntry> = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {};

const citations = scanAllCitations();
const uniqueIds = Array.from(new Set(citations.map((c) => c.tableId))).sort();

const rel = (abs: string) => abs.replace(SRC_DIR + "/", "");

describe("SSB table citations in src/data/ must exist", () => {
  it("ships a metadata cache fixture", () => {
    expect(
      existsSync(CACHE_PATH),
      `Missing ${rel(CACHE_PATH)}. Run: npx tsx scripts/refresh-ssb-metadata-cache.ts`,
    ).toBe(true);
  });

  it("scans more than a handful of data files", () => {
    expect(listDataFiles().length).toBeGreaterThan(3);
  });

  it("cache covers every cited table", () => {
    const missing = uniqueIds.filter((id) => !(id in cache));
    const hint = missing.length
      ? `\nNew citation(s) found that are not in the cache yet:\n` +
        missing.map((id) => `  - ${id}`).join("\n") +
        `\n\nRun: npx tsx scripts/refresh-ssb-metadata-cache.ts`
      : undefined;
    expect(missing, hint).toEqual([]);
  });

  it("every cited SSB table exists on SSB", () => {
    const failures = citations.filter(
      (c) => cache[c.tableId] && cache[c.tableId].exists === false,
    );
    const report = failures
      .map(
        (c) =>
          `  ${rel(c.file)}:${c.line} cites SSB table ${c.tableId} — does not exist on SSB.\n    ${c.excerpt}`,
      )
      .join("\n");
    const hint = failures.length
      ? `\n${report}\n\nEither:\n` +
        `  - Correct the citation to the actual source table\n` +
        `  - Remove the citation if values are not SSB-sourced\n` +
        `  - Add a \`${LEGACY_CITATION_DIRECTIVE} {reason}\` comment on the line if intentionally retained for historical reference`
      : undefined;
    expect(failures, hint).toEqual([]);
  });
});

describe("ssb-citations scanner — sanity checks", () => {
  it("detects common citation patterns", () => {
    const snippet = [
      "// SSB tabell 07459",
      " * Source: SSB table 08487",
      "// https://data.ssb.no/api/pxwebapi/v2/tables/12345",
      "/** ... (SSB 06944, SamletInntekt). */",
      "// Source: tabell 09429",
    ].join("\n");
    const hits = scanCitations("synthetic.ts", snippet).map((c) => c.tableId);
    expect(hits).toContain("07459");
    expect(hits).toContain("08487");
    expect(hits).toContain("12345");
    expect(hits).toContain("06944");
    expect(hits).toContain("09429");
  });

  it("ignores year literals and kommunenumre without a citation prefix", () => {
    const snippet = [
      "const YEAR = 2026;",
      "const kommuneCount = 355;",
      "// Tid=2024",
      `"3107": { kommunenummer: "3107", name: "Fredrikstad" },`,
      "// see ContentsCode=06944 — note: raw dimension key, not a citation",
    ].join("\n");
    // ContentsCode=06944 has no "SSB"/"table" prefix, so it must not match.
    const hits = scanCitations("synthetic.ts", snippet);
    expect(hits.map((c) => c.tableId)).toEqual([]);
  });

  it("respects the legacy-citation escape hatch on the same line", () => {
    const snippet =
      "// Previously built from SSB table 09817. // legacy-citation: retired table, kept for audit trail";
    const hits = scanCitations("synthetic.ts", snippet);
    expect(hits).toEqual([]);
  });

  it("flags a phantom table when the cache marks it missing", () => {
    const phantomCache: Record<string, CacheEntry> = {
      "99999": {
        exists: false,
        title: "",
        lastVerified: "2026-04-22T00:00:00Z",
      },
    };
    const phantomCitations = scanCitations(
      "synthetic.ts",
      "// Source: SSB table 99999",
    );
    const failures = phantomCitations.filter(
      (c) => phantomCache[c.tableId]?.exists === false,
    );
    expect(failures).toHaveLength(1);
    expect(failures[0].tableId).toBe("99999");
  });
});
