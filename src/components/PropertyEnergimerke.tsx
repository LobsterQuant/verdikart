"use client";

import { useEffect, useState } from "react";
import { Zap, ExternalLink } from "lucide-react";
import { TopographicHover } from "@/components/motion/TopographicHover";
import { nb } from "@/lib/format";

interface EnergimerkeData {
  energikarakter: string | null;
  kwhM2: number | null;
  byggear: number | null;
  bygningskategori: string | null;
  attestUri: string | null;
  bruksareal: number | null;
  materialvalg: string | null;
}

function labelColor(label: string): { text: string; bg: string; border: string } {
  switch (label) {
    case "A":
      return { text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" };
    case "B":
    case "C":
      return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" };
    case "D":
    case "E":
      return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" };
    case "F":
    case "G":
      return { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" };
    default:
      return { text: "text-text-secondary", bg: "bg-background", border: "border-card-border" };
  }
}

function labelDescription(label: string): string {
  switch (label) {
    case "A": return "Svært energieffektiv";
    case "B": return "Energieffektiv";
    case "C": return "God energistandard";
    case "D": return "Middels energistandard";
    case "E": return "Under middels";
    case "F": return "Svak energistandard";
    case "G": return "Dårlig energistandard";
    default: return "";
  }
}

// Enova residential categories. Everything else (Kontorbygg, Forretningsbygg,
// Hotell, Skole, Sykehus, Industri, etc.) is a næringsbygg where per-m² energy
// intensity compares apples to oranges with a home.
const RESIDENTIAL_KEYWORDS = ["småhus", "bolig"];

function isResidentialCategory(kategori: string | null): boolean {
  if (!kategori) return true; // unknown → default to residential path
  const k = kategori.toLowerCase();
  return RESIDENTIAL_KEYWORDS.some((kw) => k.includes(kw));
}

// Enova's CSV occasionally returns total-building kWh instead of kWh/m² for
// large non-residential entries. Cap at a physically plausible ceiling —
// Norwegian homes are typically 80–300 kWh/m²/år.
const MAX_PLAUSIBLE_KWH_PER_SQM = 500;

export default function PropertyEnergimerke({
  postnummer,
  adresse,
}: {
  postnummer: string;
  adresse: string;
}) {
  const [data, setData] = useState<EnergimerkeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postnummer || !adresse) {
      setLoading(false);
      return;
    }

    async function fetchEnergimerke() {
      try {
        const res = await fetch(
          `/api/energimerke?postnummer=${encodeURIComponent(postnummer)}&adresse=${encodeURIComponent(adresse)}`
        );
        if (res.ok) {
          const json = await res.json();
          if (json.energikarakter) {
            setData(json);
          }
        }
      } catch {
        // Silent — energy label is a bonus, not critical
      } finally {
        setLoading(false);
      }
    }
    fetchEnergimerke();
  }, [postnummer, adresse]);

  if (loading) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="skeleton mb-3 h-5 w-32" />
        <div className="skeleton h-14 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <Zap className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold">Energimerke</h3>
        </div>
        <p className="text-sm text-text-secondary">
          Ingen energiattest registrert for denne adressen.
        </p>
        <p className="mt-1 text-xs text-text-tertiary">
          Energimerking har vært påkrevd ved salg siden 2010, men ikke alle boliger er registrert hos Enova.
        </p>
      </div>
    );
  }

  const badge = labelColor(data.energikarakter!);
  const desc = labelDescription(data.energikarakter!);
  const residential = isResidentialCategory(data.bygningskategori);
  // Only show kWh/m² when we trust the number — residential AND within range.
  const kwhTrusted =
    residential && data.kwhM2 !== null && data.kwhM2 > 0 && data.kwhM2 <= MAX_PLAUSIBLE_KWH_PER_SQM;

  return (
    <TopographicHover className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Zap className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold">Energimerke</h3>
      </div>

      <div className="flex items-center gap-4">
        {/* Big label badge */}
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-xl border text-3xl font-bold ${badge.text} ${badge.bg} ${badge.border}`}
        >
          {data.energikarakter}
        </div>

        <div className="flex-1">
          <p className={`text-sm font-semibold ${badge.text}`}>{desc}</p>
          {kwhTrusted && (
            <p className="mt-0.5 text-xs text-text-tertiary">
              {nb(data.kwhM2!, 0)} kWh/m² per år
            </p>
          )}
          {!residential && data.bygningskategori && (
            <p className="mt-0.5 text-xs text-text-tertiary">
              Næringsbygg ({data.bygningskategori}) — kWh/m² ikke sammenlignbart med bolig.
            </p>
          )}
          {data.byggear && (
            <p className="text-xs text-text-tertiary">
              Byggeår: {data.byggear}
              {data.bruksareal ? ` · ${data.bruksareal} m²` : ""}
              {data.materialvalg ? ` · ${data.materialvalg}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Energy scale bar */}
      <div className="mt-4 flex gap-0.5">
        {["A", "B", "C", "D", "E", "F", "G"].map((label) => {
          const isActive = label === data.energikarakter;
          const colors: Record<string, string> = {
            A: "bg-green-500", B: "bg-green-400", C: "bg-emerald-400",
            D: "bg-yellow-400", E: "bg-amber-400", F: "bg-orange-500", G: "bg-red-500",
          };
          return (
            <div
              key={label}
              className={`flex-1 rounded-sm text-center text-[10px] font-bold transition-all ${
                isActive
                  ? `${colors[label]} text-white py-1.5 scale-110`
                  : `${colors[label]}/20 text-text-tertiary py-1`
              }`}
            >
              {label}
            </div>
          );
        })}
      </div>

      {data.attestUri && (
        <a
          href={data.attestUri}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          Se full energiattest
          <ExternalLink className="h-3 w-3" strokeWidth={2} />
        </a>
      )}

      <p className="mt-3 text-xs text-text-tertiary">
        Kilde: Enova Energimerkesystemet. Offisielt energimerke for denne boligen.
      </p>
    </TopographicHover>
  );
}
