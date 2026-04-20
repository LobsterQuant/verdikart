// Real eiendom slugs end with `--<lat>-<lon>-<knr>` (lat/lon = integer × 1e4,
// knr = 4-digit kommunenummer). Used by middleware to reject malformed slugs
// at the edge with a real 404 — see audit C-NEW-2 (2026-04-20).
export const EIENDOM_SLUG_RE = /--(-?\d+)-(-?\d+)-(\d{4})$/;

export function isValidEiendomSlug(slug: string): boolean {
  return EIENDOM_SLUG_RE.test(slug);
}
