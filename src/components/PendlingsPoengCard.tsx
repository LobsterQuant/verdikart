import Link from "next/link";
import { Compass } from "lucide-react";
import { TopographicHover } from "@/components/motion/TopographicHover";
import { roundBarWidth } from "@/lib/percent";
import type { PendlingsPoengResult } from "@/lib/scoring/pendlings-poeng";
import {
  bandForScore,
  fmtKr,
  fmtMeters,
  fmtMinutes,
  fmtPerHour,
  fmtTransfers,
  isNoTransitResult,
} from "@/lib/scoring/pendlings-poeng-display";
import { PendlingsPoengTracker } from "./PendlingsPoengTracker";

interface PendlingsPoengCardProps {
  /** Null = scoring call failed (network error, upstream timeout). */
  result: PendlingsPoengResult | null;
}

interface BarRow {
  label: string;
  value: string;
  score: number;
  ariaLabel: string;
}

export default function PendlingsPoengCard({ result }: PendlingsPoengCardProps) {
  if (!result) return <PendlingsPoengFailedCard />;

  const { total, center, components, rushHourTested } = result;
  const band = bandForScore(total);
  const noTransit = isNoTransitResult(result);

  const rows: BarRow[] = [
    {
      label: "Reise til sentrum",
      value: noTransit ? "Ingen forbindelse" : fmtMinutes(components.doorToDoorMinutes),
      score: components.doorToDoorScore,
      ariaLabel: `Reise til sentrum: ${components.doorToDoorScore} av 100`,
    },
    {
      label: "Avgangsfrekvens",
      value: noTransit ? "–" : fmtPerHour(components.frequencyPerHour),
      score: components.frequencyScore,
      ariaLabel: `Avgangsfrekvens: ${components.frequencyScore} av 100`,
    },
    {
      label: "Gangavstand til holdeplass",
      value: noTransit ? "–" : fmtMeters(components.walkDistanceMeters),
      score: components.walkDistanceScore,
      ariaLabel: `Gangavstand: ${components.walkDistanceScore} av 100`,
    },
    {
      label: "Antall bytter",
      value: noTransit ? "–" : fmtTransfers(components.transfers),
      score: components.transfersScore,
      ariaLabel: `Antall bytter: ${components.transfersScore} av 100`,
    },
    {
      label: "Månedskort",
      value: fmtKr(components.monthlyPriceNok),
      score: components.monthlyPriceScore,
      ariaLabel: `Månedskort: ${components.monthlyPriceScore} av 100`,
    },
  ];

  return (
    <TopographicHover
      as="section"
      className="relative overflow-hidden rounded-2xl border border-card-border bg-card-bg p-4 sm:p-6"
    >
      {/* Subtle composite-score accent: a soft radial pulse in the top-right,
          distinct from Månedskostnad's flat surface so the two heros read as
          parallel-but-not-identical. */}
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
          <Compass className="h-4 w-4 text-accent" strokeWidth={1.75} />
          Pendlings-poeng
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Målt mot {center.sentrum} ({center.name})
        </p>
      </header>

      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <div
          className="text-6xl font-bold tracking-tight tabular-nums sm:text-8xl"
          style={{
            background:
              "linear-gradient(135deg, var(--accent-hover) 0%, var(--accent) 50%, var(--warm) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: "clamp(4rem, 12vw, 6.25rem)",
            lineHeight: 1,
          }}
          aria-label={`Pendlings-poeng ${total} av 100, ${band}`}
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

      {noTransit && (
        <p className="mt-3 text-sm text-text-secondary">
          Ingen kollektivtransport innen rimelig rekkevidde. Bilavhengig bosetting.
        </p>
      )}

      {!rushHourTested && !noTransit && (
        <p className="mt-3 text-xs text-text-tertiary">
          Beregnet utenfor rushtid. Faktisk reisetid kan være høyere.
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

      <p className="mt-5 text-xs text-text-tertiary">
        <Link
          href="/pendlings-poeng"
          className="text-accent transition-colors hover:text-accent-hover"
        >
          Hvordan beregnes dette?
        </Link>
        <span className="ml-1">Metodologi kommer snart.</span>
      </p>

      <PendlingsPoengTracker
        totalBucket={bucketLabel(total)}
        workCenter={center.id}
        rushHourTested={rushHourTested}
      />
    </TopographicHover>
  );
}

function bucketLabel(total: number): string {
  if (total >= 85) return "85-100";
  if (total >= 70) return "70-84";
  if (total >= 55) return "55-69";
  if (total >= 35) return "35-54";
  return "0-34";
}

function PendlingsPoengFailedCard() {
  return (
    <section
      className="rounded-2xl border border-card-border bg-card-bg p-4 sm:p-6"
      aria-labelledby="pendlings-poeng-failed-heading"
    >
      <header className="mb-3">
        <h2
          id="pendlings-poeng-failed-heading"
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-text-secondary"
        >
          <Compass className="h-4 w-4 text-text-tertiary" strokeWidth={1.75} />
          Pendlings-poeng
        </h2>
      </header>
      <p className="text-sm text-text-secondary">
        Kunne ikke beregne pendlings-poeng akkurat nå.
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
