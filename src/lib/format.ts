/**
 * Norwegian number formatting helpers.
 *
 * `.toFixed()` outputs English decimals ("93.2"); Norwegian users expect
 * "93,2". Always route through these helpers for user-facing decimals.
 */

/**
 * Format a number with Norwegian (nb-NO) decimal conventions — comma separator,
 * fixed fraction digits. Replaces the common `.toFixed(n)` pattern.
 *
 * @example
 *   nb(93.2)        // "93,2"
 *   nb(3.141, 2)    // "3,14"
 *   nb(1250.5, 0)   // "1 251" (thousand-separated by Intl)
 */
export function nb(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return "–";
  return value.toLocaleString("nb-NO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
