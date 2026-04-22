"use client";

import { useEffect, useRef } from "react";

interface PendlingsPoengTrackerProps {
  totalBucket: string;
  workCenter: string;
  rushHourTested: boolean;
}

/**
 * Fires a single Plausible `pendlings_poeng_viewed` event when the hero card
 * mounts. Kept as a leaf client component so the card itself can stream from
 * the server; the ref guard prevents React 18 StrictMode double-fire in dev.
 */
export function PendlingsPoengTracker({
  totalBucket,
  workCenter,
  rushHourTested,
}: PendlingsPoengTrackerProps) {
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
      plausible("pendlings_poeng_viewed", {
        props: {
          total_score: totalBucket,
          work_center: workCenter,
          rush_hour_tested: rushHourTested,
        },
      });
    } catch {
      // Analytics must never break the render.
    }
  }, [totalBucket, workCenter, rushHourTested]);

  return null;
}
