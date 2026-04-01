"use client";

import { useEffect, useState } from "react";

const USE_CASES = [
  {
    emoji: "🏠",
    headline: "Støynivå megleren ikke nevnte",
    body: "Ring 2-trafikken vises direkte på kartet. Sjekk støykart, kollektivdekning og prisstatistikk — før du bestemmer deg.",
    tag: "Illustrativt eksempel · Grünerløkka, Oslo",
  },
  {
    emoji: "🚇",
    headline: "Reisetid fra Entur — ikke fra annonsen",
    body: "Verdikart henter faktiske avganger og gangavstand fra Entur. Ikke meglerens anslag. Sammenlign to adresser side om side.",
    tag: "Illustrativt eksempel · Bergen",
  },
  {
    emoji: "📊",
    headline: "SSB-prisdata for nabolaget",
    body: "Se gjennomsnittlig kvadratmeterpris for kommunen og prisutviklingen siste 8 kvartaler — fra Statistisk sentralbyrå.",
    tag: "Illustrativt eksempel · Trondheim",
  },
];

export default function SocialProofStrip() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % USE_CASES.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6">
      {/* Trust strip — kommuner + datakilder */}
      <div className="mb-8 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-card-border bg-card-bg px-3 py-4">
          <p className="text-2xl font-bold text-foreground">47</p>
          <p className="mt-1 text-xs text-text-tertiary">kommuner med prisdata</p>
        </div>
        <div className="rounded-xl border border-card-border bg-card-bg px-3 py-4">
          <p className="text-2xl font-bold text-foreground">4</p>
          <p className="mt-1 text-xs text-text-tertiary">offentlige datakilder</p>
        </div>
        <div className="rounded-xl border border-card-border bg-card-bg px-3 py-4">
          <p className="text-2xl font-bold text-foreground">100%</p>
          <p className="mt-1 text-xs text-text-tertiary">gratis, ingen konto</p>
        </div>
      </div>

      {/* Use-case carousel */}
      <div className="relative overflow-hidden rounded-2xl border border-card-border bg-card-bg">
        {USE_CASES.map((uc, i) => (
          <div
            key={uc.headline}
            className={`flex items-start gap-4 px-6 py-5 transition-all duration-500 ${
              i === active ? "opacity-100 translate-y-0" : "absolute inset-0 opacity-0 translate-y-4 pointer-events-none"
            }`}
            aria-hidden={i !== active}
          >
            <span className="text-3xl shrink-0 mt-0.5" aria-hidden>{uc.emoji}</span>
            <div>
              <p className="font-semibold text-foreground">{uc.headline}</p>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">{uc.body}</p>
              <p className="mt-2 text-xs text-text-tertiary italic">{uc.tag}</p>
            </div>
          </div>
        ))}
        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 pb-3 pt-1">
          {USE_CASES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Use case ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-6 bg-accent" : "w-1.5 bg-text-tertiary/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
