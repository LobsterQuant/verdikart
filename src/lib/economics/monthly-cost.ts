import { getKommunePopulation } from "@/data/kommune-population";

/**
 * Finanstilsynet-stresstest rate per boliglånsforskriften § 5. Applied to every
 * månedskostnad-display regardless of the market rate snapshot so the number
 * a buyer sees in the hero and in the detail card never diverges.
 */
export const STRESSTEST_RATE = 0.07;

export type KommuneCategory = "storby" | "mellomby" | "distrikt";
export type BuildingType =
  | "enebolig"
  | "rekkehus"
  | "tomannsbolig"
  | "leilighet"
  | "fritidsbolig"
  | "unknown";

export const STORBY_KOMMUNER: ReadonlySet<string> = new Set([
  "0301", // Oslo
  "4601", // Bergen
  "5001", // Trondheim
  "1103", // Stavanger
  "3005", // Drammen
  "4204", // Kristiansand
  "3004", // Fredrikstad
  "5401", // Tromsø
]);

const DEFAULT_AREA_BY_TYPE: Record<BuildingType, number> = {
  enebolig: 140,
  rekkehus: 110,
  tomannsbolig: 120,
  leilighet: 65,
  fritidsbolig: 75,
  unknown: 75,
};

const MUNICIPAL_FEES_BY_CATEGORY: Record<KommuneCategory, number> = {
  storby: 1800,
  mellomby: 1500,
  distrikt: 2200,
};

export function defaultAreaForBuildingType(type: BuildingType): number {
  return DEFAULT_AREA_BY_TYPE[type];
}

export function buildingTypeFromEnovaKategori(
  kategori: string | null | undefined,
): BuildingType {
  if (!kategori) return "unknown";
  const k = kategori.toLowerCase();
  if (k.includes("blokk") || k.includes("leilighet")) return "leilighet";
  if (k.includes("rekkehus")) return "rekkehus";
  if (k.includes("tomannsbolig")) return "tomannsbolig";
  if (k.includes("enebolig")) return "enebolig";
  if (k.includes("fritid")) return "fritidsbolig";
  if (k.includes("småhus")) return "enebolig";
  return "unknown";
}

export function kommuneCategoryFromPopulation(
  population: number | null,
): KommuneCategory {
  if (population === null || population < 20_000) return "distrikt";
  if (population < 100_000) return "mellomby";
  return "storby";
}

export function resolveKommuneCategory(kommunenummer: string): KommuneCategory {
  if (STORBY_KOMMUNER.has(kommunenummer)) return "storby";
  const pop = getKommunePopulation(kommunenummer);
  return kommuneCategoryFromPopulation(pop);
}

export function estimatedMunicipalFees(category: KommuneCategory): number {
  return MUNICIPAL_FEES_BY_CATEGORY[category];
}

export interface MonthlyCostInput {
  propertyValue: number;
  area: number;
  rate: number;
  equityPct: number;
  termYears: number;
  municipalFees: number;
  maintenancePct: number;
}

export interface MonthlyCostBreakdown {
  total: number;
  loanPayment: number;
  municipalFees: number;
  maintenance: number;
  loanAmount: number;
}

function annuityMonthlyPayment(
  loanAmount: number,
  annualRate: number,
  termYears: number,
): number {
  if (loanAmount <= 0 || termYears <= 0) return 0;
  const n = termYears * 12;
  const r = annualRate / 12;
  if (r === 0) return loanAmount / n;
  return (loanAmount * r) / (1 - Math.pow(1 + r, -n));
}

export function calculateMonthlyCost(input: MonthlyCostInput): MonthlyCostBreakdown {
  const loanAmount = input.propertyValue * (1 - input.equityPct);
  const loanPayment = annuityMonthlyPayment(loanAmount, input.rate, input.termYears);
  const maintenance = (input.propertyValue * input.maintenancePct) / 12;
  const total = loanPayment + input.municipalFees + maintenance;
  return {
    total,
    loanPayment,
    municipalFees: input.municipalFees,
    maintenance,
    loanAmount,
  };
}

export function roundToNearest100(value: number): number {
  return Math.round(value / 100) * 100;
}
