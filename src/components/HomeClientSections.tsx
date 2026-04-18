"use client";

import { useState, useRef, useEffect } from "react";
import React from "react";
import { Bus, TrendingUp, Home, Droplets, Wind, CircleDollarSign } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import NewBadge from "@/components/NewBadge";

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

// ── FeatureCard (hover effects need client state) ─────────────────────────
export function FeatureCard({
  Icon, title, description, isNew,
}: {
  Icon: React.ElementType;
  title: string;
  description: string;
  isNew?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative rounded-xl border bg-card-bg p-6 cursor-default overflow-hidden card-hover transition-transform duration-300"
      style={{
        transformStyle: "preserve-3d" as const,
        perspective: 800,
        boxShadow: hovered
          ? "0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)",
        borderColor: hovered ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)",
      }}
    >
      {/* Spotlight shimmer on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(99,102,241,0.10) 0%, transparent 65%)",
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Icon — scales + brightens on hover */}
      <div
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300"
        style={{
          backgroundColor: hovered ? "rgba(99,102,241,0.2)" : "rgba(0,102,255,0.1)",
          transform: hovered ? "scale(1.12)" : "scale(1)",
        }}
      >
        <div
          className="transition-transform duration-300"
          style={{ transform: hovered ? "rotate(8deg)" : "rotate(0deg)" }}
        >
          <Icon
            className="h-5 w-5"
            strokeWidth={1.5}
            style={{ color: hovered ? "#818cf8" : "#0066FF" }}
          />
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <h3
          className="text-lg font-semibold transition-colors duration-200"
          style={{ color: hovered ? "#ffffff" : undefined }}
        >
          {title}
        </h3>
        {isNew && <NewBadge />}
      </div>
      <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
    </div>
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
      {valueProps.map(({ Icon, title, description, isNew }) => (
        <FeatureCard
          key={title}
          Icon={Icon}
          title={title}
          description={description}
          isNew={isNew}
        />
      ))}
    </div>
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
        <span className="mt-1 text-xs leading-tight text-text-tertiary">Ingen registrering</span>
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
