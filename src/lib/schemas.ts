/**
 * Runtime validation schemas for external API responses.
 *
 * We don't control Entur, SSB, or Geonorge — they can change response shapes
 * without warning. Validating at boundaries surfaces schema drift as a loud
 * failure (tagged Sentry event) instead of a silent card outage.
 *
 * Only the fields Verdikart actually consumes are modeled. Upstream APIs
 * return more — additional fields pass through (default zod behavior).
 */

import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

/* ── Entur journey-planner GraphQL ─────────────────────────────────────── */

export const EnturLegSchema = z
  .object({
    mode: z.string(),
    duration: z.number().nullable().optional(),
    fromPlace: z.object({ name: z.string().nullable().optional() }).nullable().optional(),
    toPlace: z.object({ name: z.string().nullable().optional() }).nullable().optional(),
    line: z.object({ publicCode: z.string().nullable().optional() }).nullable().optional(),
  })
  .passthrough();

export const EnturTripPatternSchema = z
  .object({
    duration: z.number().nullable().optional(),
    legs: z.array(EnturLegSchema).nullable().optional(),
  })
  .passthrough();

export const EnturResponseSchema = z
  .object({
    data: z
      .object({
        trip: z
          .object({
            tripPatterns: z.array(EnturTripPatternSchema).nullable().optional(),
          })
          .nullable()
          .optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();

export type EnturResponse = z.infer<typeof EnturResponseSchema>;

/* ── SSB JSON-stat2 table responses ────────────────────────────────────── */

const SsbDimensionSchema = z
  .object({
    category: z
      .object({
        label: z.record(z.string(), z.string()).nullable().optional(),
        index: z.record(z.string(), z.number()).nullable().optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();

export const SsbJsonStat2Schema = z
  .object({
    value: z.array(z.number().nullable()).nullable().optional(),
    dimension: z.record(z.string(), SsbDimensionSchema).nullable().optional(),
  })
  .passthrough();

export type SsbJsonStat2 = z.infer<typeof SsbJsonStat2Schema>;

/* ── Geonorge address lookup ───────────────────────────────────────────── */

export const GeonorgeAddressSchema = z
  .object({
    adressetekst: z.string(),
    kommunenummer: z.string().nullable().optional(),
    postnummer: z.string().nullable().optional(),
    poststed: z.string().nullable().optional(),
    representasjonspunkt: z
      .object({
        lat: z.number(),
        lon: z.number(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();

export const GeonorgeResponseSchema = z
  .object({
    adresser: z.array(GeonorgeAddressSchema).nullable().optional(),
  })
  .passthrough();

export type GeonorgeResponse = z.infer<typeof GeonorgeResponseSchema>;

/* ── Safe parse helper ─────────────────────────────────────────────────── */

/**
 * Parse unknown upstream JSON with a schema. On failure:
 *   1. Log a `schema_drift` event to Sentry with the source tag
 *   2. Return `null` so callers can fall through to graceful empty state
 *
 * Callers should treat `null` the same as an API error — degrade gracefully,
 * never throw to the client.
 */
export function parseUpstream<T>(
  source: string,
  schema: z.ZodType<T>,
  data: unknown,
): T | null {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  Sentry.captureMessage("Upstream schema drift detected", {
    level: "warning",
    tags: { schema_drift: "true", source },
    extra: {
      issues: result.error.issues.slice(0, 5),
      sample: JSON.stringify(data).slice(0, 500),
    },
  });
  return null;
}
