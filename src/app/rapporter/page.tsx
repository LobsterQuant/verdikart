import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FileBarChart2, Clock } from "lucide-react";
import { rapporter, kommendeRapporter } from "@/data/rapporter";
import JsonLd from "@/components/JsonLd";

const PAGE_URL = "https://verdikart.no/rapporter";

export const metadata: Metadata = {
  title: "Markedsrapporter | Verdikart",
  description:
    "Datadrevne markedsrapporter om norsk boligmarked. Basert på ferske tall fra SSB, Kartverket og Entur.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Markedsrapporter | Verdikart",
    description:
      "Datadrevne markedsrapporter om norsk boligmarked. Basert på ferske tall fra SSB, Kartverket og Entur.",
    url: PAGE_URL,
    siteName: "Verdikart",
    locale: "nb_NO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Markedsrapporter | Verdikart",
    description:
      "Datadrevne markedsrapporter om norsk boligmarked. Basert på ferske tall fra SSB, Kartverket og Entur.",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nb-NO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function RapporterIndex() {
  const sorted = [...rapporter].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const [featured, ...rest] = sorted;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Markedsrapporter | Verdikart",
    url: PAGE_URL,
    description:
      "Datadrevne markedsrapporter om norsk boligmarked fra Verdikart.",
    publisher: {
      "@type": "Organization",
      name: "Verdikart",
      url: "https://verdikart.no",
    },
    hasPart: sorted.map((r) => ({
      "@type": "Report",
      name: r.title,
      url: `https://verdikart.no/rapport/${r.slug}`,
      datePublished: r.publishedAt,
      reportNumber: r.reportNumber,
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hjem", item: "https://verdikart.no" },
      { "@type": "ListItem", position: 2, name: "Markedsrapporter", item: PAGE_URL },
    ],
  };

  return (
    <>
      <JsonLd schema={[collectionSchema, breadcrumb]} />
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">

          <nav
            aria-label="Brødsmuler"
            className="mb-8 flex items-center gap-1.5 text-xs text-text-tertiary"
          >
            <Link href="/" className="hover:text-foreground transition-colors">
              Hjem
            </Link>
            <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
            <span className="text-text-secondary">Markedsrapporter</span>
          </nav>

          <div className="mb-12">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <FileBarChart2 className="h-5 w-5 text-accent" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Markedsrapporter
            </h1>
            <p className="mt-3 max-w-2xl text-text-secondary">
              Datadrevne analyser av norsk boligmarked. Ferske tall fra SSB,
              Kartverket og Entur, satt sammen til funn som ikke finnes andre
              steder.
            </p>
          </div>

          <Link
            href={`/rapport/${featured.slug}`}
            className="group mb-4 block overflow-hidden rounded-2xl border border-accent/25 bg-accent/5 p-6 transition-all hover:border-accent/45 sm:p-8 card-hover"
          >
            <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
              <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-accent">
                Siste rapport
              </span>
              <span className="text-text-tertiary">
                {featured.reportNumber}
              </span>
            </div>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl group-hover:text-accent transition-colors">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
                  {featured.excerpt}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-tertiary">
                  <span>Publisert {formatDate(featured.publishedAt)}</span>
                  <span className="h-1 w-1 rounded-full bg-card-border" aria-hidden />
                  <span>Datakilde: {featured.dataSources.join(", ")}</span>
                </div>

                <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent transition-transform group-hover:translate-x-0.5">
                  Les rapporten →
                </span>
              </div>

              <div className="shrink-0 rounded-xl border border-accent/30 bg-background/40 p-5 text-center sm:w-48">
                <div className="font-display text-4xl font-bold leading-none text-accent sm:text-5xl">
                  {featured.headlineStat}
                </div>
                <div className="mt-2 text-[11px] leading-snug text-text-secondary">
                  {featured.headlineStatLabel}
                </div>
              </div>
            </div>
          </Link>

          {/* Rest of reports */}
          {rest.length > 0 && (
            <div className="space-y-4">
              {rest.map((r) => (
                <Link
                  key={r.slug}
                  href={`/rapport/${r.slug}`}
                  className="group flex items-start gap-4 rounded-xl border border-card-border bg-card-bg p-5 transition-all hover:border-accent/30 card-hover"
                >
                  <div className="shrink-0 rounded-lg border border-card-border bg-background/40 px-3 py-2 text-center">
                    <div className="font-display text-lg font-bold leading-none text-accent">
                      {r.headlineStat}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold leading-snug group-hover:text-accent transition-colors">
                      {r.title}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary line-clamp-2">
                      {r.excerpt}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-text-tertiary">
                      <span>{formatDate(r.publishedAt)}</span>
                      <span>·</span>
                      <span>{r.reportNumber}</span>
                    </div>
                  </div>
                  <ChevronRight
                    className="mt-1 h-4 w-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5"
                    strokeWidth={1.5}
                  />
                </Link>
              ))}
            </div>
          )}

          {/* Kommende rapporter */}
          <section aria-labelledby="kommende" className="mt-16">
            <div className="mb-5 flex items-center gap-2">
              <Clock className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
              <h2
                id="kommende"
                className="text-xs font-semibold uppercase tracking-widest text-text-tertiary"
              >
                Kommende rapporter
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {kommendeRapporter.map((k) => (
                <div
                  key={k.title}
                  className="rounded-xl border border-dashed border-card-border bg-card-bg/40 p-4"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                    {k.expectedQuarter}
                  </div>
                  <h3 className="mt-2 text-sm font-semibold leading-snug text-foreground">
                    {k.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                    {k.teaser}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-5 text-xs text-text-tertiary">
              Vil du få beskjed når neste rapport slippes?{" "}
              <Link
                href="/kontakt"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Abonner på kvartalsvise oppdateringer
              </Link>
              .
            </p>
          </section>

        </div>
      </div>
    </>
  );
}
