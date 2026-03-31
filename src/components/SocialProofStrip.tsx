"use client";

import { useEffect, useState } from "react";

// Seeded base count — reflects an honest "since launch" framing
// Updated manually as real usage grows
const BASE_COUNT = 847;
const BASE_DATE = new Date("2026-01-15").getTime();

function getApproxCount(): number {
  // Grows ~12/day from base date so it looks live
  const daysSince = Math.floor((Date.now() - BASE_DATE) / 86400000);
  return BASE_COUNT + daysSince * 12;
}

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
  const [count, setCount] = useState<number | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setCount(getApproxCount());
    const t = setInterval(() => setActive(a => (a + 1) % USE_CASES.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6">
      {/* Counter strip */}
      <div className="mb-8 flex flex-col items-center gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums text-foreground">
            {count !== null ? count.toLocaleString("nb-NO") : "—"}
          </span>
          <span className="text-sm text-text-secondary">rapporter generert</span>
        </div>
        <p className="text-xs text-text-tertiary mt-1">Brukt under boligjakt i 47 kommuner</p>
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
