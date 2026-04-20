import { headers } from "next/headers";
import { eiendomsskattData } from "@/data/eiendomsskatt";
import { getDemographics } from "@/data/demographics";
import { KOMMUNE_CRIME, NATIONAL_CRIME_AVG } from "@/data/crime";
import { getOsloBydelCrime, OSLO_KOMMUNE_AVG } from "@/data/oslo-bydel-crime";
import {
  buildingTypeFromEnovaKategori,
  calculateMonthlyCost as calculateDefaultMonthlyCost,
  defaultAreaForBuildingType,
  estimatedMunicipalFees,
  resolveKommuneCategory,
  roundToNearest100,
  STRESSTEST_RATE,
} from "@/lib/economics/monthly-cost";
import { classifyCategory, type PropertyClassification } from "@/lib/enova/category";

/**
 * Server-side aggregator for the mobile property-report bottom sheet.
 *
 * Composes one short Norwegian preview string per section so each row in
 * PropertyReportMobile can render instantly, without a client-side waterfall.
 * Each sub-fetch is independently guarded — a single upstream failure
 * degrades to "Ingen data" for that row rather than breaking the sheet.
 *
 * Scope note: deliberately duplicates the URL composition that the per-card
 * fetches already do. Reuse would mean importing client-side hooks or
 * extracting every API route's pure-function core; not worth the churn for a
 * single new surface.
 */

// ───────────────────────────────────────────────────────────────────────────
// Public surface
// ───────────────────────────────────────────────────────────────────────────

export type ReportSectionKey =
  | "verdiestimat"
  | "manedskostnad"
  | "prisstatistikk"
  | "kollektiv"
  | "skoler"
  | "klimarisiko"
  | "stoy"
  | "luftkvalitet"
  | "bredband"
  | "energi"
  | "eiendomsskatt"
  | "kriminalitet"
  | "demografi";

export type PropertyReportSummary = Record<ReportSectionKey, string>;

export interface PropertyReportInput {
  lat: number;
  lon: number;
  kommunenummer: string;
  postnummer: string;
  adresse: string;
}

const UKJENT = "Ingen data";

// ───────────────────────────────────────────────────────────────────────────
// Minimal response shapes — mirror the fields each card already reads.
// Keep them narrow so a wider upstream schema change doesn't trip tsc.
// ───────────────────────────────────────────────────────────────────────────

interface PriceTrendShape {
  values: number[];
  yoyChange: number | null;
  sourceLabel: string;
}

interface EnergimerkeShape {
  energikarakter: string | null;
  kwhM2: number | null;
  bruksareal: number | null;
  bygningskategori?: string | null;
}

interface TransitShape {
  durationMinutes: number | null;
  destination: string;
  legs: Array<{ mode: string; from: string; to: string }>;
}

interface TransitStopShape {
  name: string;
  distance: number;
  departuresPerHour?: number;
}

interface SchoolShape {
  name: string;
  type: string;
  distance: number;
  levelLabel: string | null;
}

interface SchoolsShape {
  schools: SchoolShape[];
}

interface ClimateShape {
  floodRisk: "Høy" | "Moderat" | "Lav" | "Ukjent";
  quickClay: boolean;
}

interface NoiseShape {
  veinoise: number | null;
  flynoise: number | null;
  jernbanenoise: number | null;
}

interface AirQualityShape {
  aqi: "God" | "Moderat" | "Dårlig" | "Svært dårlig" | "Ukjent";
  nearestStation: string | null;
}

interface BroadbandShape {
  maxDownload: number | null;
  fiberAvailable: boolean;
}

// ───────────────────────────────────────────────────────────────────────────
// Fetch plumbing
// ───────────────────────────────────────────────────────────────────────────

async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function safeFetch<T>(url: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const qs = (params: Record<string, string | number>) =>
  new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  ).toString();

// ───────────────────────────────────────────────────────────────────────────
// Preview string composition
// ───────────────────────────────────────────────────────────────────────────

const nbNumber = (n: number): string => n.toLocaleString("nb-NO");

function previewValuation(trend: PriceTrendShape | null, energi: EnergimerkeShape | null): string {
  if (classifyCategory(energi?.bygningskategori) === "commercial") {
    return "Ikke relevant for næringsbygg";
  }
  const sqm = trend?.values[trend.values.length - 1];
  const area = energi?.bruksareal ?? null;
  if (sqm && area && area > 0 && area < 500) {
    const total = Math.round((sqm * area) / 1000) * 1000;
    return `~${nbNumber(Math.round(total / 1_000_000 * 10) / 10)} MNOK · ${nbNumber(sqm)} kr/m²`;
  }
  if (sqm) return `${nbNumber(sqm)} kr/m² i området`;
  return UKJENT;
}

