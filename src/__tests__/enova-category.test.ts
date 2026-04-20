import { describe, it, expect } from "vitest";
import {
  classifyCategory,
  isResidentialCategory,
  isMixedUseCategory,
} from "@/lib/enova/category";

describe("classifyCategory", () => {
  it("treats missing kategori as residential (unknown default)", () => {
    expect(classifyCategory(null)).toBe("residential");
    expect(classifyCategory(undefined)).toBe("residential");
    expect(classifyCategory("")).toBe("residential");
  });

  it("classifies Småhus and Bolig variants as residential", () => {
    expect(classifyCategory("Småhus")).toBe("residential");
    expect(classifyCategory("Boligblokk")).toBe("residential");
    expect(classifyCategory("småhus")).toBe("residential");
  });

  it("classifies Forretningsbygg and Kombinasjonsbygg as mixed-use", () => {
    expect(classifyCategory("Forretningsbygg")).toBe("mixed-use");
    expect(classifyCategory("Kombinasjonsbygg")).toBe("mixed-use");
    expect(classifyCategory("forretningsbygg")).toBe("mixed-use");
  });

  it("classifies other næringsbygg as commercial", () => {
    expect(classifyCategory("Kontorbygg")).toBe("commercial");
    expect(classifyCategory("Hoteller")).toBe("commercial");
    expect(classifyCategory("Skole")).toBe("commercial");
    expect(classifyCategory("Sykehus")).toBe("commercial");
    expect(classifyCategory("Industri")).toBe("commercial");
  });
});

describe("isResidentialCategory / isMixedUseCategory", () => {
  it("isResidentialCategory stays true for null (backward-compatible default)", () => {
    expect(isResidentialCategory(null)).toBe(true);
    expect(isResidentialCategory("Boligblokk")).toBe(true);
    expect(isResidentialCategory("Forretningsbygg")).toBe(false);
    expect(isResidentialCategory("Kontorbygg")).toBe(false);
  });

  it("isMixedUseCategory flags only Forretningsbygg/Kombinasjonsbygg", () => {
    expect(isMixedUseCategory("Forretningsbygg")).toBe(true);
    expect(isMixedUseCategory("Kombinasjonsbygg")).toBe(true);
    expect(isMixedUseCategory("Boligblokk")).toBe(false);
    expect(isMixedUseCategory("Kontorbygg")).toBe(false);
    expect(isMixedUseCategory(null)).toBe(false);
  });
});
