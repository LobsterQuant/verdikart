import type { Metadata } from "next";
import { Mail, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Presse og media | Verdikart",
  description: "Presseinfo om Verdikart — fakta om produktet, sitater, kontaktinfo for journalister og media.",
  alternates: { canonical: "https://verdikart.no/presse" },
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
    q: "Hvad er forretningsmodellen?",
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

        {/* Links */}
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-text-tertiary">Lenker</h2>
          <div className="space-y-2">
            {[
              { label: "verdikart.no", href: "https://verdikart.no", icon: ExternalLink },
              { label: "Michael H. — LinkedIn", href: "https://www.linkedin.com/in/micaready/", icon: ExternalLink },
              { label: "X / Twitter: @micareadyeu", href: "https://x.com/micareadyeu", icon: ExternalLink },
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
