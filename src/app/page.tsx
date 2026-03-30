"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import AddressSearch from "@/components/AddressSearch";
import ProductPreview from "@/components/ProductPreview";
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
          className="mt-8 w-full max-w-xl sm:mt-10"
          {...fadeUpProps(0.32)}
        >
          <AddressSearch />
        </motion.div>

        {/* Social proof strip — above the fold */}
        <motion.div
          className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          {...fadeUpProps(0.4)}
        >
          {/* Live indicator */}
          <span className="flex items-center gap-1.5 text-sm text-text-tertiary">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Gratis · Ingen registrering
          </span>

          <span className="hidden h-4 w-px bg-card-border sm:block" aria-hidden />

          {/* Stat: addresses */}
          <span className="flex items-center gap-1.5 text-sm text-text-tertiary">
            <span className="font-semibold text-foreground">2,5M+</span>
            norske adresser
          </span>

          <span className="hidden h-4 w-px bg-card-border sm:block" aria-hidden />

          {/* Stat: cities */}
          <span className="flex items-center gap-1.5 text-sm text-text-tertiary">
            <span className="font-semibold text-foreground">15</span>
            byer dekket
          </span>

          <span className="hidden h-4 w-px bg-card-border sm:block" aria-hidden />

          {/* Stat: data sources */}
          <span className="flex items-center gap-1.5 text-sm text-text-tertiary">
            <span className="font-semibold text-foreground">3</span>
            offentlige datakilder
          </span>
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

          {/* Testimonial strip */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { quote: "«Endelig ett sted med all info»", name: "Anna, Oslo" },
              { quote: "«Sparte meg for en dyr feil»", name: "Erik, Bergen" },
              { quote: "«Brukte det på 3 adresser før budrunden»", name: "Marte, Trondheim" },
            ].map(({ quote, name }) => (
              <div
                key={name}
                className="flex items-center gap-2 rounded-full border border-card-border bg-card-bg px-4 py-2"
              >
                {/* Avatar dot */}
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
                  {name[0]}
                </span>
                <span className="text-xs text-text-secondary">
                  {quote}{" "}
                  <span className="text-text-tertiary">— {name}</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Product preview — fades in on scroll */}
      <PreviewSection />

      {/* Value Props — stagger on scroll */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 sm:pb-24">
        <FeatureCards />
      </section>

      {/* Email capture */}
      <section className="border-t border-card-border bg-card-bg px-4 py-14 text-center sm:px-6">
        <div className="mx-auto max-w-md">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">Beta</p>
          <h2 className="mb-3 text-2xl font-bold">Få varsel når nye funksjoner lanseres</h2>
          <p className="mb-6 text-sm leading-relaxed text-text-secondary">
            Vi jobber med prisvarslinger, AI-sammendrag og historiske salgskart. Registrer deg for å høre om det først.
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
                <a href="https://www.linkedin.com/in/micaready/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
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
            </div>
            <div className="space-y-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Byer</p>
              {[["Fredrikstad","/by/fredrikstad"],["Drammen","/by/drammen"],["Tromsø","/by/tromso"],["Sandnes","/by/sandnes"],["Bodø","/by/bodoe"],["Skien","/by/skien"],["Sarpsborg","/by/sarpsborg"],["Arendal","/by/arendal"],["Hamar","/by/hamar"]].map(([l,h]) => (
                <a key={h} href={h} className="block text-text-secondary transition-colors hover:text-foreground">{l}</a>
              ))}
            </div>
            <div className="space-y-2 mt-6 sm:mt-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">For deg</p>
              {[["Førstegangskjøper","/for/forstegangskjoper"],["Boliginvestor","/for/boliginvestor"],["Barnefamilie","/for/barnefamilier"],["Blogg","/blog"],["FAQ","/faq"]].map(([l,h]) => (
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
