"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Global motion config. `LazyMotion` with `domAnimation` ships a ~2 KB proxy
 * eagerly and loads the ~15 KB animation feature set on first use — instead
 * of the full ~40 KB bundle every framer-motion import would otherwise pull
 * in. `strict` enforces that every motion element uses `m.*` (not `motion.*`)
 * so we don't accidentally lose the savings.
 *
 * `MotionConfig` sets spring defaults inside the lazy tree so any `m.*` element
 * without an explicit `transition` feels consistent. `reducedMotion="user"`
 * lets users with `prefers-reduced-motion: reduce` skip animations entirely.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig
        reducedMotion="user"
        transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.9 }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
