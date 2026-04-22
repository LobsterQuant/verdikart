import { describe, it, expect } from "vitest";
import {
  scoreDoorToDoor,
  scoreFrequency,
  scoreWalkDistance,
  scoreTransfers,
  scoreMonthlyPrice,
  composeTotal,
  calculatePendlingsPoeng,
  nextTuesdayAtHourOslo,
  WEIGHTS,
  type PendlingsPoengComponents,
} from "./pendlings-poeng";
import {
  selectNearestWorkCenter,
  selectWorkCenterByKommune,
  resolveWorkCenter,
  getWorkCenter,
  WORK_CENTERS,
} from "./work-centers";
import {
  estimateMonthlyPriceNok,
  getOperatorPricing,
} from "./commute-pricing";

/* ═══════════════════════════════════════════════════════════════════════
 * Component scoring — pure functions, exhaustive boundary coverage
 * ═══════════════════════════════════════════════════════════════════════ */

describe("scoreDoorToDoor", () => {
  it("hits spec anchors exactly", () => {
    expect(scoreDoorToDoor(20)).toBe(100);
    expect(scoreDoorToDoor(30)).toBe(80);
    expect(scoreDoorToDoor(45)).toBe(60);
    expect(scoreDoorToDoor(60)).toBe(40);
    expect(scoreDoorToDoor(90)).toBe(0);
  });

  it("clamps below 20 and above 90", () => {
    expect(scoreDoorToDoor(0)).toBe(100);
    expect(scoreDoorToDoor(5)).toBe(100);
    expect(scoreDoorToDoor(120)).toBe(0);
    expect(scoreDoorToDoor(200)).toBe(0);
  });

  it("interpolates linearly between anchors", () => {
    expect(scoreDoorToDoor(25)).toBe(90);  // midpoint 20→30
    expect(scoreDoorToDoor(37.5)).toBe(70); // midpoint 30→45
    expect(scoreDoorToDoor(75)).toBeCloseTo(20, 5); // midpoint 60→90
  });
});

describe("scoreFrequency", () => {
  it("hits spec anchors exactly", () => {
    expect(scoreFrequency(0)).toBe(0);
    expect(scoreFrequency(1)).toBe(10);
    expect(scoreFrequency(2)).toBe(30);
    expect(scoreFrequency(4)).toBe(60);
    expect(scoreFrequency(6)).toBe(80);
    expect(scoreFrequency(8)).toBe(100);
  });

  it("caps at 100 above 8/hr", () => {
    expect(scoreFrequency(10)).toBe(100);
    expect(scoreFrequency(30)).toBe(100);
  });

  it("interpolates linearly between anchors", () => {
    expect(scoreFrequency(0.5)).toBe(5);
    expect(scoreFrequency(3)).toBe(45);   // mid 2→4
    expect(scoreFrequency(5)).toBe(70);   // mid 4→6
    expect(scoreFrequency(7)).toBe(90);   // mid 6→8
  });
});

describe("scoreWalkDistance", () => {
  it("hits spec anchors exactly", () => {
    expect(scoreWalkDistance(200)).toBe(100);
    expect(scoreWalkDistance(400)).toBe(80);
    expect(scoreWalkDistance(600)).toBe(60);
    expect(scoreWalkDistance(1000)).toBe(30);
    expect(scoreWalkDistance(1500)).toBe(0);
  });

  it("clamps below 200m and above 1500m", () => {
    expect(scoreWalkDistance(0)).toBe(100);
    expect(scoreWalkDistance(50)).toBe(100);
    expect(scoreWalkDistance(2000)).toBe(0);
  });

  it("interpolates linearly between anchors", () => {
    expect(scoreWalkDistance(300)).toBe(90);  // mid 200→400
    expect(scoreWalkDistance(500)).toBe(70);  // mid 400→600
    expect(scoreWalkDistance(800)).toBe(45);  // mid 600→1000
  });
});

describe("scoreTransfers", () => {
  it("hits spec anchors exactly", () => {
    expect(scoreTransfers(0)).toBe(100);
    expect(scoreTransfers(1)).toBe(70);
    expect(scoreTransfers(2)).toBe(40);
    expect(scoreTransfers(3)).toBe(0);
  });

  it("clamps for 4+ transfers", () => {
    expect(scoreTransfers(4)).toBe(0);
    expect(scoreTransfers(10)).toBe(0);
  });
});

