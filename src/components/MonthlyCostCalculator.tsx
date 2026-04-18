"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Home, Landmark, TrendingUp, Info } from "lucide-react";
import { eiendomsskattData } from "@/data/eiendomsskatt";
import { nb } from "@/lib/format";

function fmt(n: number) {
  return Math.round(n).toLocaleString("nb-NO");
}

/**
 * Norwegian monthly cost calculator for a specific property.
 * Complementary to AffordabilityCalculator — that one asks "what can I afford?",
 * this one asks "given this specific price, what will it cost me per month?".
 *
 * Deep-link params (all optional):
 *   ?pris=5000000   — property price in NOK
 *   ?knr=0301       — kommunenummer (for eiendomsskatt lookup)
 *   ?ek=750000      — equity in NOK
 */
export default function MonthlyCostCalculator() {
  const params = useSearchParams();
  const initialPrice = Number(params.get("pris")) || 5_000_000;
  const initialKnr = params.get("knr") ?? "0301";
  const initialEquity = Number(params.get("ek")) || Math.round(initialPrice * 0.15);

  const [price, setPrice] = useState(initialPrice);
  const [equity, setEquity] = useState(initialEquity);
  const [rate, setRate] = useState(5.5);
  const [years, setYears] = useState(25);
  const [kommunenummer, setKommunenummer] = useState(initialKnr);

  // Re-sync if URL params change after mount (e.g. new deeplink in same tab)
  useEffect(() => {
    const p = Number(params.get("pris"));
    if (p > 0) setPrice(p);
    const knr = params.get("knr");
    if (knr) setKommunenummer(knr);
    const ek = Number(params.get("ek"));
    if (ek > 0) setEquity(ek);
  }, [params]);

  const results = useMemo(() => {
    const loan = Math.max(0, price - equity);
    const equityPct = price > 0 ? (equity / price) * 100 : 0;

    // Annuity monthly payment
    const monthlyRate = rate / 100 / 12;
    const n = years * 12;
    const monthlyMortgage =
      loan === 0
        ? 0
        : monthlyRate > 0
          ? (loan * monthlyRate * Math.pow(1 + monthlyRate, n)) /
            (Math.pow(1 + monthlyRate, n) - 1)
          : loan / n;

    // Stress test (+3pp, standard Norwegian bank stress scenario for existing borrowers)
    const stressMonthlyRate = (rate + 3) / 100 / 12;
    const stressMonthly =
      loan === 0
        ? 0
        : stressMonthlyRate > 0
          ? (loan * stressMonthlyRate * Math.pow(1 + stressMonthlyRate, n)) /
            (Math.pow(1 + stressMonthlyRate, n) - 1)
          : loan / n;

    // Eiendomsskatt — annual, divided by 12. Honours reduksjonsfaktor (e.g. 0.7)
    // and bunnfradrag when the kommune has them (Oslo: 70 % × boligverdi − 4,9 MNOK).
    const taxData = eiendomsskattData[kommunenummer];
    let annualTax = 0;
    if (taxData?.hasTax && taxData.promille) {
      const reduction = taxData.reductionFactor ?? 1;
      const bunnfradrag = taxData.bunnfradrag ?? 0;
      const taxable = Math.max(0, price * reduction - bunnfradrag);
      annualTax = Math.round((taxable * taxData.promille) / 1000);
    }
    const monthlyTax = annualTax / 12;

    // Document fee (dokumentavgift) — one-time, 2.5% of price for selveier (informational)
    const documentFee = Math.round(price * 0.025);

    // Total monthly housing cost (excluding fellesutgifter which we don't know)
    const totalMonthly = monthlyMortgage + monthlyTax;

    // Total interest paid over the loan term
    const totalInterest = Math.max(0, monthlyMortgage * n - loan);

    return {
      loan,
      equityPct,
      monthlyMortgage,
      stressMonthly,
      annualTax,
      monthlyTax,
      totalMonthly,
      documentFee,
      totalInterest,
      taxData,
    };
  }, [price, equity, rate, years, kommunenummer]);

  const kommuneOptions = useMemo(
    () =>
      Object.values(eiendomsskattData)
        .sort((a, b) => a.name.localeCompare(b.name, "nb"))
        .map((k) => ({ code: k.kommunenummer, name: k.name })),
    [],
  );

  const equityBelowMin = results.equityPct < 15;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-card-border bg-card-bg p-5 sm:p-6 space-y-5">
        <div className="mb-2 flex items-center gap-2">
          <Home className="h-4 w-4 text-accent" strokeWidth={1.5} />
          <h2 className="font-semibold">Boligens detaljer</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Boligpris"
            value={price}
            onChange={setPrice}
            suffix="kr"
            step={100_000}
          />
          <NumberField
            label="Egenkapital"
            value={equity}
            onChange={setEquity}
            suffix="kr"
            step={25_000}
          />
          <NumberField
            label="Rente"
            value={rate}
            onChange={setRate}
            suffix="%"
            step={0.1}
            decimals={1}
          />
          <NumberField
            label="Nedbetalingstid"
            value={years}
            onChange={setYears}
            suffix="år"
            step={1}
          />
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Kommune</label>
            <select
              value={kommunenummer}
              onChange={(e) => setKommunenummer(e.target.value)}
              className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
            >
              {kommuneOptions.map((k) => (
                <option key={k.code} value={k.code}>
                  {k.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-text-tertiary">
              Velg kommune for å inkludere eiendomsskatt i månedskostnaden.
            </p>
          </div>
        </div>

        {equityBelowMin && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-amber-300">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
            <p>
              Egenkapital er {nb(results.equityPct)} % — under bankenes minstekrav på 15 %.
              Tallet beregnes likevel, men du må forvente avslag eller særskilt godkjenning.
            </p>
          </div>
        )}
      </div>

      {/* Hero result */}
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5 text-center sm:p-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
          Total månedskostnad
        </p>
        <p className="text-4xl font-bold tabular-nums sm:text-5xl">
          {fmt(results.totalMonthly)} kr
        </p>
        <p className="mt-2 text-xs text-text-tertiary">
          Lån + eiendomsskatt. Ekskl. fellesutgifter og forsikring.
        </p>
      </div>

      {/* Breakdown */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-card-border bg-card-bg p-4">
          <div className="mb-1 flex items-center gap-2 text-xs text-text-tertiary">
            <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} /> Lånekostnad (annuitet)
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {fmt(results.monthlyMortgage)} kr
          </p>
          <p className="mt-0.5 text-[10px] text-text-tertiary">
            Lån {fmt(results.loan)} kr · {rate}% · {years} år
          </p>
        </div>

        <div className="rounded-xl border border-card-border bg-card-bg p-4">
          <div className="mb-1 flex items-center gap-2 text-xs text-text-tertiary">
            <Landmark className="h-3.5 w-3.5" strokeWidth={1.5} /> Eiendomsskatt /mnd
          </div>
          {results.taxData?.hasTax && results.taxData.promille ? (
            <>
              <p className="text-2xl font-bold tabular-nums">
                {fmt(results.monthlyTax)} kr
              </p>
              <p className="mt-0.5 text-[10px] text-text-tertiary">
                {results.taxData.bunnfradrag
                  ? `${results.taxData.promille}‰ etter bunnfradrag · ${fmt(results.annualTax)} kr/år`
                  : `${results.taxData.promille}‰ av ${fmt(price)} kr · ${fmt(results.annualTax)} kr/år`}
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold tabular-nums text-green-400">0 kr</p>
              <p className="mt-0.5 text-[10px] text-text-tertiary">
                {results.taxData?.name ?? "Denne kommunen"} har ikke eiendomsskatt
              </p>
            </>
          )}
        </div>

        <div className="rounded-xl border border-card-border bg-card-bg p-4">
          <div className="mb-1 text-xs text-text-tertiary">Stresstest (+3pp)</div>
          <p className="text-2xl font-bold tabular-nums text-amber-400">
            {fmt(results.stressMonthly)} kr
          </p>
          <p className="mt-0.5 text-[10px] text-text-tertiary">
            ved {nb(rate + 3)} % — tåler du dette?
          </p>
        </div>

        <div className="rounded-xl border border-card-border bg-card-bg p-4">
          <div className="mb-1 text-xs text-text-tertiary">Total renter over {years} år</div>
          <p className="text-2xl font-bold tabular-nums">
            {fmt(results.totalInterest)} kr
          </p>
          <p className="mt-0.5 text-[10px] text-text-tertiary">
            Det du betaler i rente før du eier boligen helt
          </p>
        </div>
      </div>

      {/* Upfront one-time costs */}
      <div className="rounded-xl border border-card-border bg-card-bg/60 p-4">
        <p className="mb-2 text-sm font-semibold">Engangskostnader ved kjøp</p>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-2 rounded-lg bg-background px-3 py-2">
            <span className="text-text-secondary">Dokumentavgift (2,5%)</span>
            <span className="font-semibold tabular-nums">{fmt(results.documentFee)} kr</span>
          </div>
          <div className="flex items-baseline justify-between gap-2 rounded-lg bg-background px-3 py-2">
            <span className="text-text-secondary">Tinglysing (est.)</span>
            <span className="font-semibold tabular-nums">585 kr</span>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-text-tertiary">
          Dokumentavgift gjelder kun selveierbolig. Borettslag/aksjeleilighet: kun tinglysingsgebyr.
        </p>
      </div>

      <p className="text-xs text-text-tertiary">
        Beregning er veiledende. Faktisk månedskostnad avhenger av fellesutgifter, forsikring,
        vedlikehold og din banks tilbud. Ikke finansiell rådgivning.
      </p>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  step,
  decimals = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
  step: number;
  decimals?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          min={0}
          step={step}
          onChange={(e) => {
            const raw = e.target.value;
            const n = Number(raw);
            if (!Number.isNaN(n)) onChange(decimals > 0 ? n : Math.round(n));
          }}
          className="w-full rounded-lg border border-card-border bg-background px-3 py-2 pr-10 text-sm tabular-nums focus:border-accent focus:outline-none"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-tertiary">
          {suffix}
        </span>
      </div>
    </div>
  );
}
