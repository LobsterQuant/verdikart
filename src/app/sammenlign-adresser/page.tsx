import type { Metadata } from "next";
import AddressCompare from "@/components/AddressCompare";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Sammenlign adresser — to eiendommer side ved side | Verdikart",
  description:
    "Sammenlign kollektivtransport, boligpriser og støynivå for to norske adresser side ved side. Gratis verktøy fra Verdikart.",
  alternates: { canonical: "https://verdikart.no/sammenlign-adresser" },
  openGraph: {
    title: "Sammenlign adresser — Verdikart",
    description: "Sammenlign to eiendommer side ved side: transport, pris og støy.",
    url: "https://verdikart.no/sammenlign-adresser",
    type: "website",
  },
};

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Sammenlign adresser — Verdikart",
  description:
    "Sammenlign kollektivtransport, boligpriser og støynivå for to norske adresser side ved side.",
  url: "https://verdikart.no/sammenlign-adresser",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hjem", item: "https://verdikart.no" },
      { "@type": "ListItem", position: 2, name: "Sammenlign adresser", item: "https://verdikart.no/sammenlign-adresser" },
    ],
  },
};

export default function CompareAddressesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <JsonLd schema={webPageSchema} />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Sammenlign adresser
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Søk på to adresser og sammenlign kollektivtransport, boligpriser og støynivå side ved side.
          </p>
        </header>
        <AddressCompare />
      </div>
      <SiteFooter />
    </div>
  );
}
