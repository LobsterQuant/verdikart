"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";

interface School {
  name: string;
  type: string;
  distance: number;
}

function typeEmoji(type: string) {
  return type === "Barnehage" ? "🧒" : "🏫";
}

function distanceLabel(d: number) {
  if (d < 200) return "Svært nær";
  if (d < 400) return "Nær";
  if (d < 700) return "OK avstand";
  return "Litt langt";
}

function distanceColor(d: number) {
  if (d < 400) return "text-green-400";
  if (d < 700) return "text-amber-400";
  return "text-text-secondary";
}

export default function SchoolsCard({ lat, lon }: { lat: number; lon: number }) {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch(`/api/schools?lat=${lat}&lon=${lon}`);
        if (res.ok) {
          const { schools: data } = await res.json();
          setSchools(data ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="skeleton mb-4 h-5 w-36" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-10 w-full rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (schools.length === 0) return null;

  const kindergartens = schools.filter(s => s.type === "Barnehage");
  const skoler = schools.filter(s => s.type === "Skole");

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <GraduationCap className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold">Skoler og barnehager</h3>
        <span className="ml-auto text-xs text-text-tertiary">innen 1 km</span>
      </div>

      {skoler.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Skoler</p>
          <div className="space-y-2">
            {skoler.slice(0, 4).map(s => (
              <div key={s.name} className="flex items-center justify-between rounded-lg bg-background px-3 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span>🏫</span>
                  <span className="truncate text-sm text-text-secondary">{s.name}</span>
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-2 text-xs">
                  <span className={`font-semibold ${distanceColor(s.distance)}`}>{s.distance}m</span>
                  <span className="text-text-tertiary hidden sm:inline">{distanceLabel(s.distance)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {kindergartens.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Barnehager</p>
          <div className="space-y-2">
            {kindergartens.slice(0, 3).map(s => (
              <div key={s.name} className="flex items-center justify-between rounded-lg bg-background px-3 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span>{typeEmoji(s.type)}</span>
                  <span className="truncate text-sm text-text-secondary">{s.name}</span>
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-2 text-xs">
                  <span className={`font-semibold ${distanceColor(s.distance)}`}>{s.distance}m</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-text-tertiary">
        Kilde: OpenStreetMap · Overpass API
      </p>
    </div>
  );
}
