import type { Metadata } from "next";
import { Mail, ExternalLink, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Presse og media | Verdikart",
  description: "Presseinfo om Verdikart — fakta om produktet, sitater, kontaktinfo for journalister og media.",
  alternates: { canonical: "https://verdikart.no/presse" },
  openGraph: {
    title: "Presse og media — Verdikart",
    description: "Presseinfo om Verdikart — fakta, sitater og kontaktinfo for journalister.",
    url: "https://verdikart.no/presse",
    siteName: "Verdikart",
    locale: "nb_NO",
    type: "website",
  },
};

const facts = [
  { label: "Produkt", value: "Verdikart — norsk eiendomsintelligens" },
  { label: "Lansert", value: "Mars 2026" },
  { label: "Grunnlegger", value: "Michael H., Oslo" },
  { label: "Teknologi", value: "Next.js 14, Vercel, SSB API, Entur API, Kartverket" },
  { label: "Datakilder", value: "SSB, Kartverket, Entur (alle offentlige, åpne data)" },
  { label: "Pris", value: "Gratis for brukere — ingen registrering" },
  { label: "Dekningsområde", value: "Hele Norge — alle kommuner" },
  { label: "Nettsted", value: "verdikart.no" },
];

const faqs = [
  {
    q: "Hva er Verdikart?",
    a: "Verdikart er et gratis norsk verktøy for boligkjøpere. Brukere søker på en adresse og får umiddelbart informasjon om kollektivtransport, boligprisutvikling og sammenlignbare salgspriser — alt hentet fra offentlige datakilder i sanntid.",
  },
  {
    q: "Hvem bruker Verdikart?",
    a: "Førstegangskjøpere, barnefamilier og boliginvestorer som ønsker bedre datagrunnlag før de kjøper bolig. Verdikart er for alle som vil forstå en adresse dypere enn det meglern forteller.",
  },
  {
    q: "Hvordan skiller Verdikart seg fra eiendomsmeglere og Finn.no?",
    a: "Verdikart er et analyserverktøy, ikke en annonseplatform. Vi selger ingen boliger, vi tar ingen provisjon, og vi har ingen agenda utover å gi brukeren best mulig data. Alle datakildene er åpne og offentlige.",
  },
  {
    q: "Hva er forretningsmodellen?",
    a: "Verdikart er i beta. Inntektsmodell er ikke offentliggjort. Produktet er gratis i sin nåværende form.",
  },
];

