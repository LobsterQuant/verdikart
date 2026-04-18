"use client";

import { useState, useRef, useEffect } from "react";
import React from "react";
import { motion } from "framer-motion";
import { Bus, TrendingUp, Home, Droplets, Wind, CircleDollarSign } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import NewBadge from "@/components/NewBadge";
import { fadeUp, springHover, staggerParent } from "@/lib/motion";

// ── Count-up hook — runs once when active flips true ──────────────────────
function useCountUp(target: number, duration = 1200, active = false) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!active) return;
    setVal(0);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setVal(Math.round(ease * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [active, target, duration]);
  return val;
}

// ── FeatureCard (Package 5 motion: fadeUp entry via parent stagger +
// subtle hover-lift. Shadow intentionally stays flat — per spec, shadow is
// reserved for the ProductMockup centerpiece. Border strengthens on hover as
// the non-shadow visual feedback hook.) ───────────────────────────────────
export function FeatureCard({
  Icon, title, description, isNew,
}: {
  Icon: React.ElementType;
  title: string;
  description: string;
  isNew?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3, scale: 1.005 }}
      transition={springHover}
      className="group relative overflow-hidden rounded-xl border border-card-border bg-card-bg p-6 transition-colors duration-200 hover:border-accent/40"
    >
      {/* Icon */}
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(0,102,255,0.1)]">
        <Icon className="h-5 w-5" strokeWidth={1.5} style={{ color: "#0066FF" }} />
      </div>

      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {isNew && <NewBadge />}
      </div>
      <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
    </motion.div>
  );
}

// ── FeatureCards (wraps FeatureCard with icon data) ───────────────────────
const valueProps: { Icon: React.ElementType; title: string; description: string; isNew?: boolean }[] = [
  {
    Icon: CircleDollarSign,
    title: "Verdiestimat",
    description:
      "Få et estimert prisanslag basert på SSB-data og energiattest. Se hva boligen kan være verdt — med ±15% konfidensintervall.",
    isNew: true,
  },
  {
    Icon: Bus,
    title: "Kollektivtransport",
    description:
      "Finn nærmeste holdeplasser, avganger og reisetid til sentrum. Live data fra Entur, ikke meglerens anslag.",
  },
  {
    Icon: TrendingUp,
    title: "Prisutvikling",
    description:
      "Følg boligprisene i kommunen over tid. Se trender og sammenlign med resten av landet.",
  },
  {
    Icon: Droplets,
    title: "Klimarisiko",
    description:
      "Sjekk flomfare, kvikkleire og stormflo fra NVE. Vit hva du kjøper — før du byr.",
    isNew: true,
  },
  {
    Icon: Wind,
    title: "Luftkvalitet",
    description:
      "PM2.5, PM10 og NO₂ fra NILU. Se om luften er god der du vil bo.",
    isNew: true,
  },
  {
    Icon: Home,
    title: "Kommunalt prissnitt",
    description:
      "Se gjennomsnittlig kvadratmeterpris for din kommune. Forstå hva lignende boliger faktisk omsettes for.",
  },
];

export function FeatureCards() {
  return (
    <motion.div
      variants={staggerParent(80)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
    >
      {valueProps.map(({ Icon, title, description, isNew }) => (
        <FeatureCard
          key={title}
          Icon={Icon}
          title={title}
          description={description}
          isNew={isNew}
        />
      ))}
    </motion.div>
  );
}

// ── StatsGrid (animated count-up on scroll) ───────────────────────────────
export function StatsGrid() {
  const { ref, inView } = useInView(0.05);
  const addr = useCountUp(2500000, 1400, inView);
  const cities = useCountUp(47, 800, inView);
  const dataPoints = useCountUp(13, 700, inView);
  const sources = useCountUp(8, 600, inView);

  return (
    <div
      ref={ref as unknown as React.RefObject<HTMLDivElement>}
      className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border border-card-border bg-card-bg divide-y divide-card-border sm:grid-cols-5 sm:divide-y-0 sm:divide-x"
    >
      {/* Free */}
      <div className="flex flex-col items-center justify-center px-3 py-4 text-center border-r border-card-border sm:border-r-0">
        <span className="flex items-center gap-1.5 text-base font-bold text-foreground leading-tight sm:text-sm">
          <span className="relative inline-flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          Gratis
        </span>
        <span className="mt-1 text-xs leading-tight text-text-tertiary">Se full rapport uten konto</span>
      </div>
      {/* Addresses */}
      <div className="flex flex-col items-center justify-center px-3 py-4 text-center">
        <span className="text-base font-bold text-foreground leading-tight tabular-nums sm:text-sm">
          {`${(inView ? addr / 1000000 : 2.5).toFixed(1).replace(".", ",")}M+`}
        </span>
        <span className="mt-1 text-xs leading-tight text-text-tertiary">norske adresser</span>
      </div>
      {/* Cities */}
      <div className="flex flex-col items-center justify-center px-3 py-4 text-center border-r border-card-border sm:border-r-0">
        <span className="text-base font-bold text-foreground leading-tight tabular-nums sm:text-sm">
          {inView ? cities : 47}
        </span>
        <span className="mt-1 text-xs leading-tight text-text-tertiary">kommuner m/prisdata</span>
      </div>
      {/* Data points */}
      <div className="flex flex-col items-center justify-center px-3 py-4 text-center border-r border-card-border sm:border-r-0">
        <span className="text-base font-bold text-foreground leading-tight tabular-nums sm:text-sm">
          {inView ? dataPoints : 13}
        </span>
        <span className="mt-1 text-xs leading-tight text-text-tertiary">datapunkter per bolig</span>
      </div>
      {/* Sources */}
      <div className="flex flex-col items-center justify-center px-3 py-4 text-center">
        <span className="text-base font-bold text-foreground leading-tight tabular-nums sm:text-sm">
          {inView ? sources : 8}
        </span>
        <span className="mt-1 text-xs leading-tight text-text-tertiary">datakilder</span>
      </div>
    </div>
  );
}
