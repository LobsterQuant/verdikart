"use client";

import { useEffect, useState } from "react";
import { Wifi } from "lucide-react";
import DataAgeChip from "@/components/DataAgeChip";
import { nb } from "@/lib/format";

interface BroadbandData {
  maxDownload: number | null;
  maxUpload: number | null;
  fiberAvailable: boolean;
  providers: string[];
  coverageSource: string | null;
}

function speedColor(mbps: number): string {
  if (mbps >= 100) return "#22C55E";
  if (mbps >= 30) return "#3b82f6";
  if (mbps >= 4) return "#EAB308";
  return "#EF4444";
}

function speedLabel(mbps: number): string {
  if (mbps >= 100) return "Høy hastighet";
  if (mbps >= 30) return "God hastighet";
  if (mbps >= 4) return "Grunnleggende";
  return "Lav hastighet";
}

export default function BroadbandCard({ lat, lon }: { lat: number; lon: number }) {
  const [data, setData] = useState<BroadbandData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/broadband?lat=${lat}&lon=${lon}`);
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

  if (loading) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="skeleton mb-4 h-5 w-24" />
        <div className="skeleton h-12 w-full" />
      </div>
    );
  }

  if (!data || data.maxDownload === null) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
          <Wifi className="h-5 w-5 text-text-secondary" />
          Bredbånd
        </h3>
        <p className="text-sm text-text-secondary">
          Ingen bredbåndsdata tilgjengelig for denne adressen.
        </p>
      </div>
    );
  }

  const color = speedColor(data.maxDownload);

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Wifi className="h-5 w-5 text-text-secondary" />
          Bredbånd
        </h3>
        <DataAgeChip source="Nkom" date="2024" className="ml-auto" />
      </div>

      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>
          {data.maxDownload >= 1000
            ? `${nb(data.maxDownload / 1000)} Gbps`
            : `${data.maxDownload} Mbps`}
        </span>
        <span className="text-xs text-text-tertiary">maks nedlasting</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2">
          <span className="text-xs text-text-secondary">Hastighet</span>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {speedLabel(data.maxDownload)}
          </span>
        </div>

        {data.maxUpload !== null && (
          <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2">
            <span className="text-xs text-text-secondary">Opplasting</span>
            <span className="text-xs font-medium tabular-nums">
              {data.maxUpload} Mbps
            </span>
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2">
          <span className="text-xs text-text-secondary">Fiber</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              data.fiberAvailable
                ? "bg-green-500/20 text-green-500"
                : "bg-yellow-500/20 text-yellow-500"
            }`}
          >
            {data.fiberAvailable ? "Tilgjengelig" : "Ikke registrert"}
          </span>
        </div>

        {data.providers.length > 0 && (
          <div className="rounded-lg bg-background px-3 py-2">
            <span className="mb-1 block text-xs text-text-secondary">Leverandører</span>
            <div className="flex flex-wrap gap-1">
              {data.providers.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-card-border px-2 py-0.5 text-[10px] text-text-secondary"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-text-tertiary">
        Kilde: {data.coverageSource ?? "Nkom"}
      </p>
    </div>
  );
}
