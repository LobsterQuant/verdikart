import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { areas } from "./[area]/areaData";

export const metadata: Metadata = {
  title: "Nabolag: områdedata og boligpriser | Verdikart",
  description:
    "Utforsk nabolag i Oslo, Bergen, Trondheim og flere norske byer. Se boligpriser, transportvurdering og lokale data.",
  alternates: { canonical: "https://verdikart.no/nabolag" },
  openGraph: {
    title: "Nabolag: Verdikart",
    description: "Områdedata og boligpriser for norske nabolag.",
    url: "https://verdikart.no/nabolag",
    type: "website",
  },
};

const segmentColors: Record<string, string> = {
  "Svært høyt": "bg-accent/15 text-accent",
  "Høyt": "bg-green-500/15 text-green-400",
  "Middels": "bg-amber-500/15 text-amber-400",
  "Lavt": "bg-text-tertiary/15 text-text-tertiary",
};

export default function NeighborhoodsIndexPage() {
  const areaList = Object.values(areas);

  // Group by city
  const byCity = new Map<string, typeof areaList>();
  for (const area of areaList) {
    const existing = byCity.get(area.city) ?? [];
    existing.push(area);
    byCity.set(area.city, existing);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <header className="mb-10 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Nabolag
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Utforsk {areaList.length} nabolag med boligpriser, transport og lokale data.
          </p>
        </header>

        {Array.from(byCity.entries()).map(([city, cityAreas]) => (
          <section key={city} className="mb-10">
            <h2 className="mb-4 text-lg font-bold">{city}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cityAreas.map((area) => {
                const colors = segmentColors[area.priceSegment] ?? segmentColors["Middels"];
                return (
                  <Link
                    key={area.slug}
                    href={`/nabolag/${area.slug}`}
                    className="group flex items-center justify-between rounded-xl border border-card-border bg-card-bg px-4 py-3 transition-colors hover:border-accent/30"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-accent shrink-0" strokeWidth={1.5} />
                        <h3 className="truncate text-sm font-semibold group-hover:text-accent">
                          {area.name}
                        </h3>
                      </div>
                      <p className="mt-0.5 text-xs text-text-tertiary tabular-nums">
                        {area.avgSqmPrice.toLocaleString("nb-NO")} kr/m²
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${colors}`}>
                      {area.priceSegment}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
