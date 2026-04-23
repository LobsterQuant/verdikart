import { describe, it, expect } from "vitest";
import {
  scoreFlom,
  scoreKvikkleire,
  scoreSkred,
  scoreStormflo,
  scoreRadon,
  scoreTemperaturendring,
  scoreNedbørendring,
  scoreRisikoBucket,
  scoreKlimaprofil,
  composeTotal,
  calculateKlimaPoeng,
  NveWmsError,
  WEIGHTS,
  WEIGHTS_NO_RADON,
  type KlimaPoengComponents,
  type SkredLayers,
  type StormSurgeZones,
} from "./klima-poeng";
import { klimaprofilByFylke } from "@/data/klimaprofil";
import { resolveKlimaprofilKey } from "@/data/fylke-mapping";

/* ═══════════════════════════════════════════════════════════════════════
 * Component scoring — pure functions
 * ═══════════════════════════════════════════════════════════════════════ */

describe("scoreFlom", () => {
  it("maps risk levels to expected scores", () => {
    expect(scoreFlom("Lav")).toBe(100);
    expect(scoreFlom("Ukjent")).toBe(60);
    expect(scoreFlom("Moderat")).toBe(40);
    expect(scoreFlom("Høy")).toBe(0);
  });
});

describe("scoreKvikkleire", () => {
  it("binary flip between inside and outside", () => {
    expect(scoreKvikkleire(false)).toBe(100);
    expect(scoreKvikkleire(true)).toBe(0);
  });
});

describe("scoreSkred", () => {
  const none: SkredLayers = { jordflom: false, steinsprang: false, snoskred: false };

  it("zero layers inside → 100", () => {
    expect(scoreSkred(none)).toBe(100);
  });

  it("exactly one layer inside → 50 (regardless of which)", () => {
    expect(scoreSkred({ ...none, jordflom: true })).toBe(50);
    expect(scoreSkred({ ...none, steinsprang: true })).toBe(50);
    expect(scoreSkred({ ...none, snoskred: true })).toBe(50);
  });

  it("two layers inside → 20", () => {
    expect(scoreSkred({ jordflom: true, steinsprang: true, snoskred: false })).toBe(20);
    expect(scoreSkred({ jordflom: true, steinsprang: false, snoskred: true })).toBe(20);
    expect(scoreSkred({ jordflom: false, steinsprang: true, snoskred: true })).toBe(20);
  });

  it("three layers inside → 20 (same floor as two)", () => {
    expect(scoreSkred({ jordflom: true, steinsprang: true, snoskred: true })).toBe(20);
  });
});

describe("scoreStormflo", () => {
  const OUTSIDE: StormSurgeZones = {
    in20YearCurrent: false,
    in200Year2100: false,
    in1000Year2100: false,
  };

  it("outside all zones → 100", () => {
    expect(scoreStormflo(OUTSIDE)).toBe(100);
  });

  it("1000-year 2100 only → 70", () => {
    expect(scoreStormflo({ ...OUTSIDE, in1000Year2100: true })).toBe(70);
  });

  it("200-year 2100 (implies 1000-year) → 50", () => {
    expect(scoreStormflo({
      in20YearCurrent: false,
      in200Year2100: true,
      in1000Year2100: true,
    })).toBe(50);
  });

  it("20-year current (implies all) → 0, worst case", () => {
    expect(scoreStormflo({
      in20YearCurrent: true,
      in200Year2100: true,
      in1000Year2100: true,
    })).toBe(0);
  });

  it("20-year current without outer zones still → 0 (worst wins)", () => {
    expect(scoreStormflo({
      in20YearCurrent: true,
      in200Year2100: false,
      in1000Year2100: false,
    })).toBe(0);
  });
});

describe("scoreRadon", () => {
  it("maps known radon levels to expected scores", () => {
    expect(scoreRadon("Lav")).toBe(100);
    expect(scoreRadon("Moderat")).toBe(60);
    expect(scoreRadon("Høy")).toBe(20);
  });
});

