/**
 * Pure copy/label helpers for KlimaPoengCard. Kept separate so vitest (node
 * env, no JSX) can test them. Bands match Pendlings-poeng so the two hero
 * cards read as a consistent family.
 */
import type { SkredLayers, StormSurgeZones } from "./klima-poeng";

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

export function quickClayLabel(inside: boolean): string {
  return inside ? "Faresone" : "Utenfor";
}

/**
 * One-line summary of the stormflo 2100 exposure — picked by most-imminent
 * zone first, since the layers nest (20-år ⊂ 200-år ⊂ 1000-år).
 */
export function stormSurgeLabel(zones: StormSurgeZones): string {
  if (zones.in20YearCurrent) return "Flomutsatt i dag";
  if (zones.in200Year2100) return "Utsatt ved 2100";
  if (zones.in1000Year2100) return "Ekstremtilfelle";
  return "Utenfor";
}

export function klimaprofilLabel(fylkesnavn: string | null): string {
  return fylkesnavn ?? "Ingen profil";
}

/**
 * One-line summary of the three skred aktsomhetskart. Single-layer hits name
 * the layer for the reader; multi-hits bucket as "N aktsomhetsområder".
 */
export function skredLabel(layers: SkredLayers): string {
  const names: string[] = [];
  if (layers.jordflom) names.push("jord-/flomskred");
  if (layers.steinsprang) names.push("steinsprang");
  if (layers.snoskred) names.push("snøskred");
  if (names.length === 0) return "Utenfor";
  if (names.length === 1) return `Innenfor ${names[0]}`;
  return `Innenfor ${names.length} aktsomhetsområder`;
}
