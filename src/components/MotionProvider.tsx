"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Global motion config. Sets spring defaults so any `motion.*` element without
 * an explicit `transition` prop feels consistent. `reducedMotion="user"` means
 * users with `prefers-reduced-motion: reduce` get instant state transitions —
 * Framer Motion skips the animation entirely and jumps to the final value.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.9 }}
    >
      {children}
    </MotionConfig>
  );
}
