/**
 * Klimaprofiler for pre-2024 fylker — hand-transcribed from Norsk
 * Klimaservicesenter (NCCS) fylkesvise klimaprofiler.
 *
 * Source:
 *   - NCCS Report 2/2017 "Klimaprofiler for fylker" + 2021 PDF refreshes per
 *     fylke at https://www.met.no/kss/_/attachment/download/.../KP_<Fylke>.pdf
 *   - Web profiles at https://klimaservicesenter.no/kss/klimaprofiler/<slug>
 *   - Retrieved 2026-04-23.
 *
 * Licensing:
 *   Norsk Klimaservicesenter data is published under NLOD 1.0 + CC-BY 4.0.
 *   Attribute "Norsk Klimaservicesenter" in any user-facing surface.
 *
 * Refresh debt:
 *   Miljødirektoratet announced (Okt 2025) that profiles will be republished
 *   on the 2025 knowledge base + new (15) fylker structure. When that lands
 *   this file must be regenerated and src/data/fylke-mapping.ts simplified.
 *
 * Temperature + precipitation values are for RCP8.5 by 2100 (midpoint of
 * published range where a range is given). Three-level risk buckets
 * (lav/moderat/høy) summarise the profile's traffic-light risk table:
 *   "Økt sannsynlighet"          → høy
 *   "Mulig økt sannsynlighet"    → moderat
 *   "Uendret/mindre sannsynlig"  → lav
 */
import type { KlimaprofilKey } from "./fylke-mapping";

export type KlimaRisikoNivå = "lav" | "moderat" | "høy";

export interface KlimaprofilValue {
  fylkesnavn: string;
  /** Expected temperature rise in °C by 2100 under RCP8.5 (midpoint of range). */
  temperaturendring2100: number;
  /** Expected precipitation change in % by 2100 under RCP8.5 (midpoint of range). */
  nedbørendring2100: number;
  flomendring: KlimaRisikoNivå;
  tørkeendring: KlimaRisikoNivå;
  skredøkning: KlimaRisikoNivå;
  sourceUrl: string;
}

