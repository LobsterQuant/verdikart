import { TrendingUp, TrendingDown } from "lucide-react";
import { formatPct } from "@/lib/format";

interface ValueEstimateProps {
  /** Latest kr/m² for the kommune (SSB). */
  sqmPrice: number | null;
  /** YoY % delta as a number, e.g. 4.2. */
  yoyChange: number | null;
  /** Reference kommune name, e.g. "Oslo". */
  kommuneName?: string;
}

/**
 * Estimated-value card for the hero mockup.
 *
 * Shows the real SSB kr/m² for the property's kommune and the YoY delta —
 * the two numbers a user actually wants at a glance. No fake area
 * multiplication (would require matrikkel unit BRA we don't have yet).
 * Static rendering; Package 5 wraps the number with count-up.
 */
export function ValueEstimate({
  sqmPrice,
  yoyChange,
  kommuneName = "Oslo",
}: ValueEstimateProps) {
  const formattedPrice = sqmPrice
    ? sqmPrice.toLocaleString("nb-NO", { maximumFractionDigits: 0 })
    : "–";
  const isPositive = yoyChange != null && yoyChange >= 0;

  return (
    <div className="flex flex-col justify-between">
      <p className="caption text-text-muted">Estimert m²-pris</p>
      <div className="mt-1">
        <span
          className="stat-hero text-text"
          style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
        >
          {formattedPrice}
        </span>
        <span className="ml-1 text-sm text-text-muted">kr/m²</span>
      </div>
      {yoyChange != null && (
        <p
          className={`caption mt-1 flex items-center gap-1 ${
            isPositive ? "text-success" : "text-danger"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" strokeWidth={2} />
          ) : (
            <TrendingDown className="h-3 w-3" strokeWidth={2} />
          )}
          <span>
            {isPositive ? "+" : ""}
            {formatPct(yoyChange)} siste år
          </span>
        </p>
      )}
      <p className="caption mt-2 text-text-subtle">
        {kommuneName} · SSB årssnitt
      </p>
    </div>
  );
}
