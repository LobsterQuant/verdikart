import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vilkår for bruk: Verdikart",
  description: "Vilkår for bruk av Verdikart. Les om rettigheter, ansvarsbegrensning og datakilder.",
  alternates: { canonical: "https://verdikart.no/vilkar" },
};

export default function Vilkar() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background text-foreground px-6 py-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Vilkår for bruk</h1>
        <p className="text-lg text-text-secondary leading-relaxed mb-12">
          Ved å bruke Verdikart aksepterer du disse vilkårene. Les dem nøye.
        </p>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">1. Om tjenesten</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Verdikart er et informasjonsverktøy for norske boligkjøpere. Tjenesten
            sammenstiller offentlig tilgjengelig data om kollektivtransport,
            prisutvikling og markedsdata for å gi deg bedre beslutningsgrunnlag ved boligkjøp.
            Verdikart er ikke en eiendomsmegler og gir ikke finansiell rådgivning.
          </p>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">2. Ingen garanti</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Informasjonen på Verdikart er basert på offentlige datakilder og
            presenteres «som den er». Vi kan ikke garantere at all informasjon er
            fullstendig, nøyaktig eller oppdatert til enhver tid. Data fra
            tredjepartskilder (Kartverket, Entur, SSB, Geonorge) kan inneholde
            feil eller forsinkelser som vi ikke er ansvarlige for.
          </p>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">3. Ansvarsbegrensning</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Verdikart er ikke ansvarlig for beslutninger tatt på grunnlag av
            informasjon fra tjenesten. Vi anbefaler alltid å innhente
            profesjonell rådgivning: fra eiendomsmegler, takstmann eller
            advokat: ved kjøp av bolig. Verdikart kan ikke holdes ansvarlig
            for direkte eller indirekte tap som følge av bruk av tjenesten.
          </p>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">4. Tillatt bruk</h2>
          <p className="text-sm leading-relaxed text-text-secondary mb-4">
            Du kan bruke Verdikart til personlig, ikke-kommersiell informasjonsinnhenting.
            Følgende er ikke tillatt:
          </p>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">-</span>
              <span>Automatisert scraping eller maskinell innhøsting av data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">-</span>
              <span>Kommersiell viderebruk av data fra tjenesten uten avtale</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">-</span>
              <span>Forsøk på å omgå tekniske sikkerhetstiltak</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">-</span>
              <span>Bruk som er i strid med norsk lov</span>
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">5. Immaterielle rettigheter</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Alt innhold, design og kode på Verdikart er beskyttet av opphavsrett
            og tilhører Verdikart. Underliggende data tilhører de respektive
            offentlige datakildene og er underlagt deres lisenser (Norsk lisens for
            offentlige data: NLOD).
          </p>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">6. Tilgjengelighet</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Vi tilstreber høy oppetid, men kan ikke garantere at tjenesten alltid
            er tilgjengelig. Vedlikehold, oppdateringer eller feil hos
            tredjepart kan føre til midlertidige avbrudd. Vi er ikke ansvarlige
            for tap som følge av utilgjengelighet.
          </p>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">7. Personvern</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Vår behandling av personopplysninger er beskrevet i{" "}
            <a href="/personvern" className="text-accent hover:underline">personvernerklæringen</a>.
            Denne utgjør en integrert del av disse vilkårene.
          </p>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">8. Endringer av vilkår</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Vi kan oppdatere disse vilkårene. Vesentlige endringer varsles via
            banneret på nettstedet minst 14 dager før de trer i kraft. Fortsatt
            bruk etter varslingsperioden utgjør aksept av de oppdaterte vilkårene.
          </p>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">9. Gjeldende lov</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Disse vilkårene er underlagt norsk lov. Eventuelle tvister skal løses
            ved norske domstoler med verneting i Oslo.
          </p>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6">
          <h2 className="text-xl font-semibold mb-3">10. Kontakt</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Spørsmål om vilkårene? Kontakt oss på{" "}
            <a
              href="mailto:kontakt@verdikart.no"
              className="text-accent hover:underline"
            >
              kontakt@verdikart.no
            </a>
            . Sist oppdatert: mars 2026.
          </p>
        </section>
      </div>
    </div>
  );
}
