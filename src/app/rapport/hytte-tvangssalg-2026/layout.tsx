import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { TVANGSSALG_2026_DATA } from "@/data/rapport/tvangssalg-2026";

const PAGE_URL = "https://verdikart.no/rapport/hytte-tvangssalg-2026";

export const metadata: Metadata = {
  title: "Hytte-tvangssalg 2026: Rapport fra Verdikart",
  description:
    "Antall tvangssalg av fritidseiendommer har steget 82% fra 2023 til 2025. Les Verdikarts data-drevne rapport om norske hytte-tvangssalg.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Hytte-tvangssalgene nær doblet på to år",
    description:
      "Nye tall fra SSB: 98 fritidseiendommer tvangssolgt i 2025, opp fra 54 i 2023.",
    url: PAGE_URL,
    siteName: "Verdikart",
    locale: "nb_NO",
    type: "article",
    publishedTime: TVANGSSALG_2026_DATA.publicationDate,
    authors: ["Michael Hansen"],
    images: [
      {
        url: `${PAGE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Hytte-tvangssalgene nær doblet — +82% fra 2023 til 2025",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hytte-tvangssalgene nær doblet på to år",
    description:
      "Nye tall fra SSB: 98 fritidseiendommer tvangssolgt i 2025, opp fra 54 i 2023.",
    images: [`${PAGE_URL}/opengraph-image`],
  },
};

export default function RapportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reportSchema = {
    "@context": "https://schema.org",
    "@type": "Report",
    name: "Hytte-tvangssalg 2026",
    headline: "Hytte-tvangssalgene nær doblet på to år",
    url: PAGE_URL,
    reportNumber: "VK-2026-01",
    datePublished: TVANGSSALG_2026_DATA.publicationDate,
    inLanguage: "nb-NO",
    about: "Tvangssalg av fritidseiendommer i Norge",
    author: {
      "@type": "Person",
      name: "Michael Hansen",
      url: "https://verdikart.no/om-oss",
    },
    publisher: {
      "@type": "Organization",
      name: "Verdikart",
      url: "https://verdikart.no",
    },
    isBasedOn: TVANGSSALG_2026_DATA.dataSources.map((s) => ({
      "@type": "Dataset",
      name: s.name,
      description: s.description,
      url: s.url,
      publisher: {
        "@type": "Organization",
        name: "Statistisk sentralbyrå",
        url: "https://www.ssb.no",
      },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Hjem",
        item: "https://verdikart.no",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Rapport",
        item: "https://verdikart.no/rapport/hytte-tvangssalg-2026",
      },
    ],
  };

  return (
    <>
      <JsonLd schema={[reportSchema, breadcrumb]} />
      {children}
    </>
  );
}
