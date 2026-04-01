"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

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
      return `${(value / 1_000_000).toFixed(1)} MNOK`;
    }
    return `${Math.round(value / 1000)} TNOK`;
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 sm:p-6">
      <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold">
        <TrendingUp className="h-5 w-5 text-accent" />
        Estimert verdi
      </h3>

      {estimatedValue && lowEstimate && highEstimate ? (
        <>
          <div className="mb-2">
            <span className="text-3xl font-bold text-accent">
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
