/**
 * Pendlings-poeng reference centers — the 6 Norwegian work centers that serve
 * as commute destinations. Each address is automatically matched to its most
 * relevant center via either lat/lon (weighted haversine) or kommunenummer
 * (fylke-prefix map, with Agder split east/west).
 *
 * The lat/lon of each "sentrum" is the canonical transit hub:
 *  - Oslo S, Bergen Torgallmenningen, Trondheim sentralstasjon,
 *    Stavanger stasjon, Tromsø sentrum (Storgata), Kristiansand sentrum.
 */
import { haversineKm } from "@/lib/geo";

export type WorkCenterId =
  | "oslo"
  | "bergen"
  | "trondheim"
  | "stavanger"
  | "tromso"
  | "kristiansand";

export type PricingOperator =
  | "ruter"
  | "skyss"
  | "atb"
  | "kolumbus"
  | "svipper"
  | "akt";

export interface WorkCenter {
  id: WorkCenterId;
  name: string;
  sentrum: string;
  lat: number;
  lon: number;
  operator: PricingOperator;
}

export const WORK_CENTERS: ReadonlyArray<WorkCenter> = [
  {
    id: "oslo",
    name: "Oslo",
    sentrum: "Oslo S",
    lat: 59.9109,
    lon: 10.7527,
    operator: "ruter",
  },
  {
    id: "bergen",
    name: "Bergen",
    sentrum: "Torgallmenningen",
    lat: 60.3928,
    lon: 5.3240,
    operator: "skyss",
  },
  {
    id: "trondheim",
    name: "Trondheim",
    sentrum: "Trondheim sentralstasjon",
    lat: 63.4362,
    lon: 10.3984,
    operator: "atb",
  },
  {
    id: "stavanger",
    name: "Stavanger/Sandnes",
    sentrum: "Stavanger stasjon",
    lat: 58.9694,
    lon: 5.7332,
    operator: "kolumbus",
  },
  {
    id: "tromso",
    name: "Tromsø",
    sentrum: "Storgata (Tromsø sentrum)",
    lat: 69.6489,
    lon: 18.9551,
    operator: "svipper",
  },
  {
    id: "kristiansand",
    name: "Kristiansand",
    sentrum: "Kristiansand rutebilstasjon",
    lat: 58.1467,
    lon: 7.9956,
    operator: "akt",
  },
];

const BY_ID: Record<WorkCenterId, WorkCenter> = WORK_CENTERS.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<WorkCenterId, WorkCenter>,
);

export function getWorkCenter(id: WorkCenterId): WorkCenter {
  return BY_ID[id];
}

/* ── lat/lon → nearest center ─────────────────────────────────────────────
 * Pure haversine misclassifies two kinds of addresses:
 *   - Bodø (Nord-Norge) is geometrically closer to Trondheim than Tromsø, but
 *     culturally/administratively Tromsø is the correct Nord-Norge center.
 *   - Geilo is roughly equidistant to Oslo and Bergen but commutes to Oslo.
 *
 * Apply "magnetism" multipliers: Oslo ×0.80, Tromsø ×0.70 shrink the effective
 * distance to those centers. Tuned so Voss→Bergen and Stavanger→Stavanger still
 * win. For strict fylke-based routing (e.g. Agder east→Oslo), callers should
 * prefer selectWorkCenterByKommune which has deterministic political boundaries.
 */
const CENTER_MAGNETISM: Record<WorkCenterId, number> = {
  oslo: 0.80,
  tromso: 0.70,
  bergen: 1.0,
  trondheim: 1.0,
  stavanger: 1.0,
  kristiansand: 1.0,
};

export function selectNearestWorkCenter(lat: number, lon: number): WorkCenter {
  let best = WORK_CENTERS[0];
  let bestScore = Infinity;
  for (const c of WORK_CENTERS) {
    const d = haversineKm(lat, lon, c.lat, c.lon) * CENTER_MAGNETISM[c.id];
    if (d < bestScore) {
      bestScore = d;
      best = c;
    }
  }
  return best;
}

/* ── kommunenummer → center ───────────────────────────────────────────────
 * Deterministic mapping using the 2-digit fylke prefix. Handles the ambiguous
 * cases (Agder split east/west, Møre og Romsdal geography-dependent) via
 * explicit overrides.
 *
 * Fylke (post-2024):
 *   03 Oslo · 11 Rogaland · 15 Møre og Romsdal · 18 Nordland
 *   31 Østfold · 32 Akershus · 33 Buskerud · 34 Innlandet
 *   39 Vestfold · 40 Telemark · 42 Agder · 46 Vestland
 *   50 Trøndelag · 55 Troms · 56 Finnmark
 */
const FYLKE_TO_CENTER: Record<string, WorkCenterId> = {
  "03": "oslo",
  "11": "stavanger",
  "18": "tromso",
  "31": "oslo",
  "32": "oslo",
  "33": "oslo",
  "34": "oslo",
  "39": "oslo",
  "40": "oslo",
  "46": "bergen",
  "50": "trondheim",
  "55": "tromso",
  "56": "tromso",
};

/**
 * Old Aust-Agder kommuner (commute toward Oslo via E18/Arendalsbanen).
 * The remainder of fylke 42 (Vest-Agder) goes to Kristiansand.
 * List current as of the 2020 Aust+Vest merger back into fylke 42.
 */
const AGDER_EAST_KOMMUNER: ReadonlySet<string> = new Set([
  "4201", // Risør
  "4202", // Grimstad
  "4203", // Arendal
  "4211", // Gjerstad
  "4212", // Vegårshei
  "4213", // Tvedestrand
  "4214", // Froland
  "4216", // Birkenes
  "4217", // Åmli
  "4218", // Iveland
  "4219", // Evje og Hornnes
  "4220", // Bygland
  "4221", // Valle
  "4222", // Bykle
]);

/**
 * Møre og Romsdal (fylke 15) has no single obvious pull: Ålesund leans Bergen,
 * Kristiansund leans Trondheim. Fall back to geography.
 */
const AMBIGUOUS_FYLKER: ReadonlySet<string> = new Set(["15"]);

export function selectWorkCenterByKommune(knr: string): WorkCenter | null {
  if (!/^\d{4}$/.test(knr)) return null;
  const fylke = knr.slice(0, 2);

  if (fylke === "42") {
    return getWorkCenter(
      AGDER_EAST_KOMMUNER.has(knr) ? "oslo" : "kristiansand",
    );
  }

  if (AMBIGUOUS_FYLKER.has(fylke)) return null;

  const centerId = FYLKE_TO_CENTER[fylke];
  return centerId ? getWorkCenter(centerId) : null;
}

/**
 * Unified selector: prefer kommune-based mapping when a knr is known (correct
 * for political boundaries), else fall back to weighted haversine. Useful for
 * callers with partial data.
 */
export function resolveWorkCenter(
  lat: number,
  lon: number,
  knr?: string | null,
): WorkCenter {
  if (knr) {
    const byKommune = selectWorkCenterByKommune(knr);
    if (byKommune) return byKommune;
  }
  return selectNearestWorkCenter(lat, lon);
}
