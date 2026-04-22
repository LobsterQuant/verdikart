/**
 * Refreshes src/__tests__/fixtures/ssb-metadata-cache.json by scanning all
 * SSB table citations in src/data/** and hitting the SSB PxWebApi v2 metadata
 * endpoint for each unique table ID.
 *
 * The cache is consumed by src/__tests__/data-source-verification.test.ts,
 * which runs as part of the normal vitest suite. We keep the cache committed
 * (rather than hitting the network on every test) so local runs stay fast and
 * deterministic. The SSB tables we cite change rarely — a manual refresh on
 * new citations or yearly is sufficient.
 *
 * How to run:
 *   npx tsx scripts/refresh-ssb-metadata-cache.ts
 *
 * Exits non-zero if any cited table does not exist on SSB, so you can wire
 * this into release checks if desired. Network errors do not fail the script
 * — they are surfaced as warnings so a flaky connection doesn't block work.
 *
 * Required env vars: NONE (public SSB API).
 */

import { writeFileSync } from "fs";
import { resolve } from "path";
import { scanAllCitations } from "../src/__tests__/ssb-citations";

const CACHE_PATH = resolve(
  __dirname,
  "..",
  "src",
  "__tests__",
  "fixtures",
  "ssb-metadata-cache.json",
);

const metadataUrl = (id: string) =>
  `https://data.ssb.no/api/pxwebapi/v2/tables/${id}/metadata?lang=no&outputFormat=json-stat2`;

interface CacheEntry {
  exists: boolean;
  title: string;
  lastVerified: string;
}

async function fetchMetadata(
  id: string,
  now: string,
): Promise<{ entry: CacheEntry; networkError?: string }> {
  try {
    const res = await fetch(metadataUrl(id));
    if (res.status === 404) {
      return { entry: { exists: false, title: "", lastVerified: now } };
    }
    if (!res.ok) {
      return {
        entry: { exists: false, title: "", lastVerified: now },
        networkError: `HTTP ${res.status}`,
      };
    }
    const body = (await res.json()) as { label?: string };
    return {
      entry: { exists: true, title: body.label ?? "", lastVerified: now },
    };
  } catch (err) {
    return {
      entry: { exists: false, title: "", lastVerified: now },
      networkError: (err as Error).message,
    };
  }
}

async function main() {
  const citations = scanAllCitations();
  const uniqueIds = Array.from(new Set(citations.map((c) => c.tableId))).sort();
  const fileCount = new Set(citations.map((c) => c.file)).size;

  console.log(
    `Scanned ${fileCount} data file(s); found ${citations.length} citation(s) across ${uniqueIds.length} unique SSB table(s).`,
  );

  const now = new Date().toISOString();
  const cache: Record<string, CacheEntry> = {};
  const networkWarnings: string[] = [];

  for (const id of uniqueIds) {
    const { entry, networkError } = await fetchMetadata(id, now);
    cache[id] = entry;
    if (networkError) {
      networkWarnings.push(`${id}: ${networkError}`);
      console.log(`  ${id}  WARN  ${networkError}`);
    } else if (entry.exists) {
      console.log(`  ${id}  OK    ${entry.title.slice(0, 90)}`);
    } else {
      console.log(`  ${id}  FAIL  does not exist on SSB`);
    }
  }

  const sorted: Record<string, CacheEntry> = {};
  for (const id of uniqueIds) sorted[id] = cache[id];
  writeFileSync(CACHE_PATH, JSON.stringify(sorted, null, 2) + "\n", "utf8");
  console.log(
    `\nWrote ${CACHE_PATH.replace(resolve(__dirname, ".."), ".")} (${uniqueIds.length} entries).`,
  );

  const phantom = uniqueIds.filter(
    (id) => !cache[id].exists && !networkWarnings.some((w) => w.startsWith(`${id}:`)),
  );
  if (phantom.length > 0) {
    console.error(
      `\n${phantom.length} cited SSB table(s) do not exist. Fix the citations in src/data/ and re-run.`,
    );
    for (const id of phantom) {
      const where = citations
        .filter((c) => c.tableId === id)
        .map((c) => `    ${c.file}:${c.line}  ${c.excerpt}`)
        .join("\n");
      console.error(`  - ${id}\n${where}`);
    }
    process.exit(1);
  }

  if (networkWarnings.length > 0) {
    console.warn(
      `\n${networkWarnings.length} network warning(s); these entries remain stale in the cache. Retry when network is stable.`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