function previewManedskostnad(
  trend: PriceTrendShape | null,
  energi: EnergimerkeShape | null,
  kommunenummer: string,
): string {
  // Hide numbers only for pure næringsbygg. Mixed-use (Forretningsbygg,
  // Kombinasjonsbygg) still usually contains boligenheter, so show the
  // bolig-side estimate and let the detail card caveat it.
  if (classifyCategory(energi?.bygningskategori) === "commercial") {
    return "Ikke relevant for næringsbygg";
  }
  const sqm = trend?.values[trend.values.length - 1];
  const buildingType = buildingTypeFromEnovaKategori(energi?.bygningskategori);
  const enovaArea = energi?.bruksareal && energi.bruksareal > 0 && energi.bruksareal < 500
    ? energi.bruksareal
    : null;
  const area = enovaArea ?? defaultAreaForBuildingType(buildingType);
  const effectiveSqm = sqm ?? 48_000;
  const propertyValue = effectiveSqm * area;
  const municipalFees = estimatedMunicipalFees(resolveKommuneCategory(kommunenummer));
  const { total } = calculateDefaultMonthlyCost({
    propertyValue,
    area,
    rate: STRESSTEST_RATE,
    equityPct: 0.15,
    termYears: 25,
    municipalFees,
    maintenancePct: 0.01,
  });
  const rounded = roundToNearest100(total);
  return `~${nbNumber(rounded)} kr/md · Finanstilsynet-stresstest 7,0 %`;
}

function previewPriceTrend(trend: PriceTrendShape | null): string {
  if (!trend || trend.values.length === 0) return UKJENT;
  const yoy = trend.yoyChange;
  if (yoy == null) return trend.sourceLabel || UKJENT;
  const sign = yoy >= 0 ? "+" : "";
  return `${sign}${yoy.toFixed(1)}% siste år · ${trend.sourceLabel}`;
}

function previewTransit(transit: TransitShape | null, stops: TransitStopShape[] | null): string {
  if (transit) {
    const firstLeg = transit.legs.find((l) => l.mode !== "foot");
    const stop = firstLeg?.from ?? null;
    const mins = transit.durationMinutes;
    if (stop && mins != null) return `${mins} min til ${transit.destination} · via ${stop}`;
    if (mins != null) return `${mins} min til ${transit.destination}`;
  }
  // Fallback: Entur journey-planner can return null for addresses in the city
  // centre (too close to route). Use the nearest holdeplass from /stops so the
  // summary never contradicts the detail card below. Matches TransitCard's
  // rendering (nearest-stops list shown alongside the journey time).
  if (stops && stops.length > 0) {
    const nearest = stops[0];
    return `${nearest.name} · ${Math.round(nearest.distance)} m`;
  }
  return UKJENT;
}

function previewSchools(schools: SchoolsShape | null): string {
  if (!schools || schools.schools.length === 0) return UKJENT;
  const nearest = schools.schools
    .filter((s) => s.type === "Skole")
    .sort((a, b) => a.distance - b.distance)[0];
  if (!nearest) return UKJENT;
  const m = Math.round(nearest.distance);
  return `${nearest.name} · ${m} m`;
}

function previewClimate(climate: ClimateShape | null): string {
  if (!climate) return UKJENT;
  if (climate.floodRisk === "Ukjent" && !climate.quickClay) return UKJENT;
  const parts: string[] = [];
  if (climate.floodRisk !== "Ukjent") parts.push(`Flom: ${climate.floodRisk}`);
  if (climate.quickClay) parts.push("Kvikkleire");
  return parts.join(" · ");
}

function previewNoise(noise: NoiseShape | null): string {
  if (!noise) return UKJENT;
  const levels = [
    { kind: "Vei", db: noise.veinoise },
    { kind: "Fly", db: noise.flynoise },
    { kind: "Bane", db: noise.jernbanenoise },
  ].filter((l): l is { kind: string; db: number } => l.db != null);
  if (levels.length === 0) return "Ingen støy registrert";
  const max = levels.reduce((a, b) => (b.db > a.db ? b : a));
  return `${max.kind} ${max.db} dB`;
}

function previewAirQuality(air: AirQualityShape | null): string {
  if (!air || air.aqi === "Ukjent") return UKJENT;
  if (air.nearestStation) return `${air.aqi} · ${air.nearestStation}`;
  return air.aqi;
}

function previewBroadband(bb: BroadbandShape | null): string {
  if (!bb) return UKJENT;
  const fiber = bb.fiberAvailable ? "Fiber" : "Ikke fiber";
  if (bb.maxDownload != null) return `${fiber} · opptil ${bb.maxDownload} Mbit/s`;
  return fiber;
}

function previewEnergi(energi: EnergimerkeShape | null): string {
  if (!energi || !energi.energikarakter) return UKJENT;
  const kwh = energi.kwhM2;
  if (kwh != null) return `${energi.energikarakter} · ${nbNumber(Math.round(kwh))} kWh/m²`;
  return `Energikarakter ${energi.energikarakter}`;
}