describe("scoreTemperaturendring", () => {
  it("hits spec anchors", () => {
    expect(scoreTemperaturendring(3.0)).toBe(100);
    expect(scoreTemperaturendring(3.5)).toBe(85);
    expect(scoreTemperaturendring(4.0)).toBe(70);
    expect(scoreTemperaturendring(4.5)).toBe(55);
    expect(scoreTemperaturendring(5.0)).toBe(40);
    expect(scoreTemperaturendring(5.5)).toBe(25);
    expect(scoreTemperaturendring(6.0)).toBe(10);
  });

  it("clamps below 3 and above 6", () => {
    expect(scoreTemperaturendring(2.0)).toBe(100);
    expect(scoreTemperaturendring(8.0)).toBe(10);
  });

  it("interpolates between anchors", () => {
    expect(scoreTemperaturendring(4.25)).toBeCloseTo(62.5, 5);
  });
});

describe("scoreNedbørendring", () => {
  it("hits spec anchors", () => {
    expect(scoreNedbørendring(5)).toBe(100);
    expect(scoreNedbørendring(10)).toBe(85);
    expect(scoreNedbørendring(15)).toBe(70);
    expect(scoreNedbørendring(20)).toBe(55);
    expect(scoreNedbørendring(25)).toBe(35);
    expect(scoreNedbørendring(30)).toBe(20);
  });

  it("clamps below 5 and above 30", () => {
    expect(scoreNedbørendring(0)).toBe(100);
    expect(scoreNedbørendring(50)).toBe(20);
  });
});

describe("scoreRisikoBucket", () => {
  it("maps three-level buckets to expected scores", () => {
    expect(scoreRisikoBucket("lav")).toBe(100);
    expect(scoreRisikoBucket("moderat")).toBe(60);
    expect(scoreRisikoBucket("høy")).toBe(30);
  });
});

