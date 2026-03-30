"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import AddressSearch from "@/components/AddressSearch";
import ProductPreview from "@/components/ProductPreview";
import ProductDemo from "@/components/ProductDemo";
import EmailCapture from "@/components/EmailCapture";
import Logo from "@/components/Logo";
import { Bus, TrendingUp, Home } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import type { RefObject } from "react";

const valueProps = [
  {
    Icon: Bus,
    title: "Kollektivtransport",
    description:
      "Finn nærmeste holdeplasser, avganger og reisetid til sentrum. Alt du trenger for å vurdere beliggenheten.",
  },
  {
    Icon: TrendingUp,
    title: "Prisutvikling",
    description:
      "Følg boligprisene i kommunen over tid. Se trender og sammenlign med resten av landet.",
  },
  {
    Icon: Home,
    title: "Sammenlignbare salg",
    description:
      "Se gjennomsnittlig kvadratmeterpris for din kommune. Forstå hva lignende boliger faktisk omsettes for.",
  },
];

const EASE = "easeOut" as const;

function fadeUpProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: EASE, delay },
  };
}

function FeatureCard({
  Icon, title, description, delay, inView,
}: {
  Icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
  inView: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-60, 60], [6, -6]);
  const rotateY = useTransform(x, [-60, 60], [-6, 6]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    setHovered(false);
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      whileHover={{ y: -6, scale: 1.02 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-xl border bg-card-bg p-6 cursor-default overflow-hidden"
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d" as const,
        perspective: 800,
        boxShadow: hovered
          ? "0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)",
        borderColor: hovered ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)",
      }}
    >
      {/* Spotlight shimmer on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl"
        animate={{
          background: hovered
            ? "radial-gradient(circle at 50% 0%, rgba(99,102,241,0.10) 0%, transparent 65%)"
            : "radial-gradient(circle at 50% 0%, rgba(99,102,241,0) 0%, transparent 65%)",
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Icon — scales + brightens on hover */}
      <motion.div
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
        animate={{
          backgroundColor: hovered ? "rgba(99,102,241,0.2)" : "rgba(0,102,255,0.1)",
          scale: hovered ? 1.12 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        style={{ transformStyle: "preserve-3d", translateZ: 8 }}
      >
        <motion.div
          animate={{ rotate: hovered ? 8 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
        >
          <Icon
            className="h-5 w-5"
            strokeWidth={1.5}
            style={{ color: hovered ? "#818cf8" : "#0066FF" }}
          />
        </motion.div>
      </motion.div>

      <motion.h3
        className="mb-2 text-lg font-semibold"
        animate={{ color: hovered ? "#ffffff" : undefined }}
        transition={{ duration: 0.2 }}
        style={{ translateZ: 4 }}
      >
        {title}
      </motion.h3>
      <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
    </motion.div>
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
    title: "Vi henter data i sanntid",
    body: "Transport fra Entur, prisstatistikk fra SSB, støykart fra Kartverket. Alt hentes live — ingen foreldede cache-sider.",
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
          { label: "🔊  Støynivå vei", value: "52 dB — Moderat", good: null },
          { label: "🏘️  Sammenlignbare salg", value: "47 i nabolaget", good: true },
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
  { feature: "Kollektivtransport og gangavstand",   verdikart: true,  finn: false, google: false },
  { feature: "Støykart per adresse",                verdikart: true,  finn: false, google: false },
  { feature: "SSB prisstatistikk per bydel",        verdikart: true,  finn: false, google: false },
  { feature: "Sammenlignbare salg i nabolaget",     verdikart: true,  finn: true,  google: false },
  { feature: "Del-lenke til rapport",               verdikart: true,  finn: false, google: false },
  { feature: "Ingen registrering nødvendig",        verdikart: true,  finn: false, google: true  },
  { feature: "Gratis",                              verdikart: true,  finn: true,  google: true  },
];

function ComparisonSection() {
  const { ref, inView } = useInView(0.15);
  return (
    <motion.section
      ref={ref as RefObject<HTMLElement>}
      className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6"
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">Hvorfor Verdikart?</h2>
      <p className="mb-8 text-center text-sm text-text-secondary">
        Google forteller deg hva boligen ser ut som. Finn.no viser prisen. Verdikart forklarer <em>konteksten</em>.
      </p>
      <div className="overflow-hidden rounded-xl border border-card-border">
        {/* Header */}
        <div className="grid grid-cols-4 border-b border-card-border bg-card-bg px-4 py-3 text-xs font-semibold">
          <span className="col-span-1 text-text-tertiary">Funksjon</span>
          <span className="text-center text-accent">Verdikart</span>
          <span className="text-center text-text-tertiary">Finn.no</span>
          <span className="text-center text-text-tertiary">Google Maps</span>
        </div>
        {COMPARISON_ROWS.map(({ feature, verdikart, finn, google }, i) => (
          <motion.div
            key={feature}
            className={`grid grid-cols-4 items-center px-4 py-3 text-xs ${i % 2 === 0 ? "bg-background" : "bg-card-bg"}`}
            initial={{ opacity: 0, x: -12 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
          >
            <span className="col-span-1 text-text-secondary pr-2">{feature}</span>
            <span className="flex justify-center">
              {verdikart
                ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-accent font-bold">✓</span>
                : <span className="text-text-tertiary opacity-30">—</span>}
            </span>
            <span className="flex justify-center">
              {finn
                ? <span className="text-text-secondary">✓</span>
                : <span className="text-text-tertiary opacity-30">—</span>}
            </span>
            <span className="flex justify-center">
              {google
                ? <span className="text-text-secondary">✓</span>
                : <span className="text-text-tertiary opacity-30">—</span>}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function HowItWorksSection() {
  const { ref, inView } = useInView(0.2);
  return (
    <section
      ref={ref as RefObject<HTMLElement>}
      className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6"
    >
      <motion.h2
        className="mb-8 text-center text-xl font-bold sm:text-2xl"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        Slik fungerer det
      </motion.h2>
      <ol className="relative space-y-6 pl-8">
        <motion.div
          aria-hidden
          className="absolute left-[11px] top-2 bottom-2 w-px origin-top bg-card-border"
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        />
        {HOW_STEPS.map(({ n, title, body, icon, preview }, i) => (
          <motion.li
            key={n}
            className="flex gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.15, ease: "easeOut" }}
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
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

function FeatureCards() {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      className="grid gap-4 sm:grid-cols-3 sm:gap-6"
    >
      {valueProps.map(({ Icon, title, description }, i) => (
        <FeatureCard
          key={title}
          Icon={Icon}
          title={title}
          description={description}
          delay={i * 0.1}
          inView={inView}
        />
      ))}
    </div>
  );
}

function PreviewSection() {
  const { ref, inView } = useInView(0.1);
  return (
    <motion.section
      ref={ref as RefObject<HTMLElement>}
      initial={{ opacity: 0, y: 48, rotateX: 8, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      style={{ perspective: 1200, transformStyle: "preserve-3d" }}
      className="mx-auto w-full max-w-2xl px-4 pb-16 sm:px-6"
    >
      <ProductPreview />
    </motion.section>
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

        {/* Staggered headline */}
        <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          <motion.span className="block text-gradient headline-shimmer" {...fadeUpProps(0)}>
            Forstå boligen.
          </motion.span>
          <motion.span className="block text-text-secondary" {...fadeUpProps(0.12)}>
            Ikke&nbsp;bare se&nbsp;den.
          </motion.span>
        </h1>

        <motion.p
          className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary sm:mt-6 sm:text-lg"
          {...fadeUpProps(0.22)}
        >
          Verdikart gir deg innsikten du trenger før du kjøper bolig.
          Transport, prisutvikling og markedsdata — alt på ett sted.
        </motion.p>

        <motion.div
          id="sok"
          className="mt-8 w-full max-w-xl sm:mt-10"
          {...fadeUpProps(0.32)}
        >
          <AddressSearch />
        </motion.div>

        {/* Social proof strip — above the fold */}
        <motion.div
          className="mt-7 w-full max-w-lg"
          {...fadeUpProps(0.4)}
        >
          {/* Live demo widget */}
          <div className="mx-auto w-full max-w-md">
            <ProductDemo />
          </div>

          {/* Stats grid — 2×2 on mobile, 4 cols on sm+ */}
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-card-border bg-card-bg divide-y divide-card-border sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
            {[
              { value: "Gratis", label: "Ingen registrering", dot: true },
              { value: "2,5M+", label: "norske adresser" },
              { value: "15", label: "byer dekket" },
              { value: "3", label: "datakilder" },
            ].map(({ value, label, dot }, i) => (
              <div
                key={label}
                className={`flex flex-col items-center justify-center px-3 py-4 text-center${i % 2 === 0 ? " border-r border-card-border sm:border-r-0" : ""}`}
              >
                <span className="flex items-center gap-1.5 text-base font-bold text-foreground leading-tight sm:text-sm">
                  {dot && (
                    <span className="relative inline-flex h-2 w-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                  )}
                  {value}
                </span>
                <span className="mt-1 text-xs leading-tight text-text-tertiary">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Data source badges + mini testimonials */}
        <motion.div
          className="mt-5 flex flex-col items-center gap-4"
          {...fadeUpProps(0.5)}
        >
          {/* Source badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-text-tertiary">Data fra</span>
            {[
              { label: "SSB", href: "https://www.ssb.no", title: "Statistisk sentralbyrå" },
              { label: "Kartverket", href: "https://kartverket.no", title: "Nasjonal adresse- og eiendomsdata" },
              { label: "Entur", href: "https://entur.no", title: "Kollektivtransport" },
            ].map(({ label, href, title }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={title}
                className="inline-flex items-center rounded-full border border-card-border bg-card-bg px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Social proof strip — verified-style quotes */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              {
                quote: "«Endelig ett sted med all info — transport, støy og pris samlet»",
                name: "Marte K.",
                city: "Trondheim",
                context: "Tidlig bruker",
                initials: "MK",
                hue: "6366f1",
              },
              {
                quote: "«Oppdaget et støyproblem megleren ikke hadde nevnt»",
                name: "Anders L.",
                city: "Oslo",
                context: "Tidlig bruker",
                initials: "AL",
                hue: "3b82f6",
              },
              {
                quote: "«Brukte rapporten som grunnlag da jeg forhandlet pris»",
                name: "Ingrid S.",
                city: "Bergen",
                context: "Tidlig bruker",
                initials: "IS",
                hue: "8b5cf6",
              },
            ].map(({ quote, name, city, context, initials, hue }) => (
              <div
                key={name}
                className="flex items-start gap-3 rounded-2xl border border-card-border bg-card-bg px-4 py-3 text-left max-w-xs"
              >
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: `#${hue}` }}
                >
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="text-xs leading-relaxed text-text-secondary">{quote}</p>
                  <p className="mt-1 text-[11px] font-semibold text-foreground">{name} · {city}</p>
                  <p className="text-[10px] text-text-tertiary">{context}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Product preview — fades in on scroll */}
      <PreviewSection />

      {/* Slik fungerer det — staggered scroll animation */}
      <HowItWorksSection />

      {/* Competitor comparison */}
      <ComparisonSection />

      {/* Value Props — stagger on scroll */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 sm:pb-24">
        <FeatureCards />
      </section>

      {/* Email capture — reframed as value, not "coming soon" */}
      <section className="border-t border-card-border bg-card-bg px-4 py-14 text-center sm:px-6">
        <div className="mx-auto max-w-md">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">Hold deg oppdatert</p>
          <h2 className="mb-3 text-2xl font-bold">Få markedsinnsikt rett i innboksen</h2>
          <p className="mb-6 text-sm leading-relaxed text-text-secondary">
            Vi sender månedlige oppdateringer om boligprisutvikling per bydel, nye datakilder og tips til boligkjøpere. Ingen spam — kun tall som faktisk betyr noe.
          </p>
          <EmailCapture />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border px-4 pt-12 pb-8 sm:px-6 sm:pt-14 no-print">
        <div className="mx-auto max-w-5xl">

          {/* Top: brand block + inline email */}
          <div className="mb-10 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            {/* Brand */}
            <div className="max-w-xs">
              <a href="/" className="mb-3 flex items-center gap-2">
                <Logo className="h-7 w-7 shrink-0" />
                <span className="text-base font-bold tracking-tight text-foreground">Verdikart</span>
              </a>
              <p className="text-sm leading-relaxed text-text-secondary">
                Norges åpne boligverktøy. Vi tar ingen provisjon, selger ingen boliger og har ingen agenda — bare data.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <a href="https://x.com/Verdikart" target="_blank" rel="noopener noreferrer" aria-label="X"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-card-bg text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/michael-h-7723993bb/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-card-bg text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Inline email */}
            <div className="w-full max-w-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Hold deg oppdatert</p>
              <p className="mb-3 text-sm text-text-secondary">Nye funksjoner og markedsanalyser direkte i innboksen.</p>
              <EmailCapture compact />
            </div>
          </div>

          {/* Nav columns */}
          <div className="mb-8 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
            <div className="space-y-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Byer</p>
              {[["Oslo","/by/oslo"],["Bergen","/by/bergen"],["Trondheim","/by/trondheim"],["Stavanger","/by/stavanger"],["Bærum","/by/baerum"],["Kristiansand","/by/kristiansand"]].map(([l,h]) => (
                <a key={h} href={h} className="block text-text-secondary transition-colors hover:text-foreground">{l}</a>
              ))}
              <p className="mb-1 mt-4 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Nabolag</p>
              {[["Frogner","/nabolag/frogner"],["Grünerløkka","/nabolag/grunerlokka"],["Majorstuen","/nabolag/majorstuen"],["Nordnes","/nabolag/nordnes"]].map(([l,h]) => (
                <a key={h} href={h} className="block text-text-secondary transition-colors hover:text-foreground">{l}</a>
              ))}
            </div>
            <div className="space-y-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Flere byer</p>
              {[["Fredrikstad","/by/fredrikstad"],["Drammen","/by/drammen"],["Tromsø","/by/tromso"],["Sandnes","/by/sandnes"],["Bodø","/by/bodoe"],["Skien","/by/skien"],["Sarpsborg","/by/sarpsborg"],["Arendal","/by/arendal"],["Hamar","/by/hamar"]].map(([l,h]) => (
                <a key={h} href={h} className="block text-text-secondary transition-colors hover:text-foreground">{l}</a>
              ))}
            </div>
            <div className="space-y-2 mt-6 sm:mt-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">For deg</p>
              {[["Førstegangskjøper","/for/forstegangskjoper"],["Boliginvestor","/for/boliginvestor"],["Barnefamilie","/for/barnefamilier"],["Selger","/for/selger"],["Sammenlign adresser","/sammenlign"],["Boligkalkulator","/kalkulator"],["Bykart","/bykart"],["Data & metodologi","/data"],["Blogg","/blog"],["FAQ","/faq"]].map(([l,h]) => (
                <a key={h} href={h} className="block text-text-secondary transition-colors hover:text-foreground">{l}</a>
              ))}
            </div>
            <div className="space-y-2 mt-6 sm:mt-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Om oss</p>
              {[["Om oss","/om-oss"],["Kontakt","/kontakt"],["Presse","/presse"],["Endringslogg","/changelog"],["Personvern","/personvern"],["Vilkår","/vilkar"]].map(([l,h]) => (
                <a key={h} href={h} className="block text-text-secondary transition-colors hover:text-foreground">{l}</a>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-2 border-t border-card-border pt-6 text-xs text-text-tertiary sm:flex-row">
            <span>&copy; 2026 Verdikart. Data fra SSB, Kartverket og Entur.</span>
            <span>Laget i Oslo 🇳🇴</span>
          </div>

        </div>
      </footer>
    </div>
  );
}
