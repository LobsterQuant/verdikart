"use client";

import { useEffect, useState } from "react";
import { BarChart2 } from "lucide-react";

interface HousingTypeRow {
  type: string;
  pricePerSqm: number;
  transactions: number;
}

interface ComparableSalesData {
  kommuneAvg: number | null;
  totalTransactions: number | null;
  byType: HousingTypeRow[];
  period: string;
  kommuneName: string;
}

const TYPE_ICONS: Record<string, string> = {
  "Eneboliger":       "🏠",
  "Småhus":           "🏘",
  "Blokkleiligheter": "🏢",
};

// Max price across types — used to draw relative bar widths
function maxPrice(rows: HousingTypeRow[]) {
  return Math.max(...rows.map((r) => r.pricePerSqm), 1);
}

export default function ComparableSalesCard({ kommunenummer }: { kommunenummer: string }) {
  const [data, setData] = useState<ComparableSalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!kommunenummer) { setLoading(false); setError(true); return; }

    async function fetchSales() {
      try {
        const res = await fetch(`/api/comparable-sales?kommunenummer=${kommunenummer}`);
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (!json.kommuneAvg) throw new Error("No data");
        setData(json);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchSales();
  }, [kommunenummer]);

  if (loading) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="skeleton mb-4 h-5 w-40" />
        <div className="skeleton mb-3 h-10 w-48" />
        <div className="skeleton mb-2 h-8 w-full" />
        <div className="skeleton mb-2 h-8 w-full" />
        <div className="skeleton h-8 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-900/40 bg-card-bg p-4 sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-accent" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold">Sammenlignbare salg</h3>
        </div>
        <p className="text-sm text-text-secondary">
          Ingen omsetningsdata tilgjengelig for denne kommunen.
        </p>
      </div>
    );
  }

  const peak = maxPrice(data.byType);

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <BarChart2 className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold">Sammenlignbare salg</h3>
        <span className="ml-auto text-xs text-text-tertiary" title="SSB publiserer årsdata for boligomsetninger. Siste tilgjengelige data er alltid forrige kalenderår.">{data.period}</span>
      </div>

      {/* Kommunesnitt hero */}
      <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-3xl font-bold tabular-nums">
          {(data.kommuneAvg ?? 0).toLocaleString("nb-NO")}
        </span>
        <span className="text-base font-medium text-text-secondary">kr/m²</span>
        <a
          href="https://www.ssb.no/bygg-bolig-og-eiendom/eiendom/statistikk/eiendomsomsetninger"
          target="_blank"
          rel="noopener noreferrer"
          title="Kilde: SSB — Statistisk sentralbyrå"
          className="inline-flex items-center gap-1 rounded-full border border-card-border bg-background px-2 py-0.5 text-[10px] font-medium text-text-tertiary transition-colors hover:border-accent/30 hover:text-accent"
        >
          SSB
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M2.5 9.5 L9.5 2.5M5.5 2.5h4v4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
      <p className="mb-4 text-xs text-text-tertiary">
        Kommunegjennomsnitt for {data.kommuneName || `kommune ${kommunenummer}`}
        {data.totalTransactions
          ? ` · ${data.totalTransactions.toLocaleString("nb-NO")} transaksjoner`
          : ""}
        {data.period ? ` · ${data.period}` : ""}
      </p>

      {/* By housing type */}
      {data.byType.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Fordeling per boligtype
          </p>
          {data.byType.map((row) => {
            const pct = Math.round((row.pricePerSqm / peak) * 100);
            return (
              <div key={row.type}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm">
                    <span>{TYPE_ICONS[row.type] ?? "🏠"}</span>
                    <span>{row.type}</span>
                  </span>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-sm font-semibold tabular-nums">
                      {row.pricePerSqm.toLocaleString("nb-NO")} kr/m²
                    </span>
                    {row.transactions > 0 && (
                      <span className="hidden text-xs text-text-tertiary sm:block tabular-nums whitespace-nowrap">
                        {row.transactions.toLocaleString("nb-NO")} salg
                      </span>
                    )}
                  </div>
                </div>
                {/* Relative bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full bg-accent/60 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs text-text-tertiary">Kilde: SSB tabell 06035</p>
    </div>
  );
}