describe("scoreKlimaprofil", () => {
  it("null profile returns neutral 60", () => {
    expect(scoreKlimaprofil(null)).toBe(60);
  });

  it("averages all 5 sub-scores for a known fylke (Finnmark)", () => {
    const finnmark = klimaprofilByFylke["finnmark"];
    // temp 5.5→25, precip 20→55, flom moderat→60, tørke moderat→60, skred moderat→60
    // avg = (25+55+60+60+60)/5 = 52
    expect(scoreKlimaprofil(finnmark)).toBe(52);
  });

  it("averages all 5 sub-scores for a known fylke (Oslo og Akershus)", () => {
    const osloAkershus = klimaprofilByFylke["oslo-og-akershus"];
    // temp 4.0→70, precip 15→70, flom moderat→60, tørke moderat→60, skred moderat→60
    // avg = (70+70+60+60+60)/5 = 64
    expect(scoreKlimaprofil(osloAkershus)).toBe(64);
  });

  it("returns integer in [0, 100]", () => {
    for (const key of Object.keys(klimaprofilByFylke) as Array<keyof typeof klimaprofilByFylke>) {
      const score = scoreKlimaprofil(klimaprofilByFylke[key]);
      expect(Number.isInteger(score)).toBe(true);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

/* ═══════════════════════════════════════════════════════════════════════
 * composeTotal — weighted sum, rounding
 * ═══════════════════════════════════════════════════════════════════════ */

const ZERO_STORM: StormSurgeZones = {
  in20YearCurrent: false,
  in200Year2100: false,
  in1000Year2100: false,
};
const ZERO_SKRED: SkredLayers = {
  jordflom: false,
  steinsprang: false,
  snoskred: false,
};

describe("composeTotal — radon assessed (6-component path)", () => {
  it("uses the documented 20/20/20/15/10/15 weights", () => {
    expect(WEIGHTS).toEqual({
      flood: 0.20,
      quickClay: 0.20,
      skred: 0.20,
      stormSurge: 0.15,
      radon: 0.10,
      klimaprofil: 0.15,
    });
  });

  it("weights sum to 1.0", () => {
    const sum =
      WEIGHTS.flood + WEIGHTS.quickClay + WEIGHTS.skred +
      WEIGHTS.stormSurge + WEIGHTS.radon + WEIGHTS.klimaprofil;
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it("perfect components → 100", () => {
    const all100: KlimaPoengComponents = {
      floodRisk: "Lav", floodScore: 100,
      quickClay: false, quickClayScore: 100,
      skred: ZERO_SKRED, skredScore: 100,
      stormSurge: ZERO_STORM, stormSurgeScore: 100,
      radon: { assessed: true, level: "Lav", score: 100 },
      klimaprofil: null, klimaprofilScore: 100,
    };
    expect(composeTotal(all100)).toBe(100);
  });

  it("worst components → 2 (radon floor at 20 × 0.10)", () => {
    const all0: KlimaPoengComponents = {
      floodRisk: "Høy", floodScore: 0,
      quickClay: true, quickClayScore: 0,
      skred: { jordflom: true, steinsprang: true, snoskred: true }, skredScore: 20,
      stormSurge: { in20YearCurrent: true, in200Year2100: true, in1000Year2100: true },
      stormSurgeScore: 0,
      radon: { assessed: true, level: "Høy", score: 20 },
      klimaprofil: null, klimaprofilScore: 0,
    };
    // 0.20*0 + 0.20*0 + 0.20*20 + 0.15*0 + 0.10*20 + 0.15*0 = 4 + 2 = 6
    expect(composeTotal(all0)).toBe(6);
  });

  it("known mixed case", () => {
    // 0.20*100 + 0.20*100 + 0.20*50 + 0.15*50 + 0.10*60 + 0.15*64
    //   = 20 + 20 + 10 + 7.5 + 6 + 9.6 = 73.1 → 73
    const mixed: KlimaPoengComponents = {
      floodRisk: "Lav", floodScore: 100,
      quickClay: false, quickClayScore: 100,
      skred: { jordflom: true, steinsprang: false, snoskred: false }, skredScore: 50,
      stormSurge: { in20YearCurrent: false, in200Year2100: true, in1000Year2100: true },
      stormSurgeScore: 50,
      radon: { assessed: true, level: "Moderat", score: 60 },
      klimaprofil: klimaprofilByFylke["oslo-og-akershus"], klimaprofilScore: 64,
    };
    expect(composeTotal(mixed)).toBe(73);
  });
});

describe("composeTotal — radon not assessed (5-component path)", () => {
  it("uses the documented 22/22/22/17/17 redistributed weights", () => {
    expect(WEIGHTS_NO_RADON).toEqual({
      flood: 0.22,
      quickClay: 0.22,
      skred: 0.22,
      stormSurge: 0.17,
      klimaprofil: 0.17,
    });
  });

  it("no-radon weights sum to 1.0", () => {
    const sum =
      WEIGHTS_NO_RADON.flood + WEIGHTS_NO_RADON.quickClay +
      WEIGHTS_NO_RADON.skred + WEIGHTS_NO_RADON.stormSurge +
      WEIGHTS_NO_RADON.klimaprofil;
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it("perfect 5 components → 100 (no radon contribution)", () => {
    const all100: KlimaPoengComponents = {
      floodRisk: "Lav", floodScore: 100,
      quickClay: false, quickClayScore: 100,
      skred: ZERO_SKRED, skredScore: 100,
      stormSurge: ZERO_STORM, stormSurgeScore: 100,
      radon: { assessed: false },
      klimaprofil: null, klimaprofilScore: 100,
    };
    expect(composeTotal(all100)).toBe(100);
  });

  it("worst 5 components → 4 (skred floor at 20 × 0.22)", () => {
    const all0: KlimaPoengComponents = {
      floodRisk: "Høy", floodScore: 0,
      quickClay: true, quickClayScore: 0,
      skred: { jordflom: true, steinsprang: true, snoskred: true }, skredScore: 20,
      stormSurge: { in20YearCurrent: true, in200Year2100: true, in1000Year2100: true },
      stormSurgeScore: 0,
      radon: { assessed: false },
      klimaprofil: null, klimaprofilScore: 0,
    };
    // 0.22*20 = 4.4 → 4
    expect(composeTotal(all0)).toBe(4);
  });

  it("known mixed case with redistributed weights", () => {
    // 0.22*100 + 0.22*100 + 0.22*50 + 0.17*50 + 0.17*64
    //   = 22 + 22 + 11 + 8.5 + 10.88 = 74.38 → 74
    const mixed: KlimaPoengComponents = {
      floodRisk: "Lav", floodScore: 100,
      quickClay: false, quickClayScore: 100,
      skred: { jordflom: true, steinsprang: false, snoskred: false }, skredScore: 50,
      stormSurge: { in20YearCurrent: false, in200Year2100: true, in1000Year2100: true },
      stormSurgeScore: 50,
      radon: { assessed: false },
      klimaprofil: klimaprofilByFylke["oslo-og-akershus"], klimaprofilScore: 64,
    };
    expect(composeTotal(mixed)).toBe(74);
  });

  it("identical 5-component inputs score higher in no-radon path than radon-Moderat path", () => {
    // Same inputs, radon Moderat (60) vs not assessed. Redistribution means
    // the missing 60 is effectively replaced by the weighted avg of the
    // other 5, which is higher here — so the no-radon total exceeds.
    const shared = {
      floodRisk: "Lav" as const, floodScore: 100,
      quickClay: false, quickClayScore: 100,
      skred: ZERO_SKRED, skredScore: 100,
      stormSurge: { in20YearCurrent: false, in200Year2100: true, in1000Year2100: true },
      stormSurgeScore: 50,
      klimaprofil: klimaprofilByFylke["oslo-og-akershus"],
      klimaprofilScore: 64,
    };
    const withRadon: KlimaPoengComponents = {
      ...shared,
      radon: { assessed: true, level: "Moderat", score: 60 },
    };
    const withoutRadon: KlimaPoengComponents = {
      ...shared,
      radon: { assessed: false },
    };
    expect(composeTotal(withoutRadon)).toBeGreaterThan(composeTotal(withRadon));
  });
});

describe("composeTotal — integer-in-[0,100] invariant", () => {
  it("holds across assessed and non-assessed paths", () => {
    const cases: KlimaPoengComponents[] = [
      {
        floodRisk: "Moderat", floodScore: 40,
        quickClay: false, quickClayScore: 100,
        skred: ZERO_SKRED, skredScore: 100,
        stormSurge: ZERO_STORM, stormSurgeScore: 100,
        radon: { assessed: true, level: "Høy", score: 20 },
        klimaprofil: null, klimaprofilScore: 52,
      },
      {
        floodRisk: "Ukjent", floodScore: 60,
        quickClay: false, quickClayScore: 100,
        skred: { jordflom: true, steinsprang: false, snoskred: true }, skredScore: 20,
        stormSurge: { in20YearCurrent: false, in200Year2100: false, in1000Year2100: true },
        stormSurgeScore: 70,
        radon: { assessed: false },
        klimaprofil: null, klimaprofilScore: 60,
      },
    ];
    for (const c of cases) {
      const t = composeTotal(c);
      expect(Number.isInteger(t)).toBe(true);
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(100);
    }
  });
});

/* ═══════════════════════════════════════════════════════════════════════
 * Fylke mapping — kommunenummer → KSS profile key
 * ═══════════════════════════════════════════════════════════════════════ */

describe("resolveKlimaprofilKey", () => {
  it("maps core kommuner to expected profiles", () => {
    expect(resolveKlimaprofilKey("0301")).toBe("oslo-og-akershus"); // Oslo
    expect(resolveKlimaprofilKey("4601")).toBe("hordaland");         // Bergen
    expect(resolveKlimaprofilKey("5001")).toBe("trondelag");         // Trondheim
    expect(resolveKlimaprofilKey("1103")).toBe("rogaland");          // Stavanger
    expect(resolveKlimaprofilKey("5501")).toBe("troms");             // Tromsø
    expect(resolveKlimaprofilKey("4204")).toBe("agder");             // Kristiansand
    expect(resolveKlimaprofilKey("3107")).toBe("ostfold");           // Fredrikstad
  });

  it("splits Innlandet (34) at 3431 — Hedmark below, Oppland above", () => {
    expect(resolveKlimaprofilKey("3403")).toBe("hedmark");   // Hamar
    expect(resolveKlimaprofilKey("3430")).toBe("hedmark");   // Os (boundary)
    expect(resolveKlimaprofilKey("3431")).toBe("oppland");   // Lillehammer (boundary)
    expect(resolveKlimaprofilKey("3432")).toBe("oppland");   // Gjøvik
  });

  it("splits Vestland (46) with 4602 Kinn exception", () => {
    expect(resolveKlimaprofilKey("4601")).toBe("hordaland");          // Bergen
    expect(resolveKlimaprofilKey("4602")).toBe("sogn-og-fjordane");   // Kinn (ex-Flora)
    expect(resolveKlimaprofilKey("4634")).toBe("hordaland");          // Masfjorden (boundary)
    expect(resolveKlimaprofilKey("4635")).toBe("sogn-og-fjordane");   // Gulen
    expect(resolveKlimaprofilKey("4640")).toBe("sogn-og-fjordane");   // Sogndal
  });

  it("maps Akershus kommuner (32) to oslo-og-akershus", () => {
    expect(resolveKlimaprofilKey("3201")).toBe("oslo-og-akershus"); // Bærum
    expect(resolveKlimaprofilKey("3203")).toBe("oslo-og-akershus"); // Asker
  });

  it("maps Buskerud/Vestfold/Telemark/Agder/Finnmark/Nordland correctly", () => {
    expect(resolveKlimaprofilKey("3301")).toBe("buskerud");   // Drammen
    expect(resolveKlimaprofilKey("3907")).toBe("vestfold");   // Sandefjord
    expect(resolveKlimaprofilKey("4003")).toBe("telemark");   // Skien
    expect(resolveKlimaprofilKey("4203")).toBe("agder");      // Arendal
    expect(resolveKlimaprofilKey("5601")).toBe("finnmark");   // Alta
    expect(resolveKlimaprofilKey("1804")).toBe("nordland");   // Bodø
  });

  it("returns null for malformed or unknown kommunenummer", () => {
    expect(resolveKlimaprofilKey(null)).toBeNull();
    expect(resolveKlimaprofilKey("")).toBeNull();
    expect(resolveKlimaprofilKey("abc")).toBeNull();
    expect(resolveKlimaprofilKey("12")).toBeNull();
    expect(resolveKlimaprofilKey("9999")).toBeNull(); // unknown prefix 99
  });
});

/* ═══════════════════════════════════════════════════════════════════════
 * calculateKlimaPoeng — graceful degradation with injected fetch
 * ═══════════════════════════════════════════════════════════════════════ */

describe("calculateKlimaPoeng (all upstreams fail)", () => {
  it("flips every NVE dataSource to 'none' and pushes warnings when the network fails", async () => {
    const failFetch = async () => {
      throw new Error("simulated network failure");
    };

    const result = await calculateKlimaPoeng(59.9127, 10.7461, {
      kommunenummer: "0301",
      fetchFn: failFetch as unknown as typeof fetch,
    });

    // Component defaults (not-in-zone) still flow through to the scores so
    // the composite stays computable — but dataSource flips to "none" and
    // the warnings surface the outage. This is the loud-failure contract:
    // a user-visible signal that flom/kvikkleire/skred couldn't be checked
    // rather than the old silent 100/100/100.
    expect(result.components.floodScore).toBe(100);
    expect(result.components.quickClayScore).toBe(100);
    expect(result.components.skredScore).toBe(100);
    expect(result.components.stormSurgeScore).toBe(100);
    expect(result.dataSource.flood).toBe("none");
    expect(result.dataSource.quickClay).toBe("none");
    expect(result.dataSource.skred).toBe("none");
    // Kartverket stormflo catches internally (separate upstream, not in
    // this PR's scope); it still reports "kartverket" when fetches throw.
    expect(result.dataSource.stormSurge).toBe("kartverket");
    expect(result.meta.warnings).toEqual(
      expect.arrayContaining([
        "NVE flom-data utilgjengelig",
        "NVE kvikkleire-data utilgjengelig",
        "NVE skred-data utilgjengelig",
      ]),
    );
    // Radon + klimaprofil still resolve from static tables.
    expect(result.components.radon.assessed).toBe(true);
    expect(result.weights).toBe(WEIGHTS);
    expect(result.meta.fylkesprofil).toBe("oslo-og-akershus");
    expect(result.total).toBeGreaterThan(0);
    expect(result.total).toBeLessThan(100);
  });
});

describe("calculateKlimaPoeng (unknown kommune)", () => {
  it("falls back to neutral radon and null klimaprofil", async () => {
    const emptyFetch = async () =>
      new Response(
        `<?xml version="1.0"?><FeatureInfoResponse xmlns="http://www.esri.com/wms"/>`,
        { status: 200, headers: { "content-type": "text/xml" } },
      );

    const result = await calculateKlimaPoeng(59.9127, 10.7461, {
      kommunenummer: null,
      fetchFn: emptyFetch as unknown as typeof fetch,
    });

    expect(result.components.radon).toEqual({ assessed: false });
    expect(result.weights).toBe(WEIGHTS_NO_RADON);
    expect(result.dataSource.radon).toBe("ikke-vurdert");
    expect(result.components.klimaprofil).toBeNull();
    expect(result.components.klimaprofilScore).toBe(60);
    expect(result.meta.fylkesprofil).toBeNull();
  });

  it("skred XML parser: FIELDS with attrs → inside; NoData PixelValue → outside", async () => {
    // Inside-hit FIELDS (both vector and raster), NoData for one, empty for the
    // rest. Exercises the unified FIELDS+PixelValue detector end-to-end.
    const skredFetch = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("JordFlomskredAktsomhet")) {
        // Raster hit
        return new Response(
          `<?xml version="1.0"?><FeatureInfoResponse xmlns="http://www.esri.com/wms"><FIELDS UniqueValue.PixelValue="1"/></FeatureInfoResponse>`,
          { status: 200, headers: { "content-type": "text/xml" } },
        );
      }
      if (url.includes("SnoskredAktsomhet")) {
        // Vector hit
        return new Response(
          `<?xml version="1.0"?><FeatureInfoResponse xmlns="http://www.esri.com/wms"><FIELDS OBJECTID="123" sikkerhetsklasse="S3"/></FeatureInfoResponse>`,
          { status: 200, headers: { "content-type": "text/xml" } },
        );
      }
      if (url.includes("SkredSteinAktR")) {
        // Raster miss
        return new Response(
          `<?xml version="1.0"?><FeatureInfoResponse xmlns="http://www.esri.com/wms"><FIELDS UniqueValue.PixelValue="NoData"/></FeatureInfoResponse>`,
          { status: 200, headers: { "content-type": "text/xml" } },
        );
      }
      // All non-skred upstreams: valid empty FeatureInfoResponse (→ not in zone).
      return new Response(
        `<?xml version="1.0"?><FeatureInfoResponse xmlns="http://www.esri.com/wms"/>`,
        { status: 200, headers: { "content-type": "text/xml" } },
      );
    };

    const result = await calculateKlimaPoeng(60.397, 5.324, {
      kommunenummer: "4601",
      fetchFn: skredFetch as unknown as typeof fetch,
    });

    expect(result.components.skred).toEqual({
      jordflom: true,
      steinsprang: false,
      snoskred: true,
    });
    expect(result.components.skredScore).toBe(20); // 2 hits
    expect(result.dataSource.skred).toBe("nve");
  });

  it("unknown kommune (not in static table) → radon not assessed, no-radon weights", async () => {
    const emptyFetch = async () =>
      new Response(
        `<?xml version="1.0"?><FeatureInfoResponse xmlns="http://www.esri.com/wms"/>`,
        { status: 200, headers: { "content-type": "text/xml" } },
      );

    const result = await calculateKlimaPoeng(63.5844, 10.0167, {
      kommunenummer: "5055", // Indre Fosen — not in environmentalRiskData
      fetchFn: emptyFetch as unknown as typeof fetch,
    });

    expect(result.components.radon).toEqual({ assessed: false });
    expect(result.weights).toBe(WEIGHTS_NO_RADON);
    expect(result.dataSource.radon).toBe("ikke-vurdert");
    // Fylke mapping still works even when radon doesn't.
    expect(result.meta.fylkesprofil).toBe("trondelag");
    expect(result.meta.warnings.some((w) => w.includes("5055"))).toBe(true);
  });
});

/* ═══════════════════════════════════════════════════════════════════════
 * queryNveWms loud-error semantics (via calculateKlimaPoeng fetch injection)
 *
 * Pre-2026-04 the NVE WMS wrapper caught every error and returned false,
 * making a host-migration outage identical to "point outside the zone".
 * These tests pin the new contract: any HTTP 4xx/5xx, ServiceExceptionReport,
 * network error, or unrecognised body must flip dataSource to "none" and
 * surface a warning. Only a valid empty FeatureInfoResponse counts as
 * "outside zone".
 * ═══════════════════════════════════════════════════════════════════════ */

const XML_EMPTY = `<?xml version="1.0"?><FeatureInfoResponse xmlns="http://www.esri.com/wms"/>`;
const XML_FIELDS_VECTOR = `<?xml version="1.0"?><FeatureInfoResponse xmlns="http://www.esri.com/wms"><FIELDS OBJECTID="1" objType="UtlosningOmr" faregrad="Middels"/></FeatureInfoResponse>`;
const XML_PIXEL_NODATA = `<?xml version="1.0"?><FeatureInfoResponse xmlns="http://www.esri.com/wms"><FIELDS UniqueValue.PixelValue="NoData"/></FeatureInfoResponse>`;
const XML_SERVICE_EXCEPTION = `<?xml version="1.0" encoding="UTF-8"?><ServiceExceptionReport version="1.1.1"><ServiceException code="LayerNotDefined">Parameter 'layers' contains unacceptable layer names.</ServiceException></ServiceExceptionReport>`;

function xmlResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/xml" },
  });
}

/** Serves `body` to NVE upstreams, XML-empty to Kartverket stormflo. */
function nveOnly(body: string, status = 200): typeof fetch {
  const fn = async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("stormflo_havniva")) return xmlResponse(XML_EMPTY);
    return xmlResponse(body, status);
  };
  return fn as unknown as typeof fetch;
}

describe("queryNveWms — loud-failure contract", () => {
  it("HTTP 404 on an NVE service → dataSource flips to 'none' and warning fires", async () => {
    const result = await calculateKlimaPoeng(59.9127, 10.7461, {
      kommunenummer: "0301",
      fetchFn: nveOnly("Not Found", 404),
    });
    expect(result.dataSource.flood).toBe("none");
    expect(result.dataSource.quickClay).toBe("none");
    expect(result.dataSource.skred).toBe("none");
    expect(result.meta.warnings).toEqual(
      expect.arrayContaining([
        "NVE flom-data utilgjengelig",
        "NVE kvikkleire-data utilgjengelig",
        "NVE skred-data utilgjengelig",
      ]),
    );
  });

  it("ServiceExceptionReport body at HTTP 200 → dataSource 'none' (not silently false)", async () => {
    const result = await calculateKlimaPoeng(59.9127, 10.7461, {
      kommunenummer: "0301",
      fetchFn: nveOnly(XML_SERVICE_EXCEPTION),
    });
    expect(result.dataSource.flood).toBe("none");
    expect(result.dataSource.quickClay).toBe("none");
    expect(result.dataSource.skred).toBe("none");
  });

  it("unrecognised response body (e.g. HTML login page) → dataSource 'none'", async () => {
    const result = await calculateKlimaPoeng(59.9127, 10.7461, {
      kommunenummer: "0301",
      fetchFn: nveOnly("<html><body>Sign in</body></html>"),
    });
    expect(result.dataSource.flood).toBe("none");
    expect(result.dataSource.quickClay).toBe("none");
    expect(result.dataSource.skred).toBe("none");
  });

  it("valid empty FeatureInfoResponse → dataSource 'nve', point scored as outside", async () => {
    const result = await calculateKlimaPoeng(59.9127, 10.7461, {
      kommunenummer: "0301",
      fetchFn: nveOnly(XML_EMPTY),
    });
    expect(result.dataSource.flood).toBe("nve");
    expect(result.dataSource.quickClay).toBe("nve");
    expect(result.dataSource.skred).toBe("nve");
    expect(result.components.quickClay).toBe(false);
    expect(result.components.floodRisk).toBe("Lav");
  });

  it("populated FIELDS (vector hit) → component flips to inside", async () => {
    const result = await calculateKlimaPoeng(60.0767, 11.0586, {
      kommunenummer: "3230",
      fetchFn: nveOnly(XML_FIELDS_VECTOR),
    });
    // Every NVE endpoint returns the same vector-hit XML, so flom-høy +
    // flom-aktsomhet (→ Høy), kvikkleire, and all three skred layers flip.
    expect(result.components.floodRisk).toBe("Høy");
    expect(result.components.quickClay).toBe(true);
    expect(result.components.skred.jordflom).toBe(true);
    expect(result.components.skred.steinsprang).toBe(true);
    expect(result.components.skred.snoskred).toBe(true);
  });

  it("PixelValue='NoData' (raster miss) → component stays outside", async () => {
    const result = await calculateKlimaPoeng(59.9127, 10.7461, {
      kommunenummer: "0301",
      fetchFn: nveOnly(XML_PIXEL_NODATA),
    });
    expect(result.components.skred.jordflom).toBe(false);
    expect(result.components.skred.steinsprang).toBe(false);
    // quickClay also reads NoData → stays outside.
    expect(result.components.quickClay).toBe(false);
  });

  it("NveWmsError is exported with the three documented kinds", () => {
    const e = new NveWmsError("http", "status 404", "https://example");
    expect(e.name).toBe("NveWmsError");
    expect(e.kind).toBe("http");
    expect(e).toBeInstanceOf(Error);
  });
});

/* ═══════════════════════════════════════════════════════════════════════
 * Klimaprofil data integrity
 * ═══════════════════════════════════════════════════════════════════════ */

describe("klimaprofilByFylke data integrity", () => {
  it("has entries for all 16 pre-2024 profile keys", () => {
    const keys = Object.keys(klimaprofilByFylke).sort();
    expect(keys).toEqual([
      "agder",
      "buskerud",
      "finnmark",
      "hedmark",
      "hordaland",
      "more-og-romsdal",
      "nordland",
      "oppland",
      "oslo-og-akershus",
      "ostfold",
      "rogaland",
      "sogn-og-fjordane",
      "telemark",
      "troms",
      "trondelag",
      "vestfold",
    ]);
  });

  it("temperature values are in plausible range [2, 7]°C for RCP8.5 by 2100", () => {
    for (const v of Object.values(klimaprofilByFylke)) {
      expect(v.temperaturendring2100).toBeGreaterThanOrEqual(2);
      expect(v.temperaturendring2100).toBeLessThanOrEqual(7);
    }
  });

  it("precipitation values are in plausible range [0, 40]%", () => {
    for (const v of Object.values(klimaprofilByFylke)) {
      expect(v.nedbørendring2100).toBeGreaterThanOrEqual(0);
      expect(v.nedbørendring2100).toBeLessThanOrEqual(40);
    }
  });

  it("each profile has a source URL", () => {
    for (const v of Object.values(klimaprofilByFylke)) {
      expect(v.sourceUrl).toMatch(/^https:\/\/klimaservicesenter\.no\//);
    }
  });
});