export default function PressePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">

        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Media</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Presse og media</h1>
          <p className="mt-3 text-text-secondary">
            Jobber du med en artikkel om boligmarkedet, proptech eller åpne data? Her finner du fakta, sitater og kontaktinfo.
          </p>
        </div>

        {/* Key facts */}
        <section className="mb-10 rounded-xl border border-card-border bg-card-bg p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Nøkkelfakta</h2>
          <dl className="space-y-2.5">
            {facts.map(({ label, value }) => (
              <div key={label} className="flex gap-3 text-sm">
                <dt className="w-32 shrink-0 text-text-tertiary">{label}</dt>
                <dd className="text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Quote */}
        <section className="mb-10 rounded-xl border border-accent/20 bg-accent/5 p-6">
          <blockquote className="text-base leading-relaxed text-foreground">
            &ldquo;Boligkjøp er den største finansielle beslutningen de fleste nordmenn tar — og allikevel er tilgangen til relevant data fragmentert, utdatert eller gjemt bak betalingsmurer. Verdikart ble laget for å endre det.&rdquo;
          </blockquote>
          <p className="mt-3 text-sm text-text-secondary">— Michael H., grunnlegger av Verdikart</p>
        </section>

        {/* FAQ for press */}
        <section className="mb-10">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-text-tertiary">Ofte stilte spørsmål fra pressen</h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-card-border bg-card-bg p-5">
                <h3 className="mb-2 font-semibold">{q}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Press kit / logos */}
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-text-tertiary">Logopakke</h2>
          <p className="mb-4 text-sm text-text-secondary">
            Last ned Verdikart-logoen for bruk i artikler og presentasjoner. Bruk helst SVG-versjonen for best kvalitet.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-card-border bg-card-bg p-5 flex flex-col items-center gap-3">
              <div className="flex h-20 w-full items-center justify-center rounded-lg bg-[#0f1117]">
                <span className="text-xl font-bold text-white tracking-tight">Verdikart</span>
              </div>
              <p className="text-xs text-text-tertiary">Logo — mørk bakgrunn</p>
              <div className="flex gap-2">
                <a href="/assets/press/verdikart-logo-white.svg" download className="flex items-center gap-1 rounded-lg border border-card-border px-3 py-1.5 text-xs text-accent hover:border-accent/40">
                  <Download className="h-3 w-3" strokeWidth={1.5} />SVG
                </a>
                <a href="/assets/press/verdikart-logo-white.png" download className="flex items-center gap-1 rounded-lg border border-card-border px-3 py-1.5 text-xs text-accent hover:border-accent/40">
                  <Download className="h-3 w-3" strokeWidth={1.5} />PNG
                </a>
              </div>
            </div>
            <div className="rounded-xl border border-card-border bg-card-bg p-5 flex flex-col items-center gap-3">
              <div className="flex h-20 w-full items-center justify-center rounded-lg bg-white">
                <span className="text-xl font-bold text-[#0f1117] tracking-tight">Verdikart</span>
              </div>
              <p className="text-xs text-text-tertiary">Logo — lys bakgrunn</p>
              <div className="flex gap-2">
                <a href="/assets/press/verdikart-logo-dark.svg" download className="flex items-center gap-1 rounded-lg border border-card-border px-3 py-1.5 text-xs text-accent hover:border-accent/40">
                  <Download className="h-3 w-3" strokeWidth={1.5} />SVG
                </a>
                <a href="/assets/press/verdikart-logo-dark.png" download className="flex items-center gap-1 rounded-lg border border-card-border px-3 py-1.5 text-xs text-accent hover:border-accent/40">
                  <Download className="h-3 w-3" strokeWidth={1.5} />PNG
                </a>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-text-tertiary">
            Verdikart er ett ord, stor V, liten k. Ikke endre fargene eller forholdet i logoen.
          </p>
        </section>

        {/* About – short company description */}
        <section className="mb-10 rounded-xl border border-card-border bg-card-bg p-5">
          <h2 className="mb-2 font-semibold">Om Verdikart</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Verdikart er et gratis norsk verktøy som gir boligkjøpere tilgang til eiendomsdata fra offentlige kilder som SSB, Kartverket og Entur — samlet på ett sted. Tjenesten ble lansert i mars 2026 og dekker hele Norge. Brukere søker på en adresse og får umiddelbart innsikt i kollektivtransport, boligprisutvikling, støynivå og nabolagsstatistikk, uten registrering eller betaling.
          </p>
        </section>

        {/* Links */}
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-text-tertiary">Lenker</h2>
          <div className="space-y-2">
            {[
              { label: "verdikart.no", href: "https://verdikart.no", icon: ExternalLink },
              { label: "Verdikart — LinkedIn", href: "https://www.linkedin.com/in/michael-h-7723993bb/", icon: ExternalLink },
              { label: "X / Twitter: @Verdikart", href: "https://x.com/Verdikart", icon: ExternalLink },
            ].map(({ label, href, icon: Icon }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-accent hover:underline">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                {label}
              </a>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="rounded-xl border border-card-border bg-card-bg p-5">
          <h2 className="mb-2 font-semibold">Presseforespørsler</h2>
          <p className="mb-4 text-sm leading-relaxed text-text-secondary">
            For intervjuer, sitatbekreftelse, tallgrunnlag eller høyoppløselig logo — send e-post til:
          </p>
          <a href="mailto:kontakt@verdikart.no"
            className="flex items-center gap-2 text-sm font-medium text-accent hover:underline">
            <Mail className="h-4 w-4" strokeWidth={1.5} />
            kontakt@verdikart.no
          </a>
          <p className="mt-2 text-xs text-text-tertiary">Vi svarer innen 1 virkedag på presserelaterte henvendelser.</p>
        </section>

      </div>
    </div>
  );
}
