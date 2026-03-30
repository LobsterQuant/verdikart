"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, TrendingUp } from "lucide-react";

interface City {
  slug: string;
  name: string;
  avgSqmPrice: number;
  yoy: number;
  // Normalised SVG coordinates (0–100 x, 0–100 y) on a simplified Norway outline
  // y=0 is North, y=100 is South
  sx: number;
  sy: number;
}

// Approximate positions on a simplified 100×100 Norway map (landscape, S→N top→bottom inverted)
// Norway: lat roughly 57.8°N (south) to 71.2°N (north), lon 4.3°E to 31.1°E
// Mapping: sx = (lon - 4.3) / (31.1 - 4.3) * 100, sy = (71.2 - lat) / (71.2 - 57.8) * 100
const CITIES: City[] = [
  { slug: "oslo",         name: "Oslo",         avgSqmPrice: 94200,  yoy: 5.1, sx: 43, sy: 66 },
  { slug: "baerum",       name: "Bærum",        avgSqmPrice: 72500,  yoy: 4.8, sx: 41, sy: 64 },
  { slug: "fredrikstad",  name: "Fredrikstad",  avgSqmPrice: 36900,  yoy: 6.1, sx: 46, sy: 70 },
  { slug: "sarpsborg",    name: "Sarpsborg",    avgSqmPrice: 32400,  yoy: 5.7, sx: 47, sy: 69 },
  { slug: "drammen",      name: "Drammen",      avgSqmPrice: 44700,  yoy: 5.3, sx: 40, sy: 67 },
  { slug: "skien",        name: "Skien",        avgSqmPrice: 28900,  yoy: 4.9, sx: 38, sy: 72 },
  { slug: "kristiansand", name: "Kristiansand", avgSqmPrice: 42600,  yoy: 5.9, sx: 31, sy: 82 },
  { slug: "stavanger",    name: "Stavanger",    avgSqmPrice: 57800,  yoy: 7.4, sx: 17, sy: 79 },
  { slug: "sandnes",      name: "Sandnes",      avgSqmPrice: 49200,  yoy: 6.8, sx: 16, sy: 80 },
  { slug: "bergen",       name: "Bergen",       avgSqmPrice: 62400,  yoy: 4.3, sx: 15, sy: 64 },
  { slug: "trondheim",    name: "Trondheim",    avgSqmPrice: 54100,  yoy: 6.2, sx: 37, sy: 38 },
  { slug: "tromso",       name: "Tromsø",       avgSqmPrice: 52300,  yoy: 4.1, sx: 53, sy: 12 },
  { slug: "bodoe",        name: "Bodø",         avgSqmPrice: 41200,  yoy: 6.5, sx: 41, sy: 24 },
  { slug: "arendal",      name: "Arendal",      avgSqmPrice: 36100,  yoy: 5.2, sx: 35, sy: 79 },
  { slug: "hamar",        name: "Hamar",        avgSqmPrice: 38200,  yoy: 4.6, sx: 45, sy: 60 },
];

const MAX_PRICE = Math.max(...CITIES.map(c => c.avgSqmPrice));
const MIN_PRICE = Math.min(...CITIES.map(c => c.avgSqmPrice));

function priceColor(price: number): string {
  const t = (price - MIN_PRICE) / (MAX_PRICE - MIN_PRICE);
  // Low (green) → mid (amber) → high (red)
  if (t < 0.5) {
    const r = Math.round(34 + t * 2 * (251 - 34));
    const g = Math.round(197 + t * 2 * (191 - 197));
    const b = Math.round(94 + t * 2 * (36 - 94));
    return `rgb(${r},${g},${b})`;
  }
  const t2 = (t - 0.5) * 2;
  const r = Math.round(251 + t2 * (239 - 251));
  const g = Math.round(191 + t2 * (68 - 191));
  const b = Math.round(36 + t2 * (68 - 36));
  return `rgb(${r},${g},${b})`;
}

function bubbleSize(price: number): number {
  const t = (price - MIN_PRICE) / (MAX_PRICE - MIN_PRICE);
  return 10 + t * 20; // 10–30px radius
}

