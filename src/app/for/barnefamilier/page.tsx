import type { Metadata } from "next";
import Link from "next/link";
import { Train, Volume2, School, ChevronRight } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import AddressSearch from "@/components/AddressSearch";

export const metadata: Metadata = {
  title: "Verdikart for Barnefamilier — Sjekk transport, støy og nabolag | Verdikart",
  description: "Barnefamilier trenger trygt nabolag, gode skoler og kollektivtilbud. Verdikart viser deg transport, støy og prisdata for enhver norsk adresse.",
  alternates: { canonical: "https://verdikart.no/for/barnefamilier" },
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

  return (
    <>
      <JsonLd schema={schema} />
      <div className="min-h-screen bg-background text-foreground">

        <section className="relative overflow-hidden px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(99,102,241,0.16) 0%, transparent 65%)" }} />
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
            <p className="mb-3 text-sm text-text-secondary">12 ting du bør undersøke før bud — inkludert radon, teknisk tilstand og fellesgjeld.</p>
            <Link href="/blog/hva-sjekke-for-boligkjop" className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
              Les sjekklisten <ChevronRight className="h-3.5 w-3.5" />
            </Link>
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
