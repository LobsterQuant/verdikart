"use client";

import { animate, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Props = {
  /** Target value the counter animates toward. */
  value: number;
  /** Visible label under the number. */
  label: string;
  /** Duration of the count-up in ms. Default 1600 — mechanical easeOut. */
  durationMs?: number;
  /** Formatter used during the animation. */
  formatFn: (n: number) => string;
  /** Final formatted value — what SSR + hydration render before inView fires. */
  displayFinal: string;
};

/**
 * Animated version of the stat cell. Starts with `displayFinal` already
 * rendered so SSR / the static fallback / initial hydration all show the
 * same markup — no flash of zero, no CLS. When the element scrolls into
 * view, it snaps to 0 and counts up to `value` once. Respects
 * prefers-reduced-motion via the imperative-animate-safe `useReducedMotion`.
 */
export function CountUpStatAnimated({
  value,
  label,
  durationMs = 1600,
  formatFn,
  displayFinal,
}: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  // Initial state = final value. Matches SSR / static fallback so hydration
  // never flashes and the count-up is purely a scroll-triggered treatment.
  const [display, setDisplay] = useState(displayFinal);

  useEffect(() => {
    if (!inView) return;
    if (shouldReduceMotion) {
      setDisplay(displayFinal);
      return;
    }
    // Snap to zero then animate — gives the count-up its dramatic effect.
    setDisplay(formatFn(0));
    motionValue.set(0);
    const controls = animate(motionValue, value, {
      duration: durationMs / 1000,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(formatFn(v)),
    });
    return () => controls.stop();
  }, [inView, value, durationMs, motionValue, formatFn, shouldReduceMotion, displayFinal]);

  return (
    <div className="text-center md:text-left">
      <p ref={ref} className="stat-hero tabular-nums text-text">
        {display}
      </p>
      <p className="caption mt-2 text-text-muted">{label}</p>
    </div>
  );
}
