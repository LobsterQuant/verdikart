import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, BarChart2, MapPin, ChevronRight } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import AddressSearch from "@/components/AddressSearch";

export const metadata: Metadata = {
  title: "Verdikart for Boligselgere — Forstå hva boligen din er verdt | Verdikart",
  description: "Selger du bolig? Verdikart gir deg kvadratmeterpris, prishistorikk og sammenlignbare salg for din adresse — gratis, i sanntid, uten megler.",
  alternates: { canonical: "https://verdikart.no/for/selger" },
};

const features = [
  {
    icon: BarChart2,
    title: "Hva er kvadratmeterprisen i ditt område?",
    body: "Se gjennomsnittlig kvadratmeterpris for din kommune og bydel fra SSB. Forstå om boligen din er priset riktig — før du setter prisen.",
  },
  {
    icon: TrendingUp,
    title: "Prisutvikling de siste 12 månedene",
    body: "Er markedet på vei opp eller ned? Verdikart viser prisindeks per kommune over tid, slik at du kan time salget riktigst mulig.",
  },
  {
    icon: MapPin,
    title: "Sammenlignbare salg i nabolaget",
    body: "Se hva lignende boliger faktisk er solgt for i nærområdet. Bruk dette som grunnlag i dialogen med megleren din.",
  },
];

const faqs = [
  {
    q: "Kan jeg bruke Verdikart til å sette prisantydning?",
    a: "Verdikart gir deg markedsdata som grunnlag — kommunebasert kvadratmeterpris og prishistorikk. En fullstendig verdivurdering krever en megler som kjenner boligen fysisk, men Verdikart hjelper deg forstå om meglerens prisforslag er realistisk.",
  },
  {
    q: "Er dataen oppdatert?",
    a: "SSB-prisstatistikken oppdateres kvartalsvis. Kartverkets adressedata er sanntids. Vi viser alltid siste tilgjengelige periode og merker tydelig når dataen er fra.",
  },
  {
    q: "Koster det noe?",
    a: "Nei. Verdikart er gratis for alle brukere — kjøpere og selgere.",
  },
];

export default function SelgerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Verdikart for Boligselgere",
    description: metadata.description,
    url: "https://verdikart.no/for/selger",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Hjem", item: "https://verdikart.no" },
        { "@type": "ListItem", position: 2, name: "For selgere", item: "https://verdikart.no/for/selger" },
      ],
    },
  };

  return (
    <>
      <JsonLd schema={schema} />
      <div className="min-h-screen bg-background text-foreground">

        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(99,102,241,0.16) 0%, transparent 65%)" }} />
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">For boligselgere</p>
          <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Vet du hva boligen din er verdt?
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg">
            Før du ringer megleren — sjekk kvadratmeterpris, prishistorikk og sammenlignbare salg for din adresse. Gratis, i sanntid.
          </p>
          <div className="mx-auto mt-8 w-full max-w-xl">
            <AddressSearch />
          </div>
          <p className="mt-3 text-xs text-text-tertiary">Søk på din egen adresse — se markedsdata umiddelbart</p>
        </section>

        {/* Features */}
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
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 pb-12 sm:px-6">
          <h2 className="mb-5 text-lg font-semibold">Vanlige spørsmål fra selgere</h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-card-border bg-card-bg p-5">
                <h3 className="mb-2 font-semibold">{q}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Blog CTA */}
        <section className="mx-auto max-w-3xl px-4 pb-12 sm:px-6">
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
            <h3 className="mb-2 font-semibold">Sjekkliste for boligsalg</h3>
            <p className="mb-3 text-sm text-text-secondary">Les om hva kjøpere sjekker — og hva du bør forberede deg på.</p>
            <Link href="/blog/hva-sjekke-for-boligkjop" className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
              Les artikkelen <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Cross-links */}
        <section className="border-t border-card-border bg-card-bg px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm text-text-secondary">Verdikart er også nyttig for:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                ["Førstegangskjøpere", "/for/forstegangskjoper"],
                ["Boliginvestorer", "/for/boliginvestor"],
                ["Barnefamilier", "/for/barnefamilier"],
              ].map(([label, href]) => (
                <Link key={href} href={href}
                  className="rounded-full border border-card-border bg-background px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent/30 hover:text-foreground">
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
