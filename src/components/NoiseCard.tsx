"use client";

import { useEffect, useState } from "react";

interface NoiseData {
  road?: number;
  air?: number;
  rail?: number;
  // API field names from /api/noise
  veinoise?: number;
  flynoise?: number;
  jernbanenoise?: number;
}

function getNoiseColor(db: number): string {
  if (db < 50) return "#22C55E";
  if (db <= 65) return "#EAB308";
  return "#EF4444";
}

function getNoiseLabel(db: number): string {
  if (db < 50) return "Lavt";
  if (db <= 65) return "Moderat";
  return "Høyt";
}

export default function NoiseCard({ lat, lon }: { lat: number; lon: number }) {
  const [data, setData] = useState<NoiseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchNoise() {
      try {
        const res = await fetch(`/api/noise?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        // Normalise API field names → component field names
        setData({
          road: json.road ?? json.veinoise ?? undefined,
          air: json.air ?? json.flynoise ?? undefined,
          rail: json.rail ?? json.jernbanenoise ?? undefined,
        });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchNoise();
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="skeleton mb-4 h-5 w-24" />
        <div className="space-y-3">
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-full" />
        </div>
      </div>
    );
  }

  const hasData = data && (data.road != null || data.air != null || data.rail != null);

  if (error || !hasData) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <h3 className="mb-2 text-lg font-semibold">Støynivå</h3>
        <p className="text-sm text-text-secondary">
          Ingen støydata tilgjengelig for denne adressen fra Kartverkets støykart.
        </p>
        <p className="mt-1 text-xs text-text-tertiary">
          Kilde: Kartverket / Geonorge (Veg_Lden, Fly_Lden, Jernbane_Lden)
        </p>
      </div>
    );
  }

  const sources = [
    { label: "Veitrafikk", value: data.road },
    { label: "Flytrafikk", value: data.air },
    { label: "Togtrafikk", value: data.rail },
  ];

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <h3 className="mb-4 text-lg font-semibold">Støynivå</h3>
      <div className="space-y-3">
        {sources.map((source) => {
          if (source.value === undefined || source.value === null) return null;
          const color = getNoiseColor(source.value);
          const label = getNoiseLabel(source.value);
          return (
            <div
              key={source.label}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-background px-4 py-3"
            >
              <span className="text-sm text-text-secondary">
                {source.label}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-medium tabular-nums">
                  {source.value} dB
                </span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${color}20`,
                    color: color,
                  }}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
