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
            <li><strong className="text-foreground">Virksomhet:</strong> Verdikart</li>
            <li><strong className="text-foreground">E-post:</strong>{" "}
              <a href="mailto:kontakt@verdikart.no" className="text-accent hover:underline">
                kontakt@verdikart.no
              </a>
            </li>
          </ul>
          <p className="mt-3 text-xs text-text-tertiary">
            Organisasjonsnummer vil bli oppgitt når virksomheten er registrert i Brønnøysundregistrene.
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
                <strong className="text-foreground">Søkedata</strong> — Adresser og
                søk du gjør i tjenesten. Disse lagres ikke permanent og knyttes
                ikke til deg som person.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">-</span>
              <span>
                <strong className="text-foreground">Tekniske loggdata</strong> — IP-adresse,
                nettlesertype og tidspunkt for besøk, utelukkende for
                driftsformål. Disse slettes fortløpende.
              </span>
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Informasjonskapsler (cookies)</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Verdikart bruker kun teknisk nødvendige informasjonskapsler for at
            tjenesten skal fungere. Vi bruker ikke sporings- eller
            markedsføringscookies, og vi deler ikke data med tredjepart til
            reklamefomål.
          </p>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Tredjeparter</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            For å vise kart benytter vi Leaflet med kartfliser fra offentlige
            norske kilder (Kartverket/Geonorge). Disse tjenestene er underlagt
            sine egne personvernerklæringer. Vi videresender ingen
            personopplysninger til disse tjenestene utover det som er teknisk
            nødvendig (f.eks. kartvisning).
          </p>
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
