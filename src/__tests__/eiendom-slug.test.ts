import { describe, it, expect } from "vitest";
import { parseEiendomSlug, isValidEiendomSlug } from "@/lib/eiendom-slug";

describe("parseEiendomSlug — the ai-summary cache-key trust root", () => {
  it("returns lat/lon/kommunenummer decoded from the slug suffix", () => {
    // Matches chip slug for Karl Johans gate 1, Oslo — the same lat/lon that
    // HeroMap pins to, so the trust root has an end-to-end anchor.
    expect(parseEiendomSlug("karl-johans-gate-1--599114-107494-0301")).toEqual({
      lat: 59.9114,
      lon: 10.7494,
      kommunenummer: "0301",
    });

    expect(parseEiendomSlug("bryggen-1-bergen--603971-53215-4601")).toEqual({
      lat: 60.3971,
      lon: 5.3215,
      kommunenummer: "4601",
    });
  });

  it("handles negative longitudes", () => {
    // Not a real Norwegian location, but the regex supports it — guard against
    // accidental breakage if someone later decides to encode negative coords.
    expect(parseEiendomSlug("svalbard-outpost--781234--155678-2100")).toEqual({
      lat: 78.1234,
      lon: -15.5678,
      kommunenummer: "2100",
    });
  });

  it("returns null for slugs without the canonical suffix", () => {
    expect(parseEiendomSlug("karl-johans-gate-1")).toBeNull();
    expect(parseEiendomSlug("no-suffix-at-all")).toBeNull();
    expect(parseEiendomSlug("")).toBeNull();
    expect(parseEiendomSlug("karl-johans-gate-1--599114-107494")).toBeNull(); // missing knr
  });

  it("rejects a 5-digit kommunenummer — prevents silent extraction of garbage", () => {
    expect(parseEiendomSlug("foo--599114-107494-03011")).toBeNull();
  });

  it("is a pure function of the slug — body fields cannot influence it", () => {
    // Security invariant for /api/ai-summary: whatever the POST body contains,
    // the lat/lon/kommunenummer fed into the prompt and the cache-key path
    // must be fixed by the slug alone. Any drift means the cache is once
    // again poisonable. If this test ever needs to accept extra parameters,
    // stop and reconsider — the invariant is gone.
    const slug = "karl-johans-gate-1--599114-107494-0301";
    const a = parseEiendomSlug(slug);
    const b = parseEiendomSlug(slug);
    expect(a).toEqual(b);
    expect(parseEiendomSlug.length).toBe(1);
  });

  it("agrees with isValidEiendomSlug on acceptance", () => {
    const valid = "torget-2-trondheim--634306-103952-5001";
    const invalid = "torget-2-trondheim";
    expect(isValidEiendomSlug(valid)).toBe(true);
    expect(parseEiendomSlug(valid)).not.toBeNull();
    expect(isValidEiendomSlug(invalid)).toBe(false);
    expect(parseEiendomSlug(invalid)).toBeNull();
  });
});
