/**
 * Pure copy/label helpers for PendlingsPoengCard. Kept separate from the
 * component so vitest (node env, no JSX) can test them.
 */
import type { PendlingsPoengResult } from "./pendlings-poeng";

export type PoengBand = "Utmerket" | "Bra" | "OK" | "Svak" | "Svært svak";
export type PoengBucket = "0-34" | "35-54" | "55-69" | "70-84" | "85-100";

export function bandForScore(total: number): PoengBand {
  if (total >= 85) return "Utmerket";
  if (total >= 70) return "Bra";
  if (total >= 55) return "OK";
  if (total >= 35) return "Svak";
  return "Svært svak";
}

export function bucketForScore(total: number): PoengBucket {
  if (total >= 85) return "85-100";
  if (total >= 70) return "70-84";
  if (total >= 55) return "55-69";
  if (total >= 35) return "35-54";
  return "0-34";
}

export function fmtMeters(m: number): string {
  if (m >= 1000) return `${(m / 1000).toLocaleString("nb-NO", { maximumFractionDigits: 1 })} km`;
  return `${Math.round(m)} m`;
}

export function fmtMinutes(min: number): string {
  return `${Math.round(min)} min`;
}

export function fmtPerHour(perHour: number): string {
  if (perHour <= 0) return "0/time";
  if (perHour < 1) return `${perHour.toLocaleString("nb-NO", { maximumFractionDigits: 1 })}/time`;
  return `${Math.round(perHour)}/time`;
}

export function fmtKr(nok: number): string {
  return `${Math.round(nok).toLocaleString("nb-NO")} kr`;
}

export function fmtTransfers(n: number): string {
  if (n === 0) return "Direkte";
  if (n === 1) return "1 bytte";
  return `${n} bytter`;
}

/**
 * True when Entur returned zero viable trips (score collapses to 0 across
 * all five components). Caller should render the "bilavhengig" message.
 */
export function isNoTransitResult(result: PendlingsPoengResult): boolean {
  return (
    result.total === 0 &&
    result.components.doorToDoorMinutes === 0 &&
    result.components.frequencyPerHour === 0
  );
}
