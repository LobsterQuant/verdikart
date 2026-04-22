/**
 * Candidate kommuner and comparison addresses for the /pendlings-poeng landing
 * page. Input to `scripts/refresh-pendlings-poeng-landing.ts`, which scores
 * each via Entur and writes the ranked top 10 + comparison results to
 * `pendlings-poeng-landing-data.ts`.
 *
 * Kommunesentrum coordinates are hand-picked: the main rådhus or rutebilstasjon
 * (transit-weighted), not the geometric centroid — which for sprawling kommuner
 * like Bærum or Asker would penalize the score unfairly.
 *
 * Curated to ~28 kommuner across the six work-center catchments. The "top 10"
 * will emerge from the ranking; adding more candidates only adds Entur load.
 */
import type { WorkCenterId } from "@/lib/scoring/work-centers";

export interface KommuneCandidate {
  kommunenummer: string;
  kommunenavn: string;
  slug: string;
  lat: number;
  lon: number;
  centerNote: string;
  expectedCenter: WorkCenterId;
}

export const KOMMUNE_CANDIDATES: ReadonlyArray<KommuneCandidate> = [
  // Oslo catchment.
  //
  // Known limitation — the six work-center kommuner use landmark addresses
  // ~300-800 m from the exact work-center lat/lon (Karl Johans gate, Bryggen,
  // Trondheim torg, Pedersgata, Christian IV's gate, Tromsø domkirke). Reason:
  // when the origin coord equals the work-center coord, Entur's fastest trip
  // pattern is all-walking, which the scoring engine treats as "no transit
  // found" and scores 0. Offsetting by a block or two produces a realistic
  // walk+transit pattern (score 96-100). Future work: the scoring engine
  // should short-circuit near-zero-distance origins to 100 explicitly, at
  // which point these offsets can be replaced with the canonical sentrum
  // coordinate.
  { kommunenummer: "0301", kommunenavn: "Oslo",         slug: "oslo",         lat: 59.9127, lon: 10.7461, centerNote: "Karl Johans gate",           expectedCenter: "oslo" },
  { kommunenummer: "3201", kommunenavn: "Bærum",        slug: "baerum",       lat: 59.8918, lon: 10.5234, centerNote: "Sandvika stasjon",           expectedCenter: "oslo" },
  { kommunenummer: "3203", kommunenavn: "Asker",        slug: "asker",        lat: 59.8337, lon: 10.4345, centerNote: "Asker sentrum",              expectedCenter: "oslo" },
  { kommunenummer: "3205", kommunenavn: "Lillestrøm",   slug: "lillestrom",   lat: 59.9554, lon: 11.0494, centerNote: "Lillestrøm stasjon",         expectedCenter: "oslo" },
  { kommunenummer: "3207", kommunenavn: "Nordre Follo", slug: "nordre-follo", lat: 59.7189, lon: 10.8352, centerNote: "Ski stasjon",                expectedCenter: "oslo" },
  { kommunenummer: "3222", kommunenavn: "Lørenskog",    slug: "lorenskog",    lat: 59.9269, lon: 10.9613, centerNote: "Lørenskog sentrum",          expectedCenter: "oslo" },
  { kommunenummer: "3209", kommunenavn: "Ullensaker",   slug: "ullensaker",   lat: 60.1305, lon: 11.1745, centerNote: "Jessheim stasjon",           expectedCenter: "oslo" },
  { kommunenummer: "3301", kommunenavn: "Drammen",      slug: "drammen",      lat: 59.7440, lon: 10.2045, centerNote: "Drammen stasjon",            expectedCenter: "oslo" },
  { kommunenummer: "3232", kommunenavn: "Nittedal",     slug: "nittedal",     lat: 60.0532, lon: 10.8613, centerNote: "Rotnes sentrum",             expectedCenter: "oslo" },
  { kommunenummer: "3218", kommunenavn: "Ås",           slug: "aas",          lat: 59.6640, lon: 10.7910, centerNote: "Ås stasjon",                 expectedCenter: "oslo" },
  { kommunenummer: "3224", kommunenavn: "Rælingen",     slug: "raelingen",    lat: 59.9353, lon: 11.0864, centerNote: "Fjerdingby",                 expectedCenter: "oslo" },
  { kommunenummer: "3212", kommunenavn: "Nesodden",     slug: "nesodden",     lat: 59.8608, lon: 10.6644, centerNote: "Tangen brygge",              expectedCenter: "oslo" },
  { kommunenummer: "3216", kommunenavn: "Vestby",       slug: "vestby",       lat: 59.6042, lon: 10.7464, centerNote: "Vestby stasjon",             expectedCenter: "oslo" },

  // Oslo-adjacent / Østlandet long-commute
  { kommunenummer: "3107", kommunenavn: "Fredrikstad",  slug: "fredrikstad",  lat: 59.2113, lon: 10.9374, centerNote: "Fredrikstad stasjon",        expectedCenter: "oslo" },
  { kommunenummer: "3105", kommunenavn: "Sarpsborg",    slug: "sarpsborg",    lat: 59.2840, lon: 11.1104, centerNote: "Sarpsborg stasjon",          expectedCenter: "oslo" },
  { kommunenummer: "3103", kommunenavn: "Moss",         slug: "moss",         lat: 59.4344, lon: 10.6576, centerNote: "Moss stasjon",               expectedCenter: "oslo" },
  { kommunenummer: "3905", kommunenavn: "Tønsberg",     slug: "tonsberg",     lat: 59.2675, lon: 10.4080, centerNote: "Tønsberg stasjon",           expectedCenter: "oslo" },
  { kommunenummer: "3303", kommunenavn: "Kongsberg",    slug: "kongsberg",    lat: 59.6633, lon: 9.6476,  centerNote: "Kongsberg stasjon",          expectedCenter: "oslo" },

  // Bergen catchment — kommune sentrum coord must differ from Bergen work-center
  // (Torgallmenningen) or the trip-to-self query returns empty; Bryggen is a
  // ~500m offset that still reads as "Bergen sentrum" to users.
  { kommunenummer: "4601", kommunenavn: "Bergen",       slug: "bergen",       lat: 60.3972, lon: 5.3224,  centerNote: "Bryggen",                     expectedCenter: "bergen" },
  { kommunenummer: "4627", kommunenavn: "Askøy",        slug: "askoy",        lat: 60.4056, lon: 5.2286,  centerNote: "Kleppestø terminal",          expectedCenter: "bergen" },
  { kommunenummer: "4631", kommunenavn: "Alver",        slug: "alver",        lat: 60.5370, lon: 5.2340,  centerNote: "Knarvik sentrum",             expectedCenter: "bergen" },
  { kommunenummer: "4624", kommunenavn: "Bjørnafjorden", slug: "bjornafjorden", lat: 60.1830, lon: 5.4690, centerNote: "Osøyro sentrum",             expectedCenter: "bergen" },

  // Trondheim catchment — Torvet is ~700m south of sentralstasjon.
  { kommunenummer: "5001", kommunenavn: "Trondheim",    slug: "trondheim",    lat: 63.4305, lon: 10.3951, centerNote: "Trondheim torg",              expectedCenter: "trondheim" },
  { kommunenummer: "5035", kommunenavn: "Stjørdal",     slug: "stjordal",     lat: 63.4693, lon: 10.9195, centerNote: "Stjørdal stasjon",            expectedCenter: "trondheim" },
  { kommunenummer: "5031", kommunenavn: "Malvik",       slug: "malvik",       lat: 63.4385, lon: 10.6667, centerNote: "Hommelvik sentrum",           expectedCenter: "trondheim" },

  // Stavanger/Sandnes catchment — Pedersgata ~800m NE of stasjon, far enough
  // that Entur's fastest pattern includes a bussleg.
  { kommunenummer: "1103", kommunenavn: "Stavanger",    slug: "stavanger",    lat: 58.9746, lon: 5.7420,  centerNote: "Pedersgata",                  expectedCenter: "stavanger" },
  { kommunenummer: "1108", kommunenavn: "Sandnes",      slug: "sandnes",      lat: 58.8516, lon: 5.7355,  centerNote: "Sandnes stasjon",             expectedCenter: "stavanger" },
  { kommunenummer: "1124", kommunenavn: "Sola",         slug: "sola",         lat: 58.8881, lon: 5.6042,  centerNote: "Sola sentrum",                expectedCenter: "stavanger" },

  // Sør-/Nord-Norge — use offsets of ~500-900m so the fastest Entur trip
  // pattern contains at least one transit leg (pure-walking patterns score 0).
  { kommunenummer: "4204", kommunenavn: "Kristiansand", slug: "kristiansand", lat: 58.1513, lon: 7.9976,  centerNote: "Christian IV's gate",         expectedCenter: "kristiansand" },
  { kommunenummer: "5501", kommunenavn: "Tromsø",       slug: "tromso",       lat: 69.6521, lon: 18.9653, centerNote: "Tromsø storsenter",           expectedCenter: "tromso" },
];

