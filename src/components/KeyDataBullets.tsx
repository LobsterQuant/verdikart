import type { ReactNode } from "react";

/**
 * Combined address summary card. Tier 1 — the deterministic bullets — is
 * always server-rendered from PropertyReportSummary, zero network cost.
 * Tier 2 — the AI paragraph — is passed in as `children` and loads itself
 * (see AISummary). Both live in one visual block so the page doesn't look
 * like two competing summary cards.
 */
interface Props {
  bullets: string[];
  children?: ReactNode;
}

export default function KeyDataBullets({ bullets, children }: Props) {
  if (bullets.length === 0 && !children) return null;

  return (
    <section className="mt-8 overflow-hidden rounded-xl border border-accent/25 bg-card-bg no-print">
      {bullets.length > 0 && (
        <div className="px-5 py-5">
          <h3 className="text-sm font-semibold text-text-primary">
            Nøkkeldata for denne adressen
          </h3>
          <ul className="mt-4 space-y-2.5">
            {bullets.map((bullet, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-text-secondary"
              >
                <span
                  aria-hidden
                  className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70"
                />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {children}
    </section>
  );
}
