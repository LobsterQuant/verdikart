import { describe, it, expect } from "vitest";
import { nearestCity, CITY_CENTERS } from "@/lib/cities";

describe("nearestCity", () => {
  it("finds Oslo for coordinates in Oslo", () => {
    const city = nearestCity(59.92, 10.75);
    expect(city.name).toBe("Oslo sentrum");
  });

  it("finds Bergen for coordinates in Bergen", () => {
    const city = nearestCity(60.39, 5.33);
    expect(city.name).toBe("Bergen sentrum");
  });

  it("finds Tromsø for far north coordinates", () => {
    const city = nearestCity(69.65, 18.96);
    expect(city.name).toBe("Tromsø sentrum");
  });

  it("finds Stavanger for southwest coordinates", () => {
    const city = nearestCity(58.97, 5.73);
    expect(city.name).toBe("Stavanger sentrum");
  });
});

describe("CITY_CENTERS", () => {
  it("has 20 cities", () => {
    expect(CITY_CENTERS.length).toBe(20);
  });

  it("all have valid coordinates", () => {
    for (const city of CITY_CENTERS) {
      expect(city.lat).toBeGreaterThan(55);
      expect(city.lat).toBeLessThan(72);
      expect(city.lon).toBeGreaterThan(4);
      expect(city.lon).toBeLessThan(32);
    }
  });
});
