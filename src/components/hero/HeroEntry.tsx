"use client";

import { motion } from "framer-motion";
import AddressSearch from "@/components/AddressSearch";
import SavedAddressesList from "@/components/SavedAddressesList";
import { fadeUp, staggerParent } from "@/lib/motion";

const EXAMPLES: ReadonlyArray<readonly [string, string]> = [
  ["Karl Johans gate 1, Oslo", "karl-johans-gate-1--599114-107494-0301"],
  ["Bryggen 1, Bergen", "bryggen-1-bergen--603893-53320-4601"],
  ["Torget 2, Trondheim", "torget-2-trondheim--633436-103892-5001"],
];

/**
 * Hero entry choreography — eyebrow → H1 → supporting paragraph → search →
 * example chips → saved-addresses list, staggered at 60 ms intervals with
 * fadeUp on mount.
 *
 * Client component so the variant-driven mount animation plays once on
 * hydration. The static markup still renders on the server (Next.js streams
 * the HTML); Framer Motion then takes over once JS boots. No CLS because
 * the hidden state only offsets y by 16 px — the layout box is already sized.
 */
export default function HeroEntry() {
  return (
    <motion.div
      className="flex w-full flex-col items-center"
      variants={staggerParent(60)}
      initial="hidden"
      animate="visible"
    >
      {/* Eyebrow */}
      <motion.p variants={fadeUp} className="caption mb-4 uppercase tracking-[0.14em] text-accent">
        Forstå boligen. Ikke bare se den.
      </motion.p>

      {/* H1 — whole block animates as a single unit per Package 5 spec */}
      <motion.h1 variants={fadeUp} className="display-1 max-w-3xl text-text">
        Er nabolaget verdt prisen?
        <br />
        <span className="italic text-text-muted">
          Finn svaret på&nbsp;10&nbsp;sekunder.
        </span>
      </motion.h1>

      {/* Supporting paragraph */}
      <motion.p
        variants={fadeUp}
        className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg"
      >
        Søk på hvilken som helst norsk adresse og få full rapport om
        kollektivtransport, boligprisutvikling, støynivå og nabolagsdata —
        direkte fra SSB, Kartverket og Entur.
      </motion.p>

      {/* Search field + example chips. `id=sok` preserved as hash anchor target. */}
      <motion.div variants={fadeUp} id="sok" className="mt-block w-full max-w-xl">
        <AddressSearch />
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
          <span className="text-[11px] text-text-tertiary">Eksempler:</span>
          {EXAMPLES.map(([label, slug]) => (
            <a
              key={label}
              href={`/eiendom/${slug}?adresse=${encodeURIComponent(label)}`}
              className="rounded-full border border-card-border bg-card-bg/60 px-2.5 py-1 text-[11px] text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
            >
              {label}
            </a>
          ))}
        </div>
      </motion.div>

      {/* Saved addresses */}
      <motion.div variants={fadeUp} className="mt-4 w-full max-w-md">
        <SavedAddressesList />
      </motion.div>
    </motion.div>
  );
}