export interface ComparisonAddress {
  label: string;
  kommunenavn: string;
  kommunenummer: string;
  lat: number;
  lon: number;
  /** Short context line under the result. */
  context: string;
}

/** Mix of high-scoring urban and low-scoring distrikt to anchor the range. */
export const COMPARISON_ADDRESSES: ReadonlyArray<ComparisonAddress> = [
  {
    label: "Karl Johans gate 1",
    kommunenavn: "Oslo",
    kommunenummer: "0301",
    lat: 59.9127,
    lon: 10.7461,
    context: "Oslo sentrum — tett kollektivnett med T-bane, trikk og tog.",
  },
  {
    label: "Bryggen, Bergen",
    kommunenavn: "Bergen",
    kommunenummer: "4601",
    lat: 60.3972,
    lon: 5.3224,
    context: "Bergen sentrum — Bybanen og bussrutebil sentralt.",
  },
  {
    label: "Pedersgata, Stavanger",
    kommunenavn: "Stavanger",
    kommunenummer: "1103",
    lat: 58.9746,
    lon: 5.7420,
    context: "Stavanger sentrum — nær Jærbanen og Kolumbus sine hovedruter.",
  },
  {
    label: "Drammen sentrum",
    kommunenavn: "Drammen",
    kommunenummer: "3301",
    lat: 59.7440,
    lon: 10.2045,
    context: "Togforbindelse til Oslo hvert 15. minutt i rush.",
  },
  {
    label: "Geilo sentrum",
    kommunenavn: "Hol",
    kommunenummer: "3347",
    lat: 60.5342,
    lon: 8.2064,
    context: "Fjellbygd med få daglige avganger mot Oslo.",
  },
  {
    label: "Voss sentrum",
    kommunenavn: "Voss",
    kommunenummer: "4621",
    lat: 60.6297,
    lon: 6.4137,
    context: "Ett tog i timen mot Bergen, ca. 80 minutters reise.",
  },
];
