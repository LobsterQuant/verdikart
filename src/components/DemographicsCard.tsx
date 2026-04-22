import { Users } from "lucide-react";
import { getDemographics } from "@/data/demographics";
import DataAgeChip from "@/components/DataAgeChip";
import { TopographicHover } from "@/components/motion/TopographicHover";
import { nb } from "@/lib/format";
import { roundBarWidth } from "@/lib/percent";

export default function DemographicsCard({ kommunenummer }: { kommunenummer: string }) {
  const data = getDemographics(kommunenummer);

  if (!data) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-text-secondary">Befolkningsprofil</h3>
        </div>
        <p className="mt-2 text-xs text-text-secondary">
          Vi har ikke befolkningsdata for denne kommunen ennå. Vi utvider dekningen løpende.
        </p>
      </div>
    );
  }

  const incomeFormatted = data.medianIncome.toLocaleString("nb-NO");
  const growthSign = data.populationGrowthPct >= 0 ? "+" : "";

  const workingPct = 100 - data.childrenPct - data.elderlyPct;
  const childrenBarWidth = roundBarWidth((data.childrenPct / 35) * 100);
  const workingBarWidth = roundBarWidth((workingPct / 80) * 100);
  const elderlyBarWidth = roundBarWidth((data.elderlyPct / 35) * 100);

  return (
    <TopographicHover className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Users className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold">Befolkningsprofil</h3>
        <DataAgeChip source="SSB" date="2024–26" className="ml-auto" />
      </div>

      {/* Income + Education row */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-background p-3">
          <p className="text-xs text-text-secondary mb-1">Medianinntekt</p>
          <p className="text-lg font-bold text-foreground tabular-nums">
            {incomeFormatted}
          </p>
          <p className="text-xs text-text-secondary">kr/husholdning</p>
        </div>
        <div className="rounded-lg bg-background p-3">
          <p className="text-xs text-text-secondary mb-1">Høyere utdanning</p>
          <p className="text-lg font-bold text-foreground tabular-nums">
            {nb(data.higherEducationPct)} %
          </p>
          <p className="text-xs text-text-secondary">av befolkn. 16+ år</p>
        </div>
      </div>

      {/* Age distribution */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Aldersfordeling
        </p>
        <div className="space-y-2">
          {/* Children */}
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-text-secondary">Barn og unge (0–17 år)</span>
              <span className="font-semibold tabular-nums text-foreground">
                {nb(data.childrenPct)} %
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-accent/60"
                style={{ width: `${childrenBarWidth}%` }}
              />
            </div>
          </div>
          {/* Working age (implied) */}
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-text-secondary">Voksen alder (18–66 år)</span>
              <span className="font-semibold tabular-nums text-foreground">
                {nb(workingPct)} %
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${workingBarWidth}%` }}
              />
            </div>
          </div>
          {/* Elderly */}
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-text-secondary">Eldre (67+ år)</span>
              <span className="font-semibold tabular-nums text-foreground">
                {nb(data.elderlyPct)} %
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-text-tertiary/50"
                style={{ width: `${elderlyBarWidth}%` }}
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
          {growthSign}{nb(data.populationGrowthPct)} %
        </span>
      </div>

      <p className="mt-3 text-xs text-text-secondary">
        Kilde: SSB tabell 07459 (befolkning, 1.1.2026), 06944 (inntekt, 2024), 09429 (utdanning, 2024).
      </p>
    </TopographicHover>
  );
}
