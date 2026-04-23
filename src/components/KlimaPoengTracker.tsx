"use client";

import { useEffect, useRef } from "react";

interface KlimaPoengTrackerProps {
  totalBucket: string;
  fylke: string | null;
  hasStormfloRisk: boolean;
}

/**
 * Fires a single Plausible `klima_poeng_viewed` event on hero-card mount.
 * Ref-guarded against React 18 StrictMode double-fire in dev.
 */
export function KlimaPoengTracker({
  totalBucket,
  fylke,
  hasStormfloRisk,
}: KlimaPoengTrackerProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const plausible = (window as unknown as {
      plausible?: (
        event: string,
        options?: { props?: Record<string, string | number | boolean> },
      ) => void;
    }).plausible;
    if (typeof plausible !== "function") return;
    try {
      plausible("klima_poeng_viewed", {
        props: {
          total_score: totalBucket,
          fylke: fylke ?? "unknown",
          stormflo_risk: hasStormfloRisk,
        },
      });
    } catch {
      // Plausible not loaded or errored — swallow silently.
    }
  }, [totalBucket, fylke, hasStormfloRisk]);

  return null;
}
