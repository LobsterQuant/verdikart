"use client";

import { Shield, Info, AlertTriangle } from "lucide-react";
import DataAgeChip from "@/components/DataAgeChip";
import { TopographicHover } from "@/components/motion/TopographicHover";
import { nb, formatPct } from "@/lib/format";
import { roundBarWidth } from "@/lib/percent";
import {
  KOMMUNE_CRIME,
  NATIONAL_CRIME_AVG as NATIONAL_AVG,
  HIGH_URBAN_COMMUNES,
} from "@/data/crime";
import {
  getOsloBydelCrime,
  OSLO_KOMMUNE_AVG,
  type OsloBydelCrime,
} from "@/data/oslo-bydel-crime";

function getLabel(rate: number, reference: number, isUrban: boolean): { label: string; color: string; bg: string; isUrbanContext: boolean } {
  const ratio = rate / reference;
  if (ratio < 0.6) return { label: "Lavt", color: "#22C55E", bg: "rgba(34,197,94,0.1)", isUrbanContext: false };
  if (ratio < 0.9) return { label: "Under snitt", color: "#86EFAC", bg: "rgba(134,239,172,0.1)", isUrbanContext: false };
  if (ratio < 1.1) {
    if (isUrban) return { label: "Storbysnitt", color: "#60A5FA", bg: "rgba(96,165,250,0.1)", isUrbanContext: true };
    return { label: "Rundt snitt", color: "#EAB308", bg: "rgba(234,179,8,0.1)", isUrbanContext: false };
  }
  if (ratio < 1.8) {
    if (isUrban) return { label: "Storbysnitt", color: "#60A5FA", bg: "rgba(96,165,250,0.1)", isUrbanContext: true };
    return { label: "Over snitt", color: "#F97316", bg: "rgba(249,115,22,0.1)", isUrbanContext: false };
  }
  return { label: "Høyt", color: "#EF4444", bg: "rgba(239,68,68,0.1)", isUrbanContext: false };
}

interface CrimeCardProps {
  kommunenummer: string;
  postnummer?: string;
  kommuneName?: string;
  lat?: number | null;
  lon?: number | null;
}

export default function CrimeCard({ kommunenummer, postnummer, kommuneName, lat, lon }: CrimeCardProps) {
  // Oslo: forsøk bydel-oppslag først. Postnummer er fast path; koordinater
  // brukes når URL-en ikke bærer ?pnr= (direkte-lenker, sitemap osv).
  if (kommunenummer === "0301") {
    const bydelCrime = getOsloBydelCrime({ postnummer, lat, lon, kommunenummer });
    if (bydelCrime) {
      return <BydelCrimeView data={bydelCrime} />;
    }
  }

  return <KommuneCrimeView kommunenummer={kommunenummer} kommuneName={kommuneName} />;
}

// ── Bydel view (Oslo med kjent bydel) ──────────────────────────────────────

function BydelCrimeView({ data }: { data: OsloBydelCrime }) {
  const { label, color, bg } = getLabel(data.rate, OSLO_KOMMUNE_AVG, false);
  const pctVsOslo = ((data.rate - OSLO_KOMMUNE_AVG) / OSLO_KOMMUNE_AVG * 100).toFixed(0);
  const aboveBelow = data.rate > OSLO_KOMMUNE_AVG ? "over" : "under";
  const barWidth = roundBarWidth(Math.min(100, (data.rate / 200) * 100));
  const osloBarWidth = roundBarWidth(Math.min(100, (OSLO_KOMMUNE_AVG / 200) * 100));

  return (
    <TopographicHover className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Shield className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold">Kriminalitet: Bydel {data.bydel}</h3>
        <DataAgeChip source="Oslo kommune" date={`${data.year}`} className="ml-auto" />
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-blue-400/20 bg-blue-500/5 px-3 py-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" strokeWidth={1.75} aria-hidden />
        <p className="text-xs leading-relaxed text-blue-300">
          Tallet gjelder bydelen, ikke enkeltadresser. Kriminalitet varierer også innad i en bydel.
        </p>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex flex-col items-center justify-center rounded-xl px-5 py-3 text-center"
          style={{ background: bg, border: `1px solid ${color}30` }}
        >
          <span className="text-[9px] font-semibold uppercase tracking-widest text-text-tertiary">
            Bydelsnivå
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color }}>
            {label}
          </span>
          <span className="text-2xl font-bold tabular-nums" style={{ color }}>
            {nb(data.rate)}
          </span>
          <span className="text-[10px] text-text-secondary">anmeldelser/1000</span>
        </div>
        <div className="flex-1 text-sm text-text-secondary leading-relaxed">
          <strong className="text-foreground">{formatPct(Math.abs(Number(pctVsOslo)), 0)}</strong>{" "}
          {aboveBelow} snittet for Oslo kommune på {nb(OSLO_KOMMUNE_AVG)} anmeldelser per 1 000 innbyggere.
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-text-secondary">Bydel {data.bydel}</span>
            <span className="font-semibold tabular-nums" style={{ color }}>{nb(data.rate)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full transition-all" style={{ width: `${barWidth}%`, background: color }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-text-secondary">Oslo-snitt (kommune)</span>
            <span className="font-semibold tabular-nums text-text-tertiary">{nb(OSLO_KOMMUNE_AVG)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full bg-text-tertiary/40 transition-all" style={{ width: `${osloBarWidth}%` }} />
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-text-secondary">
        Statistikk fra Oslo kommune, {data.year}. Tallet gjelder bydelen, ikke enkeltadresser.
      </p>
    </TopographicHover>
  );
}

