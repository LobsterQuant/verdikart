import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { resolve, join } from "path";

/**
 * Guards against regressions to pre-2024-reform kommunenumre and known phantom
 * codes. Narrowly scoped by design — we only flag codes that appear in
 * kommune-shaped contexts (data-object keys and `kommunenummer` field values).
 * Year literals, prices, and other 4-digit numbers won't match.
 *
 * See docs/kommune-data-audit-2026-04-22.md for the source of these lists.
 */

const FORBIDDEN_PRE_REFORM: Record<string, string> = {
  "3003": "3105", // Sarpsborg
  "3004": "3107", // Fredrikstad
  "3005": "3301", // Drammen
  "3024": "3201", // Bærum
  "3025": "3203", // Asker
  "3801": "3901", // Horten
  "3802": "3903", // Holmestrand
  "3803": "3907", // Sandefjord
  "3804": "3909", // Larvik
  "3805": "4001", // Porsgrunn
  "3807": "4003", // Skien
  "5401": "5501", // Tromsø
  "5403": "5601", // Alta
  "5406": "5603", // Hammerfest
};

// Codes that were never valid kommunenumre at any point. The audit also
// called 5514 and 3226 and 5532 "phantoms", but those were phantom *labels*
// (5514 was mislabeled Harstad in the old pop file, but 5514 is actually
// Ibestad per SSB; 5532 is Balsfjord; 3226 is Aurskog-Høland). Those
// mislabel bugs can't recur now that kommune-population.ts is SSB-sourced,
// so they don't need a static-code guard. 3020 truly has never existed.
const FORBIDDEN_PHANTOMS = new Set(["3020"]);

const SRC_DIR = resolve(__dirname, "..");

// Scan kommune-shaped contexts only: object keys and `kommunenummer` field
// values. Anything else (year literals, avgSqmPrice, phone area codes, etc.)
// is intentionally ignored — the audit prefers occasional misses to noisy CI.
const KEY_PATTERN = /^\s*"(\d{4})"\s*:/;
const FIELD_PATTERN = /\bkommunenummer\s*[:=]\s*"(\d{4})"/g;

// Inline-skip directive for files or lines that legitimately need a defunct
// code (e.g. a test fixture asserting the validator's own behavior).
const SKIP_DIRECTIVE = "// legacy-kommune-code:";

interface Violation {
  file: string;
  line: number;
  code: string;
  kind: "pre-reform" | "phantom";
}

function listTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "__tests__" || entry === "node_modules") continue;
      out.push(...listTsFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function scan(content: string, file: string): Violation[] {
  const violations: Violation[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(SKIP_DIRECTIVE)) continue;

    const keyMatch = line.match(KEY_PATTERN);
    if (keyMatch) {
      const code = keyMatch[1];
      if (code in FORBIDDEN_PRE_REFORM) {
        violations.push({ file, line: i + 1, code, kind: "pre-reform" });
      } else if (FORBIDDEN_PHANTOMS.has(code)) {
        violations.push({ file, line: i + 1, code, kind: "phantom" });
      }
    }

    FIELD_PATTERN.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = FIELD_PATTERN.exec(line)) !== null) {
      const code = m[1];
      if (code in FORBIDDEN_PRE_REFORM) {
        violations.push({ file, line: i + 1, code, kind: "pre-reform" });
      } else if (FORBIDDEN_PHANTOMS.has(code)) {
        violations.push({ file, line: i + 1, code, kind: "phantom" });
      }
    }
  }
  return violations;
}

describe("kommune codes — no pre-reform or phantom entries in src/", () => {
  const files = listTsFiles(SRC_DIR);
  const allViolations: Violation[] = [];
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    allViolations.push(...scan(content, file));
  }

  it("finds no pre-reform kommunenumre", () => {
    const hits = allViolations.filter((v) => v.kind === "pre-reform");
    const report = hits
      .map(
        (v) =>
          `  ${v.file.replace(SRC_DIR + "/", "")}:${v.line} uses ${v.code} — migrate to ${FORBIDDEN_PRE_REFORM[v.code]}`,
      )
      .join("\n");
    expect(hits, report ? `\n${report}` : undefined).toEqual([]);
  });

  it("finds no phantom kommunenumre", () => {
    const hits = allViolations.filter((v) => v.kind === "phantom");
    const report = hits
      .map(
        (v) =>
          `  ${v.file.replace(SRC_DIR + "/", "")}:${v.line} uses ${v.code} — phantom code, remove the entry`,
      )
      .join("\n");
    expect(hits, report ? `\n${report}` : undefined).toEqual([]);
  });

  it("actually scans more than just the data dir", () => {
    expect(files.length).toBeGreaterThan(50);
  });
});
