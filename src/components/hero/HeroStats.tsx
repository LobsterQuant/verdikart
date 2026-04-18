/**
 * Full-width stats block for the homepage.
 *
 * Display-serif numbers (Instrument Serif at clamp(48px, 5vw, 72px) via the
 * .stat-hero utility), 4 columns on desktop, 2 on mobile, no dividers —
 * whitespace does the separating. Static in Package 4; Package 5 will add
 * count-up.
 */

const STATS = [
  { value: "2,5M+", label: "norske adresser" },
  { value: "47", label: "kommuner m/prisdata" },
  { value: "13", label: "datapunkter per bolig" },
  { value: "8", label: "datakilder" },
] as const;

export function HeroStats() {
  return (
    <section className="py-section">
      <div className="mx-auto max-w-5xl px-gutter">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center md:text-left">
              <p className="stat-hero tabular-nums text-text">{value}</p>
              <p className="caption mt-2 text-text-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
