import { KollektivIcon } from "@/components/icons";

interface TransitPillProps {
  stopName: string;
  modeLabel: string;
  durationMin: number;
}

/**
 * Rounded accent pill summarizing the nearest boarding stop from Entur.
 * Rendered only when transit data is available — caller filters.
 */
export function TransitPill({
  stopName,
  modeLabel,
  durationMin,
}: TransitPillProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[12px] font-medium text-accent">
      <KollektivIcon size={14} className="shrink-0" />
      <span className="text-text">{modeLabel}</span>
      <span className="text-text-muted">·</span>
      <span className="truncate">{stopName}</span>
      <span className="text-text-muted">·</span>
      <span className="tabular-nums">{durationMin} min</span>
    </span>
  );
}
