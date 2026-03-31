import type { Metadata } from "next";
import Link from "next/link";
import { Home, TrendingUp, Train, ChevronRight, ShieldCheck, BookOpen } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import AddressSearch from "@/components/AddressSearch";

export const metadata: Metadata = {
  title: "Verdikart for Førstegangskjøpere — Forstå boligmarkedet før du kjøper | Verdikart",
  description: "Skal du kjøpe bolig for første gang? Verdikart gir deg transport-, pris- og nabolagsdata for enhver norsk adresse — gratis, uten registrering.",
  alternates: { canonical: "https://verdikart.no/for/forstegangskjoper" },
};

const steps = [
  {
    icon: Train,
    title: "Sjekk kollektivtilbudet",
    body: "Søk på adressen og se alle holdeplasser innen gangavstand, linjenumre og avganger per time. Ikke la megleren fortelle deg at «det er kort til T-banen» — sjekk det selv.",
  },
  {
    icon: TrendingUp,
    title: "Forstå prisbildet",
    body: "Se gjennomsnittlig kvadratmeterpris for kommunen og prisutvikling over tid. Er det du betaler innenfor det normale? Verdikart viser deg tallene direkte fra SSB.",
  },
  {
    icon: Home,
    title: "Sammenlign med nabolaget",
    body: "Se hva lignende boliger faktisk er solgt for i nærområdet. Ikke betal mer enn markedet — bruk dataen til å forhandle.",
  },
  {
    icon: ShieldCheck,
    title: "Dobbeltsjekk støy og miljø",
    body: "Støykart, luftkvalitet og støynivå fra nærliggende trafikkårer. Noen ting ser du ikke på visning.",
  },
];

export default function FørstegangskjøperPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Verdikart for Førstegangskjøpere",
    description: metadata.description,
    url: "https://verdikart.no/for/forstegangskjoper",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Hjem", item: "https://verdikart.no" },
        { "@type": "ListItem", position: 2, name: "Førstegangskjøper", item: "https://verdikart.no/for/forstegangskjoper" },
      ],
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Hva er BSU og hvordan bruker jeg det?", acceptedAnswer: { "@type": "Answer", text: "BSU (Boligsparing for Ungdom) er en skattefavorisert sparekonto for deg under 34 år. Du kan spare inntil 27 500 kr/år og få 10% skattefradrag. Maks saldo 300 000 kr, kun til boligkjøp." } },
      { "@type": "Question", name: "Hva mener banken med 85%-regelen?", acceptedAnswer: { "@type": "Answer", text: "Banken kan normalt ikke gi lån over 85% av boligens verdi. Du må stille med minst 15% egenkapital." } },
      { "@type": "Question", name: "Hva er fellesgjeld og hvorfor er det viktig?", acceptedAnswer: { "@type": "Answer", text: "Fellesgjeld er borettslagets andel av felles lån. Totalpris = kjøpspris + fellesgjeld. Høy fellesgjeld gir sårbarhet for renteøkninger." } },
    ],
  };

  return (
    <>
      <JsonLd schema={schema} />
      <JsonLd schema={faqSchema} />
      <div className="min-h-screen bg-background text-foreground">

        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(99,102,241,0.16) 0%, transparent 65%)" }} />
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">For førstegangskjøpere</p>
          <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Kjøp din første bolig med åpne øyne
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg">
            Som førstegangskjøper kan du ikke stole blindt på megleren. Verdikart gir deg de dataene du trenger for å ta en informert beslutning — gratis.
          </p>
          <div className="mx-auto mt-8 w-full max-w-xl">
            <AddressSearch />
          </div>
          <p className="mt-3 text-xs text-text-tertiary">Søk på en adresse du vurderer — se rapport umiddelbart</p>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h2 className="mb-8 text-center text-xl font-semibold">Hva du bør sjekke — og hvordan Verdikart hjelper</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border border-card-border bg-card-bg p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-4.5 w-4.5 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Blog CTA */}
        <section className="mx-auto max-w-3xl px-4 pb-12 sm:px-6">
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <BookOpen className="h-4.5 w-4.5 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Les vår sjekkliste for boligkjøp</h3>
                <p className="mb-3 text-sm text-text-secondary">12 ting du MÅ undersøke før du legger inn bud — fra fellesgjeld til radon.</p>
                <Link href="/blogg/hva-sjekke-for-boligkjop" className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
                  Les sjekklisten <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
          <h2 className="mb-6 text-xl font-semibold">Vanlige spørsmål for førstegangskjøpere</h2>
          <div className="space-y-3">
            {[
              {
                q: "Hva er BSU og hvordan bruker jeg det?",
                a: "BSU (Boligsparing for Ungdom) er en skattefavorisert sparekonto for deg under 34 år. Du kan spare inntil 27 500 kr/år (2024) og få 10% av innskuddet som skattefradrag. Midlene kan kun brukes til boligkjøp eller nedbetaling av boliglån. Maks saldo: 300 000 kr."
              },
              {
                q: "Hva mener banken med 85%-regelen?",
                a: "Banken kan normalt ikke gi deg lån som overstiger 85% av boligens verdi (eller 60% for sekundærbolig). Du må altså stille med minst 15% egenkapital. For Oslo kan dette bety 500 000–800 000 kr i egenkapital for en gjennomsnittlig leilighet."
              },
              {
                q: "Hva er fellesgjeld og hvorfor er det viktig?",
                a: "Fellesgjeld er borettslaget eller eierseksjonssameiet sin andel av felles lån. Høy fellesgjeld betyr at månedlige felleskostnader kan stige kraftig hvis renten øker. Sjekk alltid 'andel fellesgjeld' i prospektet og beregn totalpris = kjøpspris + fellesgjeld."
              },
              {
                q: "Bør jeg bruke verdikart.no på visning?",
                a: "Ja — Verdikart er designet for mobilbruk på visning. Søk på adressen og sjekk kollektivavganger, støynivå og prisstatistikk direkte fra mobilen. Du ser ting megleren ikke vil fortelle deg."
              },
              {
                q: "Hva er dokumentavgift?",
                a: "Dokumentavgift er 2,5% av kjøpesummen og betales til staten ved overføring av eiendom. For en leilighet til 4 millioner betyr det 100 000 kr ekstra. Merk: borettslag og aksjeleiligheter har ikke dokumentavgift — kun selveierboliger."
              },
            ].map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-card-border bg-card-bg">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-semibold list-none">
                  {q}
                  <span className="shrink-0 text-text-tertiary transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-4 pt-0 text-sm leading-relaxed text-text-secondary">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Other use cases */}
        <section className="border-t border-card-border bg-card-bg px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm text-text-secondary">Verdikart er også nyttig for:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[["Boliginvestorer", "/for/boliginvestor"], ["Barnefamilier", "/for/barnefamilier"]].map(([label, href]) => (
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
