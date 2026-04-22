export interface EnergimerkeData {
  kommunenummer: string;
  name: string;
  /** Most common energy label in this kommune */
  dominantLabel: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  /** % of buildings with label A-C (good) */
  goodPct: number;
  /** % of buildings with label D-E (moderate) */
  moderatePct: number;
  /** % of buildings with label F-G (poor) */
  poorPct: number;
  /** Average building year in kommune */
  avgBuildYear: number;
  note?: string;
}

// Estimates based on SSB bygningsstatistikk and Enova energimerkeregister (2023/2024).
// Distribution reflects kommune building age profile, renovation rates, and new-build share.
export const energimerkeData: Record<string, EnergimerkeData> = {
  "0301": {
    kommunenummer: "0301",
    name: "Oslo",
    dominantLabel: "E",
    goodPct: 22,
    moderatePct: 38,
    poorPct: 40,
    avgBuildYear: 1952,
    note: "Stor variasjon mellom bydeler. Nye felt på Løren/Hovinbyen trekker opp, eldre murgårder på Grünerløkka/Frogner trekker ned.",
  },
  "1103": {
    kommunenummer: "1103",
    name: "Stavanger",
    dominantLabel: "D",
    goodPct: 26,
    moderatePct: 41,
    poorPct: 33,
    avgBuildYear: 1968,
    note: "Betydelig nybygging etter oljeboomen fra 1970-tallet.",
  },
  "1108": {
    kommunenummer: "1108",
    name: "Sandnes",
    dominantLabel: "C",
    goodPct: 34,
    moderatePct: 40,
    poorPct: 26,
    avgBuildYear: 1985,
    note: "Ung boligmasse med mye nybygging de siste 20 årene.",
  },
  "1507": {
    kommunenummer: "1507",
    name: "Ålesund",
    dominantLabel: "E",
    goodPct: 18,
    moderatePct: 36,
    poorPct: 46,
    avgBuildYear: 1958,
    note: "Eldre trehusbebyggelse dominerer sentrum.",
  },
  "1804": {
    kommunenummer: "1804",
    name: "Bodø",
    dominantLabel: "D",
    goodPct: 30,
    moderatePct: 39,
    poorPct: 31,
    avgBuildYear: 1975,
    note: "Mye gjenoppbygging etter krigen og nyere utbygging på Mørkved.",
  },
  "3105": {
    kommunenummer: "3105",
    name: "Sarpsborg",
    dominantLabel: "E",
    goodPct: 16,
    moderatePct: 35,
    poorPct: 49,
    avgBuildYear: 1955,
    note: "Eldre industribybebyggelse med lavt renoveringstempo.",
  },
  "3107": {
    kommunenummer: "3107",
    name: "Fredrikstad",
    dominantLabel: "F",
    goodPct: 14,
    moderatePct: 33,
    poorPct: 53,
    avgBuildYear: 1948,
    note: "Gammel Fredrikstad-bebyggelse med høy andel uisolerte trehus.",
  },
  "3301": {
    kommunenummer: "3301",
    name: "Drammen",
    dominantLabel: "E",
    goodPct: 20,
    moderatePct: 39,
    poorPct: 41,
    avgBuildYear: 1960,
  },
  "3201": {
    kommunenummer: "3201",
    name: "Bærum",
    dominantLabel: "D",
    goodPct: 29,
    moderatePct: 42,
    poorPct: 29,
    avgBuildYear: 1970,
    note: "Høy andel eneboliger med gjennomført energioppgradering. Fornebu-utbyggingen bidrar med nye A/B-boliger.",
  },
  "3203": {
    kommunenummer: "3203",
    name: "Asker",
    dominantLabel: "D",
    goodPct: 28,
    moderatePct: 43,
    poorPct: 29,
    avgBuildYear: 1972,
    note: "Velholdt boligmasse med god renoveringsrate.",
  },
  "3403": {
    kommunenummer: "3403",
    name: "Hamar",
    dominantLabel: "E",
    goodPct: 17,
    moderatePct: 37,
    poorPct: 46,
    avgBuildYear: 1956,
  },
  "3907": {
    kommunenummer: "3907",
    name: "Sandefjord",
    dominantLabel: "E",
    goodPct: 19,
    moderatePct: 38,
    poorPct: 43,
    avgBuildYear: 1962,
  },
  "4003": {
    kommunenummer: "4003",
    name: "Skien",
    dominantLabel: "F",
    goodPct: 15,
    moderatePct: 34,
    poorPct: 51,
    avgBuildYear: 1950,
    note: "Eldre industriby med mange boliger fra mellomkrigstiden.",
  },
  "4203": {
    kommunenummer: "4203",
    name: "Arendal",
    dominantLabel: "E",
    goodPct: 18,
    moderatePct: 37,
    poorPct: 45,
    avgBuildYear: 1957,
  },
  "4204": {
    kommunenummer: "4204",
    name: "Kristiansand",
    dominantLabel: "D",
    goodPct: 24,
    moderatePct: 40,
    poorPct: 36,
    avgBuildYear: 1966,
  },
  "4601": {
    kommunenummer: "4601",
    name: "Bergen",
    dominantLabel: "F",
    goodPct: 16,
    moderatePct: 34,
    poorPct: 50,
    avgBuildYear: 1946,
    note: "Gammel trehusbebyggelse i sentrum og Sandviken. Nybygg på Fantoft/Laksevåg bedrer snittet noe.",
  },
  "5001": {
    kommunenummer: "5001",
    name: "Trondheim",
    dominantLabel: "D",
    goodPct: 25,
    moderatePct: 40,
    poorPct: 35,
    avgBuildYear: 1965,
    note: "Blanding av gamle trehusbydeler og nyere studentby- og NTNU-næringsutbygging.",
  },
  "5501": {
    kommunenummer: "5501",
    name: "Tromsø",
    dominantLabel: "E",
    goodPct: 21,
    moderatePct: 38,
    poorPct: 41,
    avgBuildYear: 1963,
    note: "Strenge klimakrav gir god isolering i nybygg, men eldre bebyggelse har svak energistandard.",
  },
};

export function getEnergimerke(kommunenummer: string): EnergimerkeData | undefined {
  return energimerkeData[kommunenummer];
}
