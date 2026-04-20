// Enova residential categories. Everything else (Kontorbygg, Forretningsbygg,
// Hotell, Skole, Sykehus, Industri, etc.) is a næringsbygg where per-m² energy
// intensity and home-oriented calculators (månedskostnad, felleskostnader)
// don't make sense.
const RESIDENTIAL_KEYWORDS = ["småhus", "bolig"];

export function isResidentialCategory(kategori: string | null | undefined): boolean {
  if (!kategori) return true; // unknown → default to residential path
  const k = kategori.toLowerCase();
  return RESIDENTIAL_KEYWORDS.some((kw) => k.includes(kw));
}
