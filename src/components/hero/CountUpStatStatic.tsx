/**
 * Static fallback for CountUpStat — renders the final formatted value and
 * label with no motion code. Server-safe; used as the SSR output and the
 * next/dynamic loading fallback so the motion chunk can stay out of the
 * critical render path (Package 5.1).
 */
export function CountUpStatStatic({
  displayFinal,
  label,
}: {
  displayFinal: string;
  label: string;
}) {
  return (
    <div className="text-center md:text-left">
      <p className="stat-hero tabular-nums text-text">{displayFinal}</p>
      <p className="caption mt-2 text-text-muted">{label}</p>
    </div>
  );
}