// ── Kommune view (alle andre kommuner + Oslo-fallback) ────────────────────

function KommuneCrimeView({ kommunenummer, kommuneName }: { kommunenummer: string; kommuneName?: string }) {
  const data = KOMMUNE_CRIME[kommunenummer];

  if (!data) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold">Kriminalitet</h3>
        </div>
        <p className="text-sm text-text-secondary">
          Kriminalitetsdata er ikke tilgjengelig for denne kommunen. Vi dekker ca. 175 kommuner som representerer de fleste norske byer og tettsteder.
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          Kilde: SSB: Kriminalstatistikk 2023. Bydels- og nabolagsnivå er ikke tilgjengelig.
        </p>
      </div>
    );
  }

  const isUrban = HIGH_URBAN_COMMUNES.has(kommunenummer);
  const { label, color, bg, isUrbanContext } = getLabel(data.rate, NATIONAL_AVG, isUrban);
  const pctVsNational = ((data.rate - NATIONAL_AVG) / NATIONAL_AVG * 100).toFixed(0);
  const aboveBelow = data.rate > NATIONAL_AVG ? "over" : "under";
  const barWidth = roundBarWidth(Math.min(100, (data.rate / 150) * 100));
  const nationalBarWidth = roundBarWidth(Math.min(100, (NATIONAL_AVG / 150) * 100));

  const heading = kommuneName
    ? `Kriminalitet: ${kommuneName} kommune`
    : "Kriminalitet: kommunenivå";

  return (
    <TopographicHover className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Shield className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold">{heading}</h3>
        <DataAgeChip source="SSB" date={`${data.year}`} className="ml-auto" />
      </div>

      <div className={`mb-4 flex items-start gap-2 rounded-lg border px-3 py-2 ${
        isUrbanContext
          ? "border-blue-400/20 bg-blue-500/5"
          : "border-amber-400/30 bg-amber-50 dark:bg-amber-900/20"
      }`}>
        {isUrbanContext ? (
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" strokeWidth={1.75} aria-hidden />
        ) : (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" strokeWidth={1.75} aria-hidden />
        )}
        <p className={`text-xs leading-relaxed ${isUrbanContext ? "text-blue-300" : "text-amber-800 dark:text-amber-200"}`}>
          Dette er kommunesnittet. Tallene varierer mellom områder: f.eks. er sentrum ofte høyere, villaområder lavere.
        </p>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex flex-col items-center justify-center rounded-xl px-5 py-3 text-center"
          style={{ background: bg, border: `1px solid ${color}30` }}
        >
          <span className="text-[9px] font-semibold uppercase tracking-widest text-text-tertiary">
            Kommunenivå
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color }}>
            {label}
          </span>
          <span className="text-2xl font-bold tabular-nums" style={{ color }}>
            {nb(data.rate)}
          </span>
          <span className="text-[10px] text-text-secondary">anmeldelser/1000</span>
        </div>
        <div className="flex-1 text-sm text-text-secondary leading-relaxed">
          <strong className="text-foreground">{formatPct(Math.abs(Number(pctVsNational)), 0)}</strong>{" "}
          {aboveBelow} landsgjennomsnittet på {nb(NATIONAL_AVG)} anmeldelser per 1 000 innbyggere.
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-text-secondary">Denne kommunen</span>
            <span className="font-semibold tabular-nums" style={{ color }}>{nb(data.rate)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full transition-all" style={{ width: `${barWidth}%`, background: color }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-text-secondary">Landsgjennomsnitt</span>
            <span className="font-semibold tabular-nums text-text-tertiary">{nb(NATIONAL_AVG)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full bg-text-tertiary/40 transition-all" style={{ width: `${nationalBarWidth}%` }} />
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-text-secondary">
        Statistikk fra SSB, {data.year}. Dette er kommunesnittet. Tallene varierer mellom områder: f.eks. er sentrum ofte høyere, villaområder lavere.
      </p>
    </TopographicHover>
  );
}
