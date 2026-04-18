"use client";

import { useState, useMemo } from "react";
import { Calculator, Info, TrendingUp, Home, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { nb } from "@/lib/format";

// Norwegian boliglånsforskrift rules (2024):
// - Max loan = 5× gross annual income
// - Min equity = 15% (10% in Oslo requires special approval)
// - Max debt-service ratio implicit in 5× rule
// - Stress test at +5pp interest rate (bank internal — we note it)

function fmt(n: number) {
  return Math.round(n).toLocaleString("nb-NO");
}

function Slider({
  label, value, min, max, step, unit, onChange, info,
}: {
  label: string; value: number; min: number; max: number; step: number;
  unit: string; onChange: (v: number) => void; info?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium">{label}</label>
          {info && (
            <span title={info} className="cursor-help text-text-tertiary">
              <Info className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
          )}
        </div>
        <span className="text-sm font-bold tabular-nums">
          {fmt(value)} {unit}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute h-1.5 w-full rounded-full bg-card-border" />
        <div
          className="absolute h-1.5 rounded-full bg-accent"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative z-10 h-5 w-full cursor-pointer appearance-none bg-transparent
            [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent
            [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgb(var(--accent-rgb) / 0.25)]
            [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-0"
        />
      </div>
    </div>
  );
}

export default function AffordabilityCalculator() {
  const [income, setIncome] = useState(700000);          // gross annual NOK
  const [coIncome, setCoIncome] = useState(0);           // co-applicant
  const [equity, setEquity] = useState(500000);          // equity NOK
  const [existingDebt, setExistingDebt] = useState(0);  // other debt
  const [rate, setRate] = useState(5.5);                 // interest rate %
  const [years, setYears] = useState(25);                // loan term

  const results = useMemo(() => {
    const totalIncome = income + coIncome;
    // Rule 1: max loan = 5× income minus existing debt
    const maxLoanByIncome = totalIncome * 5 - existingDebt;
    // Rule 2: max price given 15% equity floor
    const maxPriceByEquity = equity / 0.15;
    // Combine: loan from equity-based price
    const loanFromEquityPrice = maxPriceByEquity - equity;

    const maxLoan = Math.max(0, Math.min(maxLoanByIncome, loanFromEquityPrice));
    const maxPrice = maxLoan + equity;

    // Monthly payment (annuity formula)
    const monthlyRate = rate / 100 / 12;
    const n = years * 12;
    const monthlyPayment =
      monthlyRate > 0
        ? (maxLoan * monthlyRate * Math.pow(1 + monthlyRate, n)) /
          (Math.pow(1 + monthlyRate, n) - 1)
        : maxLoan / n;

    // Stress test: +5pp
    const stressRate = (rate + 5) / 100 / 12;
    const stressPayment =
      stressRate > 0
        ? (maxLoan * stressRate * Math.pow(1 + stressRate, n)) /
          (Math.pow(1 + stressRate, n) - 1)
        : maxLoan / n;

    const equityPct = maxPrice > 0 ? (equity / maxPrice) * 100 : 0;
    const limitingFactor =
      maxLoanByIncome <= loanFromEquityPrice ? "income" : "equity";

    return { maxLoan, maxPrice, monthlyPayment, stressPayment, equityPct, limitingFactor, totalIncome };
  }, [income, coIncome, equity, existingDebt, rate, years]);

  const isViable = results.maxPrice > 0 && results.equityPct >= 15;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-card-border bg-card-bg p-5 sm:p-6 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="h-4.5 w-4.5 text-accent" strokeWidth={1.5} />
          <h2 className="font-semibold">Din økonomi</h2>
        </div>

        <Slider label="Bruttoinntekt (år)" value={income} min={200000} max={3000000} step={25000} unit="kr"
          onChange={setIncome} info="Brutto årslønn inkl. bonus. Norske banker bruker bruttoinntekt i gjeldsvurdering." />

        <Slider label="Medlåntakers inntekt" value={coIncome} min={0} max={2000000} step={25000} unit="kr"
          onChange={setCoIncome} info="Legg til ektefelle/samboer/medlåntaker. Sett 0 for alene." />

        <Slider label="Egenkapital" value={equity} min={50000} max={5000000} step={25000} unit="kr"
          onChange={setEquity} info="Banken krever minimum 15% egenkapital (10% i Oslo krever særskilt godkjenning)." />

        <Slider label="Annen gjeld" value={existingDebt} min={0} max={2000000} step={10000} unit="kr"
          onChange={setExistingDebt} info="Studielån, billån, kredittkort. Trekkes fra maksimalt lånebeløp (5× inntektsregel)." />

        <Slider label="Rente" value={rate} min={1} max={12} step={0.1} unit="%"
          onChange={setRate} info="Gjeldende flytende boliglånsrente. Norsk gjennomsnitt pr. mars 2026: ca. 5,5%." />

        <Slider label="Nedbetalingstid" value={years} min={5} max={30} step={1} unit="år"
          onChange={setYears} info="Maksimalt 30 år etter boliglånsforskriften." />
      </div>

      {/* Results */}
      <div className="rounded-xl border border-card-border bg-card-bg p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Home className="h-4.5 w-4.5 text-accent" strokeWidth={1.5} />
          <h2 className="font-semibold">Resultat</h2>
          <span className="ml-auto text-xs text-text-tertiary">
            Begrenset av: <span className="font-medium text-foreground">{results.limitingFactor === "income" ? "inntektsregelen (5×)" : "egenkapitalkravet (15%)"}</span>
          </span>
        </div>

        {!isViable ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" strokeWidth={1.5} />
            <p className="text-amber-300">
              Egenkapital på {fmt(equity)} kr dekker ikke 15%-kravet for noen realistisk boligpris med disse innstillingene. Øk egenkapitalen eller legg til medlåntaker.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Hero number */}
            <div className="rounded-xl bg-accent/8 border border-accent/20 p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">Maks boligpris</p>
              <p className="text-4xl font-bold tabular-nums">{fmt(results.maxPrice)} kr</p>
              <p className="mt-1 text-xs text-text-tertiary">
                Lån: {fmt(results.maxLoan)} kr · Egenkapital: {nb(results.equityPct)} %
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-card-border bg-background p-4">
                <p className="text-xs text-text-tertiary mb-1">Månedlig kostnad</p>
                <p className="text-xl font-bold tabular-nums">{fmt(results.monthlyPayment)} kr</p>
                <p className="text-[10px] text-text-tertiary mt-0.5">ved {rate}%</p>
              </div>
              <div className="rounded-xl border border-card-border bg-background p-4">
                <p className="text-xs text-text-tertiary mb-1">Stresstest (+5pp)</p>
                <p className="text-xl font-bold tabular-nums text-amber-400">{fmt(results.stressPayment)} kr</p>
                <p className="text-[10px] text-text-tertiary mt-0.5">ved {nb(rate + 5)} %</p>
              </div>
              <div className="rounded-xl border border-card-border bg-background p-4">
                <p className="text-xs text-text-tertiary mb-1">Maks lån (5× regel)</p>
                <p className="text-xl font-bold tabular-nums">{fmt(results.totalIncome * 5 - existingDebt)} kr</p>
                <p className="text-[10px] text-text-tertiary mt-0.5">5 × {fmt(results.totalIncome)} kr</p>
              </div>
              <div className="rounded-xl border border-card-border bg-background p-4">
                <p className="text-xs text-text-tertiary mb-1">Egenkapitalprosent</p>
                <p className={`text-xl font-bold tabular-nums ${results.equityPct >= 15 ? "text-green-400" : "text-red-400"}`}>
                  {nb(results.equityPct)} %
                </p>
                <p className="text-[10px] text-text-tertiary mt-0.5">krav: min. 15%</p>
              </div>
            </div>

            {/* CTA to search */}
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Finn boliger innen budsjettet</p>
                <p className="text-xs text-text-tertiary">Sjekk transport og pris for en spesifikk adresse</p>
              </div>
              <Link href="/#sok"
                className="shrink-0 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-ink transition-opacity hover:opacity-80">
                Søk →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-xl border border-card-border bg-card-bg p-4 text-xs text-text-tertiary">
        <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-tertiary" strokeWidth={1.5} />
        <p>
          Beregningen er veiledende og basert på{" "}
          <a href="https://lovdata.no/dokument/LTI/forskrift/2020-11-19-2396" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">boliglånsforskriften</a>{" "}
          (5× inntekt, 15% egenkapital). Faktisk lånekapasitet avhenger av din banks kredittvurdering, SIFO-satser og øvrig økonomi. Ikke finansiell rådgivning.
        </p>
      </div>
    </div>
  );
}
