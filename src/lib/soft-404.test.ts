import { describe, expect, it } from "vitest";
import { isValidEiendomSlug } from "./eiendom-slug";
import { getAllSlugs } from "@/app/blogg/posts";
import { allCitySlugs } from "@/app/by/[city]/cityData";
import { getAllBydelSlugs } from "@/app/by/oslo/[bydel]/bydelData";
import { getAllAreaSlugs } from "@/app/nabolag/[area]/areaData";

// Audit C-NEW-2 (2026-04-20): invalid dynamic slugs must 404, not soft-404.
// This tests the inputs to the two mechanisms that guarantee that:
//  • static routes (blogg/by/bydel/nabolag) rely on `dynamicParams = false`
//    plus generateStaticParams — anything outside the prerendered set 404s.
//  • /eiendom/[slug] relies on middleware edge-rejecting malformed slugs.

describe("soft-404 (C-NEW-2)", () => {
  describe("eiendom slug validation", () => {
    it("rejects five known-invalid slugs", () => {
      const invalid = [
        "denne-finnes-ikke-xyz123",
        "fake-address",
        "oslo-sentrum",
        "bygdoy-alle-2",
        "just-random-text-no-coords",
      ];
      for (const slug of invalid) {
        expect(isValidEiendomSlug(slug), `expected invalid: ${slug}`).toBe(false);
      }
    });

    it("accepts five well-formed slugs", () => {
      const valid = [
        "bygdoy-alle--5993-1069-0301",
        "karl-johans-gate-1--5991-1075-0301",
        "torggata-5--5992-1074-0301",
        "a--5993-1069-4601",
        "negative-lon--5993--1069-0301",
      ];
      for (const slug of valid) {
        expect(isValidEiendomSlug(slug), `expected valid: ${slug}`).toBe(true);
      }
    });
  });

  describe("static-route datasets (dynamicParams=false relies on these)", () => {
    it("blogg has known-good slugs", () => {
      const slugs = getAllSlugs().map((s) => s.slug);
      expect(slugs).toContain("hva-sjekke-for-boligkjop");
      expect(slugs.length).toBeGreaterThan(10);
    });

    it("by has known-good city slugs", () => {
      expect(allCitySlugs).toContain("oslo");
      expect(allCitySlugs).toContain("bergen");
    });

    it("by/oslo has known-good bydel slugs", () => {
      const slugs = getAllBydelSlugs().map((s) => s.bydel);
      expect(slugs).toContain("frogner");
      expect(slugs).toContain("grunerlokka");
    });

    it("nabolag has known-good area slugs", () => {
      const slugs = getAllAreaSlugs().map((s) => s.area);
      expect(slugs).toContain("frogner");
      expect(slugs).toContain("majorstuen");
    });
  });
});
