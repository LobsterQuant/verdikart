"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TVANGSSALG_2026_DATA } from "@/data/rapport/tvangssalg-2026";

type TooltipPayloadItem = {
  dataKey: string;
  value: number;
  color: string;
  name: string;
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-card-border bg-bg-overlay px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
      <div className="mb-1 font-semibold text-foreground">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
            aria-hidden
          />
          <span className="text-text-secondary">{p.name}:</span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
      <div className="mt-1 text-[10px] text-text-tertiary">
        Rullerende 4-kvartalers sum
      </div>
    </div>
  );
}

export default function TrendChart() {
  const data = TVANGSSALG_2026_DATA.nationalTrend.map((p) => ({
    label: p.label,
    Alle: p.rolling4qTotal,
    Fritidseiendom: p.rolling4qFritid,
  }));

  return (
    <div className="h-[340px] w-full sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 16, left: 0, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgb(127 227 212 / 0.08)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#1f2937" }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            label={{
              value: "Alle eiendommer",
              angle: -90,
              position: "insideLeft",
              style: {
                fontSize: 10,
                fill: "#64748b",
                textAnchor: "middle",
              },
              offset: 12,
            }}
            width={56}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#7FE3D4", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            label={{
              value: "Fritidseiendom",
              angle: 90,
              position: "insideRight",
              style: {
                fontSize: 10,
                fill: "#7FE3D4",
                textAnchor: "middle",
              },
              offset: 12,
            }}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={28}
            iconType="line"
            wrapperStyle={{ fontSize: 12, color: "#94a3b8" }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Alle"
            name="Alle eiendommer"
            stroke="#64748b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#94a3b8" }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="Fritidseiendom"
            name="Fritidseiendom"
            stroke="#7FE3D4"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, fill: "#7FE3D4" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
