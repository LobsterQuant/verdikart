"use client";

import { motion } from "framer-motion";
import { Children, type ReactNode } from "react";
import { fadeUp, staggerParent } from "@/lib/motion";

/**
 * Client wrapper for the hero ProductMockup. Takes the already-rendered
 * sub-blocks (map, value + sparkline row, transit pill) as children and
 * reveals them sequentially when the frame scrolls into view.
 *
 * Timing exception (120 ms stagger, 200 ms delayChildren): the mockup is
 * the hero centerpiece — each sub-block earns its own moment. The delay
 * gives the hero entry choreography room to finish first.
 */
export default function ProductMockupAnimated({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-[640px] rounded-2xl border border-border bg-bg-elevated p-4 text-left sm:p-6"
      style={{
        boxShadow:
          "0 30px 60px -20px rgba(0, 0, 0, 0.5), 0 0 0 0.5px rgb(255 255 255 / 0.04)",
      }}
      variants={staggerParent(120, 200)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-15% 0px" }}
    >
      {Children.map(children, (child, i) =>
        child == null ? null : (
          <motion.div key={i} variants={fadeUp}>
            {child}
          </motion.div>
        )
      )}
    </motion.div>
  );
}