export default function CityOverviewMap() {
  const [selected, setSelected] = useState<City | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Map */}
      <div className="relative rounded-xl border border-card-border bg-card-bg overflow-hidden" style={{ minHeight: 480 }}>
        {/* SVG map */}
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          style={{ minHeight: 480 }}
          aria-label="Norges bykart med boligprisbobler"
        >
          {/* Simplified Norway coastline — very rough polygon */}
          <path
            d="M 25,96 L 28,90 L 24,85 L 20,82 L 15,79 L 12,72 L 14,65 L 12,58 L 16,52 L 18,45 L 16,38 L 20,30 L 22,22 L 28,16 L 35,10 L 42,8 L 50,10 L 58,12 L 64,10 L 68,14 L 72,18 L 70,25 L 65,30 L 62,38 L 58,42 L 55,48 L 52,55 L 50,62 L 48,68 L 46,74 L 44,80 L 40,86 L 36,92 L 32,96 Z"
            fill="rgba(99,102,241,0.06)"
            stroke="rgba(99,102,241,0.2)"
            strokeWidth="0.4"
          />

          {/* City bubbles */}
          {CITIES.map((city) => {
            const r = bubbleSize(city.avgSqmPrice);
            const color = priceColor(city.avgSqmPrice);
            const isSelected = selected?.slug === city.slug;
            const isHovered = hovered === city.slug;
            return (
              <g
                key={city.slug}
                transform={`translate(${city.sx}, ${city.sy})`}
                onClick={() => setSelected(isSelected ? null : city)}
                onMouseEnter={() => setHovered(city.slug)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
                role="button"
                aria-label={`${city.name}: ${city.avgSqmPrice.toLocaleString("nb-NO")} kr/m²`}
              >
                {/* Pulse ring for selected */}
                {isSelected && (
                  <circle r={r + 5} fill="none" stroke={color} strokeWidth="0.8" opacity="0.4" />
                )}
                {/* Main bubble */}
                <circle
                  r={r / 8}  /* r is px, SVG viewBox is 100 — scale down */
                  fill={color}
                  opacity={isHovered || isSelected ? 1 : 0.75}
                  stroke={isSelected ? "white" : "rgba(255,255,255,0.3)"}
                  strokeWidth={isSelected ? "0.8" : "0.3"}
                  style={{ transform: `scale(${(isHovered || isSelected) ? 1.15 : 1})`, transformOrigin: "0 0", transition: "transform 0.15s" }}
                />
                {/* City label for larger cities */}
                {(r > 22 || isSelected || isHovered) && (
                  <text
                    y={r / 8 + 2.2}
                    textAnchor="middle"
                    fill="white"
                    fontSize="2"
                    fontWeight={isSelected ? "700" : "500"}
                    opacity="0.9"
                  >
                    {city.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 rounded-lg border border-card-border bg-background/90 p-3 backdrop-blur-sm text-xs">
          <p className="mb-1.5 font-semibold text-text-secondary">Kvadratmeterpris</p>
          <div className="flex items-center gap-2">
            <div className="h-3 w-16 rounded-full" style={{
              background: "linear-gradient(to right, #22c55e, #fbbf24, #ef4444)"
            }} />
            <span className="text-text-tertiary">{MIN_PRICE.toLocaleString("nb-NO")}</span>
            <span className="text-text-tertiary ml-auto">{MAX_PRICE.toLocaleString("nb-NO")}</span>
          </div>
          <p className="mt-1 text-[10px] text-text-tertiary">kr/m² · klikk for detaljer</p>
        </div>
      </div>

      {/* Side panel */}
      <div className="space-y-3">
        {selected ? (
          <div className="rounded-xl border border-accent/30 bg-card-bg p-5">
            <div className="mb-3 flex items-start justify-between">
              <h2 className="text-lg font-bold">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-text-tertiary hover:text-foreground text-xs">✕</button>
            </div>
            <div className="space-y-3 mb-4">
              <div className="rounded-lg bg-background p-3">
                <p className="text-xs text-text-tertiary">Kvadratmeterpris</p>
                <p className="text-2xl font-bold tabular-nums">{selected.avgSqmPrice.toLocaleString("nb-NO")} kr/m²</p>
              </div>
              <div className="rounded-lg bg-background p-3">
                <p className="text-xs text-text-tertiary">Prisvekst (12 mnd)</p>
                <p className="text-xl font-bold text-green-400 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" strokeWidth={2} />
                  +{selected.yoy}%
                </p>
              </div>
            </div>
            <Link
              href={`/by/${selected.slug}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            >
              Se full byrapport
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-card-border bg-card-bg p-5">
            <p className="mb-3 text-sm font-semibold">Alle byer</p>
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {[...CITIES].sort((a, b) => b.avgSqmPrice - a.avgSqmPrice).map(city => (
                <button
                  key={city.slug}
                  onClick={() => setSelected(city)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-background"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: priceColor(city.avgSqmPrice) }} />
                    <span className="font-medium">{city.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold tabular-nums">{city.avgSqmPrice.toLocaleString("nb-NO")}</p>
                    <p className="text-[10px] text-green-400">+{city.yoy}%</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All-cities compare link */}
        <Link href="/sammenlign"
          className="flex items-center justify-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground">
          Sammenlign to adresser →
        </Link>
      </div>
    </div>
  );
}
