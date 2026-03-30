"use client";

import { useEffect, useState } from "react";
import { Bus, Clock, MapPin, ArrowRight } from "lucide-react";

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

interface LineInfo {
  code: string;
  mode: string;
}

interface StopData {
  name: string;
  distance: number;
  lines: LineInfo[];
  departuresPerHour: number;
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

function getModeLabel(mode: string): string {
  switch (mode.toLowerCase()) {
    case "bus":   return "Buss";
    case "rail":
    case "train": return "Tog";
    case "metro": return "T-bane";
    case "tram":  return "Trikk";
    case "walk":
    case "foot":  return "Gå";
    case "water": return "Båt";
    default:      return mode;
  }
}

// Colour-coded mode badge — matching Oslo Transit's visual language
function ModeBadge({ line }: { line: LineInfo }) {
  const colors: Record<string, { bg: string; text: string }> = {
    metro: { bg: "#1E3A8A", text: "#93C5FD" },
    rail:  { bg: "#1C3A2A", text: "#4ADE80" },
    tram:  { bg: "#3B1F0E", text: "#FB923C" },
    bus:   { bg: "#1A1A1A", text: "#AAAAAA" },
    water: { bg: "#0C2340", text: "#7DD3FC" },
  };
  const c = colors[line.mode] ?? colors.bus;
  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 text-xs font-bold tabular-nums"
      style={{ backgroundColor: c.bg, color: c.text }}
      title={getModeLabel(line.mode)}
    >
      {line.code}
    </span>
  );
}

export default function TransitCard({ lat, lon, address = "" }: { lat: number; lon: number; address?: string }) {
  const [transit, setTransit] = useState<TransitData | null>(null);
  const [stops, setStops]     = useState<StopData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [transitRes, stopsRes] = await Promise.all([
          fetch(`/api/transit?lat=${lat}&lon=${lon}`),
          fetch(`/api/transit/stops?lat=${lat}&lon=${lon}`),
        ]);
        if (!transitRes.ok) throw new Error("transit failed");
        const transitJson = await transitRes.json();
        setTransit(transitJson);
        if (stopsRes.ok) {
          const stopsJson = await stopsRes.json();
          setStops(Array.isArray(stopsJson) ? stopsJson.slice(0, 3) : []);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="skeleton mb-4 h-5 w-36" />
        <div className="skeleton mb-3 h-12 w-32" />
        <div className="skeleton mb-2 h-16 w-full" />
        <div className="skeleton h-16 w-full" />
      </div>
    );
  }

  if (error || !transit) {
    return (
      <div className="rounded-xl border border-red-900/40 bg-card-bg p-4 sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <Bus className="h-4 w-4 text-accent" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold">Kollektivtransport</h3>
        </div>
        <p className="text-sm text-text-secondary">
          Kunne ikke hente rutedata. Prøv å laste siden på nytt.
        </p>
      </div>
    );
  }

  const scoreLabel = getScoreLabel(transit.durationMinutes);
  const scoreColor = getScoreColor(transit.durationMinutes);

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Bus className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold">Kollektivtransport</h3>
      </div>

      {/* Journey time hero */}
      <div className="mb-3 flex flex-wrap items-end gap-x-3 gap-y-1">
        <Clock className="mb-1 h-5 w-5 text-text-tertiary" strokeWidth={1.5} />
        <span className="text-4xl font-bold tabular-nums">{transit.durationMinutes}</span>
        <span className="mb-1 min-w-0 break-words text-text-secondary">
          min til {transit.destination}
        </span>
      </div>

      <span
        className="mb-5 inline-block rounded-full px-3 py-1 text-sm font-medium"
        style={{ backgroundColor: `${scoreColor}20`, color: scoreColor }}
      >
        {scoreLabel}
      </span>

      {/* Nearby stops */}
      {stops.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
            <MapPin className="h-3 w-3" strokeWidth={1.5} />
            Nærmeste holdeplasser
          </p>
          <div className="space-y-2">
            {stops.map((stop) => (
              <div
                key={stop.name}
                className="rounded-lg border border-card-border bg-background px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium leading-snug">{stop.name}</span>
                  <span className="shrink-0 text-xs text-text-tertiary tabular-nums whitespace-nowrap">
                    {stop.distance} m
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  {stop.lines.slice(0, 8).map((line) => (
                    <ModeBadge key={line.code} line={line} />
                  ))}
                  {stop.lines.length > 8 && (
                    <span className="text-xs text-text-tertiary">+{stop.lines.length - 8}</span>
                  )}
                  <span className="ml-auto text-xs text-text-tertiary whitespace-nowrap">
                    ~{stop.departuresPerHour}/t
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Journey legs — fallback if no stops */}
      {stops.length === 0 && transit.legs && transit.legs.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">Reiserute</p>
          <div className="space-y-1.5">
            {transit.legs.map((leg, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="shrink-0 rounded bg-background px-2 py-0.5 text-xs font-medium text-foreground">
                  {getModeLabel(leg.mode)}{leg.line ? ` ${leg.line}` : ""}
                </span>
                <span className="truncate">
                  {leg.from === "Origin" ? (address || "Startpunkt") : leg.from}
                  <ArrowRight className="inline h-3 w-3 mx-1 opacity-40" />
                  {leg.to === "Destination" ? transit.destination : leg.to}
                </span>
                <span className="ml-auto shrink-0 text-xs tabular-nums">{leg.duration} min</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
