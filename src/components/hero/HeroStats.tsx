"use client";

import dynamic from "next/dynamic";

/**
 * Full-width stats block for the homepage.
 *
 * Display-serif numbers (Instrument Serif at clamp(48px, 5vw, 72px) via the
 * .stat-hero utility), 4 columns on desktop, 2 on mobile, no dividers —
 * whitespace does the separating.
 *
 * Package 5.1: the motion layer (CountUpStatAnimated) is code-split off the
 * critical render path. SSR renders CountUpStatStatic (final value already
 * visible); the motion chunk only boots when it lands, seamlessly replacing
 * the static output with the inView-triggered count-up. No flash, no CLS.
 */

// Formatter for "2,5M+" style. Module scope so the reference is stable —
// passing a new closure on every render would retrigger CountUpStat's effect.
const millionsPlus = (n: number): string => `${n.toFixed(1).replace(".", ",")}M+`;
const plain = (n: number): string => Math.round(n).toLocaleString("nb-NO");

const STATS: ReadonlyArray<{
  value: number;
  label: string;
  formatFn: (n: number) => string;
  displayFinal: string;
}> = [
  { value: 2.5, label: "norske adresser", formatFn: millionsPlus, displayFinal: "2,5M+" },
  { value: 47, label: "kommuner m/prisdata", formatFn: plain, displayFinal: "47" },
  { value: 13, label: "datapunkter per bolig", formatFn: plain, displayFinal: "13" },
  { value: 8, label: "datakilder", formatFn: plain, displayFinal: "8" },
];

// Lazy motion wrapper — server renders the static fallback, framer-motion
// loads only after the initial paint. ssr:true preserves the animated
// component's SSR output (same markup as static), so there's no visual jump
// when the chunk hydrates.
const CountUpStatAnimated = dynamic(
  () => import("./CountUpStatAnimated").then((m) => m.CountUpStatAnimated),
  {
    ssr: true,
    loading: () => null, // placeholder handled per-cell below
  }
);

export function HeroStats() {
  return (
    <section className="py-section">
      <div className="mx-auto max-w-5xl px-gutter">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
          {STATS.map((stat) => (
            <CountUpStatAnimated
              key={stat.label}
              value={stat.value}
              label={stat.label}
              formatFn={stat.formatFn}
              displayFinal={stat.displayFinal}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
