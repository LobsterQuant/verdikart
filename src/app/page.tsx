"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import AddressSearch from "@/components/AddressSearch";
import ProductPreview from "@/components/ProductPreview";
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
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
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
        {/* Radial glow background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 50% -10%, rgba(99,102,241,0.18) 0%, rgba(59,130,246,0.06) 40%, transparent 70%)",
          }}
        />

        {/* Staggered headline */}
        <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          <motion.span className="block text-gradient" {...fadeUpProps(0)}>
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

        {/* Trust row */}
        <motion.div
          className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          {...fadeUpProps(0.4)}
        >
          <p className="flex items-center gap-1.5 text-sm text-text-tertiary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            Gratis å bruke · Ingen registrering
          </p>
        </motion.div>

        {/* Data source badges */}
        <motion.div
          className="mt-5 flex flex-wrap items-center justify-center gap-2"
          {...fadeUpProps(0.46)}
        >
          <span className="text-xs text-text-tertiary">Basert på data fra</span>
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
        </motion.div>
      </main>

      {/* Product preview — fades in on scroll */}
      <PreviewSection />

      {/* Value Props — stagger on scroll */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 sm:pb-24">
        <FeatureCards />
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Top row: brand + social */}
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <Logo className="h-6 w-6 shrink-0 opacity-60" />
              <span className="text-sm text-text-tertiary">&copy; 2026 Verdikart</span>
            </a>
            <div className="flex items-center gap-2">
              <a
                href="https://x.com/micareadyeu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Verdikart på X"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-card-bg text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground"
              >
                {/* X logo */}
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/micaready/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Verdikart på LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-card-bg text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground"
              >
                {/* LinkedIn logo */}
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-start">
            {[
              ["/by/oslo", "Oslo"],
              ["/by/bergen", "Bergen"],
              ["/by/trondheim", "Trondheim"],
              ["/blog", "Blogg"],
              ["/faq", "FAQ"],
              ["/changelog", "Endringslogg"],
              ["/kontakt", "Kontakt"],
              ["/om-oss", "Om oss"],
              ["/personvern", "Personvern"],
              ["/vilkar", "Vilkår"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="text-sm text-text-secondary transition-colors hover:text-foreground">{label}</a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
