import { Zap } from "lucide-react";
import { TopographicHover } from "@/components/motion/TopographicHover";
import { getEnergimerke } from "@/data/energimerke";
import { roundBarWidth } from "@/lib/percent";

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

export default function EnergimerkeCard({ kommunenummer }: { kommunenummer: string }) {
  const data = getEnergimerke(kommunenummer);
  if (!data) return null;

  const badge = labelColor(data.dominantLabel);
  const goodBarWidth = roundBarWidth(data.goodPct);
  const moderateBarWidth = roundBarWidth(data.moderatePct);
  const poorBarWidth = roundBarWidth(data.poorPct);

  return (
    <TopographicHover className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Zap className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold">Energimerke-fordeling</h3>
      </div>

      {/* Dominant label badge */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl border text-2xl font-bold ${badge.text} ${badge.bg} ${badge.border}`}
        >
          {data.dominantLabel}
        </div>
        <div className="text-sm text-text-secondary leading-relaxed">
          <p>
            Vanligste energimerke i <strong className="text-foreground">{data.name}</strong>
          </p>
          <p className="text-xs text-text-tertiary">Gj.sn. byggeår: {data.avgBuildYear}</p>
        </div>
      </div>

      {/* Distribution bars */}
      <div className="space-y-3">
        {/* A–C (good) */}
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-text-secondary">A–C (god)</span>
            <span className="font-semibold tabular-nums text-green-400">{data.goodPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${goodBarWidth}%` }}
            />
          </div>
        </div>

        {/* D–E (moderate) */}
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-text-secondary">D–E (middels)</span>
            <span className="font-semibold tabular-nums text-amber-400">{data.moderatePct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${moderateBarWidth}%` }}
            />
          </div>
        </div>

        {/* F–G (poor) */}
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-text-secondary">F–G (svak)</span>
            <span className="font-semibold tabular-nums text-red-400">{data.poorPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-red-500 transition-all"
              style={{ width: `${poorBarWidth}%` }}
            />
          </div>
        </div>
      </div>

      {/* Note */}
      {data.note && (
        <p className="mt-4 text-sm leading-relaxed text-text-secondary">{data.note}</p>
      )}

      <p className="mt-4 text-xs text-text-tertiary">
        Estimat basert på SSB bygningsstatistikk og Enova energimerkeregister.
      </p>
    </TopographicHover>
  );
}
