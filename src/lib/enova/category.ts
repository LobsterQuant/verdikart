// Enova bygningskategori classification for downstream UI decisions.
//
// - "residential" — Småhus, Bolig. Full home-buyer treatment (verdi,
//   månedskostnad, per-m² energy number, etc.).
// - "mixed-use"   — Forretningsbygg, Kombinasjonsbygg. Registered as næring,
//   but commonly contains residential units (street-level shops with
//   apartments above). Show home-buyer numbers with a caveat banner, but
//   suppress misleading per-m² energy since the denominator includes
//   commercial floor area.
// - "commercial" — Kontorbygg, Hoteller, Skole, Sykehus, Industri, etc.
//   No home-buyer numbers make sense; hide valuation + månedskostnad entirely.
const RESIDENTIAL_KEYWORDS = ["småhus", "bolig"];
const MIXED_USE_KEYWORDS = ["forretning", "kombinasjon"];

export type PropertyClassification = "residential" | "mixed-use" | "commercial";

export function classifyCategory(
  kategori: string | null | undefined,
): PropertyClassification {
  if (!kategori) return "residential"; // unknown → default to residential path
  const k = kategori.toLowerCase();
  if (RESIDENTIAL_KEYWORDS.some((kw) => k.includes(kw))) return "residential";
  if (MIXED_USE_KEYWORDS.some((kw) => k.includes(kw))) return "mixed-use";
  return "commercial";
}

export function isResidentialCategory(kategori: string | null | undefined): boolean {
  return classifyCategory(kategori) === "residential";
}

export function isMixedUseCategory(kategori: string | null | undefined): boolean {
  return classifyCategory(kategori) === "mixed-use";
}
