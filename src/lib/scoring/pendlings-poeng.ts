/**
 * Pendlings-poeng — a 0-100 composite commute score per address, measuring how
 * viable it is to commute to the nearest Norwegian work center by public
 * transit. First of the H1 composite-score line-up; future scores (Skole-poeng,
 * Støy-poeng, Utepoeng) will follow the same pattern.
 *
 * Five weighted components:
 *   - Door-to-door time   35%  (fastest trip, rush-hour biased)
 *   - Departures/hour     25%  (frequency on the chosen line, 07-09 Tue)
 *   - Walk to first stop  15%  (meters on first foot leg)
 *   - Transfers           15%  (transit-leg count minus one)
 *   - Monthly-card cost   10%  (operator zone, estimated from distance)
 *
 * Data source: Entur Journey Planner v3 (GraphQL). Rush-hour tested by
 * querying next Tuesday 08:00 Oslo-time; on failure falls back to 10:00
 * midday (rushHourTested flips false). No transit coverage = all 5 scores 0.
 */
import { z } from "zod";
import { haversineKm, haversineM } from "@/lib/geo";
import { parseUpstream } from "@/lib/schemas";
import {
  resolveWorkCenter,
  getWorkCenter,
  type WorkCenter,
  type WorkCenterId,
} from "./work-centers";
import { estimateMonthlyPriceNok } from "./commute-pricing";

/* ── Public types ──────────────────────────────────────────────────────── */

export interface PendlingsPoengComponents {
  doorToDoorMinutes: number;
  doorToDoorScore: number;
  frequencyPerHour: number;
  frequencyScore: number;
  walkDistanceMeters: number;
  walkDistanceScore: number;
  transfers: number;
  transfersScore: number;
  monthlyPriceNok: number;
  monthlyPriceScore: number;
}

export interface PendlingsPoengWeights {
  time: 0.35;
  freq: 0.25;
  walk: 0.15;
  transfers: 0.15;
  cost: 0.10;
}

export interface PendlingsPoengResult {
  total: number;
  center: WorkCenter;
  components: PendlingsPoengComponents;
  weights: PendlingsPoengWeights;
  rushHourTested: boolean;
  dataSource: { transit: "entur"; pricing: "static" };
  calculatedAt: string;
}

export interface PendlingsPoengOptions {
  center?: WorkCenterId;
  kommunenummer?: string;
  /** Injected for tests; defaults to global fetch. */
  fetchFn?: typeof fetch;
  /** Injected for tests; defaults to new Date(). */
  now?: () => Date;
}

export const WEIGHTS: PendlingsPoengWeights = {
  time: 0.35,
  freq: 0.25,
  walk: 0.15,
  transfers: 0.15,
  cost: 0.10,
};

/* ── Pure component scoring (tested exhaustively) ──────────────────────── */

/**
 * Piecewise-linear interpolation given (x,y) anchor points sorted by x asc.
 * Clamps at both ends. y values are score contributions in [0, 100].
 */
