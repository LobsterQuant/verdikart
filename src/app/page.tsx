"use client";

import { motion } from "framer-motion";
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

function FeatureCards() {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      className="grid gap-4 sm:grid-cols-3 sm:gap-6"
    >
      {valueProps.map(({ Icon, title, description }, i) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
          className="rounded-xl border border-card-border bg-card-bg p-6 transition-colors hover:border-accent/30"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
          </div>
          <h3 className="mb-2 text-lg font-semibold">{title}</h3>
          <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
        </motion.div>
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
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-24 overflow-hidden">
        {/* Radial glow background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Staggered headline */}
        <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          <motion.span className="block" {...fadeUpProps(0)}>
            Forstå boligen.
          </motion.span>
          <motion.span className="block text-text-secondary" {...fadeUpProps(0.12)}>
            Ikke bare se den.
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
          <span className="hidden text-text-tertiary sm:block">·</span>
          <p className="text-sm text-text-tertiary">
            Allerede brukt på{" "}
            <span className="font-semibold text-foreground">500+</span>{" "}
            adresser i Norge
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
      <footer className="border-t border-card-border px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <a href="/" className="flex items-center gap-2">
            <Logo className="h-6 w-6 shrink-0 opacity-60" />
            <span className="text-sm text-text-tertiary">&copy; 2026 Verdikart</span>
          </a>
          <nav className="flex gap-6">
            <a href="/om-oss" className="text-sm text-text-secondary transition-colors hover:text-foreground">Om oss</a>
            <a href="/personvern" className="text-sm text-text-secondary transition-colors hover:text-foreground">Personvern</a>
            <a href="/vilkar" className="text-sm text-text-secondary transition-colors hover:text-foreground">Vilkår</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
