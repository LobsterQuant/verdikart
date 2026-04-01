import { describe, it, expect } from "vitest";
import { OSLO_BYDEL_INDEX } from "@/lib/oslo-bydeler";

describe("OSLO_BYDEL_INDEX", () => {
  it("maps Frogner postal codes to index 1.55", () => {
    expect(OSLO_BYDEL_INDEX["0252"]?.name).toBe("Frogner");
    expect(OSLO_BYDEL_INDEX["0252"]?.index).toBe(1.55);
  });

  it("maps Holmenkollen postal codes to highest index", () => {
    expect(OSLO_BYDEL_INDEX["0370"]?.index).toBe(1.70);
  });

  it("maps Stovner to lowest index", () => {
    expect(OSLO_BYDEL_INDEX["0970"]?.index).toBe(0.70);
  });

  it("all indices are between 0.5 and 2.0", () => {
    for (const [, bydel] of Object.entries(OSLO_BYDEL_INDEX)) {
      expect(bydel.index).toBeGreaterThan(0.5);
      expect(bydel.index).toBeLessThan(2.0);
    }
  });

  it("all keys are 4-digit postal codes", () => {
    for (const key of Object.keys(OSLO_BYDEL_INDEX)) {
      expect(key).toMatch(/^\d{4}$/);
    }
  });
});