function piecewise(anchors: ReadonlyArray<readonly [number, number]>, x: number): number {
  if (x <= anchors[0][0]) return anchors[0][1];
  const last = anchors[anchors.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 0; i < anchors.length - 1; i++) {
    const [x0, y0] = anchors[i];
    const [x1, y1] = anchors[i + 1];
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return last[1];
}

const clamp100 = (v: number) => Math.max(0, Math.min(100, v));

/** 20 min = 100, 30 min = 80, 45 min = 60, 60 min = 40, 90+ min = 0. */
export function scoreDoorToDoor(minutes: number): number {
  return clamp100(
    piecewise(
      [
        [20, 100],
        [30, 80],
        [45, 60],
        [60, 40],
        [90, 0],
      ],
      minutes,
    ),
  );
}

/** 8+/hr = 100, 6 = 80, 4 = 60, 2 = 30, 1 = 10, 0 = 0. */
export function scoreFrequency(perHour: number): number {
  return clamp100(
    piecewise(
      [
        [0, 0],
        [1, 10],
        [2, 30],
        [4, 60],
        [6, 80],
        [8, 100],
      ],
      perHour,
    ),
  );
}

/** <200m = 100, 400m = 80, 600m = 60, 1000m = 30, 1500m+ = 0. */
export function scoreWalkDistance(meters: number): number {
  return clamp100(
    piecewise(
      [
        [200, 100],
        [400, 80],
        [600, 60],
        [1000, 30],
        [1500, 0],
      ],
      meters,
    ),
  );
}

/** 0 = 100, 1 = 70, 2 = 40, 3+ = 0. */
export function scoreTransfers(transfers: number): number {
  return clamp100(
    piecewise(
      [
        [0, 100],
        [1, 70],
        [2, 40],
        [3, 0],
      ],
      transfers,
    ),
  );
}

/** ≤900 = 100, 1200 = 80, 1500 = 60, 1800 = 40, 2000+ = 0. */
export function scoreMonthlyPrice(nok: number): number {
  return clamp100(
    piecewise(
      [
        [900, 100],
        [1200, 80],
        [1500, 60],
        [1800, 40],
        [2000, 0],
      ],
      nok,
    ),
  );
}

export function composeTotal(components: PendlingsPoengComponents): number {
  const weighted =
    WEIGHTS.time * components.doorToDoorScore +
    WEIGHTS.freq * components.frequencyScore +
    WEIGHTS.walk * components.walkDistanceScore +
    WEIGHTS.transfers * components.transfersScore +
    WEIGHTS.cost * components.monthlyPriceScore;
  return Math.round(clamp100(weighted));
}

/* ── Entur schema (module-local, extends shared schema with quay IDs) ──── */

const EnturQuaySchema = z
  .object({
    id: z.string().nullable().optional(),
    stopPlace: z
      .object({ id: z.string().nullable().optional() })
      .nullable()
      .optional(),
  })
  .passthrough();

const EnturPlaceSchema = z
  .object({
    name: z.string().nullable().optional(),
    quay: EnturQuaySchema.nullable().optional(),
  })
  .passthrough();

const EnturLineRefSchema = z
  .object({
    id: z.string().nullable().optional(),
    publicCode: z.string().nullable().optional(),
  })
  .passthrough();

const ScoringLegSchema = z
  .object({
    mode: z.string(),
    duration: z.number().nullable().optional(),
    distance: z.number().nullable().optional(),
    fromPlace: EnturPlaceSchema.nullable().optional(),
    toPlace: EnturPlaceSchema.nullable().optional(),
    line: EnturLineRefSchema.nullable().optional(),
  })
  .passthrough();

const ScoringTripResponseSchema = z
  .object({
    data: z
      .object({
        trip: z
          .object({
            tripPatterns: z
              .array(
                z
                  .object({
                    duration: z.number().nullable().optional(),
                    legs: z.array(ScoringLegSchema).nullable().optional(),
                  })
                  .passthrough(),
              )
              .nullable()
              .optional(),
          })
          .nullable()
          .optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();

const EstimatedCallsResponseSchema = z
  .object({
    data: z
      .object({
        stopPlace: z
          .object({
            estimatedCalls: z
              .array(
                z
                  .object({ expectedDepartureTime: z.string().nullable().optional() })
                  .passthrough(),
              )
              .nullable()
              .optional(),
          })
          .nullable()
          .optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();

/* ── Entur requests ────────────────────────────────────────────────────── */

const ENTUR_URL = "https://api.entur.io/journey-planner/v3/graphql";
const ET_CLIENT = "verdikart-pendlingspoeng";

async function enturPost<T>(
  schema: z.ZodType<T>,
  query: string,
  fetchFn: typeof fetch,
  timeoutMs = 8000,
): Promise<T | null> {
  try {
    const res = await fetchFn(ENTUR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ET-Client-Name": ET_CLIENT,
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const raw = await res.json();
    return parseUpstream("entur", schema, raw);
  } catch (err) {
    console.error(
      "[pendlings-poeng] Entur request failed:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

interface FastestTrip {
  durationMinutes: number;
  transfers: number;
  walkDistanceMeters: number;
  firstLineId: string | null;
  firstStopPlaceId: string | null;
}

async function fetchFastestTrip(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  dateTimeIso: string,
  fetchFn: typeof fetch,
): Promise<FastestTrip | null> {
  const query = `
{
  trip(
    from: { coordinates: { latitude: ${fromLat}, longitude: ${fromLon} } }
    to:   { coordinates: { latitude: ${toLat}, longitude: ${toLon} } }
    dateTime: "${dateTimeIso}"
    modes: {
      accessMode: foot
      egressMode: foot
      transportModes: [
        { transportMode: bus }
        { transportMode: rail }
        { transportMode: metro }
        { transportMode: tram }
      ]
    }
    maximumTransfers: 3
    numTripPatterns: 5
  ) {
    tripPatterns {
      duration
      legs {
        mode
        duration
        distance
        fromPlace { name quay { id stopPlace { id } } }
        toPlace { name }
        line { id publicCode }
      }
    }
  }
}`;

  const parsed = await enturPost(ScoringTripResponseSchema, query, fetchFn);
  if (!parsed) return null;
  const patterns = parsed.data?.trip?.tripPatterns ?? [];
  if (!patterns || patterns.length === 0) return null;

  const fastest = patterns.reduce(
    (best, p) => ((p.duration ?? Infinity) < (best.duration ?? Infinity) ? p : best),
    patterns[0],
  );
  const legs = fastest.legs ?? [];
  if (legs.length === 0) return null;

  const transitLegs = legs.filter((l) => l.mode !== "foot");
  if (transitLegs.length === 0) return null;

  const durationSeconds = fastest.duration ?? 0;
  const durationMinutes = Math.round(durationSeconds / 60);

  // Walking distance on foot legs BEFORE the first transit leg (origin walk).
  let walkMeters = 0;
  for (const leg of legs) {
    if (leg.mode === "foot") {
      walkMeters += leg.distance ?? 0;
    } else {
      break;
    }
  }

  const firstTransit = transitLegs[0];
  const firstLineId = firstTransit.line?.id ?? null;
  const firstStopPlaceId =
    firstTransit.fromPlace?.quay?.stopPlace?.id ??
    firstTransit.fromPlace?.quay?.id ??
    null;

  return {
    durationMinutes,
    transfers: transitLegs.length - 1,
    walkDistanceMeters: Math.round(walkMeters),
    firstLineId,
    firstStopPlaceId,
  };
}

async function fetchLineFrequency(
  stopPlaceId: string,
  lineId: string,
  windowStartIso: string,
  fetchFn: typeof fetch,
): Promise<number> {
  // 2-hour window (07-09); numberOfDepartures high enough for frequent metro.
  const query = `
{
  stopPlace(id: "${stopPlaceId}") {
    estimatedCalls(
      startTime: "${windowStartIso}"
      timeRange: 7200
      numberOfDepartures: 120
      filters: [{ select: [{ lines: ["${lineId}"] }] }]
    ) {
      expectedDepartureTime
    }
  }
}`;

  const parsed = await enturPost(EstimatedCallsResponseSchema, query, fetchFn);
  if (!parsed) return 0;
  const calls = parsed.data?.stopPlace?.estimatedCalls ?? [];
  // 2-hour window — divide by 2 for departures/hour.
  return (calls?.length ?? 0) / 2;
}

/* ── Time helpers (Oslo TZ aware) ─────────────────────────────────────── */

const DOW: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

function osloDayOfWeek(d: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Oslo",
    weekday: "short",
  }).formatToParts(d);
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  return DOW[wd] ?? 1;
}

function osloYMD(d: Date): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { y: +get("year"), m: +get("month"), d: +get("day") };
}

function osloOffsetString(d: Date): string {
  const part = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Oslo",
    timeZoneName: "shortOffset",
  })
    .formatToParts(d)
    .find((p) => p.type === "timeZoneName");
  const m = /GMT([+-]?\d+)/.exec(part?.value ?? "GMT+2");
  const h = m ? parseInt(m[1], 10) : 2;
  const sign = h >= 0 ? "+" : "-";
  return `${sign}${Math.abs(h).toString().padStart(2, "0")}:00`;
}

/** Build ISO string for next Tuesday at HH:00 local Oslo time. */
export function nextTuesdayAtHourOslo(hour: number, now: Date = new Date()): string {
  const todayOsloDow = osloDayOfWeek(now);
  const daysUntil = ((2 - todayOsloDow + 7) % 7) || 7; // always strictly future
  const { y, m, d } = osloYMD(now);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + daysUntil);
  const ty = base.getUTCFullYear();
  const tm = (base.getUTCMonth() + 1).toString().padStart(2, "0");
  const td = base.getUTCDate().toString().padStart(2, "0");
  const offset = osloOffsetString(base);
  const hh = hour.toString().padStart(2, "0");
  return `${ty}-${tm}-${td}T${hh}:00:00${offset}`;
}

/* ── Work-center selection re-exports ──────────────────────────────────── */

export {
  selectNearestWorkCenter,
  selectWorkCenterByKommune,
  resolveWorkCenter,
  getWorkCenter,
  WORK_CENTERS,
  type WorkCenter,
  type WorkCenterId,
} from "./work-centers";

/* ── Main entry point ──────────────────────────────────────────────────── */

const ZERO_COMPONENTS: PendlingsPoengComponents = {
  doorToDoorMinutes: 0,
  doorToDoorScore: 0,
  frequencyPerHour: 0,
  frequencyScore: 0,
  walkDistanceMeters: 0,
  walkDistanceScore: 0,
  transfers: 0,
  transfersScore: 0,
  monthlyPriceNok: 0,
  monthlyPriceScore: 0,
};

export async function calculatePendlingsPoeng(
  originLat: number,
  originLon: number,
  options: PendlingsPoengOptions = {},
): Promise<PendlingsPoengResult> {
  const fetchFn = options.fetchFn ?? fetch;
  const now = options.now ? options.now() : new Date();

  const center: WorkCenter = options.center
    ? getWorkCenter(options.center)
    : resolveWorkCenter(originLat, originLon, options.kommunenummer ?? null);

  // 1. Rush-hour trip, then 10:00 fallback.
  const rushIso = nextTuesdayAtHourOslo(8, now);
  const midIso = nextTuesdayAtHourOslo(10, now);

  let trip = await fetchFastestTrip(
    originLat,
    originLon,
    center.lat,
    center.lon,
    rushIso,
    fetchFn,
  );
  let rushHourTested = trip !== null;
  if (!trip) {
    trip = await fetchFastestTrip(
      originLat,
      originLon,
      center.lat,
      center.lon,
      midIso,
      fetchFn,
    );
    rushHourTested = false;
  }

  const distKm = haversineKm(originLat, originLon, center.lat, center.lon);
  const monthlyPriceNok = estimateMonthlyPriceNok(center.operator, distKm);

  // No transit coverage → all 5 components = 0 (honest: "ikke pendlervennlig").
  if (!trip) {
    const result: PendlingsPoengResult = {
      total: 0,
      center,
      components: { ...ZERO_COMPONENTS, monthlyPriceNok },
      weights: WEIGHTS,
      rushHourTested: false,
      dataSource: { transit: "entur", pricing: "static" },
      calculatedAt: new Date().toISOString(),
    };
    return result;
  }

  // 2. Frequency on the first transit line (07-09 window on same Tuesday).
  let frequencyPerHour = 0;
  if (trip.firstLineId && trip.firstStopPlaceId) {
    const freqWindowIso = nextTuesdayAtHourOslo(7, now);
    frequencyPerHour = await fetchLineFrequency(
      trip.firstStopPlaceId,
      trip.firstLineId,
      freqWindowIso,
      fetchFn,
    );
  }

  // Sanity floor: if the trip found a line but frequency lookup failed or
  // returned 0, assume at least 1/hr (else we double-penalize).
  if (frequencyPerHour === 0 && trip.firstLineId) frequencyPerHour = 1;

  // If Entur handed us a 0-length walk (coords snap to stop), treat as direct.
  const walkMeters = trip.walkDistanceMeters > 0
    ? trip.walkDistanceMeters
    : Math.round(
        haversineM(originLat, originLon, center.lat, center.lon) > 200
          ? 0 // assume indoor/adjacent access; fine as 0
          : 0,
      );

  const components: PendlingsPoengComponents = {
    doorToDoorMinutes: trip.durationMinutes,
    doorToDoorScore: scoreDoorToDoor(trip.durationMinutes),
    frequencyPerHour,
    frequencyScore: scoreFrequency(frequencyPerHour),
    walkDistanceMeters: walkMeters,
    walkDistanceScore: scoreWalkDistance(walkMeters),
    transfers: trip.transfers,
    transfersScore: scoreTransfers(trip.transfers),
    monthlyPriceNok,
    monthlyPriceScore: scoreMonthlyPrice(monthlyPriceNok),
  };

  return {
    total: composeTotal(components),
    center,
    components,
    weights: WEIGHTS,
    rushHourTested,
    dataSource: { transit: "entur", pricing: "static" },
    calculatedAt: new Date().toISOString(),
  };
}
