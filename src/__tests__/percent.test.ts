import { describe, it, expect } from "vitest";
import { roundBarWidth } from "@/lib/percent";

describe("roundBarWidth", () => {
  it("clamps floating-point noise to 1 decimal", () => {
    expect(roundBarWidth(87.12500000000001)).toBe(87.1);
    expect(roundBarWidth(34.57142857142857)).toBe(34.6);
    expect(roundBarWidth(38.266666666666666)).toBe(38.3);
    expect(roundBarWidth(62.13333333333334)).toBe(62.1);
  });

  it("passes integers through unchanged", () => {
    expect(roundBarWidth(0)).toBe(0);
    expect(roundBarWidth(50)).toBe(50);
    expect(roundBarWidth(100)).toBe(100);
  });

  it("falls back to 0 for non-finite input", () => {
    expect(roundBarWidth(Number.NaN)).toBe(0);
    expect(roundBarWidth(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it("rendered widths contain no 5+ digit decimals", () => {
    // Fixture mirrors real SSB data ratios that previously leaked
    // "87.12500000000001%" into the DemographicsCard bar widths.
    const noisy = [
      (21.7 / 35) * 100,
      ((100 - 21.7 - 14.8) / 80) * 100,
      (14.8 / 35) * 100,
    ];
    for (const pct of noisy) {
      const rendered = `${roundBarWidth(pct)}%`;
      expect(rendered).not.toMatch(/\.\d{5,}%/);
    }
  });
});
