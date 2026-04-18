"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Calculator, ArrowRight } from "lucide-react";
import Link from "next/link";
import { nb } from "@/lib/format";

interface ValuationCardProps {
  kommunenummer: string;
  postnummer: string;
  adresse: string;
}

interface PriceTrendData {
  values: number[];
  source: string;
  sourceLabel: string;
}

interface EnergimerkeData {
  bruksareal: number | null;
}

export default function ValuationCard({ kommunenummer, postnummer, adresse }: ValuationCardProps) {
  const [sqmPrice, setSqmPrice] = useState<number | null>(null);
  const [bruksareal, setBruksareal] = useState<number | null>(null);
  const [manualArea, setManualArea] = useState("");
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [priceRes, energiRes] = await Promise.all([
          fetch(`/api/price-trend?kommunenummer=${kommunenummer}&postnummer=${postnummer}`),
          fetch(`/api/energimerke?postnummer=${postnummer}&adresse=${encodeURIComponent(adresse)}`),
        ]);

        if (priceRes.ok) {
          const priceData: PriceTrendData = await priceRes.json();
          if (priceData.values.length > 0) {
            setSqmPrice(priceData.values[priceData.values.length - 1]);
            setSource(priceData.sourceLabel || priceData.source);
          }
        }

        if (energiRes.ok) {
          const energiData: EnergimerkeData = await energiRes.json();
          if (energiData.bruksareal && energiData.bruksareal > 0) {
            setBruksareal(energiData.bruksareal);
          }
        }
      } catch {
        // Silent fail — card will show manual input
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [kommunenummer, postnummer, adresse]);

  if (loading) {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 sm:p-6">
        <div className="skeleton mb-3 h-5 w-32" />
        <div className="skeleton h-10 w-48" />
      </div>
    );
  }

  if (!sqmPrice) {
    return null; // Don't show card if no price data
  }

  const effectiveArea = bruksareal ?? (manualArea ? parseFloat(manualArea) : null);
  const estimatedValue = effectiveArea && sqmPrice ? Math.round(effectiveArea * sqmPrice) : null;
  const lowEstimate = estimatedValue ? Math.round(estimatedValue * 0.85) : null;
  const highEstimate = estimatedValue ? Math.round(estimatedValue * 1.15) : null;

  function formatNok(value: number): string {
    if (value >= 1_000_000) {
      return `${nb(value / 1_000_000)} MNOK`;
    }
    return `${Math.round(value / 1000)} TNOK`;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent/30 p-4 sm:p-6" style={{
      background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(59,130,246,0.04) 50%, rgba(99,102,241,0.02) 100%)",
    }}>
      {/* Subtle glow in top-right */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full" style={{
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
      }} aria-hidden />
      <h3 className="relative mb-1 flex items-center gap-2 text-lg font-semibold">
        <TrendingUp className="h-5 w-5 text-accent" />
        Estimert verdi
      </h3>

      {estimatedValue && lowEstimate && highEstimate ? (
        <>
          <div className="relative mb-2">
            <span className="text-4xl font-bold tracking-tight sm:text-5xl" style={{
              background: "linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {formatNok(estimatedValue)}
            </span>
          </div>
          <div className="mb-3 flex items-center gap-2 text-sm text-text-secondary">
            <span>
              {formatNok(lowEstimate)} – {formatNok(highEstimate)}
            </span>
            <span className="text-text-tertiary">(±15%)</span>
          </div>
          <div className="space-y-1 text-xs text-text-tertiary">
            <p>
              {sqmPrice.toLocaleString("nb-NO")} kr/m² × {effectiveArea} m²
              {bruksareal ? " (fra energiattest)" : " (manuelt oppgitt)"}
            </p>
            <p>Prisgrunnlag: {source}</p>
          </div>

          {/* Deep link to calculator with price + kommune pre-filled */}
          <Link
            href={`/kalkulator?pris=${estimatedValue}&knr=${kommunenummer}`}
            className="group/cta relative mt-4 flex items-center justify-between gap-3 rounded-xl border border-accent/25 bg-background/60 px-4 py-3 transition-all hover:border-accent/50 hover:bg-background"
          >
            <div className="flex items-center gap-2.5">
              <Calculator className="h-4 w-4 text-accent" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold">Hva koster dette per måned?</p>
                <p className="text-[11px] text-text-tertiary">
                  Lån, eiendomsskatt og stresstest for {formatNok(estimatedValue)}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover/cta:translate-x-0.5" strokeWidth={2} />
          </Link>
        </>
      ) : (
        <div className="mt-2">
          <p className="mb-2 text-sm text-text-secondary">
            Oppgi boligens areal for å beregne estimert verdi
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="f.eks. 65"
              value={manualArea}
              onChange={(e) => setManualArea(e.target.value)}
              className="w-24 rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
            <span className="text-sm text-text-tertiary">m²</span>
          </div>
          {sqmPrice && (
            <p className="mt-2 text-xs text-text-tertiary">
              Snittjm²pris: {sqmPrice.toLocaleString("nb-NO")} kr/m² ({source})
            </p>
          )}
        </div>
      )}

      <p className="mt-3 text-xs text-text-tertiary">
        Estimatet er basert på SSB-prisstatistikk for området og er kun veiledende. Ikke en takst.
      </p>
    </div>
  );
}