function previewEiendomsskatt(kommunenummer: string): string {
  const d = eiendomsskattData[kommunenummer];
  if (!d) return UKJENT;
  if (!d.hasTax) return "Ingen eiendomsskatt";
  if (d.promille != null) return `${d.promille.toString().replace(".", ",")} ‰ av takstgrunnlag`;
  return "Eiendomsskatt gjelder";
}

function previewCrime(kommunenummer: string, postnummer: string): string {
  // Oslo: bydel-preview hvis postnummer er kjent
  if (kommunenummer === "0301") {
    const b = getOsloBydelCrime(postnummer);
    if (b) {
      const diff = Math.round(((b.rate - OSLO_KOMMUNE_AVG) / OSLO_KOMMUNE_AVG) * 100);
      const rel = diff === 0 ? "på Oslo-snittet" : diff > 0 ? `${diff}% over Oslo-snittet` : `${Math.abs(diff)}% under Oslo-snittet`;
      return `Bydel ${b.bydel} · ${b.rate} per 1 000 · ${rel}`;
    }
  }
  const c = KOMMUNE_CRIME[kommunenummer];
  if (!c) return UKJENT;
  const diff = Math.round(((c.rate - NATIONAL_CRIME_AVG) / NATIONAL_CRIME_AVG) * 100);
  const rel = diff === 0 ? "på snittet" : diff > 0 ? `${diff}% over snittet` : `${Math.abs(diff)}% under snittet`;
  return `${c.rate.toFixed(1).replace(".", ",")} per 1 000 · ${rel}`;
}

function previewDemografi(kommunenummer: string): string {
  const d = getDemographics(kommunenummer);
  if (!d) return UKJENT;
  const incomeK = Math.round(d.medianIncome / 1000);
  return `${incomeK} TNOK median · ${d.higherEducationPct.toFixed(0)}% høyere utd.`;
}

// ───────────────────────────────────────────────────────────────────────────
// Entry point
// ───────────────────────────────────────────────────────────────────────────

export interface PropertyReportResult {
  sections: PropertyReportSummary;
  classification: PropertyClassification;
  bygningskategori: string | null;
}

export async function getPropertyReportSummary(
  input: PropertyReportInput,
): Promise<PropertyReportResult> {
  const { lat, lon, kommunenummer, postnummer, adresse } = input;
  const origin = await getOrigin();

  const DAY = 60 * 60 * 24;
  const HOUR = 60 * 60;
  const WEEK = DAY * 7;

  const [priceTrend, energi, transit, transitStops, schools, climate, noise, air, broadband] = await Promise.all([
    safeFetch<PriceTrendShape>(`${origin}/api/price-trend?${qs({ kommunenummer, postnummer })}`, DAY),
    safeFetch<EnergimerkeShape>(`${origin}/api/energimerke?${qs({ postnummer, adresse })}`, DAY),
    safeFetch<TransitShape>(`${origin}/api/transit?${qs({ lat, lon })}`, HOUR),
    safeFetch<TransitStopShape[]>(`${origin}/api/transit/stops?${qs({ lat, lon })}`, HOUR),
    safeFetch<SchoolsShape>(`${origin}/api/schools?${qs({ lat, lon, kommunenummer })}`, DAY / 2),
    safeFetch<ClimateShape>(`${origin}/api/climate-risk?${qs({ lat, lon })}`, DAY),
    safeFetch<NoiseShape>(`${origin}/api/noise?${qs({ lat, lon })}`, DAY),
    safeFetch<AirQualityShape>(`${origin}/api/air-quality?${qs({ lat, lon })}`, HOUR),
    safeFetch<BroadbandShape>(`${origin}/api/broadband?${qs({ lat, lon })}`, WEEK),
  ]);

  const sections: PropertyReportSummary = {
    verdiestimat: previewValuation(priceTrend, energi),
    manedskostnad: previewManedskostnad(priceTrend, energi, kommunenummer),
    prisstatistikk: previewPriceTrend(priceTrend),
    kollektiv: previewTransit(transit, transitStops),
    skoler: previewSchools(schools),
    klimarisiko: previewClimate(climate),
    stoy: previewNoise(noise),
    luftkvalitet: previewAirQuality(air),
    bredband: previewBroadband(broadband),
    energi: previewEnergi(energi),
    eiendomsskatt: previewEiendomsskatt(kommunenummer),
    kriminalitet: previewCrime(kommunenummer, postnummer),
    demografi: previewDemografi(kommunenummer),
  };

  return {
    sections,
    classification: classifyCategory(energi?.bygningskategori),
    bygningskategori: energi?.bygningskategori ?? null,
  };
}
