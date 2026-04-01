import { describe, it, expect } from "vitest";
import { haversineKm, haversineM } from "@/lib/geo";

describe("haversineKm", () => {
  it("returns 0 for same point", () => {
    expect(haversineKm(59.91, 10.75, 59.91, 10.75)).toBe(0);
  });

  it("calculates Oslo to Bergen ~305 km", () => {
    const d = haversineKm(59.9109, 10.7502, 60.3893, 5.3320);
    expect(d).toBeGreaterThan(300);
    expect(d).toBeLessThan(310);
  });

  it("calculates Oslo to Trondheim ~390 km", () => {
    const d = haversineKm(59.9109, 10.7502, 63.4362, 10.3984);
    expect(d).toBeGreaterThan(385);
    expect(d).toBeLessThan(395);
  });
});

describe("haversineM", () => {
  it("returns meters (1000x km)", () => {
    const km = haversineKm(59.91, 10.75, 59.92, 10.75);
    const m = haversineM(59.91, 10.75, 59.92, 10.75);
    expect(m).toBeCloseTo(km * 1000, 1);
  });

  it("short distance: ~111m for 0.001 degree lat", () => {
    const m = haversineM(59.91, 10.75, 59.911, 10.75);
    expect(m).toBeGreaterThan(100);
    expect(m).toBeLessThan(120);
  });
});
