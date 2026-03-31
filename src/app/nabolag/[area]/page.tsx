import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Train, Home, ChevronRight } from "lucide-react";
import { getArea, getAllAreaSlugs, areas } from "./areaData";
import JsonLd from "@/components/JsonLd";
import AddressSearch from "@/components/AddressSearch";

export async function generateStaticParams() {
  return getAllAreaSlugs();
}

export async function generateMetadata({ params }: { params: { area: string } }): Promise<Metadata> {
  const area = getArea(params.area);
  if (!area) return {};
  return {
    title: area.metaTitle,
    description: area.metaDescription,
    alternates: { canonical: `https://verdikart.no/nabolag/${area.slug}` },
    openGraph: {
      title: area.metaTitle,
      description: area.metaDescription,
      url: `https://verdikart.no/nabolag/${area.slug}`,
      siteName: "Verdikart",
      locale: "nb_NO",
      type: "website",
    },
  };
}

function formatPrice(n: number) {
  return n.toLocaleString("nb-NO");
}

export default function AreaPage({ params }: { params: { area: string } }) {
  const area = getArea(params.area);
  if (!area) notFound();

  const url = `https://verdikart.no/nabolag/${area.slug}`;

  const areaSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${area.name}, ${area.city}`,
    url,
    description: area.metaDescription,
    containedInPlace: {
      "@type": "City",
      name: area.city,
      addressCountry: "NO",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: area.faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hjem", item: "https://verdikart.no" },
      { "@type": "ListItem", position: 2, name: area.city, item: `https://verdikart.no/by/${area.citySlug}` },
      { "@type": "ListItem", position: 3, name: area.name, item: url },
    ],
  };

  const segmentColor: Record<string, string> = {
    "Svært høyt": "#f87171",
    "Høyt": "#fb923c",
    "Middels": "#fbbf24",
    "Lavt": "#4ade80",
  };

  return (
    <>
      <JsonLd schema={areaSchema} />
      <JsonLd schema={faqSchema} />
      <JsonLd schema={breadcrumb} />

      <div className="min-h-screen bg-background text-foreground">

        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-14 pt-16 sm:px-6 sm:pt-24">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: "radial-gradient(ellipse at 50% -5%, rgba(99,102,241,0.14) 0%, transparent 65%)" }} />

          {/* Breadcrumb */}
          <nav className="mb-5 flex items-center gap-1.5 text-xs text-text-tertiary">
            <Link href="/" className="hover:text-foreground transition-colors">Hjem</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/by/${area.citySlug}`} className="hover:text-foreground transition-colors">{area.city}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-text-secondary">{area.name}</span>
          </nav>

          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {area.heroHeading}
          </h1>
          <p className="mt-2 text-base text-text-secondary">{area.heroSubheading}</p>

          {/* Stats strip */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-xl border border-card-border bg-card-bg px-5 py-3">
              <p className="text-xs text-text-tertiary">Kvadratmeterpris (estimert)</p>
              <p className="text-lg font-bold">{formatPrice(area.avgSqmPrice)} kr/m²</p>
              <p className="mt-0.5 text-[10px] text-text-tertiary/60">SSB årsgjennomsnitt 2024</p>
            </div>
            <div className="rounded-xl border border-card-border bg-card-bg px-5 py-3">
              <p className="text-xs text-text-tertiary">Prisvekst (12 mnd)</p>
              <p className="text-lg font-bold text-green-400">+{area.avgSqmPriceYoY}%</p>
              <p className="mt-0.5 text-[10px] text-text-tertiary/60">SSB 2023–2024</p>
            </div>
            <div className="rounded-xl border border-card-border bg-card-bg px-5 py-3">
              <p className="text-xs text-text-tertiary">Prissegment</p>
              <p className="text-lg font-bold" style={{ color: segmentColor[area.priceSegment] ?? "#fff" }}>
                {area.priceSegment}
              </p>
            </div>
            <div className="rounded-xl border border-card-border bg-card-bg px-5 py-3">
              <p className="text-xs text-text-tertiary">Kollektiv</p>
              <p className="text-lg font-bold text-accent">{area.transitScore}</p>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

          {/* Intro */}
          <section className="mb-8 rounded-xl border border-card-border bg-card-bg p-6">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Home className="h-4.5 w-4.5 text-accent" strokeWidth={1.5} />
              Om {area.name}
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">{area.introText}</p>
            {area.topStreets.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-text-tertiary">Populære gater</p>
                <div className="flex flex-wrap gap-2">
                  {area.topStreets.map((s) => (
                    <span key={s} className="rounded-full border border-card-border bg-background px-3 py-1 text-xs text-text-secondary">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Transit */}
          <section className="mb-8 rounded-xl border border-card-border bg-card-bg p-6">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Train className="h-4.5 w-4.5 text-accent" strokeWidth={1.5} />
              Kollektivtransport
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">{area.transitText}</p>
          </section>

          {/* Price context */}
          <section className="mb-8 rounded-xl border border-card-border bg-card-bg p-6">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <TrendingUp className="h-4.5 w-4.5 text-accent" strokeWidth={1.5} />
              Prisutvikling
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Estimert kvadratmeterpris i {area.name} er <strong className="text-foreground">{formatPrice(area.avgSqmPrice)} kr/m²</strong> basert på SSB-data for {area.name.includes("Bergen") || area.kommunenummer !== "0301" ? "kommunen" : "Oslo"}, justert for bydelnivå. Det er en estimert økning på <strong className="text-green-400">+{area.avgSqmPriceYoY}%</strong> sammenlignet med samme periode i fjor.
            </p>
            <p className="mt-2 text-xs text-text-tertiary">Kilde: SSB boligprisstatistikk, kommunenummer {area.kommunenummer}. Bydeltall er estimerte verdier — eksakt adressedata er tilgjengelig i <a href="/" className="text-accent hover:underline">adresserapporten</a>.</p>
          </section>

          {/* Search CTA */}
          <section className="mb-8 rounded-xl border border-accent/20 bg-accent/5 p-6">
            <p className="mb-1 text-sm font-semibold">Sjekk en spesifikk adresse i {area.name}</p>
            <p className="mb-4 text-xs text-text-secondary">Få transport, prisdata og støykart for en eksakt adresse — gratis.</p>
            <AddressSearch />
          </section>

          {/* FAQ */}
          {area.faq.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold">Vanlige spørsmål om {area.name}</h2>
              <div className="space-y-3">
                {area.faq.map(({ q, a }) => (
                  <div key={q} className="rounded-xl border border-card-border bg-card-bg p-5">
                    <h3 className="mb-2 font-semibold">{q}</h3>
                    <p className="text-sm leading-relaxed text-text-secondary">{a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sibling nabolag links */}
          {(() => {
            const siblings = Object.values(areas).filter(a => a.city === area.city && a.slug !== area.slug);
            if (siblings.length === 0) return null;
            return (
              <div className="rounded-xl border border-card-border bg-card-bg p-5">
                <p className="mb-3 text-sm font-semibold">Andre nabolag i {area.city}</p>
                <div className="flex flex-wrap gap-2">
                  {siblings.map(s => (
                    <Link
                      key={s.slug}
                      href={`/nabolag/${s.slug}`}
                      className="rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Back to city */}
          <Link href={`/by/${area.citySlug}`}
            className="flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-foreground">
            <ChevronRight className="h-4 w-4 rotate-180" strokeWidth={1.5} />
            Tilbake til {area.city}
          </Link>
        </div>
      </div>
    </>
  );
}
