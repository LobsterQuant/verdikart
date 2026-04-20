"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";

const FRITID_KEYWORDS = ["fritid", "hytte"];

function isFritidCategory(kategori: string | null | undefined): boolean {
  if (!kategori) return false;
  const k = kategori.toLowerCase();
  return FRITID_KEYWORDS.some((kw) => k.includes(kw));
}

export default function RapportKort({
  postnummer,
  adresse,
}: {
  postnummer: string;
  adresse: string;
}) {
  const [fritid, setFritid] = useState(false);

  useEffect(() => {
    if (!postnummer || !adresse) return;
    let cancelled = false;

    async function detect() {
      try {
        const res = await fetch(
          `/api/energimerke?postnummer=${encodeURIComponent(postnummer)}&adresse=${encodeURIComponent(adresse)}`
        );
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && isFritidCategory(json?.bygningskategori)) {
          setFritid(true);
        }
      } catch {
        // Silent — detection is an enhancement, fall back to generic card
      }
    }
    detect();
    return () => {
      cancelled = true;
    };
  }, [postnummer, adresse]);

  const accentClass = fritid
    ? "border-accent/40 bg-accent/5 hover:border-accent/60"
    : "border-card-border bg-card-bg hover:border-accent/40";

  return (
    <Link
      href="/rapport/hytte-tvangssalg-2026"
      className={`group block rounded-xl border p-4 transition-colors ${accentClass}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <FileText className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-foreground">
          {fritid ? "Relevant rapport for hytter" : "Markedsrapport"}
        </h3>
      </div>
      <p className="text-sm font-medium text-foreground">
        Hytte-tvangssalgene nær doblet på to år
      </p>
      <p className="mt-1 text-xs leading-relaxed text-text-secondary">
        {fritid
          ? "Fritidseiendommer på tvangssalg steg 82 prosent fra 2023 til 2025. Les Verdikarts analyse av SSB-tallene."
          : "Tvangssalg av fritidseiendommer opp 82 prosent fra 2023 til 2025: Verdikarts analyse av ferske SSB-tall."}
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent transition-transform group-hover:translate-x-0.5">
        Les rapporten →
      </span>
    </Link>
  );
}
