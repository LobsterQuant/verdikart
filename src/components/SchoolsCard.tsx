"use client";

import { useEffect, useState } from "react";
import { GraduationCap, ExternalLink } from "lucide-react";
import { SkolerIcon } from "@/components/icons";

interface School {
  name: string;
  type: string;
  distance: number;
  isPrivate?: boolean;
  levelLabel?: string | null;
  pupils?: number | null;
  url?: string | null;
  nsrId?: number | null;
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

// Map kommunenummer prefix → barnehageplass URL
function barnehageLink(kommunenummer?: string): string {
  if (!kommunenummer) return "https://www.barnehagefakta.no";
  const k = kommunenummer.padStart(4, "0");
  // Oslo
  if (k === "0301") return "https://www.oslo.kommune.no/barnehage/";
  // Bergen
  if (k === "4601") return "https://www.bergen.kommune.no/innbyggerhjelpen/barnehage";
  // Trondheim
  if (k === "5001") return "https://www.trondheim.kommune.no/barnehage/";
  // Stavanger
  if (k === "1103") return "https://www.stavanger.kommune.no/barnehage/";
  // Generic UDIR barnehagefakta
  return `https://www.barnehagefakta.no/naermeste?lat=&kommunenr=${k}`;
}

export default function SchoolsCard({ lat, lon, kommunenummer }: { lat: number; lon: number; kommunenummer?: string }) {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const knrParam = kommunenummer ? `&knr=${kommunenummer}` : "";
        const res = await fetch(`/api/schools?lat=${lat}&lon=${lon}${knrParam}`);
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
  const bhLink = barnehageLink(kommunenummer);

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
                  <SkolerIcon size={16} className="text-accent shrink-0" />
                  <div className="min-w-0">
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="truncate text-sm text-text-secondary hover:text-accent transition-colors">{s.name}</a>
                    ) : (
                      <span className="truncate text-sm text-text-secondary">{s.name}</span>
                    )}
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {s.levelLabel && (
                        <span className="text-[10px] text-text-tertiary">{s.levelLabel}</span>
                      )}
                      {s.pupils != null && s.pupils > 0 && (
                        <span className="text-[10px] text-text-tertiary">· {s.pupils} elever</span>
                      )}
                      {s.isPrivate && (
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-px text-[10px] text-amber-400">Privat</span>
                      )}
                    </div>
                  </div>
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
            {kindergartens.slice(0, 4).map(s => (
              <div key={s.name} className="flex items-center justify-between rounded-lg bg-background px-3 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <SkolerIcon size={16} className="text-accent shrink-0" />
                  <div className="min-w-0">
                    <span className="truncate text-sm text-text-secondary">{s.name}</span>
                    {s.isPrivate && (
                      <span className="ml-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-px text-[10px] text-amber-400">Privat</span>
                    )}
                  </div>
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-2 text-xs">
                  <span className={`font-semibold ${distanceColor(s.distance)}`}>{s.distance}m</span>
                </div>
              </div>
            ))}
          </div>
          {/* Barnehageplass link */}
          <a
            href={bhLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-1.5 text-xs text-accent hover:underline"
          >
            <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
            Søk barnehageplass i kommunen
          </a>
        </div>
      )}

      <p className="mt-3 text-xs text-text-tertiary">
        Skoler: <a href="https://data-nsr.udir.no" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Nasjonalt skoleregister (Udir)</a>
        {" · "}Barnehager: <a href="https://www.barnehagefakta.no" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">OpenStreetMap</a>
      </p>
    </div>
  );
}
