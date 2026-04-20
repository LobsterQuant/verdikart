"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Droplets, Mountain, Waves } from "lucide-react";
import { TopographicHover } from "@/components/motion/TopographicHover";

interface ClimateRiskData {
  floodRisk: "Høy" | "Moderat" | "Lav" | "Ukjent";
  quickClay: boolean;
  stormSurge: boolean;
}

function riskColor(risk: string): string {
  if (risk === "Høy") return "#EF4444";
  if (risk === "Moderat") return "#EAB308";
  return "#22C55E";
}

interface ClimateRiskCardProps {
  lat: number;
  lon: number;
  onDataStatus?: (hasData: boolean) => void;
  hideWhenEmpty?: boolean;
}

export default function ClimateRiskCard({ lat, lon, onDataStatus, hideWhenEmpty }: ClimateRiskCardProps) {
  const [data, setData] = useState<ClimateRiskData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/climate-risk?lat=${lat}&lon=${lon}`);
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
    const hasData = !!data && data.floodRisk !== "Ukjent";
    onDataStatus?.(hasData);
  }, [loading, data, onDataStatus]);

  if (loading) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="skeleton mb-4 h-5 w-28" />
        <div className="space-y-3">
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!data || data.floodRisk === "Ukjent") {
    if (hideWhenEmpty) return null;
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
          <AlertTriangle className="h-5 w-5 text-text-secondary" />
          Klimarisiko
        </h3>
        <p className="text-sm text-text-secondary">
          Ingen registrert klimarisiko for denne adressen, eller data er ikke tilgjengelig.
        </p>
        <p className="mt-1 text-xs text-text-secondary">Kilde: NVE</p>
      </div>
    );
  }

  const floodColor = riskColor(data.floodRisk);
  const hasRisk = data.floodRisk !== "Lav" || data.quickClay || data.stormSurge;

  const risks = [
    {
      icon: <Droplets className="h-4 w-4" />,
      label: "Flomrisiko",
      value: data.floodRisk,
      color: floodColor,
      show: true,
    },
    {
      icon: <Mountain className="h-4 w-4" />,
      label: "Kvikkleire",
      value: data.quickClay ? "Registrert" : "Ikke registrert",
      color: data.quickClay ? "#EF4444" : "#22C55E",
      show: true,
    },
    {
      icon: <Waves className="h-4 w-4" />,
      label: "Stormflo",
      value: data.stormSurge ? "Utsatt" : "Ikke utsatt",
      color: data.stormSurge ? "#EAB308" : "#22C55E",
      show: true,
    },
  ];

  return (
    <TopographicHover className={`rounded-xl border p-4 sm:p-6 ${hasRisk ? "border-yellow-500/30 bg-yellow-500/5" : "border-card-border bg-card-bg"}`}>
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <AlertTriangle className={`h-5 w-5 ${hasRisk ? "text-yellow-500" : "text-green-500"}`} />
        Klimarisiko
      </h3>
      <div className="space-y-3">
        {risks.filter(r => r.show).map((risk) => (
          <div
            key={risk.label}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-background px-4 py-3"
          >
            <span className="flex items-center gap-2 text-sm text-text-secondary">
              {risk.icon}
              {risk.label}
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${risk.color}20`,
                color: risk.color,
              }}
            >
              {risk.value}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-text-secondary">
        Kilde: NVE: Norges vassdrags- og energidirektorat
      </p>
    </TopographicHover>
  );
}
