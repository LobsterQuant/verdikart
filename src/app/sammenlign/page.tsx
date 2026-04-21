import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import { cities } from "@/app/by/[city]/cityData";
import { getDemographics } from "@/data/demographics";
import { formatPct } from "@/lib/format";

export const metadata: Metadata = {
  title: "Sammenlign norske byer: Oslo, Bergen, Trondheim, Stavanger, Tromsø, Kristiansand | Verdikart",
  description:
    "Sammenlikn befolkning, inntekt, utdanning og prisutvikling mellom Norges største byer. Hva er best for deg?",
  alternates: { canonical: "https://verdikart.no/sammenlign" },
  openGraph: {
    title: "Sammenlign byer | Verdikart",
    description: "Sammenlikn Oslo, Bergen, Trondheim, Stavanger og mer.",
    type: "website",
    url: "https://verdikart.no/sammenlign",
  },
};

export default function CompareCitiesPage() {
  // Comparison cities: the 6 largest from the array
  const citiesList = Object.values(cities);
  const compareCities = citiesList.slice(0, 6); // Oslo, Bergen, Trondheim, Stavanger, Tromsø, Kristiansand

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* JSON-LD */}
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Sammenlign byer i Norge",
          description: "Sammenlikn befolkning, inntekt og boligpriser mellom norske byer.",
          url: "https://verdikart.no/sammenlign",
          mainEntity: {
            "@type": "Thing",
            name: "By-sammenlikning",
          },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Hjem", item: "https://verdikart.no" },
              { "@type": "ListItem", position: 2, name: "Sammenlign byer", item: "https://verdikart.no/sammenlign" },
            ],
          },
        }}
      />

      {/* Header */}
      <div className="border-b border-card-border bg-card-bg/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
          <h1 className="text-3xl font-bold text-foreground">Sammenlign byer</h1>
          <p className="mt-2 text-text-secondary">
            Se hvordan Norges største byer sammenlignes. Befolkning, inntekt, utdanning, og boligpriser.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Demographics comparison */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-foreground">Befolkningsprofil</h2>
          <div className="overflow-x-auto rounded-xl border border-card-border bg-card-bg">
            <table className="w-full text-sm">
              <thead className="border-b border-card-border bg-background/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">By</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Medianinntekt</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Høyere utdanning</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Barn (0–17)</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Eldre (67+)</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Vekst 5 år</th>
                </tr>
              </thead>
              <tbody>
                {compareCities.map((city) => {
                  const demo = getDemographics(city.kommunenummer);
                  if (!demo) return null;

                  return (
                    <tr key={city.slug} className="border-b border-card-border/50 hover:bg-background/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        <Link href={`/by/${city.slug}`} className="text-accent hover:underline">
                          {city.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                        {(demo.medianIncome / 1000).toFixed(0)}k kr
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                        {formatPct(demo.higherEducationPct)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                        {formatPct(demo.childrenPct)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                        {formatPct(demo.elderlyPct)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">
                        <span
                          className={
                            demo.populationGrowthPct >= 2
                              ? "text-green-400"
                              : demo.populationGrowthPct >= 0
                              ? "text-yellow-400"
                              : "text-red-400"
                          }
                        >
                          {demo.populationGrowthPct >= 0 ? "+" : ""}
                          {formatPct(demo.populationGrowthPct)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-text-tertiary">
            Kilde: SSB Befolkningsstatistikk 2023
          </p>
        </section>

        {/* Price comparison */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-foreground">Boligpriser</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {compareCities.map((city) => (
              <Link
                key={city.slug}
                href={`/by/${city.slug}`}
                className="group rounded-xl border border-card-border bg-card-bg p-4 hover:border-accent hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                  {city.name}
                </h3>
                <p className="mt-2 text-2xl font-bold text-accent tabular-nums">
                  {city.avgSqmPrice.toLocaleString("nb-NO")} kr/m²
                </p>
                <p className="mt-1 text-xs text-text-secondary">Gjennomsnitt bolig</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-accent">
                  <span>Se detaljer</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-xs text-text-tertiary">
            Kilde: SSB Boligprisstatistikk 2026
          </p>
        </section>

        {/* FAQ / interpretation */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-foreground">Hva betyr disse tallene?</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-card-border bg-card-bg p-4">
              <p className="font-semibold text-foreground mb-1">Medianinntekt</p>
              <p className="text-sm text-text-secondary">
                Gjennomsnittlig brutto årslønn for husstander. Stavanger og Oslo har høyest medianinntekt blant de seks største byene, drevet av oljeindustri og hovedstadsfunksjon. Høyere inntekt følger ofte med høyere levekostnader.
              </p>
            </div>
            <div className="rounded-lg border border-card-border bg-card-bg p-4">
              <p className="font-semibold text-foreground mb-1">Høyere utdanning</p>
              <p className="text-sm text-text-secondary">
                Prosent av befolkningen (25–66 år) med bachelor eller høyere. Høyere utdanning korrelerer med jobbmuligheter og lønnsvilje.
              </p>
            </div>
            <div className="rounded-lg border border-card-border bg-card-bg p-4">
              <p className="font-semibold text-foreground mb-1">Aldersfordeling</p>
              <p className="text-sm text-text-secondary">
                Byer med høy andel barn (0–17 år) er barnefamilievennlige og har aktive skolemiljø. Høy andel eldre (67 år og over) kan bety mindre nattliv.
              </p>
            </div>
            <div className="rounded-lg border border-card-border bg-card-bg p-4">
              <p className="font-semibold text-foreground mb-1">Befolkningsvekst</p>
              <p className="text-sm text-text-secondary">
                Grønt = sterk vekst (Tromsø: +4,2 %, Oslo: +3,8 %). Gult = moderat (Stavanger: +2,1 %). Rødt = synkende (sjeldent i større byer).
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-accent/20 bg-accent/10 p-6 text-center">
          <h2 className="text-xl font-bold text-foreground mb-3">Klar for å finne bolig?</h2>
          <p className="text-text-secondary mb-4">
            Søk på en adresse og se boligpriser, kriminalstatistikk, eiendomsskatt og miljørisiko.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 font-semibold text-accent-ink hover:bg-accent/90 transition-colors"
          >
            Til forsiden
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
