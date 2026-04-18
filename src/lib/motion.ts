import type { Transition, Variants } from "framer-motion";

/**
 * Shared motion vocabulary — the SINGLE source of truth for animation timings
 * on this site. Every `motion.*` component should consume these variants /
 * spring presets. Do not hardcode ad-hoc spring values in components.
 *
 * Philosophy (Package 5): spring physics everywhere except count-up (mechanical
 * easeOut is right when animating numbers). Entry profile is 300–500 ms per
 * element with a 60 ms stagger between siblings. Global `MotionConfig` in
 * `<MotionProvider>` sets a sensible default spring; presets below override
 * when a specific sub-motion needs a different feel.
 */

// ── Spring presets ────────────────────────────────────────────────────────
// Soft / snappy / hover — use these for any transition override.
export const springSoft: Transition = { type: "spring", stiffness: 180, damping: 22, mass: 1 };
export const springSnappy: Transition = { type: "spring", stiffness: 300, damping: 28, mass: 0.8 };
export const springHover: Transition = { type: "spring", stiffness: 400, damping: 30, mass: 0.6 };

// ── Entry variants ────────────────────────────────────────────────────────
// Fade + 16px slide up. The 16px offset is small enough to avoid CLS when the
// child is already sized and laid out (parent reserves space).
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

// ── Stagger container ─────────────────────────────────────────────────────
// Parent container that orchestrates the entry of its children via variant
// propagation. Defaults to 60 ms stagger (the canonical hero timing). Override
// with a faster 30 ms for autocomplete-style snappy lists, or a slower 120 ms
// for hero centerpieces like the product mockup.
export const staggerParent = (staggerMs = 60, delayMs = 0): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerMs / 1000,
      delayChildren: delayMs / 1000,
    },
  },
});

// ── Hover lift ────────────────────────────────────────────────────────────
// Feature-card hover: 3px translate + 1.005x scale. Intentionally subtle —
// shadow changes are reserved for the ProductMockup centerpiece.
export const hoverLift = {
  rest: { y: 0, scale: 1 },
  hover: { y: -3, scale: 1.005 },
} as const;
