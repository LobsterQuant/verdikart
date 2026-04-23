import type { AlertDecision } from "./logic";
import { decideAlert } from "./logic";
import type { KommunePriceIndex } from "./price-index";

export interface AlertRow {
  id: string;
  userId: string;
  kommunenummer: string;
  thresholdPct: number | null;
  lastKnownValue: number | null;
  active: boolean | null;
  email: string | null;
}

export interface PriceAlertNotification {
  to: string;
  kommuneName: string;
  changePct: number;
  thresholdPct: number;
  previousValue: number;
  currentValue: number;
}

export interface CheckDeps {
  loadActiveAlerts: () => Promise<AlertRow[]>;
  fetchPriceIndex: (kommunenummer: string) => Promise<KommunePriceIndex | null>;
  sendEmail: (n: PriceAlertNotification) => Promise<unknown>;
  updateAlertValue: (id: string, value: number) => Promise<void>;
  markNotified: (id: string, value: number, notifiedAt: Date) => Promise<void>;
  now?: () => Date;
}

export interface CheckSummary {
  checked: number;
  initialized: number;
  notified: number;
  skipped: number;
  errors: Array<{ alertId: string; error: string }>;
}

export async function runPriceAlertCheck(deps: CheckDeps): Promise<CheckSummary> {
  const now = deps.now ?? (() => new Date());
  const summary: CheckSummary = {
    checked: 0,
    initialized: 0,
    notified: 0,
    skipped: 0,
    errors: [],
  };

  const rows = await deps.loadActiveAlerts();
  const priceCache = new Map<string, KommunePriceIndex | null>();

  for (const row of rows) {
    summary.checked += 1;
    try {
      let price = priceCache.get(row.kommunenummer);
      if (price === undefined) {
        price = await deps.fetchPriceIndex(row.kommunenummer);
        priceCache.set(row.kommunenummer, price);
      }
      if (!price) {
        summary.errors.push({
          alertId: row.id,
          error: `SSB returned no data for kommune ${row.kommunenummer}`,
        });
        continue;
      }

      const threshold = row.thresholdPct ?? 5.0;
      const decision: AlertDecision = decideAlert({
        lastKnownValue: row.lastKnownValue,
        currentValue: price.value,
        thresholdPct: threshold,
      });

      if (decision.action === "initialize") {
        await deps.updateAlertValue(row.id, price.value);
        summary.initialized += 1;
        continue;
      }

      if (decision.action === "skip") {
        summary.skipped += 1;
        continue;
      }

      if (!row.email) {
        summary.errors.push({ alertId: row.id, error: "User has no email address" });
        continue;
      }

      await deps.sendEmail({
        to: row.email,
        kommuneName: price.kommuneName || `Kommune ${row.kommunenummer}`,
        changePct: decision.changePct,
        thresholdPct: threshold,
        previousValue: row.lastKnownValue!,
        currentValue: price.value,
      });
      await deps.markNotified(row.id, price.value, now());
      summary.notified += 1;
    } catch (err) {
      summary.errors.push({
        alertId: row.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return summary;
}