describe("scoreMonthlyPrice", () => {
  it("hits spec anchors exactly", () => {
    expect(scoreMonthlyPrice(900)).toBe(100);
    expect(scoreMonthlyPrice(1200)).toBe(80);
    expect(scoreMonthlyPrice(1500)).toBe(60);
    expect(scoreMonthlyPrice(1800)).toBe(40);
    expect(scoreMonthlyPrice(2000)).toBe(0);
  });

  it("caps at 100 below 900 NOK", () => {
    expect(scoreMonthlyPrice(0)).toBe(100);
    expect(scoreMonthlyPrice(422)).toBe(100);   // Skyss Sone A 2026
    expect(scoreMonthlyPrice(805)).toBe(100);   // Ruter Sone 1 2026
    expect(scoreMonthlyPrice(300)).toBe(100);   // Kolumbus 2026
  });

  it("floors at 0 above 2000 NOK", () => {
    expect(scoreMonthlyPrice(2500)).toBe(0);
  });
});

/* ═══════════════════════════════════════════════════════════════════════
 * composeTotal — weighted sum, rounding, integer guarantee
 * ═══════════════════════════════════════════════════════════════════════ */

describe("composeTotal", () => {
  it("uses the documented 35/25/15/15/10 weights", () => {
    expect(WEIGHTS).toEqual({
      time: 0.35,
      freq: 0.25,
      walk: 0.15,
      transfers: 0.15,
      cost: 0.10,
    });
  });

  it("computes weighted sum for a perfect score", () => {
    const all100: PendlingsPoengComponents = {
      doorToDoorMinutes: 20,
      doorToDoorScore: 100,
      frequencyPerHour: 8,
      frequencyScore: 100,
      walkDistanceMeters: 100,
      walkDistanceScore: 100,
      transfers: 0,
      transfersScore: 100,
      monthlyPriceNok: 500,
      monthlyPriceScore: 100,
    };
    expect(composeTotal(all100)).toBe(100);
  });

  it("computes weighted sum for a worst-case score", () => {
    const all0: PendlingsPoengComponents = {
      doorToDoorMinutes: 200,
      doorToDoorScore: 0,
      frequencyPerHour: 0,
      frequencyScore: 0,
      walkDistanceMeters: 2000,
      walkDistanceScore: 0,
      transfers: 5,
      transfersScore: 0,
      monthlyPriceNok: 3000,
      monthlyPriceScore: 0,
    };
    expect(composeTotal(all0)).toBe(0);
  });

  it("computes known mixed-component case", () => {
    // 0.35*80 + 0.25*60 + 0.15*80 + 0.15*70 + 0.10*100
    // = 28 + 15 + 12 + 10.5 + 10 = 75.5 → 76
    const mixed: PendlingsPoengComponents = {
      doorToDoorMinutes: 30, doorToDoorScore: 80,
      frequencyPerHour: 4, frequencyScore: 60,
      walkDistanceMeters: 400, walkDistanceScore: 80,
      transfers: 1, transfersScore: 70,
      monthlyPriceNok: 500, monthlyPriceScore: 100,
    };
    expect(composeTotal(mixed)).toBe(76);
  });

  it("always returns an integer in [0, 100]", () => {
    const cases: PendlingsPoengComponents[] = [
      {
        doorToDoorMinutes: 37, doorToDoorScore: 71,
        frequencyPerHour: 2.7, frequencyScore: 37,
        walkDistanceMeters: 350, walkDistanceScore: 85,
        transfers: 1, transfersScore: 70,
        monthlyPriceNok: 1250, monthlyPriceScore: 77,
      },
      {
        doorToDoorMinutes: 77, doorToDoorScore: 17,
        frequencyPerHour: 0.3, frequencyScore: 3,
        walkDistanceMeters: 850, walkDistanceScore: 42,
        transfers: 2, transfersScore: 40,
        monthlyPriceNok: 1900, monthlyPriceScore: 20,
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
 * Work-center selection — lat/lon + kommunenummer
 * ═══════════════════════════════════════════════════════════════════════ */

describe("selectNearestWorkCenter (lat/lon, weighted)", () => {
  it("maps core-city addresses to their own center", () => {
    // Oslo — Karl Johans gate
    expect(selectNearestWorkCenter(59.913, 10.738).id).toBe("oslo");
    // Bergen — Torgallmenningen
    expect(selectNearestWorkCenter(60.393, 5.324).id).toBe("bergen");
    // Trondheim — Torvet
    expect(selectNearestWorkCenter(63.430, 10.394).id).toBe("trondheim");
    // Stavanger — Stavanger stasjon
    expect(selectNearestWorkCenter(58.969, 5.733).id).toBe("stavanger");
    // Tromsø — Storgata
    expect(selectNearestWorkCenter(69.649, 18.955).id).toBe("tromso");
    // Kristiansand sentrum — NOT Oslo
    expect(selectNearestWorkCenter(58.147, 7.996).id).toBe("kristiansand");
  });

  it("routes Bodø to Tromsø (Nord-Norge rule via magnetism)", () => {
    // Bodø sentrum
    expect(selectNearestWorkCenter(67.280, 14.405).id).toBe("tromso");
  });

  it("routes Voss to Bergen (not Oslo) — Vestland commute reality", () => {
    // Voss stasjon
    expect(selectNearestWorkCenter(60.626, 6.425).id).toBe("bergen");
  });

  it("routes Geilo to Oslo (cultural/work-center pull)", () => {
    // Geilo
    expect(selectNearestWorkCenter(60.534, 8.206).id).toBe("oslo");
  });

  it("routes Fredrikstad and Drammen to Oslo", () => {
    expect(selectNearestWorkCenter(59.211, 10.937).id).toBe("oslo"); // Fredrikstad
    expect(selectNearestWorkCenter(59.744, 10.204).id).toBe("oslo"); // Drammen
  });

  it("routes Haugesund to Stavanger (closer than Bergen)", () => {
    expect(selectNearestWorkCenter(59.413, 5.268).id).toBe("stavanger");
  });
});

describe("selectWorkCenterByKommune (fylke-based)", () => {
  it("maps core-kommune codes to expected centers", () => {
    expect(selectWorkCenterByKommune("0301")?.id).toBe("oslo");      // Oslo
    expect(selectWorkCenterByKommune("4601")?.id).toBe("bergen");    // Bergen
    expect(selectWorkCenterByKommune("5001")?.id).toBe("trondheim"); // Trondheim
    expect(selectWorkCenterByKommune("1103")?.id).toBe("stavanger"); // Stavanger
    expect(selectWorkCenterByKommune("5501")?.id).toBe("tromso");    // Tromsø
    expect(selectWorkCenterByKommune("4204")?.id).toBe("kristiansand"); // Kristiansand
  });

  it("routes Buskerud/Innlandet/Vestfold/Telemark → Oslo", () => {
    expect(selectWorkCenterByKommune("3301")?.id).toBe("oslo"); // Drammen
    expect(selectWorkCenterByKommune("3403")?.id).toBe("oslo"); // Hamar
    expect(selectWorkCenterByKommune("3907")?.id).toBe("oslo"); // Sandefjord
    expect(selectWorkCenterByKommune("4003")?.id).toBe("oslo"); // Skien
  });

  it("routes Agder east (old Aust-Agder) → Oslo, west → Kristiansand", () => {
    // Arendal, Grimstad, Risør, Tvedestrand → Oslo
    expect(selectWorkCenterByKommune("4203")?.id).toBe("oslo");
    expect(selectWorkCenterByKommune("4202")?.id).toBe("oslo");
    expect(selectWorkCenterByKommune("4201")?.id).toBe("oslo");
    expect(selectWorkCenterByKommune("4213")?.id).toBe("oslo");
    // Vest-Agder kommuner → Kristiansand
    expect(selectWorkCenterByKommune("4204")?.id).toBe("kristiansand"); // Kristiansand
    expect(selectWorkCenterByKommune("4215")?.id).toBe("kristiansand"); // Lindesnes
    expect(selectWorkCenterByKommune("4225")?.id).toBe("kristiansand"); // Lyngdal
  });

  it("routes Nordland kommuner → Tromsø", () => {
    expect(selectWorkCenterByKommune("1804")?.id).toBe("tromso"); // Bodø
    expect(selectWorkCenterByKommune("1806")?.id).toBe("tromso"); // Narvik
  });

  it("routes Finnmark kommuner → Tromsø", () => {
    expect(selectWorkCenterByKommune("5601")?.id).toBe("tromso"); // Alta
  });

  it("returns null for ambiguous fylke (Møre og Romsdal)", () => {
    expect(selectWorkCenterByKommune("1508")).toBeNull(); // Ålesund — fall back to geo
  });

  it("returns null for malformed or unknown kommune", () => {
    expect(selectWorkCenterByKommune("")).toBeNull();
    expect(selectWorkCenterByKommune("abc")).toBeNull();
    expect(selectWorkCenterByKommune("12")).toBeNull();
  });
});

describe("resolveWorkCenter (unified)", () => {
  it("prefers kommunenummer over geometry when provided", () => {
    // Arendal coordinates closer to Kristiansand, but knr 4203 → Oslo via Agder rule.
    expect(resolveWorkCenter(58.461, 8.770, "4203").id).toBe("oslo");
  });

  it("falls back to geometry when knr is absent", () => {
    expect(resolveWorkCenter(60.393, 5.324).id).toBe("bergen");
  });

  it("falls back to geometry for ambiguous fylke codes", () => {
    // Ålesund knr 1508 (Møre og Romsdal) — geometry should decide. Ålesund is
    // closer to Bergen than Trondheim.
    expect(resolveWorkCenter(62.472, 6.155, "1508").id).toBe("bergen");
  });
});

describe("WORK_CENTERS", () => {
  it("contains exactly the 6 specified centers with unique IDs", () => {
    expect(WORK_CENTERS).toHaveLength(6);
    const ids = WORK_CENTERS.map((c) => c.id).sort();
    expect(ids).toEqual([
      "bergen",
      "kristiansand",
      "oslo",
      "stavanger",
      "tromso",
      "trondheim",
    ]);
  });

  it("each center has sane coordinates (in Norway bbox)", () => {
    for (const c of WORK_CENTERS) {
      expect(c.lat).toBeGreaterThan(57.9);
      expect(c.lat).toBeLessThan(71.2);
      expect(c.lon).toBeGreaterThan(4.5);
      expect(c.lon).toBeLessThan(31.2);
    }
  });

  it("getWorkCenter round-trips each id", () => {
    for (const c of WORK_CENTERS) {
      expect(getWorkCenter(c.id).id).toBe(c.id);
    }
  });
});

/* ═══════════════════════════════════════════════════════════════════════
 * Pricing — estimateMonthlyPriceNok and per-operator config sanity
 * ═══════════════════════════════════════════════════════════════════════ */

describe("estimateMonthlyPriceNok (Ruter — Oslo)", () => {
  it("returns Sone 1 price for within-Oslo distance", () => {
    // Oslo is small; e.g. Kampen → Oslo S = ~2.5 km. 1-sone.
    expect(estimateMonthlyPriceNok("ruter", 2)).toBe(805);
    expect(estimateMonthlyPriceNok("ruter", 7)).toBe(805);
  });

  it("returns 2-sone price for Asker/Bærum-class distance", () => {
    expect(estimateMonthlyPriceNok("ruter", 10)).toBe(1019);
    expect(estimateMonthlyPriceNok("ruter", 18)).toBe(1019);
  });

  it("returns 3-sone price for Drammen-class distance", () => {
    // Drammen ≈ 34 km → 3 or 4 zones; Fredrikstad ≈ 80 km → 5-6.
    expect(estimateMonthlyPriceNok("ruter", 25)).toBe(1233);
  });

  it("returns max price for long-distance commute (Fredrikstad)", () => {
    // 90 km lands on the boundary → tier 5 (1661). Beyond 90 → max tier.
    expect(estimateMonthlyPriceNok("ruter", 90)).toBe(1661);
    expect(estimateMonthlyPriceNok("ruter", 100)).toBe(2000);
    expect(estimateMonthlyPriceNok("ruter", 200)).toBe(2000);
  });
});

describe("estimateMonthlyPriceNok (other operators)", () => {
  it("Skyss Sone A (<10 km) → 422 NOK", () => {
    expect(estimateMonthlyPriceNok("skyss", 5)).toBe(422);
  });

  it("Kolumbus is flat-rate 300 regardless of distance", () => {
    expect(estimateMonthlyPriceNok("kolumbus", 2)).toBe(300);
    expect(estimateMonthlyPriceNok("kolumbus", 25)).toBe(300);
    expect(estimateMonthlyPriceNok("kolumbus", 100)).toBe(300);
  });

  it("AtB 1-zone for Trondheim ≤10 km", () => {
    expect(estimateMonthlyPriceNok("atb", 5)).toBe(959);
  });

  it("AKT Kristiansand-området (<15 km) → 336 NOK", () => {
    expect(estimateMonthlyPriceNok("akt", 10)).toBe(336);
  });

  it("Svipper Troms city zone (<15 km) → 720 NOK (estimate)", () => {
    expect(estimateMonthlyPriceNok("svipper", 5)).toBe(720);
  });
});

describe("operator pricing configs are structurally valid", () => {
  it("prices monotonically non-decreasing for each operator", () => {
    for (const op of ["ruter", "skyss", "atb", "kolumbus", "svipper", "akt"] as const) {
      const cfg = getOperatorPricing(op);
      for (let i = 1; i < cfg.prices.length; i++) {
        expect(cfg.prices[i]).toBeGreaterThanOrEqual(cfg.prices[i - 1]);
      }
      expect(cfg.zoneKmThresholds.length).toBe(cfg.prices.length - 1);
    }
  });
});

/* ═══════════════════════════════════════════════════════════════════════
 * nextTuesdayAtHourOslo — time-zone helper
 * ═══════════════════════════════════════════════════════════════════════ */

describe("nextTuesdayAtHourOslo", () => {
  it("returns an ISO string on a Tuesday at the requested hour", () => {
    // Fixed Monday to test: 2026-04-20 (Mon) — next Tue is 2026-04-21.
    const iso = nextTuesdayAtHourOslo(8, new Date("2026-04-20T12:00:00Z"));
    expect(iso).toMatch(/^2026-04-21T08:00:00[+-]\d{2}:00$/);
  });

  it("skips to NEXT Tuesday when invoked on a Tuesday", () => {
    const iso = nextTuesdayAtHourOslo(8, new Date("2026-04-21T12:00:00Z"));
    expect(iso).toMatch(/^2026-04-28T/);
  });

  it("produces CEST offset (+02:00) for summer dates", () => {
    const iso = nextTuesdayAtHourOslo(8, new Date("2026-07-01T12:00:00Z"));
    expect(iso).toMatch(/\+02:00$/);
  });

  it("produces CET offset (+01:00) for winter dates", () => {
    const iso = nextTuesdayAtHourOslo(8, new Date("2026-12-01T12:00:00Z"));
    expect(iso).toMatch(/\+01:00$/);
  });
});

/* ═══════════════════════════════════════════════════════════════════════
 * calculatePendlingsPoeng — fallback path (no transit) + injected fetch
 * ═══════════════════════════════════════════════════════════════════════ */

describe("calculatePendlingsPoeng (no-transit fallback)", () => {
  it("returns total 0 with all-zero components when Entur returns nothing", async () => {
    const emptyFetch = async () =>
      new Response(JSON.stringify({ data: { trip: { tripPatterns: [] } } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });

    const result = await calculatePendlingsPoeng(
      70.166, // Nordkapp — realistic "no transit" test
      25.784,
      { fetchFn: emptyFetch as unknown as typeof fetch },
    );
    expect(result.total).toBe(0);
    expect(result.components.doorToDoorScore).toBe(0);
    expect(result.components.frequencyScore).toBe(0);
    expect(result.rushHourTested).toBe(false);
    expect(result.center.id).toBe("tromso"); // Finnmark → Tromsø
  });

  it("honors explicit center override", async () => {
    const emptyFetch = async () =>
      new Response(JSON.stringify({ data: { trip: { tripPatterns: [] } } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });

    const result = await calculatePendlingsPoeng(59.913, 10.738, {
      center: "bergen",
      fetchFn: emptyFetch as unknown as typeof fetch,
    });
    expect(result.center.id).toBe("bergen");
  });
});

/* ═══════════════════════════════════════════════════════════════════════
 * Integration tests — hit live Entur. Gated behind RUN_INTEGRATION=1.
 * Run with:   RUN_INTEGRATION=1 npm test -- pendlings-poeng
 * ═══════════════════════════════════════════════════════════════════════ */

const runIntegration = process.env.RUN_INTEGRATION === "1";

describe.skipIf(!runIntegration)("calculatePendlingsPoeng (live Entur)", () => {
  it("Karl Johans 1, Oslo → score > 85", async () => {
    const result = await calculatePendlingsPoeng(59.9127, 10.7461);
    expect(result.total).toBeGreaterThan(85);
    expect(result.center.id).toBe("oslo");
    expect(result.components.doorToDoorMinutes).toBeLessThan(15);
  }, 20_000);

  it("remote Finnmark coast → score < 30", async () => {
    // Unjárga-Nesseby sentrum-ish
    const result = await calculatePendlingsPoeng(69.8824, 28.8864);
    expect(result.total).toBeLessThan(30);
    expect(result.center.id).toBe("tromso");
  }, 20_000);
});
