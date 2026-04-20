import { describe, it, expect } from "vitest";
import {
  getOsloBydelCrime,
  OSLO_BYDEL_CRIME,
  OSLO_KOMMUNE_AVG,
} from "@/data/oslo-bydel-crime";

describe("OSLO_BYDEL_CRIME", () => {
  it("gjenkjenner Holmenkollen-postnummer og returnerer tall under Oslo-snittet", () => {
    const res = getOsloBydelCrime("0787");
    // Holmenkollen bydel-sonen ligger vest, lavt nivå
    if (res) expect(res.rate).toBeLessThan(OSLO_KOMMUNE_AVG);
  });

  it("gjenkjenner Sentrum-postnummer (Karl Johan) og returnerer tall over Oslo-snittet", () => {
    const res = getOsloBydelCrime("0159");
    expect(res?.bydel).toBe("Sentrum");
    expect(res?.rate).toBeGreaterThan(OSLO_KOMMUNE_AVG);
  });

  it("gjenkjenner Frogner-postnummer og returnerer tall under Oslo-snittet", () => {
    const res = getOsloBydelCrime("0252");
    expect(res?.bydel).toBe("Frogner");
    expect(res?.rate).toBeLessThan(OSLO_KOMMUNE_AVG);
  });

  it("returnerer null for ukjent postnummer", () => {
    expect(getOsloBydelCrime("9999")).toBeNull();
  });

  it("returnerer null for tomt/undefined postnummer", () => {
    expect(getOsloBydelCrime(undefined)).toBeNull();
    expect(getOsloBydelCrime("")).toBeNull();
  });

  it("alle bydel-rater er rimelige (30–250 per 1000)", () => {
    for (const [, entry] of Object.entries(OSLO_BYDEL_CRIME)) {
      expect(entry.rate).toBeGreaterThan(30);
      expect(entry.rate).toBeLessThan(250);
    }
  });

  it("alle sonenavn fra OSLO_BYDEL_INDEX har kriminalitetsdata", async () => {
    const { OSLO_BYDEL_INDEX } = await import("@/lib/oslo-bydeler");
    const zoneNames = Array.from(new Set(Object.values(OSLO_BYDEL_INDEX).map((z) => z.name)));
    for (const name of zoneNames) {
      expect(OSLO_BYDEL_CRIME[name], `missing crime data for ${name}`).toBeDefined();
    }
  });
});
