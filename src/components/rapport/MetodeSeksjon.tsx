import { TVANGSSALG_2026_DATA } from "@/data/rapport/tvangssalg-2026";

export default function MetodeSeksjon() {
  const { dataSources } = TVANGSSALG_2026_DATA;

  return (
    <section
      aria-labelledby="metode"
      className="mb-16 rounded-xl border border-card-border bg-card-bg p-6 sm:p-8"
    >
      <h2
        id="metode"
        className="text-xl font-semibold text-foreground sm:text-2xl"
      >
        Metodologi og definisjoner
      </h2>

      <dl className="mt-6 space-y-5 text-sm leading-relaxed">
        <div>
          <dt className="mb-1 font-semibold text-foreground">Datakilder</dt>
          <dd className="text-text-secondary">
            <ul className="list-disc space-y-1 pl-5">
              {dataSources.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-medium text-accent underline-offset-2 hover:underline"
                  >
                    {s.name}
                  </a>
                  {": "}
                  {s.description}
                </li>
              ))}
            </ul>
          </dd>
        </div>

        <div>
          <dt className="mb-1 font-semibold text-foreground">
            Hva «tvangssalg» betyr i SSB-statistikken
          </dt>
          <dd className="text-text-secondary">
            Et hjemmelsoverføringstall. Alle tall viser tinglyste,{" "}
            <em>gjennomførte</em> tvangssalg, altså der tingretten har
            stadfestet salget og ny eier er registrert. SSB-tabellen teller
            overføringsdokumentet, ikke den bakenforliggende begjæringen.
          </dd>
        </div>

        <div>
          <dt className="mb-1 font-semibold text-foreground">
            Begjæring vs. gjennomført
          </dt>
          <dd className="text-text-secondary">
            Mer enn 90 prosent av begjæringene om tvangssalg ender ikke i
            gjennomført salg: de trekkes, innfris eller henlegges.
            Begjæringsstatistikken (SSB 07218) har ikke publisert tall siden
            januar 2022 på grunn av administrative endringer i
            Brønnøysundregistrene.
          </dd>
        </div>

        <div>
          <dt className="mb-1 font-semibold text-foreground">
            Anonymisering og foreløpige tall
          </dt>
          <dd className="text-text-secondary">
            SSB publiserer ikke kvartals-tall under 3 saker per kategori. De
            to siste publiserte kvartalene er foreløpige og kan revideres.
            Rullerende 4-kvartalers sum er brukt i trendgrafen for å glatte
            ut sesongvariasjon.
          </dd>
        </div>

        <div>
          <dt className="mb-1 font-semibold text-foreground">
            Hvorfor ingen kommune-tall?
          </dt>
          <dd className="text-text-secondary">
            SSB publiserer ikke tvangssalg per kommune eller fylke. Per-adresse
            historikk krever tilgang til Kartverkets grunnbok-API. Verdikart
            har søkt om tilgang og jobber med neste fase av denne rapporten.
          </dd>
        </div>
      </dl>
    </section>
  );
}
