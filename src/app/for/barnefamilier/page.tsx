import type { Metadata } from "next";
import Link from "next/link";
import { Train, Volume2, School, ChevronRight } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import AddressSearch from "@/components/AddressSearch";

export const metadata: Metadata = {
  title: "Barnefamilier | Verdikart",
  description: "Barnefamilier trenger trygt nabolag, gode skoler og kollektivtilbud. Verdikart viser deg transport, støy og prisdata for enhver norsk adresse.",
  alternates: { canonical: "https://verdikart.no/for/barnefamilier" },
};

const faqs = [
  { q: "Hvordan finner jeg nærmeste skole for en adresse?", a: "Verdikart henter skoler og barnehager fra OpenStreetMap for enhver adresse, inkludert gangavstand. Søk på adressen og se SchoolsCard direkte i rapporten." },
  { q: "Hva er støynivå og hvor mye bør det bekymre meg?", a: "Over 55 dB utendørs på soveromsfasaden er EUs grenseverdi for søvnforstyrrelser. Norske retningslinjer (T-1442) anbefaler maks 55 dB (Lden) for boliger. Verdikart viser støynivå fra Kartverket for nøyaktig adresse." },
  { q: "Hva betyr 'skolerute' for boligvalg?", a: "Oslo opererer med skolekretser. Du må sende barna til nærskolen i din krets. Noen kretser har bedre omdømme enn andre. Sjekk Oslo kommunes skolekart på oslo.kommune.no før du kjøper." },
  { q: "Hva bør gangavstand til barnehage være?", a: "Ideelt under 500 meter. Det er ca. 7 minutter å gå. Barnehager vises i adresserapporten basert på OpenStreetMap-data, med gangavstand fra den valgte adressen." },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const features = [
  {
    icon: Train,
    title: "Kollektiv for hverdagen",
    body: "Er det buss eller T-bane til jobb, skole og fritidsaktiviteter? Verdikart viser alle holdeplasser, linjer og avganger innen gangavstand.",
  },
  {
    icon: Volume2,
    title: "Støy og luftkvalitet",
    body: "Støynivå fra vei og fly kan påvirke barns søvn og helse. Verdikart henter støydata fra Kartverket for ethvert gateadresse.",
  },
  {
    icon: School,
    title: "Prisdata for skolekretsen",
    body: "Boliger i attraktive skolekretser er typisk 5–15 % dyrere. Vi viser deg kvadratmeterpris for kommunen slik at du kan vurdere om prisen reflekterer beliggenheten.",
  },
];

export default function BarnefamilierPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Verdikart for Barnefamilier",
    url: "https://verdikart.no/for/barnefamilier",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hjem", item: "https://verdikart.no" },
      { "@type": "ListItem", position: 2, name: "Barnefamilier", item: "https://verdikart.no/for/barnefamilier" },
    ],
  };

  return (
    <>
      <JsonLd schema={schema} />
      <JsonLd schema={faqSchema} />
      <JsonLd schema={breadcrumbSchema} />
      <div className="min-h-screen bg-background text-foreground">

        <section className="relative overflow-hidden px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: "radial-gradient(ellipse at 50% -10%, rgb(var(--accent-rgb) / 0.16) 0%, transparent 65%)" }} />
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">For barnefamilier</p>
          <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Finn et trygt nabolag med gode forbindelser
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg">
            Transport til jobb, trygg nabolag og støynivå er avgjørende for barnefamilier. Verdikart gir deg dataen på ett sted.
          </p>
          <div className="mx-auto mt-8 w-full max-w-xl">
            <AddressSearch />
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="space-y-4">
            {features.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-4 rounded-xl border border-card-border bg-card-bg p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-4.5 w-4.5 text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-accent/20 bg-accent/5 p-5">
            <h3 className="mb-2 font-semibold">Sjekkliste for boligkjøp</h3>
            <p className="mb-3 text-sm text-text-secondary">12 ting du bør undersøke før bud: radon, teknisk tilstand, fellesgjeld og mer.</p>
            <Link href="/blogg/hva-sjekke-for-boligkjop" className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
              Les sjekklisten <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
          <h2 className="mb-6 text-xl font-semibold">Vanlige spørsmål for barnefamilier</h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-card-border bg-card-bg">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-semibold list-none">{q}<span className="shrink-0 text-text-tertiary transition-transform group-open:rotate-45">+</span></summary>
                <p className="px-5 pb-4 pt-0 text-sm leading-relaxed text-text-secondary">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="border-t border-card-border bg-card-bg px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm text-text-secondary">Verdikart er også nyttig for:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[["Førstegangskjøpere", "/for/forstegangskjoper"], ["Boliginvestorer", "/for/boliginvestor"]].map(([label, href]) => (
                <Link key={href} href={href} className="rounded-full border border-card-border bg-background px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent/30 hover:text-foreground">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
