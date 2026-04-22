export interface EiendomsskattData {
  kommunenummer: string;
  name: string;
  hasTax: boolean;
  promille?: number;
  /** Bunnfradrag in NOK subtracted from skattegrunnlag before tax applies. */
  bunnfradrag?: number;
  /** Obligatorisk reduksjonsfaktor — market value × this = skattegrunnlag (before bunnfradrag). */
  reductionFactor?: number;
  note?: string;
}

export const eiendomsskattData: Record<string, EiendomsskattData> = {
  "0301": {
    kommunenummer: "0301",
    name: "Oslo",
    hasTax: true,
    promille: 1.7,
    bunnfradrag: 4_900_000,
    reductionFactor: 0.7,
    note: "Primærbolig: skattegrunnlag er 70 % av markedsverdi, minus bunnfradrag på 4,9 MNOK. Boliger under ca. 7 MNOK i markedsverdi betaler ingen eiendomsskatt.",
  },
  "4601": { kommunenummer: "4601", name: "Bergen", hasTax: true, promille: 2.8, note: "Bergen innførte eiendomsskatt fra 2024. Gjelder primær- og sekundærbolig." },
  "5001": { kommunenummer: "5001", name: "Trondheim", hasTax: true, promille: 2.0, note: "Trondheim har eiendomsskatt på 2,0 promille av beregningsgrunnlaget." },
  "1103": { kommunenummer: "1103", name: "Stavanger", hasTax: true, promille: 2.0, note: "Stavanger kommune har eiendomsskatt på boliger." },
  "5501": { kommunenummer: "5501", name: "Tromsø", hasTax: true, promille: 3.0, note: "Tromsø har eiendomsskatt på 3,0 promille." },
  "4204": { kommunenummer: "4204", name: "Kristiansand", hasTax: true, promille: 2.0 },
  "3107": { kommunenummer: "3107", name: "Fredrikstad", hasTax: true, promille: 2.5 },
  "3301": { kommunenummer: "3301", name: "Drammen", hasTax: false, note: "Drammen fjernet eiendomsskatt på bolig i 2024." },
  "1108": { kommunenummer: "1108", name: "Sandnes", hasTax: false },
  "1507": { kommunenummer: "1507", name: "Ålesund", hasTax: true, promille: 3.5 },
  "3201": { kommunenummer: "3201", name: "Bærum", hasTax: false },
  "3203": { kommunenummer: "3203", name: "Asker", hasTax: false },
  "1804": { kommunenummer: "1804", name: "Bodø", hasTax: true, promille: 2.0 },
  "3403": { kommunenummer: "3403", name: "Hamar", hasTax: true, promille: 3.3 },
  "3907": { kommunenummer: "3907", name: "Sandefjord", hasTax: false },
  "3105": { kommunenummer: "3105", name: "Sarpsborg", hasTax: true, promille: 2.5 },
  "4003": { kommunenummer: "4003", name: "Skien", hasTax: true, promille: 3.5, note: "Skien kommune har eiendomsskatt på bolig." },
  "4203": { kommunenummer: "4203", name: "Arendal", hasTax: true, promille: 2.0 },
};
