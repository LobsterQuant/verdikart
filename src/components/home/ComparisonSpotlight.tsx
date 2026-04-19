"use client";

import { useState } from "react";
import {
  BarChart3,
  Bus,
  Calculator,
  Check,
  CircleDollarSign,
  Droplets,
  GraduationCap,
  Leaf,
  Sparkles,
  Volume2,
  Wind,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Provider = "verdikart" | "finn" | "google";

type Feature = {
  label: string;
  Icon: LucideIcon;
  verdikart: boolean;
  finn: boolean;
  google: boolean;
};

const FEATURES: ReadonlyArray<Feature> = [
  { label: "Verdiestimat",            Icon: CircleDollarSign, verdikart: true, finn: false, google: false },
  { label: "Kollektivtransport",      Icon: Bus,              verdikart: true, finn: false, google: false },
  { label: "SSB prisstatistikk",      Icon: BarChart3,        verdikart: true, finn: false, google: false },
  { label: "Klimarisiko (flom)",      Icon: Droplets,         verdikart: true, finn: false, google: false },
  { label: "Miljørisiko",             Icon: Leaf,             verdikart: true, finn: false, google: false },
  { label: "Støykart per adresse",    Icon: Volume2,          verdikart: true, finn: false, google: false },
  { label: "Skoler og barnehager",    Icon: GraduationCap,    verdikart: true, finn: false, google: false },
  { label: "Luftkvalitet",            Icon: Wind,             verdikart: true, finn: false, google: false },
  { label: "Energimerke fra Enova",   Icon: Zap,              verdikart: true, finn: true,  google: false },
  { label: "Eiendomsskatt-kalkulator", Icon: Calculator,      verdikart: true, finn: false, google: false },
  { label: "Månedskostnad",           Icon: CircleDollarSign, verdikart: true, finn: false, google: false },
  { label: "Gratis uten konto",       Icon: Sparkles,         verdikart: true, finn: true,  google: true  },
];

const TABS: ReadonlyArray<{ key: Provider; label: string }> = [
  { key: "verdikart", label: "Verdikart" },
  { key: "finn",      label: "Finn.no" },
  { key: "google",    label: "Google Maps" },
];

/**
 * Mobile comparison. Three tabs slide a mint pill between Verdikart / Finn.no /
 * Google Maps; the stacked feature list re-tints based on the active provider.
 * The "X av Y funksjoner" counter uses mint (≥10), warm (5–9), or muted (<5)
 * to give a quick read on coverage gap.
 */
export function ComparisonSpotlight() {
  const [active, setActive] = useState<Provider>("verdikart");
  const activeIdx = TABS.findIndex((t) => t.key === active);
  const count = FEATURES.reduce((n, f) => n + (f[active] ? 1 : 0), 0);
  const counterColor =
    count >= 10 ? "text-accent" : count >= 5 ? "text-warm" : "text-text-tertiary";

  return (
    <div>
      {/* Tab strip with sliding mint indicator */}
      <div className="relative rounded-xl border border-card-border bg-card-bg p-1">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1 bottom-1 left-1 rounded-lg bg-accent"
          style={{
            width: "calc((100% - 0.5rem) / 3)",
            transform: `translateX(${activeIdx * 100}%)`,
            transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
        <div
          className="relative grid grid-cols-3"
          role="tablist"
          aria-label="Sammenlign boligverktøy"
        >
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(tab.key)}
                className={`relative z-10 rounded-lg px-2 py-2 text-sm font-semibold transition-colors ${
                  isActive ? "text-accent-ink" : "text-text-secondary hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Counter */}
      <p
        className={`mt-3 text-center text-xs font-semibold transition-colors ${counterColor}`}
        aria-live="polite"
      >
        {count} av {FEATURES.length} funksjoner
      </p>

      {/* Feature list */}
      <ul className="mt-4 space-y-2">
        {FEATURES.map(({ label, Icon, ...truth }) => {
          const has = truth[active];
          return (
            <li
              key={label}
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${
                has
                  ? "border-accent/25 bg-accent/[0.08]"
                  : "border-card-border bg-card-bg"
              }`}
              style={{ transition: "background-color 0.4s ease, border-color 0.4s ease" }}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${has ? "text-accent" : "text-text-tertiary"}`}
                strokeWidth={1.75}
                aria-hidden
              />
              <span
                className={`flex-1 text-sm leading-snug ${
                  has ? "text-foreground" : "text-text-secondary"
                }`}
              >
                {label}
              </span>
              {has ? (
                <Check className="h-4 w-4 text-accent" strokeWidth={2.5} aria-label="ja" />
              ) : (
                <X className="h-4 w-4 text-text-tertiary/50" strokeWidth={2} aria-label="nei" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
