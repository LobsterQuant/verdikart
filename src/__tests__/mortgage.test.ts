import { describe, it, expect } from "vitest";
import {
  calculateMonthlyPayment,
  getStressRate,
  calculateMonthlyCost,
} from "@/lib/finance/mortgage";

describe("calculateMonthlyPayment", () => {
  it("gives a sane annuity figure for 2 MNOK @ 5,3% over 25 år", () => {
    // Nordea's public eksempelrente table shows ~11 800–12 300 kr for this
    // loan — sanity-check the annuity math is in the right ballpark.
    const result = calculateMonthlyPayment(2_000_000, 0.053, 25);
    expect(result).toBeGreaterThan(11_500);
    expect(result).toBeLessThan(12_500);
  });

  it("returns 0 for zero loan amount", () => {
    expect(calculateMonthlyPayment(0, 0.05, 25)).toBe(0);
  });

  it("returns 0 for zero or negative years", () => {
    expect(calculateMonthlyPayment(1_000_000, 0.05, 0)).toBe(0);
    expect(calculateMonthlyPayment(1_000_000, 0.05, -5)).toBe(0);
  });

  it("splits principal evenly when rate is 0", () => {
    // 1 MNOK / (10 × 12) = 8 333,33 → rounded 8 333
    expect(calculateMonthlyPayment(1_000_000, 0, 10)).toBe(8_333);
  });
});

describe("getStressRate", () => {
  it("returns the flat Finanstilsynet-stresstest", () => {
    expect(getStressRate()).toBeCloseTo(0.07, 10);
  });
});

describe("calculateMonthlyCost", () => {
  it("computes a full breakdown for a realistic purchase", () => {
    const result = calculateMonthlyCost({
      purchasePrice: 5_000_000,
      equityPercent: 0.15,
      loanYears: 25,
      felleskostnader: 3_500,
      eiendomsskatt: 500,
    });

    expect(result.loanAmount).toBe(4_250_000);
    // Mortgage between 24k–27k for this loan at 5,3% over 25 år
    expect(result.mortgageMonthly).toBeGreaterThan(24_000);
    expect(result.mortgageMonthly).toBeLessThan(27_000);
    // Stressed (7,0%) should exceed nominal
    expect(result.mortgageStressed).toBeGreaterThan(result.mortgageMonthly);
    // Total = mortgage + felles + skatt
    expect(result.totalMonthly).toBe(result.mortgageMonthly + 3_500 + 500);
    expect(result.totalStressed).toBe(result.mortgageStressed + 3_500 + 500);
    // Rates returned for display
    expect(result.rate).toBeCloseTo(0.053, 10);
    expect(result.stressRate).toBeCloseTo(0.07, 10);
  });

  it("handles zero eiendomsskatt communes cleanly", () => {
    const result = calculateMonthlyCost({
      purchasePrice: 3_000_000,
      equityPercent: 0.20,
      loanYears: 30,
      felleskostnader: 2_500,
      eiendomsskatt: 0,
    });
    expect(result.eiendomsskatt).toBe(0);
    expect(result.totalMonthly).toBe(result.mortgageMonthly + 2_500);
  });
});
