import { describe, it, expect } from "vitest";
import { getKeyDataBullets } from "@/lib/buildKeyDataBullets";
import type { PropertyReportSummary } from "@/lib/propertyReportSummary";

function summary(overrides: Partial<PropertyReportSummary> = {}): PropertyReportSummary {
  const empty: PropertyReportSummary = {
    verdiestimat: "Ingen data",
    manedskostnad: "Ingen data",
    prisstatistikk: "Ingen data",
    kollektiv: "Ingen data",
    skoler: "Ingen data",
    klimarisiko: "Ingen data",
    stoy: "Ingen data",
    luftkvalitet: "Ingen data",
    bredband: "Ingen data",
    energi: "Ingen data",
    eiendomsskatt: "Ingen data",
    kriminalitet: "Ingen data",
    demografi: "Ingen data",
  };
  return { ...empty, ...overrides };
}

describe("getKeyDataBullets", () => {
  it("returns an empty array when every section is 'Ingen data'", () => {
    expect(getKeyDataBullets(summary())).toEqual([]);
  });

  it("combines sqm price and yoy change into a single price bullet when both present", () => {
    const bullets = getKeyDataBullets(
      summary({
        verdiestimat: "~6.2 MNOK · 97 979 kr/m²",
        prisstatistikk: "+3.2% siste år · Oslo kommune",
      }),
    );
    expect(bullets).toContain("Kvadratmeterpris 97 979 kr/m² (+3,2 % siste år)");
  });

  it("falls back to price-only bullet when yoy is missing", () => {
    const bullets = getKeyDataBullets(
      summary({ verdiestimat: "97 979 kr/m² i området" }),
    );
    expect(bullets).toContain("Kvadratmeterpris 97 979 kr/m² i området");
  });

  it("falls back to yoy-only bullet when sqm price is missing", () => {
    const bullets = getKeyDataBullets(
      summary({ prisstatistikk: "-1.5% siste år · Nasjonalt snitt" }),
    );
    expect(bullets).toContain("Prisutvikling -1,5 % siste år");
  });

  it("extracts transit journey time from kollektiv", () => {
    const bullets = getKeyDataBullets(
      summary({ kollektiv: "34 min til Oslo S · via Nationaltheatret" }),
    );
    expect(bullets).toContain("34 min til Oslo S med kollektiv");
  });

  it("falls back to nearest stop format when kollektiv is stop-only", () => {
    const bullets = getKeyDataBullets(
      summary({ kollektiv: "Jernbanetorget · 180 m" }),
    );
    expect(bullets).toContain("Nærmeste holdeplass Jernbanetorget (180 m)");
  });

  it("surfaces crime relative to snittet", () => {
    const bullets = getKeyDataBullets(
      summary({ kriminalitet: "Bydel Gamle Oslo · 28.1 per 1 000 · 15% over Oslo-snittet" }),
    );
    expect(bullets).toContain("Kriminalitet 15 % over Oslo-snittet");
  });

  it("surfaces klimarisiko only when Høy flood or Kvikkleire is present", () => {
    expect(getKeyDataBullets(summary({ klimarisiko: "Flom: Lav" }))).toEqual([]);
    const high = getKeyDataBullets(summary({ klimarisiko: "Flom: Høy · Kvikkleire" }));
    expect(high).toContain("Området er registrert med høy flomrisiko og kvikkleiresone");
  });

  it("surfaces støy only when >=65 dB", () => {
    expect(getKeyDataBullets(summary({ stoy: "Vei 55 dB" }))).toEqual([]);
    expect(getKeyDataBullets(summary({ stoy: "Ingen støy registrert" }))).toEqual([]);
    const loud = getKeyDataBullets(summary({ stoy: "Vei 68 dB" }));
    expect(loud).toContain("Forhøyet veistøy målt til 68 dB");
  });

  it("fills with nearest school only when under 5 bullets and data is present", () => {
    const bullets = getKeyDataBullets(
      summary({
        prisstatistikk: "+2.0% siste år · Oslo kommune",
        kollektiv: "10 min til Oslo S",
        kriminalitet: "5% under snittet",
        skoler: "Kampen skole · 412 m",
      }),
    );
    expect(bullets).toContain("Nærmeste skole Kampen skole (412 m unna)");
  });

  it("caps at 5 bullets even when every section is populated", () => {
    const bullets = getKeyDataBullets(
      summary({
        verdiestimat: "~6.0 MNOK · 80 000 kr/m²",
        prisstatistikk: "+5.0% siste år · Oslo kommune",
        kollektiv: "12 min til Oslo S",
        kriminalitet: "20% over snittet",
        klimarisiko: "Flom: Høy · Kvikkleire",
        stoy: "Vei 72 dB",
        skoler: "Kampen skole · 300 m",
      }),
    );
    expect(bullets.length).toBeLessThanOrEqual(5);
  });
});
