/**
 * Indicative mortgage rates for monthly cost estimation.
 * Update quarterly based on market data.
 */
export const INDICATIVE_RATE = {
  nominal: 0.053,
  lastUpdated: "2026-04-19",
  source: "Gjennomsnitt av ledende norske bankers annonserte renter",
} as const;

/**
 * Default felleskostnader estimate by boligtype (NOK per month).
 * Source: SSB/Finn aggregated data, adjust based on actual.
 */
export const FELLESKOSTNADER_ESTIMATE: Record<string, number> = {
  leilighet: 3500,
  borettslag: 4200,
  rekkehus: 1500,
  enebolig: 0,
  tomannsbolig: 800,
  default: 2500,
};
