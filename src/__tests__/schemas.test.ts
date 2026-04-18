import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  EnturResponseSchema,
  SsbJsonStat2Schema,
  GeonorgeResponseSchema,
  parseUpstream,
} from "@/lib/schemas";

// Sentry is imported by schemas.ts — stub captureMessage so we can assert on calls
vi.mock("@sentry/nextjs", () => ({
  captureMessage: vi.fn(),
}));

import * as Sentry from "@sentry/nextjs";

describe("EnturResponseSchema", () => {
  it("accepts valid trip response", () => {
    const valid = {
      data: {
        trip: {
          tripPatterns: [
            {
              duration: 1800,
              legs: [
                {
                  mode: "bus",
                  duration: 600,
                  fromPlace: { name: "Stop A" },
                  toPlace: { name: "Stop B" },
                  line: { publicCode: "31" },
                },
              ],
            },
          ],
        },
      },
    };
    expect(EnturResponseSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts degraded response with missing optional fields", () => {
    const degraded = { data: { trip: { tripPatterns: [] } } };
    expect(EnturResponseSchema.safeParse(degraded).success).toBe(true);
  });

  it("accepts response with null trip (no route found)", () => {
    const empty = { data: { trip: null } };
    expect(EnturResponseSchema.safeParse(empty).success).toBe(true);
  });

  it("rejects response where tripPatterns is a non-array", () => {
    const broken = { data: { trip: { tripPatterns: "not-an-array" } } };
    expect(EnturResponseSchema.safeParse(broken).success).toBe(false);
  });
});

describe("SsbJsonStat2Schema", () => {
  it("accepts valid json-stat2 body", () => {
    const valid = {
      value: [100, 200, null, 300],
      dimension: {
        Tid: {
          category: { label: { "0": "2023K1", "1": "2023K2" } },
        },
      },
    };
    expect(SsbJsonStat2Schema.safeParse(valid).success).toBe(true);
  });

  it("accepts response with missing value array", () => {
    expect(SsbJsonStat2Schema.safeParse({ dimension: {} }).success).toBe(true);
  });

  it("rejects value if not an array of numbers/nulls", () => {
    const broken = { value: ["a", "b"] };
    expect(SsbJsonStat2Schema.safeParse(broken).success).toBe(false);
  });
});

describe("GeonorgeResponseSchema", () => {
  it("accepts valid address search response", () => {
    const valid = {
      adresser: [
        {
          adressetekst: "Storgata 1",
          kommunenummer: "0301",
          postnummer: "0155",
          poststed: "Oslo",
          representasjonspunkt: { lat: 59.91, lon: 10.75 },
        },
      ],
    };
    expect(GeonorgeResponseSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty result set", () => {
    expect(GeonorgeResponseSchema.safeParse({ adresser: [] }).success).toBe(true);
  });

  it("rejects when adressetekst is missing on an address", () => {
    const broken = { adresser: [{ kommunenummer: "0301" }] };
    expect(GeonorgeResponseSchema.safeParse(broken).success).toBe(false);
  });
});

describe("parseUpstream", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns typed data on valid input", () => {
    const result = parseUpstream("entur", EnturResponseSchema, {
      data: { trip: { tripPatterns: [] } },
    });
    expect(result).not.toBeNull();
    expect(result?.data?.trip?.tripPatterns).toEqual([]);
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  it("returns null and logs schema_drift on invalid input", () => {
    const result = parseUpstream("entur", EnturResponseSchema, {
      data: { trip: { tripPatterns: "broken" } },
    });
    expect(result).toBeNull();
    expect(Sentry.captureMessage).toHaveBeenCalledOnce();
    const call = (Sentry.captureMessage as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toBe("Upstream schema drift detected");
    expect(call[1].tags).toMatchObject({ schema_drift: "true", source: "entur" });
  });

  it("tags the source correctly", () => {
    parseUpstream("ssb-06035", SsbJsonStat2Schema, { value: "nope" });
    const call = (Sentry.captureMessage as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].tags.source).toBe("ssb-06035");
  });
});
