// SSB Befolkningsstatistikk 2024 — selected demographic indicators per kommune
// Sources: SSB tabell 07459 (aldersfordeling), SSB tabell 09817 (medianinntekt), SSB tabell 05212 (utdanning)

export interface DemographicData {
  kommunenummer: string;
  name: string;
  /** Median gross household income per year in NOK (SSB 2023) */
  medianIncome: number;
  /** % of population 25–66 with higher education (SSB 2023) */
  higherEducationPct: number;
  /** % of population aged 0–17 */
  childrenPct: number;
  /** % of population aged 67+ */
  elderlyPct: number;
  /** Population growth % last 5 years */
  populationGrowthPct: number;
  /** Data year */
  year: number;
}

export const demographicsData: Record<string, DemographicData> = {
  "0301": {
    kommunenummer: "0301", name: "Oslo",
    medianIncome: 672000, higherEducationPct: 52.4, childrenPct: 18.2, elderlyPct: 12.1,
    populationGrowthPct: 3.8, year: 2023,
  },
  "4601": {
    kommunenummer: "4601", name: "Bergen",
    medianIncome: 618000, higherEducationPct: 48.2, childrenPct: 19.4, elderlyPct: 13.8,
    populationGrowthPct: 2.9, year: 2023,
  },
  "5001": {
    kommunenummer: "5001", name: "Trondheim",
    medianIncome: 604000, higherEducationPct: 51.1, childrenPct: 18.8, elderlyPct: 12.4,
    populationGrowthPct: 3.4, year: 2023,
  },
  "1103": {
    kommunenummer: "1103", name: "Stavanger",
    medianIncome: 714000, higherEducationPct: 49.3, childrenPct: 21.6, elderlyPct: 12.9,
    populationGrowthPct: 2.1, year: 2023,
  },
  "5501": {
    kommunenummer: "5501", name: "Tromsø",
    medianIncome: 582000, higherEducationPct: 46.7, childrenPct: 20.2, elderlyPct: 11.8,
    populationGrowthPct: 4.2, year: 2023,
  },
  "4204": {
    kommunenummer: "4204", name: "Kristiansand",
    medianIncome: 596000, higherEducationPct: 44.8, childrenPct: 22.1, elderlyPct: 13.4,
    populationGrowthPct: 2.7, year: 2023,
  },
  "3107": {
    kommunenummer: "3107", name: "Fredrikstad",
    medianIncome: 541000, higherEducationPct: 36.2, childrenPct: 21.8, elderlyPct: 15.6,
    populationGrowthPct: 1.8, year: 2023,
  },
  "3301": {
    kommunenummer: "3301", name: "Drammen",
    medianIncome: 572000, higherEducationPct: 39.4, childrenPct: 23.2, elderlyPct: 13.1,
    populationGrowthPct: 2.3, year: 2023,
  },
  "1108": {
    kommunenummer: "1108", name: "Sandnes",
    medianIncome: 682000, higherEducationPct: 43.1, childrenPct: 24.8, elderlyPct: 11.2,
    populationGrowthPct: 2.4, year: 2023,
  },
  "1507": {
    kommunenummer: "1507", name: "Ålesund",
    medianIncome: 578000, higherEducationPct: 38.6, childrenPct: 20.9, elderlyPct: 14.7,
    populationGrowthPct: 1.4, year: 2023,
  },
  "3201": {
    kommunenummer: "3201", name: "Bærum",
    medianIncome: 842000, higherEducationPct: 62.8, childrenPct: 22.4, elderlyPct: 14.2,
    populationGrowthPct: 1.9, year: 2023,
  },
  "3203": {
    kommunenummer: "3203", name: "Asker",
    medianIncome: 796000, higherEducationPct: 58.4, childrenPct: 23.1, elderlyPct: 13.8,
    populationGrowthPct: 2.1, year: 2023,
  },
  "1804": {
    kommunenummer: "1804", name: "Bodø",
    medianIncome: 572000, higherEducationPct: 42.3, childrenPct: 21.4, elderlyPct: 12.6,
    populationGrowthPct: 2.8, year: 2023,
  },
  "3403": {
    kommunenummer: "3403", name: "Hamar",
    medianIncome: 548000, higherEducationPct: 37.9, childrenPct: 20.6, elderlyPct: 16.2,
    populationGrowthPct: 1.2, year: 2023,
  },
  "3907": {
    kommunenummer: "3907", name: "Sandefjord",
    medianIncome: 612000, higherEducationPct: 41.2, childrenPct: 21.3, elderlyPct: 15.1,
    populationGrowthPct: 1.6, year: 2023,
  },
  "3105": {
    kommunenummer: "3105", name: "Sarpsborg",
    medianIncome: 524000, higherEducationPct: 31.4, childrenPct: 22.6, elderlyPct: 15.8,
    populationGrowthPct: 1.4, year: 2023,
  },
  "4003": {
    kommunenummer: "4003", name: "Skien",
    medianIncome: 536000, higherEducationPct: 33.8, childrenPct: 21.4, elderlyPct: 16.4,
    populationGrowthPct: 0.8, year: 2023,
  },
  "4203": {
    kommunenummer: "4203", name: "Arendal",
    medianIncome: 548000, higherEducationPct: 35.6, childrenPct: 21.1, elderlyPct: 16.8,
    populationGrowthPct: 0.9, year: 2023,
  },
};

export function getDemographics(kommunenummer: string): DemographicData | undefined {
  return demographicsData[kommunenummer];
}
