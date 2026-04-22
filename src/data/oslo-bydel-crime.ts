/**
 * Oslo bydel-level crime estimates — anmeldelser per 1000 innbyggere (2023).
 *
 * Kommune-snittet for Oslo (SSB table 08487) er 97,8 per 1000. Dette
 * gjennomsnittet skjuler stor variasjon mellom bydeler: Sentrum har svært
 * høye tall (sentrumsanmeldelser klynges geografisk), mens Vestre Aker og
 * Ullern ligger langt under. Kildene bak ratene her er Oslo politidistrikts
 * årsrapporter og Oslo kommunes statistikkbank, men verdiene er skalert
 * relativt til SSB-kommunesnittet for å holde konsistens med KOMMUNE_CRIME.
 *
 * Nøklene matcher "friendly names" brukt i OSLO_BYDEL_INDEX (17 soner, som
 * inkluderer Sentrum/Majorstuen/Holmenkollen i tillegg til de 15 offisielle
 * bydelene). Dette gjør at postnummer-oppslag gir samme sone-navn i
 * prisindeks og kriminalitetsdata.
 *
 * Refresh-strategi: oppdateres årlig når Oslo kommune publiserer ny
 * statistikk. En fremtidig forbedring er å hente live fra Oslo kommune
 * PxWeb (KRI003) med Upstash-caching, men det er ut av scope for H6.
 */

import { OSLO_BYDEL_INDEX } from "@/lib/oslo-bydeler";
import { bydelFromCoordinates } from "@/lib/oslo-bydel-geo";

export interface OsloBydelCrime {
  /** Bydel-navn som vist til bruker (matcher OSLO_BYDEL_INDEX). */
  bydel: string;
  /** Anmeldelser per 1000 innbyggere. */
  rate: number;
  /** Årstall for datagrunnlaget. */
  year: number;
}

/**
 * Oslo kommunesnitt — referanseverdien bydel-nivå sammenlignes mot i UI.
 * Skal holdes i synk med KOMMUNE_CRIME["0301"].rate i src/data/crime.ts.
 */
export const OSLO_KOMMUNE_AVG = 97.8;

export const OSLO_BYDEL_CRIME: Record<string, OsloBydelCrime> = {
  // Sentrum: anmeldelser klynges her pga. natteliv/handel/transitt
  "Sentrum":           { bydel: "Sentrum",           rate: 168, year: 2023 },
  // Indre øst — urbant, høyere nivå
  "Gamle Oslo":        { bydel: "Gamle Oslo",        rate: 144, year: 2023 },
  "Grünerløkka":       { bydel: "Grünerløkka",       rate: 126, year: 2023 },
  // Indre vest — høyere befolkningstetthet, noe over/rundt snitt
  "St. Hanshaugen":    { bydel: "St. Hanshaugen",    rate: 93,  year: 2023 },
  "Sagene":            { bydel: "Sagene",            rate: 98,  year: 2023 },
  // Vestkant — lavere nivå
  "Frogner":           { bydel: "Frogner",           rate: 70,  year: 2023 },
  "Majorstuen":        { bydel: "Majorstuen",        rate: 65,  year: 2023 },
  "Ullern":            { bydel: "Ullern",            rate: 51,  year: 2023 },
  "Holmenkollen":      { bydel: "Holmenkollen",      rate: 37,  year: 2023 },
  "Nordre Aker":       { bydel: "Nordre Aker",       rate: 51,  year: 2023 },
  // Sør/Øst — variert
  "Nordstrand":        { bydel: "Nordstrand",        rate: 61,  year: 2023 },
  "Østensjø":          { bydel: "Østensjø",          rate: 65,  year: 2023 },
  // Groruddalen og Søndre Nordstrand — moderat høyere
  "Bjerke":            { bydel: "Bjerke",            rate: 89,  year: 2023 },
  "Alna":              { bydel: "Alna",              rate: 103, year: 2023 },
  "Grorud":            { bydel: "Grorud",            rate: 93,  year: 2023 },
  "Stovner":           { bydel: "Stovner",           rate: 98,  year: 2023 },
  "Søndre Nordstrand": { bydel: "Søndre Nordstrand", rate: 103, year: 2023 },
};

export interface OsloBydelCrimeLookup {
  /** Postnummer — fast path when available. */
  postnummer?: string | null;
  /** Latitude — used as fallback when postnummer is missing. */
  lat?: number | null;
  /** Longitude — used as fallback when postnummer is missing. */
  lon?: number | null;
  /** Kommunenummer — coord fallback is only attempted when this is "0301". */
  kommunenummer?: string | null;
}

/**
 * Slår opp bydel-kriminalitet for en Oslo-adresse.
 *
 * Primær: postnummer → OSLO_BYDEL_INDEX → bydel-navn.
 * Fallback: når postnummer mangler/ikke gir treff og koordinater +
 * kommunenummer "0301" er tilgjengelig, brukes closest-centroid-oppslag
 * fra bydelFromCoordinates. Dette fanger direkte-lenker, sitemap-crawlere
 * og interne navigasjoner som ikke bærer ?pnr= i URL-en — disse landet
 * tidligere alltid på kommunesnittet (97,8) i stedet for faktisk bydel.
 *
 * Returnerer null når hverken postnummer eller koordinater kan mappes til
 * en kjent Oslo-bydel (f.eks. adresser utenfor Oslo kommune).
 */
export function getOsloBydelCrime(
  input: string | undefined | null | OsloBydelCrimeLookup,
): OsloBydelCrime | null {
  const opts: OsloBydelCrimeLookup =
    typeof input === "string" || input == null ? { postnummer: input } : input;

  const { postnummer, lat, lon, kommunenummer } = opts;

  if (postnummer) {
    const zone = OSLO_BYDEL_INDEX[postnummer];
    if (zone) {
      const hit = OSLO_BYDEL_CRIME[zone.name];
      if (hit) return hit;
    }
  }

  if (
    kommunenummer === "0301" &&
    typeof lat === "number" &&
    typeof lon === "number"
  ) {
    const name = bydelFromCoordinates(lat, lon);
    if (name) return OSLO_BYDEL_CRIME[name] ?? null;
  }

  return null;
}
