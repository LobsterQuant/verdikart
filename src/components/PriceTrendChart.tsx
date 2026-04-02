"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PriceTrendChart({
  chartData,
}: {
  chartData: { name: string; price: number }[];
}) {
  return (
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
  );
}
