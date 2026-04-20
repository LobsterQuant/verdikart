import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Train, BarChart2, ChevronRight } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import AddressSearch from "@/components/AddressSearch";
import RentalYieldCalc from "@/components/RentalYieldCalc";

export const metadata: Metadata = {
  title: "Boliginvestor | Verdikart",
  description: "For boliginvestorer: kvadratmeterpris, pristrend og kollektivdekning for enhver norsk adresse. Data fra SSB og Entur. Gratis på Verdikart.",
  alternates: { canonical: "https://verdikart.no/for/boliginvestor" },
};

const faqs = [
  { q: "Hva er en god direkteavkastning for utleieboliger i Norge?", a: "Direkteavkastning (leieinntekt / kjøpspris) på 3–5% anses som normalt i Oslo. Utenfor de store byene kan du oppnå 5–7%. Husk å trekke fra fellesutgifter, eiendomsskatt og vedlikehold." },
  { q: "Hva bør jeg sjekke i et nabolag for utleiepotensial?", a: "Kollektivdekning, gangavstand til høyskole/universitet, støynivå og prisutvikling. Verdikart gir deg disse dataene direkte for enhver adresse." },
  { q: "Hva er sekundærboligskatten?", a: "Fra 2023 beskattes sekundærbolig som 100% av markedsverdi i formuesskatten (mot 25% for primærbolig). I tillegg betales 22% skatt på netto leieinntekter etter fradrag." },
  { q: "Er det lønnsomt å kjøpe i randsone utenfor Oslo?", a: "Byer som Lillestrøm, Ski og Drammen har lavere inngangspris og høyere direkteavkastning enn Oslo sentrum. Sjekk tog-/busstilbud til Oslo S. Det er den sterkeste prisdriveren i randsonene." },
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
    icon: TrendingUp,
    title: "Prishistorikk og trend",
    body: "Se historisk kvadratmeterprisutvikling per kommune fra SSB. Identifiser bydeler og kommuner med konsistent prisvekst over tid.",
  },
  {
    icon: Train,
    title: "Kollektivnærhet",
    body: "Forskning viser 10–20 % premie for T-banenærhet i Oslo. Verdikart viser deg eksakt transportdekning og avgangshyppighet for enhver adresse.",
  },
  {
    icon: BarChart2,
    title: "Sammenlignbare transaksjoner",
    body: "Se gjennomsnittlig kvadratmeterpris og antall transaksjoner for kommunen. Sammenlign prisingen med markedssnittet.",
  },
];

export default function BoliginvestorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Verdikart for Boliginvestorer",
    description: "Verdikart gir boliginvestorer kvadratmeterpris, pristrend og kollektivdekning for enhver norsk adresse. Gratis, uten registrering.",
    url: "https://verdikart.no/for/boliginvestor",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Hjem", item: "https://verdikart.no" },
        { "@type": "ListItem", position: 2, name: "For boliginvestorer", item: "https://verdikart.no/for/boliginvestor" },
      ],
    },
  };

  return (
    <>
      <JsonLd schema={schema} />
      <JsonLd schema={faqSchema} />
      <div className="min-h-screen bg-background text-foreground">

        <section className="relative overflow-hidden px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: "radial-gradient(ellipse at 50% -10%, rgb(var(--accent-rgb) / 0.16) 0%, transparent 65%)" }} />
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">For boliginvestorer</p>
          <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Ta datadrevne beslutninger om beliggenhet
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg">
            Beliggenhet og transportnærhet er de to sterkeste prisdriverne i norsk eiendom. Verdikart gir deg begge. For enhver adresse, i sanntid.
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
            <h3 className="mb-2 font-semibold">Les mer om T-bane og boligpriser</h3>
            <p className="mb-3 text-sm text-text-secondary">Vår analyse av sammenhengen mellom kollektivtransport og boligpris i norske byer.</p>
            <Link href="/blogg/kollektivtransport-og-boligpris" className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
              Les artikkelen <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Rental Yield Calculator */}
        <section className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
          <RentalYieldCalc />
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
          <h2 className="mb-6 text-xl font-semibold">Vanlige spørsmål for boliginvestorer</h2>
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
              {[["Førstegangskjøpere", "/for/forstegangskjoper"], ["Barnefamilier", "/for/barnefamilier"]].map(([label, href]) => (
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
