import type { Metadata } from "next";
import { Suspense } from "react";
import JsonLd from "@/components/JsonLd";
import KalkulatorTabs from "./KalkulatorTabs";

export const metadata: Metadata = {
  title: "Boligkalkulator — Kjøpekraft + månedskostnad | Verdikart",
  description: "Beregn hvor mye bolig du har råd til og hva en spesifikk bolig koster per måned — inkl. eiendomsskatt, renter og stresstest. Basert på norske bankstandarder.",
  alternates: { canonical: "https://verdikart.no/kalkulator" },
  openGraph: {
    title: "Boligkalkulator — Verdikart",
    description: "Kjøpekraft, månedskostnad og eiendomsskatt basert på norske bankstandarder.",
    url: "https://verdikart.no/kalkulator",
    siteName: "Verdikart",
    locale: "nb_NO",
    type: "website",
  },
};

export default function KalkulatorPage() {
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "Slik beregner du kjøpskostnader for bolig i Norge",
      description: "Beregn dokumentavgift, lånekapasitet, månedskostnad og eiendomsskatt for bolig i Norge med Verdikarts gratis kalkulator.",
      url: "https://verdikart.no/kalkulator",
      totalTime: "PT2M",
      step: [
        { "@type": "HowToStep", position: 1, name: "Velg kalkulator", text: "Kjøpekraft viser hva du har råd til. Månedskostnad viser hva en spesifikk bolig vil koste deg per måned." },
        { "@type": "HowToStep", position: 2, name: "Fyll inn økonomi", text: "Inntekt og egenkapital for kjøpekraft, boligpris og kommune for månedskostnad." },
        { "@type": "HowToStep", position: 3, name: "Se resultat", text: "Inkluderer eiendomsskatt, rentekostnad over lånets løpetid, og stresstest ved høyere rente." },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Boligkalkulator — Verdikart",
      description: metadata.description,
      url: "https://verdikart.no/kalkulator",
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Hjem", item: "https://verdikart.no" },
          { "@type": "ListItem", position: 2, name: "Kalkulator", item: "https://verdikart.no/kalkulator" },
        ],
      },
    },
  ];

  return (
    <>
      <JsonLd schema={schema} />
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Verktøy</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Boligkalkulator</h1>
            <p className="mt-3 leading-relaxed text-text-secondary">
              To spørsmål, ett verktøy: Hva har jeg råd til? Og hva koster denne spesifikke boligen meg per måned?
            </p>
          </div>
          <Suspense fallback={<div className="skeleton h-96 w-full rounded-xl" />}>
            <KalkulatorTabs />
          </Suspense>
        </div>
      </div>
    </>
  );
}
