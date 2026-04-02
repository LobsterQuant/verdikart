"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { TrendingUp, TrendingDown } from "lucide-react";

const PriceTrendChart = dynamic(() => import("@/components/PriceTrendChart"), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full" />,
});

interface QuarterData {
  quarter: string;
  price: number;
}

interface PriceTrendData {
  data: QuarterData[];
  yoyChange: number;
  source?: "bydel" | "kommune" | "national";
  sourceLabel?: string;
  lastUpdated?: string | null;
}

function formatQuarterLabel(q: string): string {
  // SSB 06035 returns annual years ("2024"), 07241 returns quarters ("2024K1")
  const qMatch = q.match(/(\d{4})K(\d)/);
  if (qMatch) return `K${qMatch[2]}'${qMatch[1].slice(2)}`;
  // Annual — just the year
  const yMatch = q.match(/(\d{4})/);
  if (yMatch) return yMatch[1];
  return q;
}

export default function PriceTrendCard({
  kommunenummer,
  postnummer = "",
}: {
  kommunenummer: string;
  postnummer?: string;
}) {
  const [data, setData] = useState<PriceTrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!kommunenummer) {
      setLoading(false);
      setError(true);
      return;
    }

    async function fetchPriceTrend() {
      try {
        const res = await fetch(
          `/api/price-trend?kommunenummer=${kommunenummer}${postnummer ? `&postnummer=${postnummer}` : ""}`
        );
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        // Normalize API response: {quarters, values, yoyChange} → {data, yoyChange}
        if (json.quarters && json.values) {
          const normalized: PriceTrendData = {
            data: json.quarters.map((q: string, i: number) => ({
              quarter: q.replace('K', 'Q'), // "2024K1" → "2024Q1" for formatter
              price: json.values[i] ?? 0,
            })),
            yoyChange: json.yoyChange ?? 0,
            source: json.source ?? "national",
            sourceLabel: json.sourceLabel ?? "",
            lastUpdated: json.lastUpdated ?? null,
          };
          setData(normalized);
        } else {
          setData(json);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPriceTrend();
  }, [kommunenummer, postnummer]);

  if (loading) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="skeleton mb-4 h-5 w-32" />
        <div className="skeleton mb-3 h-8 w-40" />
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  if (error || !data || !data.data || data.data.length === 0) {
    return (
      <div className="rounded-xl border border-red-900/40 bg-card-bg p-4 sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold">Prisutvikling</h3>
        </div>
        <p className="text-sm text-text-secondary">
          Kunne ikke hente prisdata fra SSB. Prøv igjen senere.
        </p>
      </div>
    );
  }

  const chartData = data.data.map((d) => ({
    name: formatQuarterLabel(d.quarter),
    price: d.price,
  }));

  const isPositive = data.yoyChange >= 0;

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold">Prisutvikling</h3>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span
          className="flex items-center gap-1 text-2xl font-bold"
          style={{ color: isPositive ? "#22C55E" : "#EF4444" }}
        >
          {isPositive
            ? <TrendingUp className="h-5 w-5" strokeWidth={2} />
            : <TrendingDown className="h-5 w-5" strokeWidth={2} />}
          {Math.abs(data.yoyChange).toFixed(1)}%
        </span>
        <span className="text-sm text-text-secondary">siste 12 mnd</span>
        {data.sourceLabel && (
          <span className="text-xs text-text-tertiary italic">{data.sourceLabel}</span>
        )}
        <a
          href="https://www.ssb.no/bygg-bolig-og-eiendom/eiendom/statistikk/eiendomsomsetninger"
          target="_blank"
          rel="noopener noreferrer"
          title="Kilde: SSB — Statistisk sentralbyrå, kvartalsvis"
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-card-border bg-background px-2 py-0.5 text-[10px] font-medium text-text-tertiary transition-colors hover:border-accent/30 hover:text-accent"
        >
          SSB
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M2.5 9.5 L9.5 2.5M5.5 2.5h4v4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        {data.lastUpdated && (
          <span className="ml-auto text-xs text-text-tertiary" title="SSB publiserer boligprisdata kvartalsvis. Q4 2024 er siste tilgjengelige kvartal — nyere data publiseres av SSB i 2025.">
            {data.lastUpdated.replace("K", "Q")}
          </span>
        )}
      </div>

      <div className="h-36 w-full overflow-hidden sm:h-44" style={{ minHeight: "144px" }}>
        {mounted && <PriceTrendChart chartData={chartData} />}
      </div>

      {data.source === "bydel" && (
        <p className="mt-3 text-xs text-text-tertiary">
          Bydelspris er estimert ved å justere kommunesnittet med en bydelsindeks basert på markedsrapporter. Faktiske priser kan avvike.
        </p>
      )}
    </div>
  );
}
