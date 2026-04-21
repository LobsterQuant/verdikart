import { describe, expect, it } from "vitest";
import {
  kommunenummerSchema,
  postnummerSchema,
  uuidSchema,
  slugSchema,
  coordinateSchema,
  emailSchema,
} from "../common";
import { subscribePostSchema } from "../subscribe";
import { alertsPostSchema, alertsDeleteSchema } from "../alerts";
import { reviewsPostSchema, reviewsGetQuerySchema } from "../reviews";
import {
  savedPropertiesPostSchema,
  savedPropertiesPatchSchema,
  savedPropertiesDeleteSchema,
} from "../saved-properties";
import { containsForbidden } from "../profanity";

// Audit §6.4 (2026-04-20): zod validation on mutating API routes.
// These tests assert the schemas accept valid inputs and reject the
// specific malformed inputs the ad-hoc checks missed.

describe("common primitives", () => {
  describe("kommunenummerSchema", () => {
    it("accepts 4-digit Norwegian kommunenummer", () => {
      expect(kommunenummerSchema.safeParse("0301").success).toBe(true);
      expect(kommunenummerSchema.safeParse("4601").success).toBe(true);
    });
    it("rejects 3 digits, 5 digits, letters, empty string", () => {
      expect(kommunenummerSchema.safeParse("301").success).toBe(false);
      expect(kommunenummerSchema.safeParse("03010").success).toBe(false);
      expect(kommunenummerSchema.safeParse("oslo").success).toBe(false);
      expect(kommunenummerSchema.safeParse("").success).toBe(false);
    });
  });

  describe("postnummerSchema", () => {
    it("accepts 4-digit postnummer, undefined, or null", () => {
      expect(postnummerSchema.safeParse("0150").success).toBe(true);
      expect(postnummerSchema.safeParse(undefined).success).toBe(true);
      expect(postnummerSchema.safeParse(null).success).toBe(true);
    });
    it("rejects malformed postnummer", () => {
      expect(postnummerSchema.safeParse("15").success).toBe(false);
      expect(postnummerSchema.safeParse("abcd").success).toBe(false);
      expect(postnummerSchema.safeParse("").success).toBe(false);
    });
  });

  describe("uuidSchema", () => {
    it("accepts canonical UUIDs", () => {
      expect(
        uuidSchema.safeParse("f47ac10b-58cc-4372-a567-0e02b2c3d479").success,
      ).toBe(true);
    });
    it("rejects non-UUID strings", () => {
      expect(uuidSchema.safeParse("not-a-uuid").success).toBe(false);
      expect(uuidSchema.safeParse("12345").success).toBe(false);
      expect(uuidSchema.safeParse("").success).toBe(false);
    });
  });

  describe("slugSchema", () => {
    it("accepts lowercase-alnum-dashes slugs", () => {
      expect(slugSchema.safeParse("bygdoy-alle-2-0150-oslo").success).toBe(true);
      expect(slugSchema.safeParse("a").success).toBe(true);
    });
    it("rejects slugs with invalid chars or empty/too-long", () => {
      expect(slugSchema.safeParse("slug with space").success).toBe(false);
      expect(slugSchema.safeParse("slug/with/slash").success).toBe(false);
      expect(slugSchema.safeParse("").success).toBe(false);
      expect(slugSchema.safeParse("a".repeat(201)).success).toBe(false);
    });
  });

  describe("coordinateSchema", () => {
    it("accepts finite numbers", () => {
      expect(coordinateSchema.safeParse(59.9139).success).toBe(true);
      expect(coordinateSchema.safeParse(-180).success).toBe(true);
      expect(coordinateSchema.safeParse(0).success).toBe(true);
    });
    it("rejects non-finite or non-number", () => {
      expect(coordinateSchema.safeParse(Infinity).success).toBe(false);
      expect(coordinateSchema.safeParse(NaN).success).toBe(false);
      expect(coordinateSchema.safeParse("59.9").success).toBe(false);
    });
  });

  describe("emailSchema", () => {
    it("accepts well-formed emails", () => {
      expect(emailSchema.safeParse("atlas@verdikart.no").success).toBe(true);
    });
    it("rejects malformed emails and over-long input", () => {
      expect(emailSchema.safeParse("notanemail").success).toBe(false);
      expect(emailSchema.safeParse("a@b").success).toBe(false);
      expect(emailSchema.safeParse("").success).toBe(false);
      expect(emailSchema.safeParse("a".repeat(250) + "@b.com").success).toBe(false);
    });
  });
});

