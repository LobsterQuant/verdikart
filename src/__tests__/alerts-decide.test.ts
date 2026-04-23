import { describe, it, expect } from "vitest";
import { decideAlert } from "@/lib/alerts/logic";

describe("decideAlert", () => {
  describe("initialize branch", () => {
    it("returns initialize when lastKnownValue is null", () => {
      const d = decideAlert({ lastKnownValue: null, currentValue: 80_000, thresholdPct: 5 });
      expect(d.action).toBe("initialize");
      expect(d.changePct).toBeNull();
    });

    it("returns initialize when lastKnownValue is zero (guard against division-by-zero)", () => {
      const d = decideAlert({ lastKnownValue: 0, currentValue: 80_000, thresholdPct: 5 });
      expect(d.action).toBe("initialize");
    });

    it("returns initialize when lastKnownValue is negative (defensive)", () => {
      const d = decideAlert({ lastKnownValue: -100, currentValue: 80_000, thresholdPct: 5 });
      expect(d.action).toBe("initialize");
    });
  });

  describe("notify branch", () => {
    it("notifies when change equals threshold exactly (inclusive boundary)", () => {
      const d = decideAlert({ lastKnownValue: 100_000, currentValue: 105_000, thresholdPct: 5 });
      expect(d.action).toBe("notify");
      expect(d.changePct).toBe(5);
    });

    it("notifies on positive change above threshold", () => {
      const d = decideAlert({ lastKnownValue: 100_000, currentValue: 108_000, thresholdPct: 5 });
      expect(d.action).toBe("notify");
      expect(d.changePct).toBe(8);
    });

    it("notifies on negative change above threshold (magnitude, not sign)", () => {
      const d = decideAlert({ lastKnownValue: 100_000, currentValue: 92_000, thresholdPct: 5 });
      expect(d.action).toBe("notify");
      expect(d.changePct).toBe(-8);
    });

    it("rounds changePct to one decimal", () => {
      const d = decideAlert({ lastKnownValue: 100_000, currentValue: 105_678, thresholdPct: 5 });
      expect(d.action).toBe("notify");
      expect(d.changePct).toBe(5.7);
    });
  });

  describe("skip branch", () => {
    it("skips when change is below threshold", () => {
      const d = decideAlert({ lastKnownValue: 100_000, currentValue: 104_000, thresholdPct: 5 });
      expect(d.action).toBe("skip");
      expect(d.changePct).toBe(4);
    });

    it("skips when change is zero", () => {
      const d = decideAlert({ lastKnownValue: 100_000, currentValue: 100_000, thresholdPct: 5 });
      expect(d.action).toBe("skip");
      expect(d.changePct).toBe(0);
    });

    it("skips just below threshold (4.9% < 5%)", () => {
      const d = decideAlert({ lastKnownValue: 100_000, currentValue: 104_900, thresholdPct: 5 });
      expect(d.action).toBe("skip");
    });
  });

  describe("custom thresholds", () => {
    it("honors a 10% threshold", () => {
      const below = decideAlert({
        lastKnownValue: 100_000,
        currentValue: 108_000,
        thresholdPct: 10,
      });
      expect(below.action).toBe("skip");

      const at = decideAlert({
        lastKnownValue: 100_000,
        currentValue: 110_000,
        thresholdPct: 10,
      });
      expect(at.action).toBe("notify");
    });

    it("honors a tiny threshold (0.5%)", () => {
      const d = decideAlert({
        lastKnownValue: 100_000,
        currentValue: 100_600,
        thresholdPct: 0.5,
      });
      expect(d.action).toBe("notify");
      expect(d.changePct).toBe(0.6);
    });
  });
});
