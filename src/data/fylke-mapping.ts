/**
 * Modern (post-2024) kommunenummer → Norsk Klimaservicesenter profile slug.
 *
 * KSS still publishes profiles on the PRE-2020 fylke structure (11 fylker,
 * e.g. "Hedmark", "Sogn og Fjordane"). Miljødirektoratet announced in Oct 2025
 * that profiles will be republished on the 2025 knowledge base + new fylker
 * — no timeline. When that happens, this mapping can be simplified or removed.
 *
 * Fylke prefix = first two digits of kommunenummer. Splits where a new fylke
 * maps to more than one old profile:
 *   34 Innlandet      → hedmark (3401-3430) | oppland (3431-3456)
 *   46 Vestland       → sogn-og-fjordane (4602) | hordaland (4601,4603-4634) | sogn-og-fjordane (4635-4651)
 *     (4602 = Kinn, formed from Flora + Vågsøy, both former Sogn og Fjordane.)
 */
export type KlimaprofilKey =
  | "ostfold"
  | "oslo-og-akershus"
  | "hedmark"
  | "oppland"
  | "buskerud"
  | "vestfold"
  | "telemark"
  | "agder"
  | "rogaland"
  | "hordaland"
  | "sogn-og-fjordane"
  | "more-og-romsdal"
  | "trondelag"
  | "nordland"
  | "troms"
  | "finnmark";

export function resolveKlimaprofilKey(kommunenummer: string | null | undefined): KlimaprofilKey | null {
  if (!kommunenummer || !/^\d{4}$/.test(kommunenummer)) return null;
  const prefix = kommunenummer.slice(0, 2);
  const num = parseInt(kommunenummer, 10);

  switch (prefix) {
    case "03": return "oslo-og-akershus";      // Oslo
    case "11": return "rogaland";
    case "15": return "more-og-romsdal";
    case "18": return "nordland";
    case "31": return "ostfold";
    case "32": return "oslo-og-akershus";      // Akershus
    case "33": return "buskerud";
    case "34":                                   // Innlandet split
      return num <= 3430 ? "hedmark" : "oppland";
    case "39": return "vestfold";
    case "40": return "telemark";
    case "42": return "agder";
    case "46":                                   // Vestland split
      if (num === 4602) return "sogn-og-fjordane"; // Kinn (ex-Flora/Vågsøy)
      return num <= 4634 ? "hordaland" : "sogn-og-fjordane";
    case "50": return "trondelag";
    case "55": return "troms";
    case "56": return "finnmark";
    default: return null;
  }
}
