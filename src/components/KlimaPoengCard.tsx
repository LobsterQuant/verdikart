import Link from "next/link";
import { CloudRainWind } from "lucide-react";
import { TopographicHover } from "@/components/motion/TopographicHover";
import { roundBarWidth } from "@/lib/percent";
import type { KlimaPoengResult } from "@/lib/scoring/klima-poeng";
import {
  bandForScore,
  bucketForScore,
  quickClayLabel,
  skredLabel,
  stormSurgeLabel,
} from "@/lib/scoring/klima-poeng-display";
import { KlimaPoengTracker } from "./KlimaPoengTracker";

interface KlimaPoengCardProps {
  /** Null = scoring call failed (network error, upstream timeout). */
  result: KlimaPoengResult | null;
}

interface BarRow {
  label: string;
  value: string;
  score: number;
  ariaLabel: string;
}

export default function KlimaPoengCard({ result }: KlimaPoengCardProps) {
  if (!result) return <KlimaPoengFailedCard />;

  const { total, components, meta } = result;
  const band = bandForScore(total);
  const fylkesnavn = components.klimaprofil?.fylkesnavn ?? null;
  const hasStormfloRisk =
    components.stormSurge.in20YearCurrent ||
    components.stormSurge.in200Year2100 ||
    components.stormSurge.in1000Year2100;

  const rows: BarRow[] = [
    {
      label: "Flomrisiko",
      value: components.floodRisk,
      score: components.floodScore,
      ariaLabel: `Flomrisiko: ${components.floodScore} av 100`,
    },
    {
      label: "Kvikkleire",
      value: quickClayLabel(components.quickClay),
      score: components.quickClayScore,
      ariaLabel: `Kvikkleire: ${components.quickClayScore} av 100`,
    },
    {
      label: "Skred",
      value: skredLabel(components.skred),
      score: components.skredScore,
      ariaLabel: `Skred: ${components.skredScore} av 100`,
    },
    {
      label: "Stormflo (2100)",
      value: stormSurgeLabel(components.stormSurge),
      score: components.stormSurgeScore,
      ariaLabel: `Stormflo: ${components.stormSurgeScore} av 100`,
    },
    ...(components.radon.assessed
      ? [{
          label: "Radon",
          value: components.radon.level,
          score: components.radon.score,
          ariaLabel: `Radon: ${components.radon.score} av 100`,
        }]
      : []),
    {
      label: "Klimaprofil",
      value: fylkesnavn ?? "Ingen profil",
      score: components.klimaprofilScore,
      ariaLabel: `Klimaprofil: ${components.klimaprofilScore} av 100`,
    },
  ];

  return (
    <TopographicHover
      as="section"
      className="relative overflow-hidden rounded-2xl border border-card-border bg-card-bg p-4 sm:p-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--accent-rgb) / 0.22) 0%, transparent 70%)",
        }}
      />

      <header className="mb-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-text-secondary">
          <CloudRainWind className="h-4 w-4 text-accent" strokeWidth={1.75} />
          Klima-poeng
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Klima- og naturrisiko i dag og mot 2100
        </p>
      </header>

      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <div
          className="text-5xl font-bold leading-none tracking-tight tabular-nums sm:text-7xl"
          style={{
            background:
              "linear-gradient(135deg, var(--accent-hover) 0%, var(--accent) 50%, var(--warm) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          aria-label={`Klima-poeng ${total} av 100, ${band}`}
        >
          {total}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
            av 100
          </span>
          <span className="text-lg font-semibold text-foreground sm:text-xl">{band}</span>
        </div>
      </div>

      {meta.warnings.length > 0 && (
        <p className="mt-3 text-xs text-text-tertiary">
          Enkelte datakilder var utilgjengelige — beregnet på tilgjengelige data.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {rows.map((row) => {
          const width = roundBarWidth(row.score);
          return (
            <div key={row.label}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="text-text-secondary">{row.label}</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {row.value}{" "}
                  <span className="text-xs font-normal text-text-tertiary">
                    ({Math.round(row.score)}/100)
                  </span>
                </span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-background"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(row.score)}
                aria-label={row.ariaLabel}
              >
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {!components.radon.assessed && (
        <details className="mt-4 text-xs text-text-tertiary group">
          <summary className="cursor-pointer list-none font-medium text-text-secondary hover:text-foreground">
            Radon: Ikke vurdert for denne kommunen
            <span aria-hidden className="ml-1 inline-block transition-transform group-open:rotate-90">›</span>
          </summary>
          <p className="mt-2 border-l border-card-border pl-3 leading-relaxed">
            Verdikart har ikke detaljert radon-data for din kommune. DSA anbefaler
            radonmåling for alle boliger.{" "}
            <a
              href="https://www.dsa.no/radon"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent transition-colors hover:text-accent-hover"
            >
              Les mer hos DSA
            </a>
            .
          </p>
        </details>
      )}

      <p className="mt-5 text-xs text-text-tertiary">
        <Link
          href="/klima-poeng#metodologi"
          className="text-accent transition-colors hover:text-accent-hover"
        >
          Hvordan beregnes dette?
        </Link>
      </p>

      <KlimaPoengTracker
        totalBucket={bucketForScore(total)}
        fylke={meta.fylkesprofil}
        hasStormfloRisk={hasStormfloRisk}
      />
    </TopographicHover>
  );
}

function KlimaPoengFailedCard() {
  return (
    <section
      className="rounded-2xl border border-card-border bg-card-bg p-4 sm:p-6"
      aria-labelledby="klima-poeng-failed-heading"
    >
      <header className="mb-3">
        <h2
          id="klima-poeng-failed-heading"
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-text-secondary"
        >
          <CloudRainWind className="h-4 w-4 text-text-tertiary" strokeWidth={1.75} />
          Klima-poeng
        </h2>
      </header>
      <p className="text-sm text-text-secondary">
        Kunne ikke beregne klima-poeng akkurat nå.
      </p>
      <form action="" method="get" className="mt-3">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Prøv igjen
        </button>
      </form>
    </section>
  );
}