describe("subscribePostSchema", () => {
  it("accepts email alone or email + address", () => {
    expect(subscribePostSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
    expect(
      subscribePostSchema.safeParse({ email: "a@b.com", address: "Karl Johans gate 1" })
        .success,
    ).toBe(true);
  });
  it("rejects missing or invalid email", () => {
    expect(subscribePostSchema.safeParse({}).success).toBe(false);
    expect(subscribePostSchema.safeParse({ email: "notanemail" }).success).toBe(false);
  });
});

describe("alertsPostSchema", () => {
  it("accepts valid kommunenummer + optional fields", () => {
    expect(alertsPostSchema.safeParse({ kommunenummer: "0301" }).success).toBe(true);
    expect(
      alertsPostSchema.safeParse({
        kommunenummer: "0301",
        postnummer: "0150",
        thresholdPct: 5,
      }).success,
    ).toBe(true);
  });
  it("rejects missing or malformed kommunenummer", () => {
    expect(alertsPostSchema.safeParse({}).success).toBe(false);
    expect(alertsPostSchema.safeParse({ kommunenummer: "oslo" }).success).toBe(false);
  });
  it("rejects out-of-range thresholdPct", () => {
    expect(
      alertsPostSchema.safeParse({ kommunenummer: "0301", thresholdPct: 0 }).success,
    ).toBe(false);
    expect(
      alertsPostSchema.safeParse({ kommunenummer: "0301", thresholdPct: 150 }).success,
    ).toBe(false);
  });
});

describe("alertsDeleteSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      alertsDeleteSchema.safeParse({ id: "f47ac10b-58cc-4372-a567-0e02b2c3d479" }).success,
    ).toBe(true);
  });
  it("rejects missing or non-UUID id", () => {
    expect(alertsDeleteSchema.safeParse({}).success).toBe(false);
    expect(alertsDeleteSchema.safeParse({ id: "123" }).success).toBe(false);
  });
});

describe("reviewsPostSchema", () => {
  it("accepts a full valid review", () => {
    expect(
      reviewsPostSchema.safeParse({
        kommunenummer: "0301",
        postnummer: "0150",
        rating: 4,
        pros: "Stille område",
        cons: null,
        livedYears: 3,
      }).success,
    ).toBe(true);
  });
  it("rejects out-of-range rating", () => {
    expect(
      reviewsPostSchema.safeParse({ kommunenummer: "0301", rating: 0 }).success,
    ).toBe(false);
    expect(
      reviewsPostSchema.safeParse({ kommunenummer: "0301", rating: 6 }).success,
    ).toBe(false);
    expect(
      reviewsPostSchema.safeParse({ kommunenummer: "0301", rating: 3.5 }).success,
    ).toBe(false);
  });
  it("rejects pros/cons over 500 chars", () => {
    expect(
      reviewsPostSchema.safeParse({
        kommunenummer: "0301",
        rating: 3,
        pros: "a".repeat(501),
      }).success,
    ).toBe(false);
  });
});

