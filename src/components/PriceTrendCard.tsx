"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
          <span className="ml-auto text-xs text-text-tertiary" title="Siste tilgjengelige data fra SSB">
            Sist oppdatert: {data.lastUpdated}
          </span>
        )}
      </div>

      <div className="h-36 w-full overflow-hidden sm:h-44" style={{ minHeight: "144px" }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={144}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0066FF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0066FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              tick={{ fill: "#555555", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#666666", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
              }
              width={40}
              tickCount={5}
              domain={([min, max]: readonly [number, number]) => {
                const pad = (max - min) * 0.1 || 5000;
                return [Math.floor((min - pad) / 1000) * 1000, Math.ceil((max + pad) / 1000) * 1000] as [number, number];
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111111",
                border: "1px solid #333333",
                borderRadius: "8px",
                color: "#FFFFFF",
                fontSize: "13px",
                padding: "8px 12px",
              }}
              cursor={{ stroke: "#333333", strokeWidth: 1 }}
              formatter={(value) => [
                `${Number(value).toLocaleString("nb-NO")} kr/m²`,
                "Kvadratmeterpris",
              ]}
              labelFormatter={(label) => label}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#0066FF"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
