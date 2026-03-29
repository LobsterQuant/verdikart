"use client";

import { useEffect, useState } from "react";

interface Leg {
  mode: string;
  from: string;
  to: string;
  duration: number;
  line?: string;
}

interface TransitData {
  durationMinutes: number;
  destination: string;
  legs?: Leg[];
}

function getScoreLabel(minutes: number): string {
  if (minutes < 10) return "Utmerket";
  if (minutes <= 20) return "Bra";
  if (minutes <= 35) return "OK";
  return "Dårlig";
}

function getScoreColor(minutes: number): string {
  if (minutes < 10) return "#22C55E";
  if (minutes <= 20) return "#0066FF";
  if (minutes <= 35) return "#EAB308";
  return "#EF4444";
}

function getModeIcon(mode: string): string {
  switch (mode.toLowerCase()) {
    case "bus":
      return "Buss";
    case "rail":
    case "train":
      return "Tog";
    case "metro":
      return "T-bane";
    case "tram":
      return "Trikk";
    case "walk":
    case "foot":
      return "Gå";
    default:
      return mode;
  }
}

export default function TransitCard({ lat, lon }: { lat: number; lon: number }) {
  const [data, setData] = useState<TransitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchTransit() {
      try {
        const res = await fetch(`/api/transit?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        setData(json);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchTransit();
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-6">
        <div className="skeleton mb-4 h-5 w-36" />
        <div className="skeleton mb-3 h-12 w-32" />
        <div className="skeleton h-4 w-48" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-6">
        <h3 className="mb-2 text-lg font-semibold">Kollektivtransport</h3>
        <p className="text-sm text-text-secondary">Data ikke tilgjengelig</p>
      </div>
    );
  }

  const scoreLabel = getScoreLabel(data.durationMinutes);
  const scoreColor = getScoreColor(data.durationMinutes);

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-6">
      <h3 className="mb-4 text-lg font-semibold">Kollektivtransport</h3>

      <div className="mb-4 flex items-end gap-3">
        <span className="text-4xl font-bold tabular-nums">
          {data.durationMinutes}
        </span>
        <span className="mb-1 text-text-secondary">min til Oslo S</span>
      </div>

      <span
        className="inline-block rounded-full px-3 py-1 text-sm font-medium"
        style={{
          backgroundColor: `${scoreColor}20`,
          color: scoreColor,
        }}
      >
        {scoreLabel}
      </span>

      {data.legs && data.legs.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Reiserute
          </p>
          <div className="space-y-1.5">
            {data.legs.map((leg, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-text-secondary"
              >
                <span className="shrink-0 rounded bg-background px-2 py-0.5 text-xs font-medium text-foreground">
                  {getModeIcon(leg.mode)}
                  {leg.line ? ` ${leg.line}` : ""}
                </span>
                <span className="truncate">
                  {leg.from} &rarr; {leg.to}
                </span>
                <span className="ml-auto shrink-0 text-xs tabular-nums">
                  {leg.duration} min
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
