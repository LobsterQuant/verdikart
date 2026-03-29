"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface TransitStop {
  name: string;
  lat: number;
  lon: number;
  distance?: number;
}

interface PropertyMapInnerProps {
  lat: number;
  lon: number;
  address: string;
  stops: TransitStop[];
}

const PropertyMapInner = dynamic(
  () => import("@/components/PropertyMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] items-center justify-center rounded-xl border border-card-border bg-card-bg md:h-[500px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-tertiary border-t-accent" />
      </div>
    ),
  }
);

export default function PropertyMap({
  lat,
  lon,
  address,
}: {
  lat: number;
  lon: number;
  address: string;
}) {
  const [stops, setStops] = useState<TransitStop[]>([]);

  useEffect(() => {
    async function fetchStops() {
      try {
        const res = await fetch(`/api/transit/stops?lat=${lat}&lon=${lon}`);
        if (res.ok) {
          const json = await res.json();
          const raw = Array.isArray(json) ? json : json.stops || [];
          // Normalize: API returns {coordinates:[lon,lat]} but we need {lat,lon}
          const normalized = raw.map((s: {name: string; distance: number; lat?: number; lon?: number; coordinates?: [number, number]}) => ({
            name: s.name,
            distance: s.distance,
            lat: s.lat ?? (s.coordinates ? s.coordinates[1] : 0),
            lon: s.lon ?? (s.coordinates ? s.coordinates[0] : 0),
          })).filter((s: {lat: number; lon: number}) => s.lat && s.lon);
          setStops(normalized);
        }
      } catch {
        // Ignore - stops are optional
      }
    }
    fetchStops();
  }, [lat, lon]);

  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-6 flex items-center justify-center h-[400px]">
        <p className="text-text-secondary text-sm">Kartkoordinater ikke tilgjengelig</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-0 overflow-hidden">
      <PropertyMapInner lat={lat} lon={lon} address={address} stops={stops} />
    </div>
  );
}

export type { TransitStop, PropertyMapInnerProps };
