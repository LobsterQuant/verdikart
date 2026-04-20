"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { rapporter } from "@/data/rapporter";

// This sidebar slot currently surfaces the single hytte-tvangssalg report when
// it matches the property. The matching rule lives on the Rapport entry in
// src/data/rapporter.ts (isRelevantForProperty) so future reports can declare
// their own criteria without touching this component.
const HYTTE_RAPPORT = rapporter.find((r) => r.slug === "hytte-tvangssalg-2026");

export default function RapportKort({
  postnummer,
  adresse,
}: {
  postnummer: string;
  adresse: string;
}) {
  const [bygningskategori, setBygningskategori] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (!postnummer || !adresse) {
      setResolved(true);
      return;
    }
    let cancelled = false;

    async function detect() {
      try {
        const res = await fetch(
          `/api/energimerke?postnummer=${encodeURIComponent(postnummer)}&adresse=${encodeURIComponent(adresse)}`
        );
        if (!res.ok) {
          if (!cancelled) setResolved(true);
          return;
        }
        const json = await res.json();
        if (!cancelled) {
          setBygningskategori(json?.bygningskategori ?? null);
          setResolved(true);
        }
      } catch {
        if (!cancelled) setResolved(true);
      }
    }
    detect();
    return () => {
      cancelled = true;
    };
  }, [postnummer, adresse]);

  if (!resolved || !HYTTE_RAPPORT) return null;
  if (!HYTTE_RAPPORT.isRelevantForProperty?.({ bygningskategori })) return null;

  return (
    <Link
      href={`/rapport/${HYTTE_RAPPORT.slug}`}
      className="group block rounded-xl border border-accent/40 bg-accent/5 p-4 transition-colors hover:border-accent/60"
    >
      <div className="mb-2 flex items-center gap-2">
        <FileText className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-foreground">
          Relevant rapport for hytter
        </h3>
      </div>
      <p className="text-sm font-medium text-foreground">
        {HYTTE_RAPPORT.title}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-text-secondary">
        Fritidseiendommer på tvangssalg steg 82 prosent fra 2023 til 2025. Les Verdikarts analyse av SSB-tallene.
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent transition-transform group-hover:translate-x-0.5">
        Les rapporten →
      </span>
    </Link>
  );
}
