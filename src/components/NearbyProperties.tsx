"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

interface NearbyAddress {
  adressetekst: string;
  kommunenummer: string;
  lat: number;
  lon: number;
  slug: string;
}

function buildSlug(adressetekst: string, lat: number, lon: number, knr: string): string {
  const human = adressetekst
    .toLowerCase()
    .replace(/[æ]/g, "ae").replace(/[ø]/g, "o").replace(/[å]/g, "a")
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const lat4 = Math.round(lat * 1e4);
  const lon4 = Math.round(lon * 1e4);
  return `${human}--${lat4}-${lon4}-${knr}`;
}

export default function NearbyProperties({
  lat,
  lon,
  kommunenummer,
  currentAddress,
}: {
  lat: number;
  lon: number;
  kommunenummer: string;
  currentAddress: string;
}) {
  const [nearby, setNearby] = useState<NearbyAddress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_nearby() {
      try {
        // Slightly jitter the coordinates to get nearby addresses (±~100m offsets)
        const offsets = [
          [0.0008, 0], [-0.0008, 0], [0, 0.0012], [0, -0.0012],
          [0.0006, 0.0008], [-0.0006, -0.0008],
        ];

        const results: NearbyAddress[] = [];
        const seen = new Set<string>();

        await Promise.all(
          offsets.map(async ([dlat, dlon]) => {
            try {
              const res = await fetch(
                `https://ws.geonorge.no/adresser/v1/punktsok?lat=${lat + dlat}&lon=${lon + dlon}&radius=120&utkoordsys=4258&treffPerSide=2`,
                { cache: "force-cache" }
              );
              if (!res.ok) return;
              const data = await res.json();
              for (const hit of data?.adresser ?? []) {
                const key = hit.adressetekst;
                if (!key || seen.has(key) || key === currentAddress) continue;
                seen.add(key);
                results.push({
                  adressetekst: hit.adressetekst,
                  kommunenummer: hit.kommunenummer ?? kommunenummer,
                  lat: hit.representasjonspunkt?.lat ?? lat,
                  lon: hit.representasjonspunkt?.lon ?? lon,
                  slug: buildSlug(
                    hit.adressetekst,
                    hit.representasjonspunkt?.lat ?? lat,
                    hit.representasjonspunkt?.lon ?? lon,
                    hit.kommunenummer ?? kommunenummer,
                  ),
                });
              }
            } catch { /* ignore individual failures */ }
          })
        );

        setNearby(results.slice(0, 4));
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    }

    fetch_nearby();
  }, [lat, lon, kommunenummer, currentAddress]);

  if (loading) {
    return (
      <div className="mt-8 rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <p className="mb-3 text-sm font-semibold">Lignende adresser i nabolaget</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-14 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (nearby.length === 0) return null;

  return (
    <div className="mt-8 rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <p className="text-sm font-semibold">Lignende adresser i nabolaget</p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {nearby.map((addr) => (
          <Link
            key={addr.slug}
            href={`/eiendom/${addr.slug}?adresse=${encodeURIComponent(addr.adressetekst)}&lat=${addr.lat}&lon=${addr.lon}&knr=${addr.kommunenummer}`}
            className="group flex items-center justify-between rounded-lg border border-card-border bg-background px-4 py-3 transition-colors hover:border-accent/40"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium group-hover:text-accent transition-colors">
                {addr.adressetekst}
              </p>
              <p className="text-xs text-text-secondary">Se eiendomsdata</p>
            </div>
            <ArrowRight className="ml-2 h-4 w-4 shrink-0 text-text-tertiary group-hover:text-accent transition-colors" strokeWidth={1.5} />
          </Link>
        ))}
      </div>
    </div>
  );
}
