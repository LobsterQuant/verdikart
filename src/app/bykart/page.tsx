import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import CityOverviewMap from "@/components/CityOverviewMap";

export const metadata: Metadata = {
  title: "Bykart: Boligpriser i norske byer | Verdikart",
  description: "Interaktivt kart over norske byers boligprisnivå. Klikk på en by for å se kvadratmeterpris, prisvekst og gå til full byrapport.",
  alternates: { canonical: "https://verdikart.no/bykart" },
  openGraph: {
    title: "Bykart: Boligpriser i norske byer",
    description: "Sammenlign boligprisnivå på tvers av norske byer på ett interaktivt kart.",
    url: "https://verdikart.no/bykart",
    siteName: "Verdikart",
    locale: "nb_NO",
    type: "website",
  },
};

export default function BykartPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Bykart: Boligpriser i norske byer",
    description: metadata.description,
    url: "https://verdikart.no/bykart",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Hjem", item: "https://verdikart.no" },
        { "@type": "ListItem", position: 2, name: "Bykart", item: "https://verdikart.no/bykart" },
      ],
    },
  };

  return (
    <>
      <JsonLd schema={schema} />
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Oversikt</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Boligprisnivå per by</h1>
            <p className="mx-auto mt-3 max-w-lg leading-relaxed text-text-secondary">
              Klikk på en by for å se kvadratmeterpris, prisvekst og gå til full rapport.
            </p>
          </div>
          <CityOverviewMap />
        </div>
      </div>
    </>
  );
}