export const klimaprofilByFylke: Record<KlimaprofilKey, KlimaprofilValue> = {
  "ostfold": {
    fylkesnavn: "Østfold",
    temperaturendring2100: 4.0,
    nedbørendring2100: 10,
    flomendring: "moderat",
    tørkeendring: "moderat",
    skredøkning: "moderat",
    sourceUrl: "https://klimaservicesenter.no/kss/klimaprofiler/ostfold",
  },
  "oslo-og-akershus": {
    fylkesnavn: "Oslo og Akershus",
    temperaturendring2100: 4.0,
    nedbørendring2100: 15,
    flomendring: "moderat",
    tørkeendring: "moderat",
    skredøkning: "moderat",
    sourceUrl: "https://klimaservicesenter.no/kss/klimaprofiler/oslo-og-akershus",
  },
  "hedmark": {
    fylkesnavn: "Hedmark",
    temperaturendring2100: 4.5,
    nedbørendring2100: 15,
    flomendring: "moderat",
    tørkeendring: "moderat",
    skredøkning: "moderat",
    sourceUrl: "https://klimaservicesenter.no/kss/klimaprofiler/hedmark",
  },
  "oppland": {
    fylkesnavn: "Oppland",
    temperaturendring2100: 4.0,
    nedbørendring2100: 20,
    flomendring: "moderat",
    tørkeendring: "moderat",
    skredøkning: "moderat",
    sourceUrl: "https://klimaservicesenter.no/kss/klimaprofiler/oppland",
  },
  "buskerud": {
    fylkesnavn: "Buskerud",
    temperaturendring2100: 4.0,
    nedbørendring2100: 15,
    flomendring: "moderat",
    tørkeendring: "moderat",
    skredøkning: "moderat",
    sourceUrl: "https://klimaservicesenter.no/kss/klimaprofiler/buskerud",
  },
  "vestfold": {
    fylkesnavn: "Vestfold",
    temperaturendring2100: 4.0,
    nedbørendring2100: 10,
    flomendring: "moderat",
    tørkeendring: "moderat",
    // "Vestfold er særlig utsatt for kvikkleireskred" (KSS 2021)
    skredøkning: "høy",
    sourceUrl: "https://klimaservicesenter.no/kss/klimaprofiler/vestfold",
  },
  "telemark": {
    fylkesnavn: "Telemark",
    temperaturendring2100: 4.0,
    nedbørendring2100: 15,
    flomendring: "moderat",
    tørkeendring: "moderat",
    skredøkning: "moderat",
    sourceUrl: "https://klimaservicesenter.no/kss/klimaprofiler/telemark",
  },
  "agder": {
    fylkesnavn: "Agder",
    temperaturendring2100: 4.0,
    nedbørendring2100: 10,
    flomendring: "moderat",
    // "liten eller ingen nedbørøkning om sommeren" (KSS 2021)
    tørkeendring: "moderat",
    skredøkning: "moderat",
    sourceUrl: "https://klimaservicesenter.no/kss/klimaprofiler/agder",
  },
  "rogaland": {
    fylkesnavn: "Rogaland",
    temperaturendring2100: 3.5,
    nedbørendring2100: 10,
    flomendring: "høy",
    tørkeendring: "moderat",
    skredøkning: "høy",
    sourceUrl: "https://klimaservicesenter.no/kss/klimaprofiler/rogaland",
  },
  "hordaland": {
    fylkesnavn: "Hordaland",
    temperaturendring2100: 4.0,
    nedbørendring2100: 15,
    flomendring: "høy",
    tørkeendring: "lav",
    skredøkning: "høy",
    sourceUrl: "https://klimaservicesenter.no/kss/klimaprofiler/hordaland",
  },
  "sogn-og-fjordane": {
    fylkesnavn: "Sogn og Fjordane",
    temperaturendring2100: 4.0,
    nedbørendring2100: 15,
    flomendring: "høy",
    tørkeendring: "lav",
    skredøkning: "høy",
    sourceUrl: "https://klimaservicesenter.no/kss/klimaprofiler/sogn-og-fjordane",
  },
  "more-og-romsdal": {
    fylkesnavn: "Møre og Romsdal",
    temperaturendring2100: 4.0,
    nedbørendring2100: 15,
    flomendring: "høy",
    tørkeendring: "lav",
    skredøkning: "høy",
    sourceUrl: "https://klimaservicesenter.no/kss/klimaprofiler/more-og-romsdal",
  },
  "trondelag": {
    fylkesnavn: "Trøndelag",
    // Mean of Sør-Trøndelag (4.0) and Nord-Trøndelag (4.5) — KSS still lists
    // the pre-2018 split, so this is interpolated pending republish.
    temperaturendring2100: 4.25,
    nedbørendring2100: 20,
    flomendring: "høy",
    tørkeendring: "moderat",
    // Known kvikkleire hotspot (Rissa 1978, Gjerdrum 2020).
    skredøkning: "høy",
    sourceUrl: "https://klimaservicesenter.no/kss/klimaprofiler/trondelag",
  },
  "nordland": {
    fylkesnavn: "Nordland",
    temperaturendring2100: 5.0,
    nedbørendring2100: 20,
    flomendring: "høy",
    tørkeendring: "lav",
    skredøkning: "høy",
    sourceUrl: "https://klimaservicesenter.no/kss/klimaprofiler/nordland",
  },
  "troms": {
    fylkesnavn: "Troms",
    temperaturendring2100: 5.0,
    nedbørendring2100: 15,
    flomendring: "høy",
    tørkeendring: "lav",
    skredøkning: "høy",
    sourceUrl: "https://klimaservicesenter.no/kss/klimaprofiler/troms",
  },
  "finnmark": {
    fylkesnavn: "Finnmark",
    temperaturendring2100: 5.5,
    nedbørendring2100: 20,
    // "Reduksjon i flomstørrelsen i store elver"; 0% hovedelver, 20% små elver.
    flomendring: "moderat",
    tørkeendring: "moderat",
    skredøkning: "moderat",
    sourceUrl: "https://klimaservicesenter.no/kss/klimaprofiler/finnmark",
  },
};
