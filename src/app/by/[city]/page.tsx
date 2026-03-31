import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, TrendingUp, Train, ChevronRight, HelpCircle } from "lucide-react";
import { getCityData, allCitySlugs } from "./cityData";
import JsonLd from "@/components/JsonLd";
import AddressSearch from "@/components/AddressSearch";

export async function generateStaticParams() {
  return allCitySlugs.map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const city = getCityData(params.city);
  if (!city) return {};
  return {
    title: city.metaTitle,
    description: city.metaDescription,
    alternates: { canonical: `https://verdikart.no/by/${city.slug}` },
    openGraph: {
      title: city.metaTitle,
      description: city.metaDescription,
      url: `https://verdikart.no/by/${city.slug}`,
      siteName: "Verdikart",
      locale: "nb_NO",
      type: "website",
    },
  };
}

function fmt(n: number) {
  return n.toLocaleString("nb-NO");
}

export default function CityPage({ params }: { params: { city: string } }) {
  const city = getCityData(params.city);
  if (!city) notFound();

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hjem", item: "https://verdikart.no" },
      { "@type": "ListItem", position: 2, name: city.name, item: `https://verdikart.no/by/${city.slug}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: city.faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `Verdikart ${city.name}`,
    description: city.metaDescription,
    url: `https://verdikart.no/by/${city.slug}`,
    areaServed: { "@type": "City", name: city.name, addressCountry: "NO" },
  };

  return (
    <>
      <JsonLd schema={breadcrumb} />
      <JsonLd schema={faqSchema} />
      <JsonLd schema={localBusiness} />

      <div className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse at 50% -10%, rgba(99,102,241,0.18) 0%, rgba(59,130,246,0.06) 40%, transparent 70%)",
            }}
          />
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center justify-center gap-1.5 text-xs text-text-tertiary">
            <Link href="/" className="hover:text-foreground transition-colors">Hjem</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-text-secondary">{city.name}</span>
          </nav>

          <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            <span
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #c7d2fe 45%, #818cf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {city.heroHeading}
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-secondary sm:mt-5 sm:text-lg">
            {city.heroSubheading}
          </p>

          <div className="mx-auto mt-8 w-full max-w-xl sm:mt-10">
            <AddressSearch />
          </div>
          <p className="mt-3 text-xs text-text-tertiary">Søk på en adresse i {city.name} for å se full eiendomsrapport</p>
        </section>

        {/* Stats bar */}
        <section className="border-y border-card-border bg-card-bg px-4 py-8 sm:px-6">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">{fmt(city.avgSqmPrice)}</p>
              <p className="mt-1 text-xs text-text-tertiary">kr/m² snitt</p>
              <p className="mt-0.5 text-[10px] text-text-tertiary/60">SSB årsgjennomsnitt 2024</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-green-400">+{city.avgSqmPriceYoY}%</p>
              <p className="mt-1 text-xs text-text-tertiary">prisendring siste år</p>
              <p className="mt-0.5 text-[10px] text-text-tertiary/60">SSB 2023–2024</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">{fmt(city.medianPrice)}</p>
              <p className="mt-1 text-xs text-text-tertiary">kr medianpris</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">{city.avgCommute}</p>
              <p className="mt-1 text-xs text-text-tertiary">min til sentrum</p>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">

          {/* Intro */}
          <section className="mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <MapPin className="h-5 w-5 text-accent" strokeWidth={1.5} />
              Om boligmarkedet i {city.name}
            </h2>
            <p className="leading-relaxed text-text-secondary">{city.introText}</p>
          </section>

          {/* Market */}
          <section className="mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <TrendingUp className="h-5 w-5 text-accent" strokeWidth={1.5} />
              Prisutvikling og nabolag
            </h2>
            <p className="mb-4 leading-relaxed text-text-secondary">{city.marketText}</p>

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {city.topNeighbourhoods.map((n) => {
                // Link to dedicated nabolag page where it exists
                const slugMap: Record<string, string> = {
                  "Frogner": "frogner",
                  "Grünerløkka": "grunerlokka",
                  "Majorstuen": "majorstuen",
                  "Nordnes": "nordnes",
                };
                const areaSlug = slugMap[n];
                return areaSlug ? (
                  <a
                    key={n}
                    href={`/nabolag/${areaSlug}`}
                    className="rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-accent flex items-center justify-between group"
                  >
                    {n}
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                  </a>
                ) : (
                  <div
                    key={n}
                    className="rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm font-medium text-text-secondary"
                  >
                    {n}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Transit */}
          <section className="mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Train className="h-5 w-5 text-accent" strokeWidth={1.5} />
              Kollektivtransport i {city.name}
            </h2>
            <p className="leading-relaxed text-text-secondary">{city.transitText}</p>
            <div className="mt-6 rounded-xl border border-card-border bg-card-bg p-4 text-sm text-text-secondary">
              <strong className="text-foreground">Tips:</strong> Søk på en konkret adresse i {city.name} ovenfor for å se hvilke holdeplasser som er nærmest, og hvor mange avganger per time du faktisk har.
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
              <HelpCircle className="h-5 w-5 text-accent" strokeWidth={1.5} />
              Vanlige spørsmål om bolig i {city.name}
            </h2>
            <div className="space-y-4">
              {city.faq.map(({ q, a }) => (
                <div key={q} className="rounded-xl border border-card-border bg-card-bg p-5">
                  <h3 className="mb-2 font-semibold">{q}</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">{a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CTA footer */}
        <section className="border-t border-card-border bg-card-bg px-4 py-12 text-center sm:px-6">
          <h2 className="mb-2 text-xl font-semibold">Finn din neste bolig i {city.name}</h2>
          <p className="mb-6 text-sm text-text-secondary">
            Søk på en adresse og få full rapport om transport, priser og nabolag — gratis.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Søk på adresse
            <ChevronRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </>
  );
}
