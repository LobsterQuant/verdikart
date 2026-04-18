"use client";

import { CountUpStat } from "./CountUpStat";

/**
 * Full-width stats block for the homepage.
 *
 * Display-serif numbers (Instrument Serif at clamp(48px, 5vw, 72px) via the
 * .stat-hero utility), 4 columns on desktop, 2 on mobile, no dividers —
 * whitespace does the separating. Package 5 wires each cell through
 * CountUpStat so the numbers animate once when the section scrolls into view.
 */

// Norwegian formatter for "2,5M+" style (comma decimal). Defined at module
// scope so the reference is stable across renders — a new closure on every
// render would retrigger CountUpStat's effect.
const millionsPlus = (n: number): string =>
  `${n.toFixed(1).replace(".", ",")}M+`;

export function HeroStats() {
  return (
    <section className="py-section">
      <div className="mx-auto max-w-5xl px-gutter">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
          <CountUpStat value={2.5} label="norske adresser" formatFn={millionsPlus} />
          <CountUpStat value={47} label="kommuner m/prisdata" />
          <CountUpStat value={13} label="datapunkter per bolig" />
          <CountUpStat value={8} label="datakilder" />
        </div>
      </div>
    </section>
  );
}
