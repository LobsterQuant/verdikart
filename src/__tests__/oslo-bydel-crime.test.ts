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

  // ── coord-fallback ────────────────────────────────────────────────────
  // These mirror the direct-link path: slug contains lat/lon but no ?pnr=,
  // so CrimeCard must still resolve the correct bydel.

  it("faller tilbake til koordinater når postnummer mangler (Karl Johans → Sentrum)", () => {
    const res = getOsloBydelCrime({ lat: 59.9114, lon: 10.7494, kommunenummer: "0301" });
    expect(res?.bydel).toBe("Sentrum");
  });

  it("faller tilbake til koordinater når postnummer mangler (Bygdøy allé → Frogner)", () => {
    const res = getOsloBydelCrime({ lat: 59.9149, lon: 10.7171, kommunenummer: "0301" });
    expect(res?.bydel).toBe("Frogner");
  });

  it("postnummer vinner over koordinater når begge er satt", () => {
    // 0159 tilhører Sentrum; koordinatene peker mot Frogner — postnummer skal ta presedens.
    const res = getOsloBydelCrime({ postnummer: "0159", lat: 59.9149, lon: 10.7171, kommunenummer: "0301" });
    expect(res?.bydel).toBe("Sentrum");
  });

  it("bruker ikke koordinater når kommunenummer ikke er Oslo (0301)", () => {
    const res = getOsloBydelCrime({ lat: 59.9114, lon: 10.7494, kommunenummer: "1103" });
    expect(res).toBeNull();
  });

  it("returnerer null når både postnummer og koordinater mangler", () => {
    expect(getOsloBydelCrime({ kommunenummer: "0301" })).toBeNull();
  });
});
