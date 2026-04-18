"use client";

import { useState } from "react";
import { nb } from "@/lib/format";

export default function RentalYieldCalc() {
  const [kjøpesum, setKjøpesum] = useState(4_000_000);
  const [månedligLeie, setMånedligLeie] = useState(15_000);
  const [fellesgjeld, setFellesgjeld] = useState(0);
  const [felleskostnader, setFelleskostnader] = useState(2_500);

  const totalKostnad = kjøpesum + fellesgjeld;
  const bruttoAvkastning = totalKostnad > 0 ? ((månedligLeie * 12) / totalKostnad) * 100 : 0;
  const nettoAvkastning = totalKostnad > 0 ? (((månedligLeie - felleskostnader) * 12) / totalKostnad) * 100 : 0;
  const breakEven = (månedligLeie - felleskostnader) > 0 ? totalKostnad / ((månedligLeie - felleskostnader) * 12) : 0;

  const bruttoColor = bruttoAvkastning >= 5 ? "text-green-400" : bruttoAvkastning >= 4 ? "text-amber-400" : "text-orange-400";

  const inputs: Array<{ label: string; value: number; setter: (v: number) => void; suffix: string }> = [
    { label: "Kjøpesum", value: kjøpesum, setter: setKjøpesum, suffix: "kr" },
    { label: "Månedlig leieinntekt", value: månedligLeie, setter: setMånedligLeie, suffix: "kr" },
    { label: "Fellesgjeld", value: fellesgjeld, setter: setFellesgjeld, suffix: "kr" },
    { label: "Felleskostnader/mnd", value: felleskostnader, setter: setFelleskostnader, suffix: "kr" },
  ];

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-5">
      <h3 className="mb-1 text-lg font-semibold">Leieavkastningskalkulator</h3>
      <p className="mb-5 text-sm text-text-secondary">Beregn brutto og netto direkteavkastning for et utleieobjekt.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {inputs.map(({ label, value, setter, suffix }) => (
          <label key={label} className="block">
            <span className="mb-1 block text-xs font-medium text-text-secondary">{label}</span>
            <div className="flex items-center gap-2 rounded-lg border border-card-border bg-background px-3 py-2">
              <input
                type="number"
                value={value}
                onChange={(e) => setter(Number(e.target.value) || 0)}
                className="w-full bg-transparent text-sm font-medium tabular-nums text-foreground outline-none"
              />
              <span className="shrink-0 text-xs text-text-tertiary">{suffix}</span>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-card-border bg-background/50 p-3 text-center">
          <p className="text-xs font-medium text-text-tertiary">Brutto</p>
          <p className={`mt-1 text-2xl font-bold tabular-nums ${bruttoColor}`}>
            {nb(bruttoAvkastning)} %
          </p>
        </div>
        <div className="rounded-lg border border-card-border bg-background/50 p-3 text-center">
          <p className="text-xs font-medium text-text-tertiary">Netto</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {nb(nettoAvkastning)} %
          </p>
        </div>
        <div className="rounded-lg border border-card-border bg-background/50 p-3 text-center">
          <p className="text-xs font-medium text-text-tertiary">Breakeven</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {breakEven > 0 ? `${nb(breakEven)} år` : "—"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs font-medium text-text-secondary">Typisk brutto leieavkastning i norske byer</p>
        <div className="overflow-hidden rounded-lg border border-card-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border bg-background/50">
                <th className="px-3 py-2 text-left font-medium text-text-tertiary">Område</th>
                <th className="px-3 py-2 text-right font-medium text-text-tertiary">Brutto yield</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Oslo sentrum", "2,5–3,5 %"],
                ["Oslo ytre", "3,5–4,5 %"],
                ["Bergen", "4,0–5,0 %"],
                ["Trondheim", "4,5–5,5 %"],
                ["Stavanger", "4,5–5,5 %"],
                ["Andre norske byer", "5,0–7,0 %"],
              ].map(([area, yield_]) => (
                <tr key={area} className="border-b border-card-border last:border-0">
                  <td className="px-3 py-2 text-text-secondary">{area}</td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums">{yield_}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
