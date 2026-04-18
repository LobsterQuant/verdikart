// NOTE: This file must ONLY be imported via dynamic(() => import(...), { ssr: false })
// Never import it directly — Leaflet requires window/document at module evaluation time.
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, TrendingUp } from "lucide-react";
import { formatPct } from "@/lib/format";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";

interface City {
  slug: string;
  name: string;
  avgSqmPrice: number;
  yoy: number;
  lat: number;
  lon: number;
}

// Real lat/lon for 15 Norwegian cities
const CITIES: City[] = [
  { slug: "oslo",         name: "Oslo",         avgSqmPrice: 94200, yoy: 5.1, lat: 59.9139, lon: 10.7522 },
  { slug: "baerum",       name: "Bærum",        avgSqmPrice: 72500, yoy: 4.8, lat: 59.8939, lon: 10.5456 },
  { slug: "fredrikstad",  name: "Fredrikstad",  avgSqmPrice: 36900, yoy: 6.1, lat: 59.2181, lon: 10.9298 },
  { slug: "sarpsborg",    name: "Sarpsborg",    avgSqmPrice: 32400, yoy: 5.7, lat: 59.2839, lon: 11.1094 },
  { slug: "drammen",      name: "Drammen",      avgSqmPrice: 44700, yoy: 5.3, lat: 59.7440, lon: 10.2046 },
  { slug: "skien",        name: "Skien",        avgSqmPrice: 28900, yoy: 4.9, lat: 59.2096, lon: 9.6089 },
  { slug: "kristiansand", name: "Kristiansand", avgSqmPrice: 42600, yoy: 5.9, lat: 58.1599, lon: 8.0182 },
  { slug: "stavanger",    name: "Stavanger",    avgSqmPrice: 57800, yoy: 7.4, lat: 58.9700, lon: 5.7331 },
  { slug: "sandnes",      name: "Sandnes",      avgSqmPrice: 49200, yoy: 6.8, lat: 58.8516, lon: 5.7347 },
  { slug: "bergen",       name: "Bergen",       avgSqmPrice: 62400, yoy: 4.3, lat: 60.3913, lon: 5.3221 },
  { slug: "trondheim",    name: "Trondheim",    avgSqmPrice: 54100, yoy: 6.2, lat: 63.4305, lon: 10.3951 },
  { slug: "tromso",       name: "Tromsø",       avgSqmPrice: 52300, yoy: 4.1, lat: 69.6492, lon: 18.9553 },
  { slug: "bodoe",        name: "Bodø",         avgSqmPrice: 41200, yoy: 6.5, lat: 67.2804, lon: 14.4049 },
  { slug: "arendal",      name: "Arendal",      avgSqmPrice: 36100, yoy: 5.2, lat: 58.4612, lon: 8.7723 },
  { slug: "hamar",        name: "Hamar",        avgSqmPrice: 38200, yoy: 4.6, lat: 60.7945, lon: 11.0679 },
];

const MAX_PRICE = Math.max(...CITIES.map((c) => c.avgSqmPrice));
const MIN_PRICE = Math.min(...CITIES.map((c) => c.avgSqmPrice));

function priceColor(price: number): string {
  const t = (price - MIN_PRICE) / (MAX_PRICE - MIN_PRICE);
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

function bubbleRadius(price: number): number {
  const t = (price - MIN_PRICE) / (MAX_PRICE - MIN_PRICE);
  return 8 + t * 16; // 8–24px radius
}

// Fix narrow-width bug: fires invalidateSize after mount
function MapReady() {
  const map = useMap();
  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize({ animate: false }), 80);
    const t2 = setTimeout(() => map.invalidateSize({ animate: false }), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);
  return null;
}

export default function CityOverviewMapInner() {
  const [selected, setSelected] = useState<City | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Map */}
      <div
        className="relative rounded-xl border border-card-border bg-card-bg overflow-hidden"
        style={{ minHeight: 480 }}
      >
        <MapContainer
          center={[64.5, 17]}
          zoom={4}
          className="h-[480px] w-full"
          zoomControl={true}
          scrollWheelZoom={false}
          attributionControl={true}
        >
          <MapReady />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />

          {CITIES.map((city) => {
            const r = bubbleRadius(city.avgSqmPrice);
            const color = priceColor(city.avgSqmPrice);
            const isSelected = selected?.slug === city.slug;
            return (
              <CircleMarker
                key={city.slug}
                center={[city.lat, city.lon]}
                radius={r}
                pathOptions={{
                  color: isSelected ? "#ffffff" : "rgba(255,255,255,0.35)",
                  weight: isSelected ? 2 : 1,
                  fillColor: color,
                  fillOpacity: isSelected ? 1 : 0.8,
                }}
                eventHandlers={{
                  click: () => setSelected(isSelected ? null : city),
                }}
              >
                <Tooltip direction="top" offset={[0, -4]} opacity={1} permanent={false}>
                  <span style={{ color: "#111", fontWeight: 600 }}>
                    {city.name}
                  </span>
                  <br />
                  <span style={{ color: "#444", fontSize: "11px" }}>
                    {city.avgSqmPrice.toLocaleString("nb-NO")} kr/m²
                  </span>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[400] rounded-lg border border-card-border bg-background/90 p-3 backdrop-blur-sm text-xs">
          <p className="mb-1.5 font-semibold text-text-secondary">Kvadratmeterpris</p>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-16 rounded-full"
              style={{
                background: "linear-gradient(to right, #22c55e, #fbbf24, #ef4444)",
              }}
            />
            <span className="text-text-tertiary">
              {MIN_PRICE.toLocaleString("nb-NO")}
            </span>
            <span className="text-text-tertiary ml-auto">
              {MAX_PRICE.toLocaleString("nb-NO")}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-text-tertiary">
            kr/m² · klikk for detaljer
          </p>
        </div>
      </div>

      {/* Side panel */}
      <div className="space-y-3">
        {selected ? (
          <div className="rounded-xl border border-accent/30 bg-card-bg p-5">
            <div className="mb-3 flex items-start justify-between">
              <h2 className="text-lg font-bold">{selected.name}</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-text-tertiary hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 mb-4">
              <div className="rounded-lg bg-background p-3">
                <p className="text-xs text-text-tertiary">Kvadratmeterpris</p>
                <p className="text-2xl font-bold tabular-nums">
                  {selected.avgSqmPrice.toLocaleString("nb-NO")} kr/m²
                </p>
              </div>
              <div className="rounded-lg bg-background p-3">
                <p className="text-xs text-text-tertiary">Prisvekst (12 mnd)</p>
                <p className="text-xl font-bold text-green-400 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" strokeWidth={2} />
                  +{formatPct(selected.yoy)}
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
              {[...CITIES]
                .sort((a, b) => b.avgSqmPrice - a.avgSqmPrice)
                .map((city) => (
                  <button
                    key={city.slug}
                    onClick={() => setSelected(city)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-background"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ background: priceColor(city.avgSqmPrice) }}
                      />
                      <span className="font-medium">{city.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold tabular-nums">
                        {city.avgSqmPrice.toLocaleString("nb-NO")}
                      </p>
                      <p className="text-[10px] text-green-400">+{formatPct(city.yoy)}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* All-cities compare link */}
        <Link
          href="/sammenlign"
          className="flex items-center justify-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground"
        >
          Sammenlign to adresser →
        </Link>
      </div>
    </div>
  );
}
