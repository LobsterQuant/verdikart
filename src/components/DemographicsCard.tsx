import { Users } from "lucide-react";
import { getDemographics } from "@/data/demographics";

export default function DemographicsCard({ kommunenummer }: { kommunenummer: string }) {
  const data = getDemographics(kommunenummer);

  if (!data) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-text-secondary">Befolkningsprofil</h3>
        </div>
        <p className="mt-2 text-xs text-text-tertiary">
          Vi har ikke befolkningsdata for denne kommunen ennå. Vi utvider dekningen løpende.
        </p>
      </div>
    );
  }

  const incomeFormatted = data.medianIncome.toLocaleString("nb-NO");
  const growthSign = data.populationGrowthPct >= 0 ? "+" : "";

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold">Befolkningsprofil</h3>
      </div>

      {/* Income + Education row */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-background p-3">
          <p className="text-xs text-text-tertiary mb-1">Medianinntekt</p>
          <p className="text-lg font-bold text-foreground tabular-nums">
            {incomeFormatted}
          </p>
          <p className="text-xs text-text-tertiary">kr/husholdning</p>
        </div>
        <div className="rounded-lg bg-background p-3">
          <p className="text-xs text-text-tertiary mb-1">Høyere utdanning</p>
          <p className="text-lg font-bold text-foreground tabular-nums">
            {data.higherEducationPct.toFixed(1)} %
          </p>
          <p className="text-xs text-text-tertiary">av befolkn. 25–66 år</p>
        </div>
      </div>

      {/* Age distribution */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">
          Aldersfordeling
        </p>
        <div className="space-y-2">
          {/* Children */}
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-text-secondary">Barn og unge (0–17 år)</span>
              <span className="font-semibold tabular-nums text-foreground">
                {data.childrenPct.toFixed(1)} %
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-accent/60"
                style={{ width: `${(data.childrenPct / 35) * 100}%` }}
              />
            </div>
          </div>
          {/* Working age (implied) */}
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-text-secondary">Voksen alder (18–66 år)</span>
              <span className="font-semibold tabular-nums text-foreground">
                {(100 - data.childrenPct - data.elderlyPct).toFixed(1)} %
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${((100 - data.childrenPct - data.elderlyPct) / 80) * 100}%` }}
              />
            </div>
          </div>
          {/* Elderly */}
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-text-secondary">Eldre (67+ år)</span>
              <span className="font-semibold tabular-nums text-foreground">
                {data.elderlyPct.toFixed(1)} %
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-text-tertiary/50"
                style={{ width: `${(data.elderlyPct / 35) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Population growth */}
      <div className="flex items-center justify-between rounded-lg border border-card-border bg-background px-3 py-2">
        <span className="text-xs text-text-secondary">Befolkningsvekst siste 5 år</span>
        <span
          className={`text-sm font-bold tabular-nums ${
            data.populationGrowthPct >= 2
              ? "text-green-400"
              : data.populationGrowthPct >= 0
              ? "text-yellow-400"
              : "text-red-400"
          }`}
        >
          {growthSign}{data.populationGrowthPct.toFixed(1)} %
        </span>
      </div>

      <p className="mt-3 text-xs text-text-tertiary">
        Kilde: SSB — Befolkningsstatistikk {data.year}, kommunenivå.
      </p>
    </div>
  );
}
