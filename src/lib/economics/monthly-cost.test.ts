import { describe, it, expect } from "vitest";
import {
  defaultAreaForBuildingType,
  buildingTypeFromEnovaKategori,
  kommuneCategoryFromPopulation,
  resolveKommuneCategory,
  estimatedMunicipalFees,
  calculateMonthlyCost,
  roundToNearest100,
} from "./monthly-cost";

describe("defaultAreaForBuildingType", () => {
  it("matches documented defaults per building type", () => {
    expect(defaultAreaForBuildingType("enebolig")).toBe(140);
    expect(defaultAreaForBuildingType("rekkehus")).toBe(110);
    expect(defaultAreaForBuildingType("tomannsbolig")).toBe(120);
    expect(defaultAreaForBuildingType("leilighet")).toBe(65);
    expect(defaultAreaForBuildingType("fritidsbolig")).toBe(75);
    expect(defaultAreaForBuildingType("unknown")).toBe(75);
  });
});

describe("buildingTypeFromEnovaKategori", () => {
  it("maps Enova strings to building types", () => {
    expect(buildingTypeFromEnovaKategori("Blokk - Flerfamiliehus")).toBe("leilighet");
    expect(buildingTypeFromEnovaKategori("Småhus - Enebolig")).toBe("enebolig");
    expect(buildingTypeFromEnovaKategori("Småhus - Rekkehus")).toBe("rekkehus");
    expect(buildingTypeFromEnovaKategori("Småhus - Tomannsbolig")).toBe("tomannsbolig");
    expect(buildingTypeFromEnovaKategori("Fritidsbolig")).toBe("fritidsbolig");
    expect(buildingTypeFromEnovaKategori(null)).toBe("unknown");
    expect(buildingTypeFromEnovaKategori(undefined)).toBe("unknown");
    expect(buildingTypeFromEnovaKategori("Kontorbygg")).toBe("unknown");
  });
});

describe("kommuneCategoryFromPopulation", () => {
  it("handles tier boundary conditions exactly", () => {
    expect(kommuneCategoryFromPopulation(19_999)).toBe("distrikt");
    expect(kommuneCategoryFromPopulation(20_000)).toBe("mellomby");
    expect(kommuneCategoryFromPopulation(99_999)).toBe("mellomby");
    expect(kommuneCategoryFromPopulation(100_000)).toBe("storby");
  });

  it("treats missing population as distrikt", () => {
    expect(kommuneCategoryFromPopulation(null)).toBe("distrikt");
  });
});

describe("resolveKommuneCategory", () => {
  it("returns storby for all 8 designated storby-kommuner regardless of population", () => {
    expect(resolveKommuneCategory("0301")).toBe("storby"); // Oslo
    expect(resolveKommuneCategory("4601")).toBe("storby"); // Bergen
    expect(resolveKommuneCategory("5001")).toBe("storby"); // Trondheim
    expect(resolveKommuneCategory("1103")).toBe("storby"); // Stavanger
    expect(resolveKommuneCategory("3005")).toBe("storby"); // Drammen
    expect(resolveKommuneCategory("4204")).toBe("storby"); // Kristiansand
    expect(resolveKommuneCategory("3004")).toBe("storby"); // Fredrikstad (<100k pop)
    expect(resolveKommuneCategory("5401")).toBe("storby"); // Tromsø (<100k pop)
  });

  it("returns mellomby for medium kommunes in population file", () => {
    expect(resolveKommuneCategory("1507")).toBe("mellomby"); // Ålesund ~67k
    expect(resolveKommuneCategory("3403")).toBe("mellomby"); // Hamar ~32k
  });

  it("returns distrikt for unknown kommune numbers", () => {
    expect(resolveKommuneCategory("9999")).toBe("distrikt");
  });
});

describe("estimatedMunicipalFees", () => {
  it("returns documented tier amounts", () => {
    expect(estimatedMunicipalFees("storby")).toBe(1800);
    expect(estimatedMunicipalFees("mellomby")).toBe(1500);
    expect(estimatedMunicipalFees("distrikt")).toBe(2200);
  });
});

describe("calculateMonthlyCost", () => {
  it("produces realistic figures for an Oslo leilighet 65 m² @ stress 7%", () => {
    const osloSqmPrice = 90_000;
    const area = 65;
    const propertyValue = osloSqmPrice * area;
    const result = calculateMonthlyCost({
      propertyValue,
      area,
      rate: 0.07,
      equityPct: 0.15,
      termYears: 25,
      municipalFees: 1800,
      maintenancePct: 0.01,
    });
    expect(result.loanAmount).toBeCloseTo(propertyValue * 0.85, 0);
    expect(result.loanPayment).toBeGreaterThan(30_000);
    expect(result.loanPayment).toBeLessThan(40_000);
    expect(result.municipalFees).toBe(1800);
    expect(result.maintenance).toBeCloseTo((propertyValue * 0.01) / 12, 2);
    expect(result.total).toBeCloseTo(
      result.loanPayment + result.municipalFees + result.maintenance,
      2,
    );
  });

  it("produces realistic figures for a Bergen enebolig 140 m² @ current rate", () => {
    const bergenSqmPrice = 55_000;
    const area = 140;
    const propertyValue = bergenSqmPrice * area;
    const result = calculateMonthlyCost({
      propertyValue,
      area,
      rate: 0.053,
      equityPct: 0.15,
      termYears: 25,
      municipalFees: 1800,
      maintenancePct: 0.01,
    });
    expect(result.loanPayment).toBeGreaterThan(35_000);
    expect(result.loanPayment).toBeLessThan(45_000);
  });

  it("stress-test rate produces higher monthly than current rate on same property", () => {
    const shared = {
      propertyValue: 5_000_000,
      area: 75,
      equityPct: 0.15,
      termYears: 25,
      municipalFees: 1800,
      maintenancePct: 0.01,
    };
    const current = calculateMonthlyCost({ ...shared, rate: 0.053 });
    const stressed = calculateMonthlyCost({ ...shared, rate: 0.07 });
    expect(stressed.loanPayment).toBeGreaterThan(current.loanPayment);
    expect(stressed.total).toBeGreaterThan(current.total);
  });

  it("handles zero rate without NaN", () => {
    const result = calculateMonthlyCost({
      propertyValue: 3_000_000,
      area: 75,
      rate: 0,
      equityPct: 0.15,
      termYears: 25,
      municipalFees: 1500,
      maintenancePct: 0.01,
    });
    expect(Number.isFinite(result.loanPayment)).toBe(true);
    expect(result.loanPayment).toBeGreaterThan(0);
  });
});

describe("roundToNearest100", () => {
  it("rounds to nearest hundred", () => {
    expect(roundToNearest100(28_437)).toBe(28_400);
    expect(roundToNearest100(28_450)).toBe(28_500);
    expect(roundToNearest100(28_449)).toBe(28_400);
    expect(roundToNearest100(100)).toBe(100);
    expect(roundToNearest100(49)).toBe(0);
    expect(roundToNearest100(50)).toBe(100);
  });
});
