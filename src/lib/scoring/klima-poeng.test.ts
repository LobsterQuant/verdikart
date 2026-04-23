import { describe, it, expect } from "vitest";
import {
  scoreFlom,
  scoreKvikkleire,
  scoreStormflo,
  scoreRadon,
  scoreTemperaturendring,
  scoreNedbørendring,
  scoreRisikoBucket,
  scoreKlimaprofil,
  composeTotal,
  calculateKlimaPoeng,
  WEIGHTS,
  WEIGHTS_NO_RADON,
  type KlimaPoengComponents,
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

describe("composeTotal — radon assessed (5-component path)", () => {
  it("uses the documented 25/25/20/15/15 weights", () => {
    expect(WEIGHTS).toEqual({
      flood: 0.25,
      quickClay: 0.25,
      stormSurge: 0.20,
      radon: 0.15,
      klimaprofil: 0.15,
    });
  });

  it("weights sum to 1.0", () => {
    const sum = WEIGHTS.flood + WEIGHTS.quickClay + WEIGHTS.stormSurge +
                WEIGHTS.radon + WEIGHTS.klimaprofil;
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it("perfect components → 100", () => {
    const all100: KlimaPoengComponents = {
      floodRisk: "Lav", floodScore: 100,
      quickClay: false, quickClayScore: 100,
      stormSurge: ZERO_STORM, stormSurgeScore: 100,
      radon: { assessed: true, level: "Lav", score: 100 },
      klimaprofil: null, klimaprofilScore: 100,
    };
    expect(composeTotal(all100)).toBe(100);
  });

  it("worst components → 3 (radon floor at 20)", () => {
    const all0: KlimaPoengComponents = {
      floodRisk: "Høy", floodScore: 0,
      quickClay: true, quickClayScore: 0,
      stormSurge: { in20YearCurrent: true, in200Year2100: true, in1000Year2100: true },
      stormSurgeScore: 0,
      radon: { assessed: true, level: "Høy", score: 20 },
      klimaprofil: null, klimaprofilScore: 0,
    };
    // 0.25*0 + 0.25*0 + 0.20*0 + 0.15*20 + 0.15*0 = 3
    expect(composeTotal(all0)).toBe(3);
  });

  it("known mixed case", () => {
    // 0.25*100 + 0.25*100 + 0.20*50 + 0.15*60 + 0.15*64 = 78.6 → 79
    const mixed: KlimaPoengComponents = {
      floodRisk: "Lav", floodScore: 100,
      quickClay: false, quickClayScore: 100,
      stormSurge: { in20YearCurrent: false, in200Year2100: true, in1000Year2100: true },
      stormSurgeScore: 50,
      radon: { assessed: true, level: "Moderat", score: 60 },
      klimaprofil: klimaprofilByFylke["oslo-og-akershus"], klimaprofilScore: 64,
    };
    expect(composeTotal(mixed)).toBe(79);
  });
});

describe("composeTotal — radon not assessed (4-component path)", () => {
  it("uses the documented 30/30/22.5/17.5 redistributed weights", () => {
    expect(WEIGHTS_NO_RADON).toEqual({
      flood: 0.30,
      quickClay: 0.30,
      stormSurge: 0.225,
      klimaprofil: 0.175,
    });
  });

  it("no-radon weights sum to 1.0", () => {
    const sum = WEIGHTS_NO_RADON.flood + WEIGHTS_NO_RADON.quickClay +
                WEIGHTS_NO_RADON.stormSurge + WEIGHTS_NO_RADON.klimaprofil;
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it("perfect 4 components → 100 (no radon contribution)", () => {
    const all100: KlimaPoengComponents = {
      floodRisk: "Lav", floodScore: 100,
      quickClay: false, quickClayScore: 100,
      stormSurge: ZERO_STORM, stormSurgeScore: 100,
      radon: { assessed: false },
      klimaprofil: null, klimaprofilScore: 100,
    };
    expect(composeTotal(all100)).toBe(100);
  });

  it("worst 4 components → 0", () => {
    const all0: KlimaPoengComponents = {
      floodRisk: "Høy", floodScore: 0,
      quickClay: true, quickClayScore: 0,
      stormSurge: { in20YearCurrent: true, in200Year2100: true, in1000Year2100: true },
      stormSurgeScore: 0,
      radon: { assessed: false },
      klimaprofil: null, klimaprofilScore: 0,
    };
    expect(composeTotal(all0)).toBe(0);
  });

  it("known mixed case with redistributed weights", () => {
    // 0.30*100 + 0.30*100 + 0.225*50 + 0.175*64 = 30 + 30 + 11.25 + 11.2 = 82.45 → 82
    const mixed: KlimaPoengComponents = {
      floodRisk: "Lav", floodScore: 100,
      quickClay: false, quickClayScore: 100,
      stormSurge: { in20YearCurrent: false, in200Year2100: true, in1000Year2100: true },
      stormSurgeScore: 50,
      radon: { assessed: false },
      klimaprofil: klimaprofilByFylke["oslo-og-akershus"], klimaprofilScore: 64,
    };
    expect(composeTotal(mixed)).toBe(82);
  });

  it("identical 4-component inputs score higher in no-radon path than radon-Moderat path", () => {
    // Same inputs, but one has radon Moderat (score 60), the other has no radon.
    // Redistribution means the missing 60 is effectively replaced by the
    // weighted avg of the other 4, which is higher (here 100/100/50/64), so
    // the no-radon total should exceed the radon-moderat total.
    const shared = {
      floodRisk: "Lav" as const, floodScore: 100,
      quickClay: false, quickClayScore: 100,
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
        stormSurge: ZERO_STORM, stormSurgeScore: 100,
        radon: { assessed: true, level: "Høy", score: 20 },
        klimaprofil: null, klimaprofilScore: 52,
      },
      {
        floodRisk: "Ukjent", floodScore: 60,
        quickClay: false, quickClayScore: 100,
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
  it("returns neutral-ish score with warnings when every WMS errors", async () => {
    const failFetch = async () => {
      throw new Error("simulated network failure");
    };

    const result = await calculateKlimaPoeng(59.9127, 10.7461, {
      kommunenummer: "0301",
      fetchFn: failFetch as unknown as typeof fetch,
    });

    // Flom/kvikkleire/stormflo all resolve to "not in zone" fallback (100 each).
    expect(result.components.floodScore).toBe(100); // defaults to Lav
    expect(result.components.quickClayScore).toBe(100); // defaults to outside
    expect(result.components.stormSurgeScore).toBe(100); // defaults to outside
    // Radon from static table for 0301 Oslo (Høy).
    expect(result.components.radon.assessed).toBe(true);
    if (result.components.radon.assessed) {
      expect(result.components.radon.level).toBe("Høy");
      expect(result.components.radon.score).toBe(20);
    }
    expect(result.weights).toBe(WEIGHTS);
    // Klimaprofil resolves (static), oslo-og-akershus.
    expect(result.meta.fylkesprofil).toBe("oslo-og-akershus");
    // Total should reflect the radon drag.
    expect(result.total).toBeGreaterThan(0);
    expect(result.total).toBeLessThan(100);
    // Data source markers flip to "none" for each WMS.
    // (queryNveWms and queryKartverketStormflo swallow errors internally and
    // return false, so dataSource still marks "nve"/"kartverket" — the outer
    // try/catch didn't trip. That's expected: individual feature queries
    // failing is not the same as the whole fetch branch erroring.)
  });
});

describe("calculateKlimaPoeng (unknown kommune)", () => {
  it("falls back to neutral radon and null klimaprofil", async () => {
    const emptyFetch = async () =>
      new Response(JSON.stringify({ features: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });

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

  it("unknown kommune (not in static table) → radon not assessed, no-radon weights", async () => {
    const emptyFetch = async () =>
      new Response(JSON.stringify({ features: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });

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
