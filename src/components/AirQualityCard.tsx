"use client";

import { useEffect, useState } from "react";
import { Wind } from "lucide-react";
import { TopographicHover } from "@/components/motion/TopographicHover";

interface AirQualityData {
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  aqi: "God" | "Moderat" | "Dårlig" | "Svært dårlig" | "Ukjent";
  nearestStation: string | null;
  distanceKm: number | null;
}

function aqiColor(aqi: string): string {
  if (aqi === "God") return "#22C55E";
  if (aqi === "Moderat") return "#EAB308";
  if (aqi === "Dårlig") return "#F97316";
  if (aqi === "Svært dårlig") return "#EF4444";
  return "#94a3b8";
}

interface AirQualityCardProps {
  lat: number;
  lon: number;
  onDataStatus?: (hasData: boolean) => void;
  hideWhenEmpty?: boolean;
}

export default function AirQualityCard({ lat, lon, onDataStatus, hideWhenEmpty }: AirQualityCardProps) {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error("Failed");
        setData(await res.json());
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [lat, lon]);

  useEffect(() => {
    if (loading) return;
    const hasData = !!data && data.aqi !== "Ukjent";
    onDataStatus?.(hasData);
  }, [loading, data, onDataStatus]);

  if (loading) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="skeleton mb-4 h-5 w-24" />
        <div className="skeleton h-12 w-full" />
      </div>
    );
  }

  if (!data || data.aqi === "Ukjent") {
    if (hideWhenEmpty) return null;
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
          <Wind className="h-5 w-5 text-text-secondary" />
          Luftkvalitet
        </h3>
        <p className="text-sm text-text-secondary">
          Ingen målestasjon i nærheten. NILU dekker primært byområder.
        </p>
      </div>
    );
  }

  const color = aqiColor(data.aqi);
  const measurements = [
    { label: "PM2.5", value: data.pm25, unit: "µg/m³" },
    { label: "PM10", value: data.pm10, unit: "µg/m³" },
    { label: "NO₂", value: data.no2, unit: "µg/m³" },
  ].filter((m) => m.value !== null);

  return (
    <TopographicHover className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <Wind className="h-5 w-5 text-text-secondary" />
        Luftkvalitet
      </h3>

      <div className="mb-3 flex items-center gap-3">
        <span
          className="rounded-full px-3 py-1 text-sm font-semibold"
          style={{
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          {data.aqi}
        </span>
        {data.nearestStation && (
          <span className="text-xs text-text-tertiary">
            Stasjon: {data.nearestStation}
            {data.distanceKm != null && ` (${data.distanceKm} km unna)`}
          </span>
        )}
      </div>

      {measurements.length > 0 && (
        <div className="space-y-2">
          {measurements.map((m) => (
            <div
              key={m.label}
              className="flex items-center justify-between rounded-lg bg-background px-3 py-2"
            >
              <span className="text-xs text-text-secondary">{m.label}</span>
              <span className="text-xs font-medium tabular-nums">
                {m.value} {m.unit}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-text-tertiary">Kilde: NILU — Luftkvalitet.info</p>
    </TopographicHover>
  );
}
