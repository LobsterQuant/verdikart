import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personvern: Verdikart",
  description: "Personvernerklæring for Verdikart. Les om hvordan vi behandler personopplysninger.",
  alternates: { canonical: "https://verdikart.no/personvern" },
};

export default function Personvern() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background text-foreground px-6 py-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Personvern</h1>
        <p className="text-lg text-text-secondary leading-relaxed mb-12">
          Vi tar personvernet ditt på alvor. Her forklarer vi hvilke data vi
          samler inn, hvorfor, og hvordan vi behandler dem.
        </p>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Behandlingsansvarlig</h2>
          <p className="text-sm leading-relaxed text-text-secondary mb-3">
            Verdikart er behandlingsansvarlig for personopplysninger som samles
            inn gjennom dette nettstedet.
          </p>
          <ul className="space-y-1 text-sm text-text-secondary">
            <li><strong className="text-foreground">Virksomhet:</strong> Verdikart (enkeltpersonforetak under etablering)</li>
            <li><strong className="text-foreground">Ansvarlig:</strong> Michael Hansen</li>
            <li><strong className="text-foreground">Land:</strong> Norge</li>
            <li><strong className="text-foreground">E-post:</strong>{" "}
              <a href="mailto:kontakt@verdikart.no" className="text-accent hover:underline">
                kontakt@verdikart.no
              </a>
            </li>
          </ul>
          <p className="mt-3 text-xs text-text-tertiary">
            Tjenesten drives som enkeltpersonforetak. Organisasjonsnummer registreres i Brønnøysundregistrene i takt med kommersiell oppstart: dette er et krav ved omsetning over kr 50 000. All behandling av personopplysninger skjer i tråd med GDPR uavhengig av registreringsstatus.
          </p>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Hvilke data samler vi inn?</h2>
          <p className="text-sm leading-relaxed text-text-secondary mb-4">
            Verdikart samler inn et minimum av data for å kunne tilby tjenesten:
          </p>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">-</span>
              <span>
                <strong className="text-foreground">Søkedata</strong>: Adresser og
                søk du gjør i tjenesten. Disse lagres ikke permanent og knyttes
                ikke til deg som person.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">-</span>
              <span>
                <strong className="text-foreground">Tekniske loggdata</strong>: IP-adresse,
                nettlesertype og tidspunkt for besøk, utelukkende for
                driftsformål. Disse slettes fortløpende.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">-</span>
              <span>
                <strong className="text-foreground">E-postadresser</strong>: dersom du melder
                deg på nyhetsbrev eller prisvarsel, lagrer vi e-postadressen din
                hos Formspree. Vi sletter abonnenter etter 12 måneder uten
                aktivitet, eller umiddelbart på forespørsel til{" "}
                <a href="mailto:kontakt@verdikart.no" className="text-accent hover:underline">kontakt@verdikart.no</a>.
              </span>
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Behandlingsgrunnlag</h2>
          <p className="text-sm leading-relaxed text-text-secondary mb-3">
            All behandling av personopplysninger i Verdikart har et lovlig grunnlag i henhold til GDPR artikkel 6:
          </p>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">–</span>
              <span><strong className="text-foreground">Berettiget interesse (art. 6(1)(f))</strong>: Tekniske loggdata og anonymisert analyse (Plausible) for å sikre drift og forbedre tjenesten.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">–</span>
              <span><strong className="text-foreground">Samtykke (art. 6(1)(a))</strong>: Microsoft Clarity lastes kun etter eksplisitt samtykke via samtykkebanneret. Du kan når som helst trekke samtykket tilbake.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">–</span>
              <span><strong className="text-foreground">Avtale (art. 6(1)(b))</strong>: E-postadresse behandles for å levere nyhetsbrev du har meldt deg på.</span>
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Informasjonskapsler (cookies)</h2>
          <p className="text-sm leading-relaxed text-text-secondary mb-3">
            Verdikart bruker teknisk nødvendige informasjonskapsler for at
            tjenesten skal fungere (f.eks. ditt samtykkevalg). Vi bruker ikke
            markedsføringscookies og deler ikke data med tredjepart til
            reklameformål.
          </p>
          <p className="text-sm leading-relaxed text-text-secondary">
            Ved første besøk vises et samtykkebanner. Analytiske verktøy som
            krever samtykke lastes kun etter at du har akseptert.
          </p>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Tredjeparter og analyseverktøy</h2>
          <p className="text-sm leading-relaxed text-text-secondary mb-3">
            Verdikart benytter følgende tredjepartstjenester:
          </p>
          <ul className="space-y-3 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">–</span>
              <span><strong className="text-foreground">Plausible Analytics</strong>: anonymisert besøksstatistikk uten cookies eller personidentifikasjon. Ingen data sendes utenfor EU. <a href="https://plausible.io/privacy" target="_blank" rel="noopener" className="text-accent hover:underline">plausible.io/privacy</a></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">–</span>
              <span><strong className="text-foreground">Microsoft Clarity</strong>: heatmaps og sesjonsopptak for å forbedre brukeropplevelsen. Lastes kun etter ditt samtykke via samtykkebanneret. <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener" className="text-accent hover:underline">Microsoft personvernerklæring</a></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">–</span>
              <span><strong className="text-foreground">Leaflet / CARTO</strong>: kartvisning med fliser fra CARTO DarkMatter. Teknisk nødvendig for kartfunksjonen.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">–</span>
              <span><strong className="text-foreground">Formspree</strong>: behandler kontaktskjemaer og e-postpåmeldinger. Data lagres på Formsprees servere. <a href="https://formspree.io/legal/privacy-policy" target="_blank" rel="noopener" className="text-accent hover:underline">Formspree personvernerklæring</a></span>
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Dine rettigheter</h2>
          <p className="text-sm leading-relaxed text-text-secondary mb-4">
            I henhold til GDPR og norsk personopplysningslov har du rett til å:
          </p>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">-</span>
              <span>Kreve innsyn i opplysninger vi har om deg</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">-</span>
              <span>Kreve retting eller sletting av opplysninger</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">-</span>
              <span>Protestere mot behandling av dine personopplysninger</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">-</span>
              <span>
                Klage til{" "}
                <a
                  href="https://www.datatilsynet.no"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Datatilsynet
                </a>{" "}
                dersom du mener vi behandler dine data ulovlig
              </span>
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6">
          <h2 className="text-xl font-semibold mb-3">Endringer</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Vi kan oppdatere denne erklæringen ved behov. Vesentlige endringer
            vil bli varslet på nettstedet. Sist oppdatert: mars 2026.
          </p>
        </section>
      </div>
    </div>
  );
}
