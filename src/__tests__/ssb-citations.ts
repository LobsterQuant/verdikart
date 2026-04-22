import { readdirSync, statSync, readFileSync } from "fs";
import { join, resolve } from "path";

export const DATA_DIR = resolve(__dirname, "..", "data");

export const LEGACY_CITATION_DIRECTIVE = "// legacy-citation:";

// Matches common SSB citation shapes:
//   SSB tabell 07459 | SSB table 07459
//   tabell 07459     | table 07459     | tables/07459
//   SSB 06944
// Captures a 4–6 digit table ID. Case-insensitive.
const CITATION_PATTERN =
  /\b(?:(?:SSB\s+)?(?:tabell|tables?)[\s\/]+|SSB[\s#]+)(\d{4,6})\b/gi;

export interface Citation {
  file: string;
  line: number;
  tableId: string;
  excerpt: string;
}

export function listDataFiles(dir: string = DATA_DIR): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...listDataFiles(full));
      continue;
    }
    if (!/\.ts$/.test(entry)) continue;
    if (/\.test\.ts$/.test(entry)) continue;
    if (/\.new\.ts$/.test(entry)) continue;
    if (entry === "index.ts") continue;
    out.push(full);
  }
  return out;
}

export function scanCitations(file: string, content: string): Citation[] {
  const citations: Citation[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(LEGACY_CITATION_DIRECTIVE)) continue;
    CITATION_PATTERN.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = CITATION_PATTERN.exec(line)) !== null) {
      citations.push({
        file,
        line: i + 1,
        tableId: m[1],
        excerpt: line.trim().slice(0, 140),
      });
    }
  }
  return citations;
}

export function scanAllCitations(files: string[] = listDataFiles()): Citation[] {
  const out: Citation[] = [];
  for (const file of files) {
    out.push(...scanCitations(file, readFileSync(file, "utf8")));
  }
  return out;
}