describe("reviewsGetQuerySchema (relaxed GET)", () => {
  it("accepts valid kommunenummer", () => {
    expect(reviewsGetQuerySchema.safeParse({ kommunenummer: "0301" }).success).toBe(true);
    expect(
      reviewsGetQuerySchema.safeParse({ kommunenummer: "0301", postnummer: "0150" }).success,
    ).toBe(true);
  });
  it("accepts empty string kommunenummer (slugs without knr)", () => {
    expect(reviewsGetQuerySchema.safeParse({ kommunenummer: "" }).success).toBe(true);
    expect(
      reviewsGetQuerySchema.safeParse({ kommunenummer: "", postnummer: "" }).success,
    ).toBe(true);
  });
  it("accepts missing kommunenummer (undefined)", () => {
    expect(reviewsGetQuerySchema.safeParse({}).success).toBe(true);
  });
  it("rejects malformed kommunenummer", () => {
    expect(reviewsGetQuerySchema.safeParse({ kommunenummer: "abc" }).success).toBe(false);
    expect(reviewsGetQuerySchema.safeParse({ kommunenummer: "123" }).success).toBe(false);
    expect(reviewsGetQuerySchema.safeParse({ kommunenummer: "12345" }).success).toBe(false);
  });
});

describe("savedPropertiesPostSchema", () => {
  it("accepts minimal valid payload", () => {
    expect(
      savedPropertiesPostSchema.safeParse({
        slug: "bygdoy-alle-2-0150-oslo",
        address: "Bygdøy allé 2",
        lat: 59.9139,
        lon: 10.7522,
      }).success,
    ).toBe(true);
  });
  it("rejects missing required fields", () => {
    expect(savedPropertiesPostSchema.safeParse({}).success).toBe(false);
    expect(
      savedPropertiesPostSchema.safeParse({
        slug: "x",
        address: "Y",
        lat: 59,
        // missing lon
      }).success,
    ).toBe(false);
  });
  it("rejects non-finite coordinates", () => {
    expect(
      savedPropertiesPostSchema.safeParse({
        slug: "x",
        address: "Y",
        lat: Infinity,
        lon: 10,
      }).success,
    ).toBe(false);
  });
});

describe("savedPropertiesPatchSchema", () => {
  it("accepts slug with optional notes", () => {
    expect(savedPropertiesPatchSchema.safeParse({ slug: "x" }).success).toBe(true);
    expect(
      savedPropertiesPatchSchema.safeParse({ slug: "x", notes: "a note" }).success,
    ).toBe(true);
    expect(
      savedPropertiesPatchSchema.safeParse({ slug: "x", notes: null }).success,
    ).toBe(true);
  });
  it("rejects missing slug or over-long notes", () => {
    expect(savedPropertiesPatchSchema.safeParse({}).success).toBe(false);
    expect(
      savedPropertiesPatchSchema.safeParse({ slug: "x", notes: "a".repeat(1001) }).success,
    ).toBe(false);
  });
});

describe("savedPropertiesDeleteSchema", () => {
  it("accepts valid slug", () => {
    expect(savedPropertiesDeleteSchema.safeParse({ slug: "x" }).success).toBe(true);
  });
  it("rejects missing slug", () => {
    expect(savedPropertiesDeleteSchema.safeParse({}).success).toBe(false);
  });
});

describe("containsForbidden (profanity filter)", () => {
  it("catches plain forbidden words", () => {
    expect(containsForbidden("this is a dritt place")).toBe(true);
    expect(containsForbidden("what the fuck")).toBe(true);
    expect(containsForbidden("FAEN")).toBe(true);
  });
  it("catches diacritic bypass variants", () => {
    expect(containsForbidden("drítt nabolag")).toBe(true);
    expect(containsForbidden("FÜCK")).toBe(true);
    expect(containsForbidden("fück this")).toBe(true);
  });
  it("passes clean text", () => {
    expect(containsForbidden("Fint nabolag, stille om kvelden")).toBe(false);
    expect(containsForbidden("")).toBe(false);
    expect(containsForbidden("Mange barnefamilier og butikker i nærheten")).toBe(false);
  });
});
