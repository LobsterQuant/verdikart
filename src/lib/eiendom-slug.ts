// Real eiendom slugs end with `--<lat>-<lon>-<knr>` (lat/lon = integer × 1e4,
// knr = 4-digit kommunenummer). Used by middleware to reject malformed slugs
// at the edge with a real 404 — see audit C-NEW-2 (2026-04-20).
export const EIENDOM_SLUG_RE = /--(-?\d+)-(-?\d+)-(\d{4})$/;

export function isValidEiendomSlug(slug: string): boolean {
  return EIENDOM_SLUG_RE.test(slug);
}

export interface ParsedEiendomSlug {
  lat: number;
  lon: number;
  kommunenummer: string;
}

// Return trusted coordinates + kommunenummer decoded from the slug suffix, or
// null if the slug does not match the canonical format. Use this anywhere the
// client supplies a slug and server-side code needs to resolve the underlying
// property — never trust body/query parameters for those fields.
export function parseEiendomSlug(slug: string): ParsedEiendomSlug | null {
  const match = slug.match(EIENDOM_SLUG_RE);
  if (!match) return null;
  return {
    lat: parseInt(match[1], 10) / 1e4,
    lon: parseInt(match[2], 10) / 1e4,
    kommunenummer: match[3],
  };
}
