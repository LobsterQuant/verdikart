import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import AffordabilityCalculator from "@/components/AffordabilityCalculator";

export const metadata: Metadata = {
  title: "Boligkalkulator — Hva har du råd til? | Verdikart",
  description: "Beregn hvor mye bolig du har råd til i Norge. Basert på inntekt, egenkapital og gjeldende norske boliglånsforskrift (maks 5× inntekt, 15% egenkapital).",
  alternates: { canonical: "https://verdikart.no/kalkulator" },
  openGraph: {
    title: "Boligkalkulator — Hva har du råd til?",
    description: "Beregn kjøpekraft, månedlig kostnad og maksimalt lån basert på norske bankstandarder.",
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
      description: "Beregn dokumentavgift, lånekapasitet og totale kjøpskostnader for bolig i Norge med Verdikarts gratis kalkulator.",
      url: "https://verdikart.no/kalkulator",
      totalTime: "PT2M",
      step: [
        { "@type": "HowToStep", position: 1, name: "Skriv inn boligpris", text: "Fyll inn kjøpsprisen for boligen du vurderer." },
        { "@type": "HowToStep", position: 2, name: "Velg boligtype", text: "Velg mellom selveier, borettslag eller aksjeleilighet. Kun selveierboliger har dokumentavgift (2,5%)." },
        { "@type": "HowToStep", position: 3, name: "Oppgi egenkapital og inntekt", text: "Kalkulatoren beregner lånekapasitet basert på bankenes standardkrav (5× inntekt, 15% egenkapital)." },
        { "@type": "HowToStep", position: 4, name: "Se totale kjøpskostnader", text: "Få full oversikt over dokumentavgift, tinglysingsgebyr og finansieringsbehov." },
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
              Beregn hva du faktisk har råd til — basert på norske bankstandarder og boliglånsforskriften.
            </p>
          </div>
          <AffordabilityCalculator />
        </div>
      </div>
    </>
  );
}
