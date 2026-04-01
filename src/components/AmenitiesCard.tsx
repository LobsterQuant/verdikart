"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Coffee,
  UtensilsCrossed,
  TreePine,
  Dumbbell,
  Pill,
  MapPin,
} from "lucide-react";

interface Amenity {
  name: string;
  type: string;
  category: string;
  distance: number;
}

interface AmenitiesData {
  amenities: Amenity[];
  summary: Record<string, number>;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Dagligvare: <ShoppingCart className="h-4 w-4" />,
  Nærbutikk: <ShoppingCart className="h-4 w-4" />,
  Kafé: <Coffee className="h-4 w-4" />,
  Restaurant: <UtensilsCrossed className="h-4 w-4" />,
  Bar: <UtensilsCrossed className="h-4 w-4" />,
  Park: <TreePine className="h-4 w-4" />,
  Treningssenter: <Dumbbell className="h-4 w-4" />,
  Apotek: <Pill className="h-4 w-4" />,
};

const CATEGORY_ORDER = [
  "Dagligvare",
  "Nærbutikk",
  "Apotek",
  "Kafé",
  "Restaurant",
  "Park",
  "Treningssenter",
  "Lege",
  "Tannlege",
  "Bibliotek",
];

export default function AmenitiesCard({ lat, lon }: { lat: number; lon: number }) {
  const [data, setData] = useState<AmenitiesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/amenities?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error("Failed");
        setData(await res.json());
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="skeleton mb-4 h-5 w-36" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.amenities.length === 0) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
          <MapPin className="h-5 w-5 text-text-secondary" />
          I nærheten
        </h3>
        <p className="text-sm text-text-secondary">
          Ingen fasiliteter funnet innen 1 km.
        </p>
      </div>
    );
  }

  // Sort categories by predefined order
  const sortedCategories = Object.entries(data.summary).sort(([a], [b]) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  // Group amenities by category for expanded view
  const grouped = new Map<string, Amenity[]>();
  for (const a of data.amenities) {
    if (!grouped.has(a.category)) grouped.set(a.category, []);
    grouped.get(a.category)!.push(a);
  }

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <MapPin className="h-5 w-5 text-accent" />
        I nærheten
        <span className="ml-auto text-sm font-normal text-text-tertiary">
          innen 1 km
        </span>
      </h3>

      {/* Summary grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {sortedCategories.map(([category, count]) => (
          <div
            key={category}
            className="flex items-center gap-2 rounded-lg bg-background px-3 py-2.5"
          >
            <span className="text-text-secondary">
              {CATEGORY_ICONS[category] ?? <MapPin className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <span className="block truncate text-xs text-text-secondary">
                {category}
              </span>
              <span className="text-sm font-medium">{count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Expandable detail list */}
      {data.amenities.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs font-medium text-accent hover:underline"
        >
          {expanded ? "Skjul detaljer" : `Vis alle ${data.amenities.length} steder`}
        </button>
      )}

      {expanded && (
        <div className="mt-3 space-y-3">
          {CATEGORY_ORDER.filter((cat) => grouped.has(cat)).map((cat) => (
            <div key={cat}>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                {cat}
              </h4>
              <div className="space-y-1">
                {grouped.get(cat)!.slice(0, 5).map((a, i) => (
                  <div
                    key={`${a.name}-${i}`}
                    className="flex items-center justify-between rounded bg-background px-3 py-1.5"
                  >
                    <span className="truncate text-sm">{a.name}</span>
                    <span className="shrink-0 text-xs text-text-tertiary">
                      {a.distance} m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-text-tertiary">
        Kilde: OpenStreetMap
      </p>
    </div>
  );
}
