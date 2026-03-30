import type { Metadata } from "next";
import { Database, Shield, ExternalLink } from "lucide-react";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Om Verdikart — Hvem vi er og hva vi bygger",
  description: "Verdikart er bygget av Michael H., en Oslo-basert teknologi- og datautvikler. Vi gjør boligmarkedet mer transparent for norske kjøpere.",
  alternates: { canonical: "https://verdikart.no/om-oss" },
};

export default function OmOss() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Michael H.",
    jobTitle: "Grunnlegger, Verdikart",
    url: "https://verdikart.no/om-oss",
    sameAs: [
      "https://www.linkedin.com/in/michael-h-7723993bb/",
      "https://x.com/Verdikart",
    ],
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Verdikart",
    url: "https://verdikart.no",
    founder: { "@type": "Person", name: "Michael H." },
    foundingDate: "2026",
    description: "Norsk eiendomsintelligens-verktøy for boligkjøpere.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "kontakt@verdikart.no",
      contactType: "customer support",
      availableLanguage: "Norwegian",
    },
  };

  return (
    <>
      <JsonLd schema={personSchema} />
      <JsonLd schema={orgSchema} />

      <div className="flex min-h-screen flex-col items-center bg-background text-foreground px-4 py-16 sm:px-6 sm:py-24">
        <div className="w-full max-w-2xl">

          <h1 className="text-3xl font-bold tracking-tight mb-3 sm:text-4xl">Om Verdikart</h1>
          <p className="text-lg text-text-secondary leading-relaxed mb-12">
            Vi gjør boligmarkedet mer transparent. Ingen løsrevne datasett, ingen betalingsmurer — bare den informasjonen du faktisk trenger, samlet på ett sted.
          </p>

          {/* Founder */}
          <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-5">Grunnlegger</h2>
            <div className="flex items-start gap-4">
              {/* Avatar — gradient initials mark */}
              <div className="relative h-14 w-14 shrink-0 select-none">
                <svg viewBox="0 0 56 56" className="h-14 w-14" aria-hidden>
                  <defs>
                    <linearGradient id="avatarGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                    <clipPath id="avatarClip">
                      <circle cx="28" cy="28" r="28" />
                    </clipPath>
                  </defs>
                  {/* Background */}
                  <circle cx="28" cy="28" r="28" fill="url(#avatarGrad)" opacity="0.18" />
                  <circle cx="28" cy="28" r="27" fill="none" stroke="url(#avatarGrad)" strokeWidth="1.2" opacity="0.5" />
                  {/* Initials */}
                  <text
                    x="28" y="34"
                    textAnchor="middle"
                    fontFamily="'Inter', 'DM Sans', sans-serif"
                    fontSize="20"
                    fontWeight="700"
                    fill="url(#avatarGrad)"
                    clipPath="url(#avatarClip)"
                  >MH</text>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-semibold text-lg">Michael H.</p>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://www.linkedin.com/in/michael-h-7723993bb/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-md border border-card-border bg-background px-2 py-0.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground"
                    >
                      <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                      LinkedIn
                    </a>
                    <a
                      href="https://x.com/Verdikart"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-md border border-card-border bg-background px-2 py-0.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground"
                    >
                      <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                      X
                    </a>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Oslo-basert utvikler med bakgrunn innen fintech og dataanalyse. Bygger verktøy der komplekse datasett møter enkle brukeropplevelser — Verdikart er det seneste.
                  Opptatt av at viktig informasjon skal være åpen og tilgjengelig, ikke forbeholdt de som vet hvor de skal lete.
                </p>
              </div>
            </div>
          </section>

          {/* Mission */}
          <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">Hvorfor Verdikart?</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Boligkjøp er den største finansielle beslutningen de fleste nordmenn tar — og allikevel er tilgangen til relevant data fragmentert, utdatert eller gjemt bak betalingsmurer. Eiendomsmeglere har én agenda. Bankene har en annen. Verdikart har ingen: vi henter data direkte fra Kartverket, Entur og SSB og presenterer den uten filter.
            </p>
          </section>

          {/* Data sources */}
          <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <Database className="h-5 w-5 text-accent" strokeWidth={1.5} />
              Datakilder
            </h2>
            <div className="space-y-3">
              {[
                { name: "Kartverket", desc: "Alle norske adresser og eiendomsdata — Norges offisielle matrikkel." },
                { name: "Entur", desc: "Sanntids kollektivdata for hele landet. Avganger, holdeplasser og linjer." },
                { name: "SSB", desc: "Statistisk sentralbyrå — boligprisindeks og omsetningsdata per kommune." },
              ].map(({ name, desc }) => (
                <div key={name} className="flex items-start gap-3">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-accent/60" />
                  <p className="text-sm text-text-secondary">
                    <strong className="text-foreground">{name}</strong> — {desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Privacy */}
          <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-3">
              <Shield className="h-5 w-5 text-accent" strokeWidth={1.5} />
              Personvern
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Vi lagrer ikke adressene du søker på. Ingen brukerkontoer, ingen sporing av individuelle søk. Analytics er anonym (Plausible) og vi bruker Microsoft Clarity kun for aggregert UX-analyse. Les hele{" "}
              <a href="/personvern" className="text-accent hover:underline">personvernerklæringen</a>.
            </p>
          </section>

          {/* Contact */}
          <section className="rounded-xl border border-card-border bg-card-bg p-6">
            <h2 className="text-xl font-semibold mb-3">Kontakt</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Spørsmål, feilmeldinger eller forslag? Se{" "}
              <a href="/kontakt" className="text-accent hover:underline">kontaktsiden</a>{" "}
              eller send en e-post til{" "}
              <a href="mailto:kontakt@verdikart.no" className="text-accent hover:underline">kontakt@verdikart.no</a>.
            </p>
          </section>

        </div>
      </div>
    </>
  );
}
