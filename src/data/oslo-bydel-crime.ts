/**
 * Oslo bydel-level crime estimates — anmeldelser per 1000 innbyggere (2023).
 *
 * Kommune-snittet for Oslo (SSB table 08484) er 93,2 per 1000. Dette
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
export const OSLO_KOMMUNE_AVG = 93.2;

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

/**
 * Slår opp bydel-kriminalitet for et Oslo-postnummer.
 * Returnerer null hvis postnummeret ikke er dekket av OSLO_BYDEL_INDEX
 * (f.eks. ukjent postnummer eller postnummer utenfor Oslo).
 */
export function getOsloBydelCrime(postnummer: string | undefined | null): OsloBydelCrime | null {
  if (!postnummer) return null;
  const zone = OSLO_BYDEL_INDEX[postnummer];
  if (!zone) return null;
  return OSLO_BYDEL_CRIME[zone.name] ?? null;
}
