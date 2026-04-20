import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import AffordabilityCalculator from "@/components/AffordabilityCalculator";

export const metadata: Metadata = {
  title: "Boliglånskalkulator 2026 – Beregn lånet ditt gratis | Verdikart",
  description: "Gratis boliglånskalkulator. Se månedlig terminbeløp, total rentekostnad og hvor mye bolig du har råd til i 2026.",
  alternates: { canonical: "https://verdikart.no/kalkulator" },
  openGraph: {
    title: "Boliglånskalkulator 2026 – Beregn lånet ditt gratis | Verdikart",
    description: "Gratis boliglånskalkulator. Se månedlig terminbeløp, total rentekostnad og hvor mye bolig du har råd til i 2026.",
    url: "https://verdikart.no/boliglaanskalkulator",
    siteName: "Verdikart",
    locale: "nb_NO",
    type: "website",
  },
};

export default function BoliglaanskalkPage() {
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "Slik beregner du kjøpskostnader for bolig i Norge",
      description: "Beregn dokumentavgift, lånekapasitet og totale kjøpskostnader for bolig i Norge med Verdikarts gratis kalkulator.",
      url: "https://verdikart.no/boliglaanskalkulator",
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
      name: "Boliglånskalkulator — Verdikart",
      description: metadata.description,
      url: "https://verdikart.no/boliglaanskalkulator",
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Hjem", item: "https://verdikart.no" },
          { "@type": "ListItem", position: 2, name: "Boliglånskalkulator", item: "https://verdikart.no/boliglaanskalkulator" },
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
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Boliglånskalkulator</h1>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Bruk kalkulatoren under for å beregne månedlig terminbeløp og total lånekostnad. Endre rente, løpetid og egenkapital for å se hvordan det påvirker kostnaden.
            </p>
          </div>
          <AffordabilityCalculator />
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-text-secondary">
            <Link href="/kalkulator" className="text-accent hover:underline">Se også vår fullstendige kalkulator</Link>
            <span className="text-text-tertiary">·</span>
            <Link href="/kjope-bolig" className="text-accent hover:underline">Guide til boligkjøp 2026</Link>
          </div>
        </div>
      </div>
    </>
  );
}
