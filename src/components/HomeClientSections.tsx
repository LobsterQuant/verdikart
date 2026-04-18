"use client";

import dynamic from "next/dynamic";
import { FeatureCardsStatic } from "@/components/FeatureCardsStatic";

/**
 * Homepage-only client surfaces. Package 5.1 narrowed this module to just the
 * lazy-loaded FeatureCards wrapper — the motion chunk (framer-motion variants +
 * stagger/hover behaviour) is code-split behind next/dynamic, and
 * FeatureCardsStatic serves as both the SSR output AND the loading fallback so
 * the initial HTML is complete and the client bundle stays off the critical
 * render path.
 */
const FeatureCardsAnimated = dynamic(
  () => import("@/components/FeatureCardsAnimated").then((m) => m.FeatureCardsAnimated),
  {
    ssr: true,
    loading: () => <FeatureCardsStatic />,
  }
);

export function FeatureCards() {
  return <FeatureCardsAnimated />;
}
