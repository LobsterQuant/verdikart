"use client";

import { m } from "framer-motion";
import NewBadge from "@/components/NewBadge";
import { fadeUp, springHover, staggerParent } from "@/lib/motion";
import { featureCards, type FeatureCardData } from "./featureCardsData";

/**
 * Animated version of the homepage feature-card grid. Loaded lazily via
 * next/dynamic from page.tsx with FeatureCardsStatic as the loading fallback.
 * Layout matches FeatureCardsStatic exactly so hydration is seamless (Package
 * 5.1).
 */

function AnimatedFeatureCard({ Icon, title, description, isNew }: FeatureCardData) {
  return (
    <m.div
      variants={fadeUp}
      whileHover={{ y: -3, scale: 1.005 }}
      transition={springHover}
      className="group relative overflow-hidden rounded-xl border border-card-border bg-card-bg p-6 transition-colors duration-200 hover:border-accent/40"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(0,102,255,0.1)]">
        <Icon className="h-5 w-5" strokeWidth={1.5} style={{ color: "#0066FF" }} />
      </div>

      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {isNew && <NewBadge />}
      </div>
      <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
    </m.div>
  );
}

export function FeatureCardsAnimated() {
  return (
    <m.div
      variants={staggerParent(80)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
    >
      {featureCards.map((card) => (
        <AnimatedFeatureCard key={card.title} {...card} />
      ))}
    </m.div>
  );
}
