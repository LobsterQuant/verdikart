"use client";

import { Shield } from "lucide-react";

// SSB table 08484 — Anmeldte lovbrudd per 1000 innbyggere (2023, kommunenivå)
// Source: SSB Kriminalstatistikk 2023 (published 2024)
// National average: 57.4 per 1000
const KOMMUNE_CRIME: Record<string, { rate: number; year: number }> = {
  "0301": { rate: 93.2, year: 2023 }, // Oslo
  "4601": { rate: 52.1, year: 2023 }, // Bergen
  "5001": { rate: 49.8, year: 2023 }, // Trondheim
  "1103": { rate: 43.6, year: 2023 }, // Stavanger
  "3024": { rate: 34.2, year: 2023 }, // Bærum
  "4204": { rate: 38.7, year: 2023 }, // Kristiansand
  "3004": { rate: 35.1, year: 2023 }, // Fredrikstad
  "1108": { rate: 41.2, year: 2023 }, // Sandnes
  "3005": { rate: 44.8, year: 2023 }, // Drammen
  "5401": { rate: 48.3, year: 2023 }, // Tromsø
  "3003": { rate: 38.9, year: 2023 }, // Sarpsborg
  "3807": { rate: 36.4, year: 2023 }, // Skien
  "1804": { rate: 42.1, year: 2023 }, // Bodø
  "4203": { rate: 35.8, year: 2023 }, // Arendal
  "3811": { rate: 37.2, year: 2023 }, // Hamar
};

const NATIONAL_AVG = 57.4;

// Large cities (Oslo, Bergen, Trondheim, Stavanger) always read "over snitt" due to urban density —
// show a neutral label so Frogner/Majorstuen buyers aren't misled.
const HIGH_URBAN_COMMUNES = new Set(["0301", "4601", "5001", "1103"]);

function getLabel(rate: number, kommunenummer?: string): { label: string; color: string; bg: string; isUrbanContext: boolean } {
  const isUrban = HIGH_URBAN_COMMUNES.has(kommunenummer ?? "");
  const ratio = rate / NATIONAL_AVG;
  if (ratio < 0.6) return { label: "Lavt", color: "#22C55E", bg: "rgba(34,197,94,0.1)", isUrbanContext: false };
  if (ratio < 0.9) return { label: "Under snitt", color: "#86EFAC", bg: "rgba(134,239,172,0.1)", isUrbanContext: false };
  if (ratio < 1.1) {
    // Urban cities near national average get informational (ℹ️) context, not warning (⚠️)
    if (isUrban) return { label: "Storbysnitt", color: "#60A5FA", bg: "rgba(96,165,250,0.1)", isUrbanContext: true };
    return { label: "Rundt snitt", color: "#EAB308", bg: "rgba(234,179,8,0.1)", isUrbanContext: false };
  }
  if (ratio < 1.8) {
    // Urban communes: soften to neutral blue instead of alarming orange
    if (isUrban) return { label: "Storbysnitt", color: "#60A5FA", bg: "rgba(96,165,250,0.1)", isUrbanContext: true };
    return { label: "Over snitt", color: "#F97316", bg: "rgba(249,115,22,0.1)", isUrbanContext: false };
  }
  return { label: "Høyt", color: "#EF4444", bg: "rgba(239,68,68,0.1)", isUrbanContext: false };
}

export default function CrimeCard({ kommunenummer }: { kommunenummer: string }) {
  const data = KOMMUNE_CRIME[kommunenummer];

  if (!data) return null;

  const { label, color, bg, isUrbanContext } = getLabel(data.rate, kommunenummer);
  const pctVsNational = ((data.rate - NATIONAL_AVG) / NATIONAL_AVG * 100).toFixed(0);
  const aboveBelow = data.rate > NATIONAL_AVG ? "over" : "under";
  const barWidth = Math.min(100, (data.rate / 150) * 100); // scale to 150 max
  const nationalBarWidth = Math.min(100, (NATIONAL_AVG / 150) * 100);

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Shield className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold">Kriminalitetsnivå (kommunenivå)</h3>
      </div>

      {/* Kommune-level disclaimer */}
      <div className={`mb-4 flex items-start gap-2 rounded-lg border px-3 py-2 ${
        isUrbanContext
          ? "border-blue-400/20 bg-blue-500/5"
          : "border-amber-400/30 bg-amber-50 dark:bg-amber-900/20"
      }`}>
        <span className="mt-0.5 text-base leading-none" aria-hidden>{isUrbanContext ? "ℹ️" : "⚠️"}</span>
        <p className={`text-xs leading-relaxed ${isUrbanContext ? "text-blue-300" : "text-amber-800 dark:text-amber-200"}`}>
          Tallene gjelder hele kommunen, ikke enkeltbydeler.
          {isUrbanContext && (
            <> Store byer har naturlig høyere kommunedata enn landsgjennomsnittet. Bydeler som Frogner, Majorstuen og Nordberg har historisk lavere nivå enn Oslo-snittet.</>
          )}
          {!isUrbanContext && kommunenummer === "0301" && (
            <> Frogner og Majorstuen har historisk lavere kriminalitet enn Oslo-snittet.</>
          )}
        </p>
      </div>

      {/* Hero badge */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex flex-col items-center justify-center rounded-xl px-5 py-3 text-center"
          style={{ background: bg, border: `1px solid ${color}30` }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color }}>
            {label}
          </span>
          <span className="text-2xl font-bold tabular-nums" style={{ color }}>
            {data.rate}
          </span>
          <span className="text-[10px] text-text-tertiary">anmeldelser/1000</span>
        </div>
        <div className="flex-1 text-sm text-text-secondary leading-relaxed">
          <strong className="text-foreground">{Math.abs(Number(pctVsNational))}%</strong>{" "}
          {aboveBelow} landsgjennomsnittet på {NATIONAL_AVG} anmeldelser per 1 000 innbyggere.
          {kommunenummer === "0301" && (
            <p className="mt-1 text-xs text-text-tertiary">Adresser i Frogner og Majorstuen har typisk lavere nivå enn Oslo-snittet.</p>
          )}
        </div>
      </div>

      {/* Bar comparison */}
      <div className="space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-text-secondary">Denne kommunen</span>
            <span className="font-semibold tabular-nums" style={{ color }}>{data.rate}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full transition-all" style={{ width: `${barWidth}%`, background: color }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-text-secondary">Landsgjennomsnitt</span>
            <span className="font-semibold tabular-nums text-text-tertiary">{NATIONAL_AVG}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full bg-text-tertiary/40 transition-all" style={{ width: `${nationalBarWidth}%` }} />
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-text-tertiary">
        Kilde: SSB — Kriminalstatistikk {data.year}, kommunenivå. Merk: data gjelder hele kommunen, ikke spesifikt nabolaget.
      </p>
    </div>
  );
}
