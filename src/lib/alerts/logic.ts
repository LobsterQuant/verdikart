export type AlertDecision =
  | { action: "initialize"; changePct: null }
  | { action: "notify"; changePct: number }
  | { action: "skip"; changePct: number };

export interface AlertDecisionInput {
  lastKnownValue: number | null;
  currentValue: number;
  thresholdPct: number;
}

export function decideAlert({
  lastKnownValue,
  currentValue,
  thresholdPct,
}: AlertDecisionInput): AlertDecision {
  if (lastKnownValue == null || lastKnownValue <= 0) {
    return { action: "initialize", changePct: null };
  }
  const changePct = ((currentValue - lastKnownValue) / lastKnownValue) * 100;
  if (Math.abs(changePct) >= thresholdPct) {
    return { action: "notify", changePct: round1(changePct) };
  }
  return { action: "skip", changePct: round1(changePct) };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
