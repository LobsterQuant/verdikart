import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import AddressCompare from "@/components/AddressCompare";

export const metadata: Metadata = {
  title: "Sammenlign adresser — Side ved side | Verdikart",
  description: "Sammenlign to norske adresser side ved side. Se transport, boligpris og støynivå for begge i ett overblikk.",
  alternates: { canonical: "https://verdikart.no/sammenlign" },
  openGraph: {
    title: "Sammenlign adresser — Verdikart",
    description: "Sammenlign to adresser side ved side: transport, pris og nabolagsdata.",
    url: "https://verdikart.no/sammenlign",
    siteName: "Verdikart",
    locale: "nb_NO",
    type: "website",
  },
};

export default function SammenlignPage() {
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Verdikart Adressesammenligner",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      url: "https://verdikart.no/sammenlign",
      description: "Sammenlign to norske adresser side ved side: kollektivtransport, boligpris og nabolagsdata — gratis verktøy fra Verdikart.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "NOK" },
      featureList: "Kollektivtransport · Boligprissammenligning · Støydata · Nabolagsdata",
      provider: { "@type": "Organization", name: "Verdikart", url: "https://verdikart.no" },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Sammenlign adresser — Verdikart",
      description: metadata.description,
      url: "https://verdikart.no/sammenlign",
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Hjem", item: "https://verdikart.no" },
          { "@type": "ListItem", position: 2, name: "Sammenlign", item: "https://verdikart.no/sammenlign" },
        ],
      },
    },
  ];

  return (
    <>
      <JsonLd schema={schema} />
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Verktøy</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Sammenlign adresser</h1>
            <p className="mx-auto mt-3 max-w-lg leading-relaxed text-text-secondary">
              Søk på to adresser og se transport, boligpris og nabolagsdata side ved side — perfekt for boligjakten.
            </p>
          </div>
          <AddressCompare />
        </div>
      </div>
    </>
  );
}
