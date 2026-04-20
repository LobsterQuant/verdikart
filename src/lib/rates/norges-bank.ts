import { unstable_cache } from "next/cache";

export interface PolicyRateSnapshot {
  policyRate: number;
  marketRate: number;
  stressTestRate: number;
  fetchedAt: string;
  fromFallback: boolean;
}

const BANK_MARGIN = 0.02;
const STRESS_ADDER = 0.03;
const STRESS_FLOOR = 0.07;

const FALLBACK_POLICY_RATE = 0.033;

const NORGES_BANK_URL =
  "https://data.norges-bank.no/api/data/IR/B.KPRA.SD.R?format=sdmx-json&lastNObservations=1";

function computeSnapshot(policyRate: number, fromFallback: boolean): PolicyRateSnapshot {
  const marketRate = policyRate + BANK_MARGIN;
  const stressTestRate = Math.max(marketRate + STRESS_ADDER, STRESS_FLOOR);
  return {
    policyRate,
    marketRate,
    stressTestRate,
    fetchedAt: new Date().toISOString(),
    fromFallback,
  };
}

function extractPolicyRateFromSdmx(json: unknown): number | null {
  if (!json || typeof json !== "object") return null;
  const root = json as Record<string, unknown>;
  const dataSets = root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>).dataSets : (root as Record<string, unknown>).dataSets;
  if (!Array.isArray(dataSets) || dataSets.length === 0) return null;
  const first = dataSets[0] as Record<string, unknown>;
  const series = first.series as Record<string, { observations?: Record<string, unknown[]> }> | undefined;
  if (!series) return null;
  const seriesKeys = Object.keys(series);
  if (seriesKeys.length === 0) return null;
  const observations = series[seriesKeys[0]].observations;
  if (!observations) return null;
  const obsKeys = Object.keys(observations);
  if (obsKeys.length === 0) return null;
  const lastObs = observations[obsKeys[obsKeys.length - 1]];
  const raw = Array.isArray(lastObs) ? lastObs[0] : null;
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  return raw / 100;
}

async function fetchPolicyRate(): Promise<PolicyRateSnapshot> {
  try {
    const res = await fetch(NORGES_BANK_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return computeSnapshot(FALLBACK_POLICY_RATE, true);
    const json = await res.json();
    const rate = extractPolicyRateFromSdmx(json);
    if (rate === null || rate <= 0 || rate > 0.25) {
      return computeSnapshot(FALLBACK_POLICY_RATE, true);
    }
    return computeSnapshot(rate, false);
  } catch {
    return computeSnapshot(FALLBACK_POLICY_RATE, true);
  }
}

export const getPolicyRateSnapshot = unstable_cache(
  fetchPolicyRate,
  ["norges-bank-policy-rate-v1"],
  { revalidate: 60 * 60 * 24 },
);
