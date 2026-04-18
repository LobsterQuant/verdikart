import { AlertTriangle } from "lucide-react";
import { TopographicHover } from "@/components/motion/TopographicHover";
import { environmentalRiskData, type RiskLevel } from "@/data/environmentalRisk";

const riskColors: Record<RiskLevel, { text: string; bg: string }> = {
  "Høy": { text: "text-rose-400", bg: "bg-rose-500/10" },
  "Moderat": { text: "text-amber-400", bg: "bg-amber-500/10" },
  "Lav": { text: "text-green-400", bg: "bg-green-500/10" },
  "Ukjent": { text: "text-text-tertiary", bg: "bg-background" },
};

export default function EnvironmentalRiskCard({ kommunenummer }: { kommunenummer: string }) {
  const data = environmentalRiskData[kommunenummer];
  if (!data) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-text-secondary">Miljørisiko</h3>
        </div>
        <p className="mt-2 text-xs text-text-tertiary">
          Vi har ikke miljørisikodata for denne kommunen ennå. Vi utvider dekningen løpende.
        </p>
      </div>
    );
  }

  const radonColor = riskColors[data.radonRisk];
  const floodColor = riskColors[data.floodRisk];

  return (
    <TopographicHover className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold">Miljørisiko</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Radon */}
        <div className="rounded-lg border border-card-border bg-background/50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">Radon</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${radonColor.bg} ${radonColor.text}`}>
              {data.radonRisk}
            </span>
          </div>
          {data.radonNote && (
            <p className="text-xs leading-relaxed text-text-tertiary">{data.radonNote}</p>
          )}
        </div>

        {/* Flom */}
        <div className="rounded-lg border border-card-border bg-background/50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">Flomrisiko</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${floodColor.bg} ${floodColor.text}`}>
              {data.floodRisk}
            </span>
          </div>
          {data.floodNote && (
            <p className="text-xs leading-relaxed text-text-tertiary">{data.floodNote}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-tertiary">
        <a href="https://geo.ngu.no/kart/radon/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
          Radonkart: geo.ngu.no
        </a>
        <a href="https://temakart.nve.no/tema/flomsoner" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
          Flomsonekart: nve.no
        </a>
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-medium text-text-secondary hover:text-foreground transition-colors">
          Hva er radon?
        </summary>
        <p className="mt-2 leading-relaxed text-text-tertiary">
          Radon er en radioaktiv gass som dannes naturlig i berggrunn og jord. Langtidseksponering
          over 100 Bq/m³ øker risiko for lungekreft. Bygg på granitt- og alunskifergrunn har
          høyest risiko.
        </p>
      </details>
    </TopographicHover>
  );
}
