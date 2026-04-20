/**
 * Small data-provenance chip shown in data-card headers.
 *
 * Intent: make it obvious at a glance which dataset (and how fresh) you're
 * looking at. Reviewers flagged that users couldn't tell whether a number
 * was a 2023 snapshot, a live feed, or a five-year-old yearbook.
 */
export default function DataAgeChip({
  source,
  date,
  className = "",
}: {
  source: string;
  /** Free-form date/cadence string. Examples: "Q4 2024", "live", "2023". */
  date: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-card-border/80 bg-background/60 px-2 py-0.5 text-[10px] font-medium text-text-secondary ${className}`}
      title={`Datakilde: ${source} · ${date}`}
    >
      <span className="font-semibold text-text-secondary">{source}</span>
      <span aria-hidden className="text-text-tertiary/60">·</span>
      <span className="tabular-nums">{date}</span>
    </span>
  );
}
