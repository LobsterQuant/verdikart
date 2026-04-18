import NewBadge from "@/components/NewBadge";
import { featureCards } from "./featureCardsData";

/**
 * Static fallback for the homepage feature-card grid. Server-renderable,
 * no framer-motion. Used both as the SSR output AND as the next/dynamic
 * loading fallback for FeatureCardsAnimated, so the motion chunk can stay
 * off the critical render path (Package 5.1).
 *
 * Layout MUST match FeatureCardsAnimated exactly — same grid, same card
 * padding, same border — so that when the motion chunk hydrates and takes
 * over, there is zero CLS.
 */
export function FeatureCardsStatic() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {featureCards.map(({ Icon, title, description, isNew }) => (
        <div
          key={title}
          className="group relative overflow-hidden rounded-xl border border-card-border bg-card-bg p-6 transition-colors duration-200 hover:border-accent/40"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(0,102,255,0.1)]">
            <Icon className="h-5 w-5" strokeWidth={1.5} style={{ color: "#0066FF" }} />
          </div>

          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            {isNew && <NewBadge />}
          </div>
          <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
        </div>
      ))}
    </div>
  );
}
