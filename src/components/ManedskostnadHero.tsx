import { Wallet } from "lucide-react";
import { TopographicHover } from "@/components/motion/TopographicHover";
import { formatPct } from "@/lib/format";
import {
  buildingTypeFromEnovaKategori,
  calculateMonthlyCost,
  defaultAreaForBuildingType,
  estimatedMunicipalFees,
  resolveKommuneCategory,
  roundToNearest100,
  type BuildingType,
} from "@/lib/economics/monthly-cost";
import { getPolicyRateSnapshot } from "@/lib/rates/norges-bank";
import { isResidentialCategory } from "@/lib/enova/category";

interface ManedskostnadHeroProps {
  kommunenummer: string;
  postnummer: string;
  adresse: string;
}

interface PriceTrendShape {
  values: number[];
}

interface EnergimerkeShape {
  bruksareal: number | null;
  bygningskategori: string | null;
}

const EQUITY_PCT = 0.15;
const TERM_YEARS = 25;
const MAINTENANCE_PCT = 0.01;
const NATIONAL_SQM_FALLBACK = 48_000;

async function getOrigin(): Promise<string> {
  const { headers } = await import("next/headers");
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

function fmtKr(value: number): string {
  return `${Math.round(value).toLocaleString("nb-NO")} kr`;
}

export default async function ManedskostnadHero({
  kommunenummer,
  postnummer,
  adresse,
}: ManedskostnadHeroProps) {
  const origin = await getOrigin();
  const DAY = 60 * 60 * 24;

  const [priceTrend, energi, rateSnapshot] = await Promise.all([
    safeFetch<PriceTrendShape>(
      `${origin}/api/price-trend?kommunenummer=${encodeURIComponent(kommunenummer)}&postnummer=${encodeURIComponent(postnummer)}`,
      DAY,
    ),
    safeFetch<EnergimerkeShape>(
      `${origin}/api/energimerke?postnummer=${encodeURIComponent(postnummer)}&adresse=${encodeURIComponent(adresse)}`,
      DAY,
    ),
    getPolicyRateSnapshot(),
  ]);

  if (energi?.bygningskategori && !isResidentialCategory(energi.bygningskategori)) {
    return null;
  }

  const buildingType: BuildingType = buildingTypeFromEnovaKategori(energi?.bygningskategori);
  const enovaArea = energi?.bruksareal && energi.bruksareal > 0 && energi.bruksareal < 500
    ? energi.bruksareal
    : null;
  const area = enovaArea ?? defaultAreaForBuildingType(buildingType);
  const sqmPrice = priceTrend?.values?.length
    ? priceTrend.values[priceTrend.values.length - 1]
    : NATIONAL_SQM_FALLBACK;
  const propertyValue = sqmPrice * area;

  const kommuneCategory = resolveKommuneCategory(kommunenummer);
  const municipalFees = estimatedMunicipalFees(kommuneCategory);

  const shared = {
    propertyValue,
    area,
    equityPct: EQUITY_PCT,
    termYears: TERM_YEARS,
    municipalFees,
    maintenancePct: MAINTENANCE_PCT,
  } as const;

  const stressed = calculateMonthlyCost({ ...shared, rate: rateSnapshot.stressTestRate });
  const current = calculateMonthlyCost({ ...shared, rate: rateSnapshot.marketRate });

  const stressedTotal = roundToNearest100(stressed.total);
  const currentTotal = roundToNearest100(current.total);
  const loanPart = roundToNearest100(stressed.loanPayment);
  const maintenancePart = roundToNearest100(stressed.maintenance);

  const stressPct = formatPct(rateSnapshot.stressTestRate * 100, 1);
  const currentPct = formatPct(rateSnapshot.marketRate * 100, 2);

  const areaSource = enovaArea ? `${area} m²` : `${area} m² (typisk for ${buildingTypeLabel(buildingType)})`;
  const assumptions = `Eksempel: ${areaSource} · 15 % egenkapital · 25 års nedbetaling · stresstest ${stressPct}`;

  return (
    <TopographicHover className="relative rounded-2xl border border-card-border bg-card-bg p-4 sm:p-6">
      <header className="mb-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-text-secondary">
          <Wallet className="h-4 w-4 text-accent" strokeWidth={1.75} />
          Månedskostnad (stresstest · eksempel)
        </h2>
      </header>

      <div
        className="text-4xl font-bold tracking-tight tabular-nums sm:text-5xl"
        style={{
          background: "linear-gradient(135deg, var(--accent-hover) 0%, var(--accent) 50%, var(--warm) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {fmtKr(stressedTotal)}/md
      </div>

      <p className="mt-2 text-sm text-text-secondary">
        ved {stressPct} stresstest-rente · {fmtKr(currentTotal)}/md ved dagens {currentPct}
      </p>

      <p className="mt-3 text-sm text-text-secondary">
        Boliglån {fmtKr(loanPart)} · Kommunale avgifter {fmtKr(municipalFees)} (estimat) · Vedlikehold {fmtKr(maintenancePart)}
      </p>

      <p className="mt-3 text-xs text-text-tertiary">{assumptions}</p>

      <p className="mt-1 text-xs text-text-tertiary">
        Felleskostnader ikke inkludert. Legg dem til nedenfor hvis aktuelt.
      </p>

      <p className="mt-4 text-xs font-medium text-accent">
        Justér tallene for din situasjon ↓
      </p>
    </TopographicHover>
  );
}

function buildingTypeLabel(type: BuildingType): string {
  switch (type) {
    case "enebolig": return "enebolig";
    case "rekkehus": return "rekkehus";
    case "tomannsbolig": return "tomannsbolig";
    case "leilighet": return "leilighet";
    case "fritidsbolig": return "fritidsbolig";
    default: return "bolig";
  }
}
