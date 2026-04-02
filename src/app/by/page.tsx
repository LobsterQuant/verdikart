import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, TrendingUp } from "lucide-react";
import { cities } from "./[city]/cityData";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Norske byer — boligpriser og markedsdata | Verdikart",
  description:
    "Utforsk boligpriser, pendlertid og nabolagsdata for Norges største byer. Sammenlign Oslo, Bergen, Trondheim, Stavanger og flere.",
  alternates: { canonical: "https://verdikart.no/by" },
  openGraph: {
    title: "Norske byer — Verdikart",
    description: "Boligpriser og markedsdata for Norges største byer.",
    url: "https://verdikart.no/by",
    type: "website",
  },
};

export default function CitiesIndexPage() {
  const cityList = Object.values(cities);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <header className="mb-10 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Norske byer
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Utforsk boligpriser, pendlertid og nabolagsdata for {cityList.length} norske byer.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cityList.map((city) => {
            const isPositive = city.avgSqmPriceYoY >= 0;
            return (
              <Link
                key={city.slug}
                href={`/by/${city.slug}`}
                className="group rounded-xl border border-card-border bg-card-bg p-5 transition-colors hover:border-accent/30"
              >
                <div className="mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" strokeWidth={1.5} />
                  <h2 className="text-lg font-semibold group-hover:text-accent">
                    {city.name}
                  </h2>
                </div>
                <p className="mb-3 text-xs text-text-tertiary">{city.county} · {city.population} innbyggere</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold tabular-nums">
                      {city.avgSqmPrice.toLocaleString("nb-NO")} kr/m²
                    </p>
                    <p className="text-xs text-text-tertiary">Gjennomsnitt</p>
                  </div>
                  <span
                    className="flex items-center gap-1 text-sm font-semibold"
                    style={{ color: isPositive ? "#22C55E" : "#EF4444" }}
                  >
                    <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
                    {isPositive ? "+" : ""}{city.avgSqmPriceYoY.toFixed(1)}%
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
