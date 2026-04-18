"use client";

import { animate, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Props = {
  /** Target value to count up to. */
  value: number;
  /** Appended after the formatted number (e.g. "+"). Usually leave empty. */
  suffix?: string;
  /** Visible label under the number. */
  label: string;
  /** Animation duration in ms. Default 1600 — mechanical easeOut, not spring. */
  durationMs?: number;
  /** Overrides display. Receives the in-flight motion value. */
  formatFn?: (n: number) => string;
};

const defaultFormat = (n: number) => Math.round(n).toLocaleString("nb-NO");

/**
 * Count-up stat that triggers once when scrolled into view. Uses Framer
 * Motion's animate primitive with easeOut — numbers should feel mechanical,
 * not bouncy (one of the two documented exceptions to the spring default).
 */
export function CountUpStat({
  value,
  suffix = "",
  label,
  durationMs = 1600,
  formatFn = defaultFormat,
}: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const motionValue = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(() => formatFn(0));

  useEffect(() => {
    if (!inView) return;
    // Respect prefers-reduced-motion — the imperative animate() primitive is
    // NOT covered by MotionConfig's reducedMotion setting, so we gate it here.
    if (shouldReduceMotion) {
      setDisplay(formatFn(value));
      return;
    }
    const controls = animate(motionValue, value, {
      duration: durationMs / 1000,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(formatFn(v)),
    });
    return () => controls.stop();
  }, [inView, value, durationMs, motionValue, formatFn, shouldReduceMotion]);

  return (
    <div className="text-center md:text-left">
      <p ref={ref} className="stat-hero tabular-nums text-text">
        {display}
        {suffix}
      </p>
      <p className="caption mt-2 text-text-muted">{label}</p>
    </div>
  );
}
