"use client";

import { useEffect, useState } from "react";
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
}

function formatQuarterLabel(q: string): string {
  // Expects format like "2024Q1" -> "K1 2024"
  const match = q.match(/(\d{4})Q(\d)/);
  if (match) return `K${match[2]} ${match[1]}`;
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
        <h3 className="mb-2 text-lg font-semibold">Prisutvikling</h3>
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
      <h3 className="mb-4 text-lg font-semibold">Prisutvikling</h3>

      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span
          className="text-2xl font-bold"
          style={{ color: isPositive ? "#22C55E" : "#EF4444" }}
        >
          {isPositive ? "\u2191" : "\u2193"}{" "}
          {Math.abs(data.yoyChange).toFixed(1)}%
        </span>
        <span className="text-sm text-text-secondary">siste 12 mnd</span>
        {data.sourceLabel && (
          <span className="text-xs text-text-tertiary italic">
            {data.sourceLabel}
          </span>
        )}
      </div>

      <div className="h-36 w-full overflow-hidden sm:h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
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
              tick={{ fill: "#555555", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
              }
              width={36}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111111",
                border: "1px solid #1A1A1A",
                borderRadius: "8px",
                color: "#FFFFFF",
                fontSize: "13px",
              }}
              formatter={(value) => [
                `${Number(value).toLocaleString("nb-NO")} kr/m²`,
                "Kvadratmeterpris",
              ]}
              labelFormatter={(label) => `År: ${label}`}
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
