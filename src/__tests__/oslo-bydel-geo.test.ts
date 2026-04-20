import { describe, it, expect } from "vitest";
import { bydelFromCoordinates } from "@/lib/oslo-bydel-geo";
import { OSLO_BYDEL_CRIME } from "@/data/oslo-bydel-crime";

describe("bydelFromCoordinates", () => {
  it("maps Karl Johans gate to Sentrum", () => {
    expect(bydelFromCoordinates(59.9114, 10.7494)).toBe("Sentrum");
  });

  it("maps Bygdøy allé to Frogner", () => {
    expect(bydelFromCoordinates(59.9149, 10.7171)).toBe("Frogner");
  });

  it("maps Grünerløkka coordinates to Grünerløkka", () => {
    expect(bydelFromCoordinates(59.922, 10.759)).toBe("Grünerløkka");
  });

  it("maps Sagene coordinates to Sagene", () => {
    expect(bydelFromCoordinates(59.937, 10.758)).toBe("Sagene");
  });

  it("maps Holmenkollen coordinates to Holmenkollen", () => {
    expect(bydelFromCoordinates(59.963, 10.675)).toBe("Holmenkollen");
  });

  it("maps Nordstrand coordinates to Nordstrand", () => {
    expect(bydelFromCoordinates(59.864, 10.808)).toBe("Nordstrand");
  });

  it("maps Søndre Nordstrand (Holmlia) to Søndre Nordstrand", () => {
    expect(bydelFromCoordinates(59.834, 10.815)).toBe("Søndre Nordstrand");
  });

  it("returns null for a coordinate in Bergen (outside Oslo)", () => {
    // Bergen sentrum ~ 60.39, 5.33
    expect(bydelFromCoordinates(60.3893, 5.3320)).toBeNull();
  });

  it("returns null for a coordinate in Stavanger (outside Oslo)", () => {
    expect(bydelFromCoordinates(58.969, 5.733)).toBeNull();
  });

  it("returns null for non-finite coordinates", () => {
    expect(bydelFromCoordinates(Number.NaN, 10.75)).toBeNull();
    expect(bydelFromCoordinates(59.91, Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("always returns a name with crime data attached", () => {
    // Walk a small grid inside Oslo — every result must resolve to a known
    // crime entry so the fallback path never produces a dangling name.
    for (let lat = 59.82; lat <= 60.00; lat += 0.04) {
      for (let lon = 10.55; lon <= 10.95; lon += 0.08) {
        const name = bydelFromCoordinates(lat, lon);
        expect(name).not.toBeNull();
        expect(OSLO_BYDEL_CRIME[name as string]).toBeDefined();
      }
    }
  });
});
