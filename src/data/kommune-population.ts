// SSB tabell 07459 — kommune population (approx 2024 figures).
// Used by economics/monthly-cost to tier municipal-fee estimates as
// storby / mellomby / distrikt. Only kommunes at or above ~20k pop are
// listed; everything else is treated as distrikt by the category function.

export interface KommunePopulationEntry {
  kommunenummer: string;
  name: string;
  population: number;
}

export const kommunePopulation: Record<string, KommunePopulationEntry> = {
  "0301": { kommunenummer: "0301", name: "Oslo", population: 717710 },
  "4601": { kommunenummer: "4601", name: "Bergen", population: 291940 },
  "5001": { kommunenummer: "5001", name: "Trondheim", population: 213312 },
  "1103": { kommunenummer: "1103", name: "Stavanger", population: 148572 },
  "3024": { kommunenummer: "3024", name: "Bærum", population: 131572 },
  "4204": { kommunenummer: "4204", name: "Kristiansand", population: 115667 },
  "3005": { kommunenummer: "3005", name: "Drammen", population: 103560 },
  "3025": { kommunenummer: "3025", name: "Asker", population: 97714 },
  "3004": { kommunenummer: "3004", name: "Fredrikstad", population: 85290 },
  "1108": { kommunenummer: "1108", name: "Sandnes", population: 83487 },
  "5401": { kommunenummer: "5401", name: "Tromsø", population: 78867 },
  "1507": { kommunenummer: "1507", name: "Ålesund", population: 67313 },
  "3803": { kommunenummer: "3803", name: "Sandefjord", population: 65079 },
  "3003": { kommunenummer: "3003", name: "Sarpsborg", population: 58939 },
  "3807": { kommunenummer: "3807", name: "Skien", population: 55808 },
  "1804": { kommunenummer: "1804", name: "Bodø", population: 54614 },
  "1101": { kommunenummer: "1101", name: "Eigersund", population: 15110 },
  "3801": { kommunenummer: "3801", name: "Horten", population: 28014 },
  "3802": { kommunenummer: "3802", name: "Holmestrand", population: 25621 },
  "3804": { kommunenummer: "3804", name: "Larvik", population: 48145 },
  "3805": { kommunenummer: "3805", name: "Porsgrunn", population: 37107 },
  "4203": { kommunenummer: "4203", name: "Arendal", population: 45525 },
  "4205": { kommunenummer: "4205", name: "Lindesnes", population: 23876 },
  "5501": { kommunenummer: "5501", name: "Alta", population: 21606 },
  "1106": { kommunenummer: "1106", name: "Haugesund", population: 38155 },
  "1119": { kommunenummer: "1119", name: "Hå", population: 19981 },
  "1120": { kommunenummer: "1120", name: "Klepp", population: 20622 },
  "1121": { kommunenummer: "1121", name: "Time", population: 19974 },
  "1124": { kommunenummer: "1124", name: "Sola", population: 28883 },
  "1127": { kommunenummer: "1127", name: "Randaberg", population: 11402 },
  "4640": { kommunenummer: "4640", name: "Sogndal", population: 12354 },
  "4626": { kommunenummer: "4626", name: "Øygarden", population: 39226 },
  "4627": { kommunenummer: "4627", name: "Askøy", population: 30256 },
  "4631": { kommunenummer: "4631", name: "Alver", population: 29922 },
  "5006": { kommunenummer: "5006", name: "Steinkjer", population: 23795 },
  "5007": { kommunenummer: "5007", name: "Namsos", population: 15217 },
  "3403": { kommunenummer: "3403", name: "Hamar", population: 32329 },
  "3405": { kommunenummer: "3405", name: "Lillehammer", population: 28763 },
  "3407": { kommunenummer: "3407", name: "Gjøvik", population: 30519 },
  "3411": { kommunenummer: "3411", name: "Ringsaker", population: 35234 },
  "3301": { kommunenummer: "3301", name: "Drammen (gml)", population: 103560 },
  "3303": { kommunenummer: "3303", name: "Kongsberg", population: 28525 },
  "3305": { kommunenummer: "3305", name: "Ringerike", population: 30895 },
  "3201": { kommunenummer: "3201", name: "Bærum", population: 131572 },
  "3203": { kommunenummer: "3203", name: "Asker", population: 97714 },
  "3205": { kommunenummer: "3205", name: "Lillestrøm", population: 91586 },
  "3207": { kommunenummer: "3207", name: "Nordre Follo", population: 62051 },
  "3209": { kommunenummer: "3209", name: "Ullensaker", population: 42014 },
  "3212": { kommunenummer: "3212", name: "Nesodden", population: 20165 },
  "3214": { kommunenummer: "3214", name: "Ås", population: 21934 },
  "3216": { kommunenummer: "3216", name: "Frogn", population: 16026 },
  "3220": { kommunenummer: "3220", name: "Lørenskog", population: 46891 },
  "3222": { kommunenummer: "3222", name: "Rælingen", population: 19104 },
  "3224": { kommunenummer: "3224", name: "Lier", population: 27873 },
  "3226": { kommunenummer: "3226", name: "Drammen (ny)", population: 103560 },
  "1860": { kommunenummer: "1860", name: "Vestvågøy", population: 11708 },
  "1871": { kommunenummer: "1871", name: "Andøy", population: 4705 },
  "5532": { kommunenummer: "5532", name: "Hammerfest", population: 11493 },
  "5514": { kommunenummer: "5514", name: "Harstad", population: 24703 },
};

export function getKommunePopulation(kommunenummer: string): number | null {
  return kommunePopulation[kommunenummer]?.population ?? null;
}
