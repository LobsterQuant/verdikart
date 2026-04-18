import type { Metadata } from "next";
import { Database, Shield, ExternalLink } from "lucide-react";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Om Verdikart — Hvem vi er og hva vi bygger",
  description: "Verdikart er et lite, fokusert team som gjør boligmarkedet mer transparent for norske kjøpere — med data fra Kartverket, Entur og SSB.",
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
    foundingDate: "2026-03",
    description: "Forstå boligen. Ikke bare se den. Data fra Kartverket, Entur og SSB.",
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
            Forstå boligen. Ikke bare se den. Ingen løsrevne datasett, ingen betalingsmurer — data fra Kartverket, Entur og SSB, samlet på ett sted.
          </p>

          {/* Founder */}
          <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-5">Grunnlegger</h2>
            <div className="flex items-start gap-4">
              {/* Avatar — illustrated portrait */}
              <div className="relative h-16 w-16 shrink-0 select-none">
                <svg viewBox="0 0 64 64" className="h-16 w-16" aria-label="Michael H., grunnlegger">
                  <defs>
                    <linearGradient id="avatarBg" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#312e81" />
                      <stop offset="100%" stopColor="#1e1b4b" />
                    </linearGradient>
                    <linearGradient id="avatarAccent" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" />
                      <stop offset="100%" stopColor="var(--accent-hover)" />
                    </linearGradient>
                    <clipPath id="avatarCircle">
                      <circle cx="32" cy="32" r="31" />
                    </clipPath>
                  </defs>
                  {/* Background circle */}
                  <circle cx="32" cy="32" r="32" fill="url(#avatarBg)" />
                  {/* Subtle dot pattern */}
                  {[0,1,2,3].map(row => [0,1,2,3].map(col => (
                    <circle key={`${row}-${col}`} cx={col*16+8} cy={row*16+8} r="0.8" fill="var(--accent)" opacity="0.15" />
                  )))}
                  {/* Torso / shoulders */}
                  <ellipse cx="32" cy="58" rx="18" ry="10" fill="#1e1b4b" clipPath="url(#avatarCircle)" />
                  <rect x="18" y="50" width="28" height="20" fill="#1e1b4b" clipPath="url(#avatarCircle)" />
                  {/* Shirt collar */}
                  <path d="M 26 50 L 32 56 L 38 50" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round" />
                  {/* Neck */}
                  <rect x="28" y="42" width="8" height="10" rx="2" fill="#c4a882" />
                  {/* Head */}
                  <ellipse cx="32" cy="35" rx="12" ry="13" fill="#c4a882" />
                  {/* Hair */}
                  <path d="M 20 33 Q 20 19 32 19 Q 44 19 44 33 Q 42 26 32 25 Q 22 26 20 33 Z" fill="#3d2b1f" />
                  {/* Eyes */}
                  <ellipse cx="27.5" cy="34" rx="2" ry="2.2" fill="#2d1b0e" />
                  <ellipse cx="36.5" cy="34" rx="2" ry="2.2" fill="#2d1b0e" />
                  {/* Eye highlights */}
                  <circle cx="28.5" cy="33" r="0.6" fill="white" opacity="0.7" />
                  <circle cx="37.5" cy="33" r="0.6" fill="white" opacity="0.7" />
                  {/* Slight smile */}
                  <path d="M 28 40 Q 32 43 36 40" fill="none" stroke="#a07850" strokeWidth="1" strokeLinecap="round" />
                  {/* Ring border */}
                  <circle cx="32" cy="32" r="31" fill="none" stroke="url(#avatarAccent)" strokeWidth="1.5" />
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
                <p className="text-xs text-text-tertiary mt-0.5 mb-2">Grunnlegger · Oslo</p>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Utvikler og dataentusiast med bakgrunn innen fintech og systemutvikling. Bygger verktøy der komplekse offentlige datasett møter enkle brukeropplevelser.
                  Verdikart startet som et personlig prosjekt etter å ha kjøpt bolig og innsett hvor fragmentert tilgjengelig informasjon faktisk var.
                </p>
              </div>
            </div>
          </section>

          {/* Team / longevity note */}
          <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">Et lite, fokusert team</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Verdikart er bygget og driftet av et lite distribuert team med bakgrunn i systemutvikling og dataanalyse. Vi er ikke et VC-finansiert selskap med et burn rate — tjenesten er designet for å holde seg oppe uten tung infrastruktur. All data hentes fra åpne, offisielle API-er (Kartverket, Entur, SSB) som har eksistert i 10+ år og ikke forsvinner. Trenger du svar? Vi svarer på{" "}
              <a href="mailto:kontakt@verdikart.no" className="text-accent hover:underline">kontakt@verdikart.no</a> innen en arbeidsdag.
            </p>
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
                { name: "OpenStreetMap", desc: "Skoler, barnehager og nærservice via åpne geodata." },
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
