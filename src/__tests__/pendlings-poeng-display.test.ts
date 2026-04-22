import { describe, it, expect } from "vitest";
import {
  bandForScore,
  bucketForScore,
  fmtKr,
  fmtMeters,
  fmtMinutes,
  fmtPerHour,
  fmtTransfers,
  isNoTransitResult,
} from "@/lib/scoring/pendlings-poeng-display";
import type { PendlingsPoengResult } from "@/lib/scoring/pendlings-poeng";
import { WORK_CENTERS } from "@/lib/scoring/work-centers";

const OSLO = WORK_CENTERS[0];

function result(total: number, overrides: Partial<PendlingsPoengResult> = {}): PendlingsPoengResult {
  return {
    total,
    center: OSLO,
    components: {
      doorToDoorMinutes: 30,
      doorToDoorScore: 80,
      frequencyPerHour: 6,
      frequencyScore: 80,
      walkDistanceMeters: 300,
      walkDistanceScore: 90,
      transfers: 1,
      transfersScore: 70,
      monthlyPriceNok: 900,
      monthlyPriceScore: 100,
    },
    weights: { time: 0.35, freq: 0.25, walk: 0.15, transfers: 0.15, cost: 0.10 },
    rushHourTested: true,
    dataSource: { transit: "entur", pricing: "static" },
    calculatedAt: "2026-04-22T12:00:00.000Z",
    ...overrides,
  };
}

describe("bandForScore", () => {
  it("maps the 5 ranges per spec", () => {
    expect(bandForScore(100)).toBe("Utmerket");
    expect(bandForScore(85)).toBe("Utmerket");
    expect(bandForScore(84)).toBe("Bra");
    expect(bandForScore(70)).toBe("Bra");
    expect(bandForScore(69)).toBe("OK");
    expect(bandForScore(55)).toBe("OK");
    expect(bandForScore(54)).toBe("Svak");
    expect(bandForScore(35)).toBe("Svak");
    expect(bandForScore(34)).toBe("Svært svak");
    expect(bandForScore(0)).toBe("Svært svak");
  });
});

describe("bucketForScore", () => {
  it("maps to Plausible bucket labels", () => {
    expect(bucketForScore(100)).toBe("85-100");
    expect(bucketForScore(85)).toBe("85-100");
    expect(bucketForScore(84)).toBe("70-84");
    expect(bucketForScore(70)).toBe("70-84");
    expect(bucketForScore(69)).toBe("55-69");
    expect(bucketForScore(55)).toBe("55-69");
    expect(bucketForScore(54)).toBe("35-54");
    expect(bucketForScore(35)).toBe("35-54");
    expect(bucketForScore(34)).toBe("0-34");
    expect(bucketForScore(0)).toBe("0-34");
  });
});

describe("Norwegian formatters", () => {
  it("formats meters with km cut-off", () => {
    expect(fmtMeters(150)).toBe("150 m");
    expect(fmtMeters(999)).toBe("999 m");
    expect(fmtMeters(1000)).toBe("1 km");
    expect(fmtMeters(1234)).toBe("1,2 km");
  });

  it("formats minutes rounded", () => {
    expect(fmtMinutes(0)).toBe("0 min");
    expect(fmtMinutes(29.4)).toBe("29 min");
    expect(fmtMinutes(30.6)).toBe("31 min");
  });

  it("formats frequency per hour", () => {
    expect(fmtPerHour(0)).toBe("0/time");
    expect(fmtPerHour(0.5)).toBe("0,5/time");
    expect(fmtPerHour(6)).toBe("6/time");
    expect(fmtPerHour(8.4)).toBe("8/time");
  });

  it("formats NOK with nb-NO thousand separator", () => {
    expect(fmtKr(900)).toBe("900 kr");
    expect(fmtKr(1200)).toMatch(/1[\s  ]?200 kr/);
  });

  it("formats transfers in Norwegian", () => {
    expect(fmtTransfers(0)).toBe("Direkte");
    expect(fmtTransfers(1)).toBe("1 bytte");
    expect(fmtTransfers(2)).toBe("2 bytter");
    expect(fmtTransfers(3)).toBe("3 bytter");
  });
});

describe("isNoTransitResult", () => {
  it("detects no-transit zero score", () => {
    expect(
      isNoTransitResult(
        result(0, {
          rushHourTested: false,
          components: {
            doorToDoorMinutes: 0,
            doorToDoorScore: 0,
            frequencyPerHour: 0,
            frequencyScore: 0,
            walkDistanceMeters: 0,
            walkDistanceScore: 0,
            transfers: 0,
            transfersScore: 0,
            monthlyPriceNok: 1100,
            monthlyPriceScore: 85,
          },
        }),
      ),
    ).toBe(true);
  });

  it("low but non-zero score is not flagged as no-transit", () => {
    // e.g. Geilo: long trip, few departures, but transit exists.
    expect(
      isNoTransitResult(
        result(18, {
          components: {
            doorToDoorMinutes: 180,
            doorToDoorScore: 0,
            frequencyPerHour: 1,
            frequencyScore: 10,
            walkDistanceMeters: 400,
            walkDistanceScore: 80,
            transfers: 2,
            transfersScore: 40,
            monthlyPriceNok: 1100,
            monthlyPriceScore: 85,
          },
        }),
      ),
    ).toBe(false);
  });

  it("perfect score is not no-transit", () => {
    expect(isNoTransitResult(result(95))).toBe(false);
  });
});
