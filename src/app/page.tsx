"use client";

import { useState, useRef, useEffect } from "react";
import React from "react";
import AddressSearch from "@/components/AddressSearch";
import ProductPreview from "@/components/ProductPreview";
import ProductDemo from "@/components/ProductDemo";
import SocialProofStrip from "@/components/SocialProofStrip";
import EmailCapture from "@/components/EmailCapture";
import SiteFooter from "@/components/SiteFooter";
import SavedAddressesList from "@/components/SavedAddressesList";
import { Bus, TrendingUp, Home, Droplets, Wind, CircleDollarSign } from "lucide-react";
import { useInView } from "@/hooks/useInView";

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

// Count-up hook — runs once when active flips true
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

function FeatureCard({
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
        {isNew && (
          <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-400">
            Nytt
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
    </div>
  );
}

const HOW_STEPS = [
  {
    n: "1",
    title: "Skriv inn adressen",
    body: "Søk på enhver norsk gateadresse — Kartverket kjenner alle 2,5 millioner av dem. Velg fra forslagslisten og trykk Enter.",
    icon: "🔍",
    preview: (
      <div className="mt-3 rounded-lg border border-card-border bg-background px-3 py-2.5 text-xs">
        <div className="flex items-center gap-2 rounded-md border border-accent/40 bg-card-bg px-3 py-2">
          <svg className="h-3.5 w-3.5 text-text-tertiary shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>
          <span className="text-text-secondary">Bygdøy allé 34, Oslo</span>
          <span className="ml-auto h-3.5 w-px animate-pulse bg-accent" />
        </div>
        <div className="mt-1.5 divide-y divide-card-border rounded-md border border-card-border bg-card-bg">
          {["Bygdøy allé 34, 0265 Oslo", "Bygdøy allé 36, 0265 Oslo"].map((s, i) => (
            <div key={i} className={`px-3 py-1.5 text-[11px] ${i === 0 ? "text-foreground bg-accent/8" : "text-text-tertiary"}`}>{s}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    n: "2",
    title: "Data direkte fra kilden",
    body: "Kollektivdata fra Entur hentes live ved hvert søk. Prisstatistikk fra SSB oppdateres kvartalsvis. Adressedata fra Kartverket er Norges offisielle register.",
    icon: "⚡",
    preview: (
      <div className="mt-3 grid grid-cols-3 gap-1.5 text-[11px]">
        {[
          { src: "Entur", label: "Transport", color: "bg-blue-500/15 border-blue-500/25 text-blue-400" },
          { src: "SSB", label: "Boligpris", color: "bg-green-500/15 border-green-500/25 text-green-400" },
          { src: "Kart.", label: "Støykart", color: "bg-purple-500/15 border-purple-500/25 text-purple-400" },
        ].map(({ src, label, color }) => (
          <div key={src} className={`rounded-lg border px-2 py-2 text-center ${color}`}>
            <div className="font-bold">{src}</div>
            <div className="text-[10px] opacity-70">{label}</div>
            <div className="mt-1 flex justify-center">
              <span className="relative inline-flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 bg-current"/><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current"/></span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    n: "3",
    title: "Les rapporten, ta en bedre beslutning",
    body: "Se holdeplasser, avganger, kvadratmeterpris og sammenlignbare salg — samlet på én side. Del lenken med megler eller bankrådgiver.",
    icon: "📋",
    preview: (
      <div className="mt-3 space-y-1.5 text-[11px]">
        {[
          { label: "🚇  T-bane 50m", value: "Nationalteatret", good: true },
          { label: "📊  Kvadratmeterpris", value: "94 200 kr/m²", good: true },
          { label: "🔊  Støynivå vei", value: "Data fra Kartverket", good: null },
          { label: "🏘️  Sammenlignbare salg", value: "kommunesnitt", good: true },
        ].map(({ label, value, good }) => (
          <div key={label} className="flex items-center justify-between rounded-md border border-card-border bg-background px-2.5 py-1.5">
            <span className="text-text-secondary">{label}</span>
            <span className={`font-semibold ${good === true ? "text-green-400" : good === false ? "text-red-400" : "text-amber-400"}`}>{value}</span>
          </div>
        ))}
      </div>
    ),
  },
];

const COMPARISON_ROWS = [
  { feature: "Verdiestimat for boligen",         short: "Verdiestimat",  icon: "💰", verdikart: true,  finn: false, google: false, note: "nytt" },
  { feature: "Klimarisiko (flom, kvikkleire)",   short: "Klimarisiko",   icon: "🌊", verdikart: true,  finn: false, google: false, note: "nytt" },
  { feature: "Luftkvalitet (PM2.5, NO₂)",        short: "Luftkvalitet",  icon: "💨", verdikart: true,  finn: false, google: false, note: "nytt" },
  { feature: "Bredbåndsdekning og fiber",        short: "Bredbånd",      icon: "📡", verdikart: true,  finn: false, google: false, note: "nytt" },
  { feature: "Butikker, parker, fasiliteter",    short: "I nærheten",    icon: "🛒", verdikart: true,  finn: false, google: true,  note: "nytt" },
  { feature: "Holdeplasser + avganger per time", short: "Avganger/time", icon: "🚇", verdikart: true,  finn: false, google: false, note: "" },
  { feature: "Støykart fra Kartverket",          short: "Støykart",      icon: "🔊", verdikart: true,  finn: false, google: false, note: "" },
  { feature: "SSB prisstatistikk (kvartal)",     short: "SSB pris",      icon: "📊", verdikart: true,  finn: false, google: false, note: "" },
  { feature: "Skoler og barnehager (NSR)",       short: "Skoler",        icon: "🏫", verdikart: true,  finn: false, google: false, note: "" },
  { feature: "Nabolagsvurderinger",              short: "Vurderinger",   icon: "⭐", verdikart: true,  finn: false, google: false, note: "nytt" },
  { feature: "Lagre + prisvarsler",              short: "Lagre/varsle",  icon: "🔔", verdikart: true,  finn: true,  google: false, note: "" },
  { feature: "PDF-rapport",                      short: "PDF",           icon: "📄", verdikart: true,  finn: false, google: false, note: "nytt" },
  { feature: "Gratis & ingen registrering",      short: "Gratis",        icon: "✨", verdikart: true,  finn: true,  google: true,  note: "" },
];

function ComparisonSection() {
  const competitors = [
    {
      name: "Verdikart",
      tagline: "Kontekst + data",
      accent: true,
      logo: (
        <span className="text-base font-bold text-accent">V</span>
      ),
    },
    {
      name: "Finn.no",
      tagline: "Annonser + pris",
      accent: false,
      logo: <span className="text-base font-bold text-text-tertiary">F</span>,
    },
    {
      name: "Google Maps",
      tagline: "Kart + bilder",
      accent: false,
      logo: <span className="text-base font-bold text-text-tertiary">G</span>,
    },
  ];

  return (
    <section
      className="mx-auto w-full max-w-4xl px-4 pb-20 sm:px-6"
    >
      <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">Hvorfor Verdikart?</h2>
      <p className="mb-10 text-center text-sm text-text-secondary max-w-lg mx-auto">
        Google forteller deg hva boligen ser ut som. Finn.no viser prisen. Verdikart forklarer <em>konteksten</em>.
      </p>

      {/* Unified comparison table — header cards + feature rows share the same grid */}
      <div className="overflow-x-auto rounded-xl border border-card-border" role="table" aria-label="Sammenligning av boligverktøy" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="min-w-[520px] w-max sm:w-full">

          {/* Header row — product cards aligned to columns */}
          <div className="grid grid-cols-[minmax(140px,1fr)_repeat(3,_100px)] border-b border-card-border" role="row">
            <div role="columnheader" /> {/* empty label column */}
            {competitors.map(({ name, tagline, accent, logo }) => (
              <div
                key={name}
                role="columnheader"
                className={`flex flex-col items-center justify-center px-2 py-4 text-center ${
                  accent ? "bg-accent/5" : ""
                }`}
              >
                <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full border ${accent ? "border-accent/30 bg-accent/10" : "border-card-border bg-background"}`}>
                  {logo}
                </div>
                <p className={`text-sm font-bold leading-tight ${accent ? "text-foreground" : "text-text-secondary"}`}>{name}</p>
                <p className="text-[10px] text-text-tertiary mt-0.5">{tagline}</p>
                {accent && (
                  <div className="mt-2 inline-block rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent">
                    Anbefalt
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Feature rows */}
          {COMPARISON_ROWS.map(({ feature, short, icon, verdikart, finn, google, note }, i) => (
            <div
              key={feature}
              role="row"
              className={`grid grid-cols-[minmax(140px,1fr)_repeat(3,_100px)] items-center border-b border-card-border last:border-b-0 ${
                i % 2 === 0 ? "bg-background" : "bg-card-bg"
              }`}
            >
              <div role="rowheader" className="flex items-center gap-2.5 px-4 py-3.5">
                <span className="text-base shrink-0" aria-hidden>{icon}</span>
                <span className="text-xs text-text-secondary leading-snug">
                  <span className="sm:hidden">{short}</span>
                  <span className="hidden sm:inline">{feature}</span>
                  {note === "nytt" ? (
                    <span className="ml-1.5 inline-block rounded-full bg-green-500/20 px-1.5 py-px text-[9px] font-bold uppercase text-green-400">nytt</span>
                  ) : note ? (
                    <span className="text-text-tertiary text-[10px] ml-1">({note})</span>
                  ) : null}
                </span>
              </div>
              {/* Verdikart */}
              <div role="cell" className={`flex items-center justify-center py-3.5 ${verdikart ? "bg-accent/5" : ""}`}>
                {verdikart ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white text-[11px] font-bold shadow-sm shadow-accent/30">✓</span>
                ) : (
                  <span className="h-4 w-px bg-card-border inline-block opacity-40" />
                )}
              </div>
              {/* Finn */}
              <div role="cell" className="flex items-center justify-center py-3.5">
                {finn ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-card-border text-text-secondary text-[11px]">✓</span>
                ) : (
                  <span className="h-4 w-px bg-card-border inline-block opacity-30" />
                )}
              </div>
              {/* Google */}
              <div role="cell" className="flex items-center justify-center py-3.5">
                {google ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-card-border text-text-secondary text-[11px]">✓</span>
                ) : (
                  <span className="h-4 w-px bg-card-border inline-block opacity-30" />
                )}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* Mobile scroll hint */}
      <p className="mt-2 text-center text-[10px] text-text-tertiary sm:hidden">← Sveip for å se alle kolonner →</p>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <h2 className="mb-8 text-center text-xl font-bold sm:text-2xl">
        Slik fungerer det
      </h2>
      <ol className="relative space-y-6 pl-8">
        <div
          aria-hidden
          className="absolute left-[11px] top-2 bottom-2 w-px origin-top bg-card-border"
        />
        {HOW_STEPS.map(({ n, title, body, icon, preview }) => (
          <li
            key={n}
            className="flex gap-4"
          >
            <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white shadow-lg shadow-accent/30 mt-0.5">
              {n}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">
                <span className="mr-1.5">{icon}</span>
                {title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">{body}</p>
              {preview}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FeatureCards() {
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

function PreviewSection() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 pb-16 sm:px-6">
      <ProductPreview />
    </section>
  );
}

function StatsGrid() {
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

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Hero */}
      <main className="hero-noise relative flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-24 overflow-hidden">

        {/* ── Background layer stack ── */}
        {/* 1. Dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,0.5) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* 2. Vignette fade over grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 30%, #080810 80%)",
          }}
        />
        {/* 3. Primary indigo glow — top-center */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(99,102,241,0.22) 0%, rgba(59,130,246,0.08) 50%, transparent 75%)",
          }}
        />
        {/* 4. Floating orb — left */}
        <div
          aria-hidden
          className="hero-orb-left pointer-events-none absolute -z-10 h-[420px] w-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            top: "10%",
            left: "-12%",
          }}
        />
        {/* 5. Floating orb — right */}
        <div
          aria-hidden
          className="hero-orb-right pointer-events-none absolute -z-10 h-[360px] w-[360px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)",
            top: "20%",
            right: "-10%",
          }}
        />
        {/* 6. Bottom accent wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 -z-10 h-32"
          style={{
            background:
              "linear-gradient(to top, #080810 0%, transparent 100%)",
          }}
        />

        {/* Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/8 px-3 py-1 text-xs font-medium text-accent">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            Gratis · Ingen registrering · Norske offentlige data
          </span>
        </div>

        {/* Staggered headline */}
        <h1 className="max-w-3xl text-[1.65rem] font-bold leading-tight tracking-tight xs:text-3xl sm:text-5xl md:text-6xl">
          <span className="block text-gradient headline-shimmer">
            Er nabolaget verdt prisen?
          </span>
          <span className="block text-foreground/80">
            Finn svaret på&nbsp;10&nbsp;sekunder.
          </span>
        </h1>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary sm:mt-6 sm:text-lg">
          Søk på hvilken som helst norsk adresse og få full rapport om
          kollektivtransport, boligprisutvikling, støynivå og nabolagsdata —
          direkte fra SSB, Kartverket og Entur.
        </p>

        <div
          id="sok"
          className="mt-8 w-full max-w-xl sm:mt-10"
        >
          <AddressSearch />
          {/* Quick-start example addresses */}
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-[11px] text-text-tertiary">Prøv:</span>
            {[
              ["Karl Johans gate 1, Oslo", "karl-johans-gate-1--599114-107494-0301"],
              ["Bryggen 1, Bergen",     "bryggen-1-bergen--603893-53320-4601"],
              ["Torget 2, Trondheim",   "torget-2-trondheim--633436-103892-5001"],
            ].map(([label, slug]) => (
              <a
                key={label}
                href={`/eiendom/${slug}?adresse=${encodeURIComponent(label)}`}
                className="rounded-full border border-card-border bg-card-bg/60 px-2.5 py-1 text-[11px] text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Saved addresses */}
        <div className="mt-5 w-full max-w-md">
          <SavedAddressesList />
        </div>

        {/* Social proof strip — above the fold */}
        <div className="mt-7 w-full max-w-lg">
          {/* Live demo widget */}
          <div className="mx-auto w-full max-w-md">
            <ProductDemo />
          </div>

          {/* Stats grid — animated count-up on scroll */}
          <div className="px-4 sm:px-0">
            <StatsGrid />
          </div>
        </div>

        {/* Data source trust strip */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-text-tertiary">Åpne data fra</span>
          {[
            { label: "SSB", href: "https://www.ssb.no", title: "Boligpriser og statistikk" },
            { label: "Kartverket", href: "https://kartverket.no", title: "Adresse, eiendom og støykart" },
            { label: "Entur", href: "https://entur.no", title: "Kollektivtransport" },
            { label: "NVE", href: "https://nve.no", title: "Klima- og flomrisiko" },
            { label: "NILU", href: "https://luftkvalitet.info", title: "Luftkvalitet" },
            { label: "Nkom", href: "https://nkom.no", title: "Bredbåndsdekning" },
            { label: "Enova", href: "https://enova.no", title: "Energimerking" },
            { label: "OSM", href: "https://openstreetmap.org", title: "Skoler og fasiliteter" },
          ].map(({ label, href, title }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
              className="inline-flex items-center gap-1 rounded-full border border-card-border bg-card-bg px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground"
            >
              {label}
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M2.5 9.5 L9.5 2.5M5.5 2.5h4v4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </div>
      </main>

      {/* Product preview — fades in on scroll */}
      <PreviewSection />

      {/* Social proof: report counter + use-case carousel */}
      <SocialProofStrip />

      {/* Slik fungerer det — staggered scroll animation */}
      <HowItWorksSection />

      {/* Competitor comparison */}
      <ComparisonSection />

      {/* Value Props — stagger on scroll */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-xl font-bold sm:text-2xl">
            13 datapunkter. Én rapport.
          </h2>
          <p className="mx-auto max-w-lg text-sm text-text-secondary">
            Fra verdiestimat til flomrisiko — Verdikart samler data fra 8 offentlige kilder som ingen andre kombinerer.
          </p>
        </div>
        <FeatureCards />
      </section>

      {/* Hvorfor gratis? — monetisation transparency */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-card-border bg-card-bg p-6 sm:p-8">
          <h2 className="mb-4 text-lg font-bold">Hvorfor er dette gratis?</h2>
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            {[
              { icon: "🏗️", title: "Åpen infrastruktur", body: "Data fra SSB, Kartverket og Entur er offentlig tilgjengelig — vi gjør den søkbar og nyttig." },
              { icon: "🌱", title: "Bygger troverdighet", body: "Vi er i en tidlig fase og ønsker at flest mulig prøver verktøyet og gir tilbakemelding." },
              { icon: "🔮", title: "Fremtidige planer", body: "Vi planlegger premium-funksjoner som lagrede rapporter og prisvarsel — de grunnleggende funksjonene forblir alltid gratis." },
            ].map(({ icon, title, body }) => (
              <div key={title} className="flex flex-col gap-2">
                <span className="text-2xl">{icon}</span>
                <p className="font-semibold text-foreground">{title}</p>
                <p className="leading-relaxed text-text-secondary">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email capture — reframed as value, not "coming soon" */}
      <section className="border-t border-card-border bg-card-bg px-4 py-14 text-center sm:px-6">
        <div className="mx-auto max-w-md">
          <h2 className="mb-3 text-2xl font-bold">Få markedsinnsikt rett i innboksen</h2>
          <p className="mb-6 text-sm leading-relaxed text-text-secondary">
            Vi sender månedlige oppdateringer om boligprisutvikling per bydel, nye datakilder og tips til boligkjøpere. Ingen spam — kun tall som faktisk betyr noe.
          </p>
          <EmailCapture />
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
