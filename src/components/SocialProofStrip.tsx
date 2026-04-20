"use client";

import { useEffect, useState } from "react";
import {
  VerdiestimatIcon,
  KlimarisikoIcon,
  KollektivIcon,
  PrisstatistikkIcon,
  type IconProps,
} from "@/components/icons";

const USE_CASES: Array<{
  Icon: (p: IconProps) => React.ReactElement;
  headline: string;
  body: string;
  tag: string;
}> = [
  {
    Icon: VerdiestimatIcon,
    headline: "Hva er boligen egentlig verdt?",
    body: "Verdikart estimerer boligens verdi basert på SSB-prisdata og energiattest. Se verdiestimat med konfidensintervall: før du legger inn bud.",
    tag: "Verdiestimat · Frogner, Oslo",
  },
  {
    Icon: KlimarisikoIcon,
    headline: "Flomrisikoen ingen andre nevner",
    body: "NVE-data avslører flomfare, kvikkleire og stormflo. Verdikart sjekker klimarisikoen automatisk: noe verken Finn.no eller megleren gjør.",
    tag: "Klimarisiko · Bergen",
  },
  {
    Icon: KollektivIcon,
    headline: "Reisetid fra Entur: ikke fra annonsen",
    body: "Faktiske avganger, gangavstand og reisetid til sentrum hentet direkte fra Entur. 13 datapunkter samlet på én side.",
    tag: "Kollektivtransport · Trondheim",
  },
  {
    Icon: PrisstatistikkIcon,
    headline: "SSB-prisdata megleren ikke viser deg",
    body: "Se gjennomsnittlig kvadratmeterpris for kommunen, bydel-justert prisutvikling og sammenlignbare salg: fra Statistisk sentralbyrå.",
    tag: "Prisstatistikk · Stavanger",
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
      {/* Use-case carousel */}
      <div className="relative overflow-hidden rounded-2xl border border-card-border bg-card-bg">
        {USE_CASES.map((uc, i) => {
          const { Icon } = uc;
          return (
          <div
            key={uc.headline}
            className={`flex items-start gap-4 px-6 py-5 transition-all duration-500 ${
              i === active ? "opacity-100 translate-y-0" : "absolute inset-0 opacity-0 translate-y-4 pointer-events-none"
            }`}
            aria-hidden={i !== active}
          >
            <Icon size={40} className="text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">{uc.headline}</p>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">{uc.body}</p>
              <p className="mt-2 text-xs text-text-tertiary italic">{uc.tag}</p>
            </div>
          </div>
          );
        })}
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
