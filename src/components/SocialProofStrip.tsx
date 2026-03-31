"use client";

import { useEffect, useState } from "react";

const USE_CASES = [
  {
    emoji: "💬",
    headline: "\"Sparte meg for et dårlig kjøp\"",
    body: "Sjekket adressen på Grünerløkka — støynivået fra Ring 2 kom opp umiddelbart. Megleren hadde ikke nevnt det. Gikk videre til neste leilighet.",
    tag: "Førstegangskjøper, Oslo",
  },
  {
    emoji: "💬",
    headline: "\"32 minutter? Megleren sa 15\"",
    body: "Kollektivdataen fra Entur viste at nærmeste T-bane var 18 minutters gange, ikke 5 som i annonsen. Satte et mye lavere bud.",
    tag: "Boligkjøper, Bergen",
  },
  {
    emoji: "💬",
    headline: "\"Skjønte endelig hva prisen betyr\"",
    body: "Så SSB-statistikken for området og sammenlignet med tre andre bydeler. Bestemte meg for å by over takst — dataene støttet det.",
    tag: "Småbarnsfamilie, Trondheim",
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
          <p className="mt-1 text-xs text-text-tertiary">kommuner brukt</p>
        </div>
        <div className="rounded-xl border border-card-border bg-card-bg px-3 py-4">
          <p className="text-2xl font-bold text-foreground">3</p>
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
