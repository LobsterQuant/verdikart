import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, Shield, ExternalLink } from "lucide-react";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Datakilder og metodologi | Verdikart",
  description: "Alle datakilder Verdikart bruker: SSB, Kartverket og Entur. Oppdateringsfrekvenser, begrensninger og metodologi for prisanalyse, kollektivdata og eiendomsoppslag.",
  alternates: { canonical: "https://verdikart.no/data" },
};

const sources = [
  {
    name: "Kartverket",
    url: "https://kartverket.no",
    icon: "🗺️",
    tagline: "Adresse- og eiendomsdata",
    description: "Kartverket forvalter det nasjonale eiendoms-, adresse- og forvaltningsregisteret (Matrikkelen). Verdikart bruker Kartverkets åpne adresse-API (ws.geonorge.no) for adressesøk, koordinatoppslag og omvendt geokoding.",
    frequency: "Sanntids (live API)",
    coverage: "Alle norske kommuner — 2,5M+ adresser",
    license: "Norsk lisens for offentlige data (NLOD)",
    licenseUrl: "https://data.norge.no/nlod/no/2.0",
    endpoints: [
      { label: "Adressesøk", url: "https://ws.geonorge.no/adresser/v1/sok" },
      { label: "Punktsøk (reverse geocode)", url: "https://ws.geonorge.no/adresser/v1/punktsok" },
    ],
    limitations: "Kartverkets API dekker offisielle gateadresser. Ikke alle gårdsbruk, hytteadresser eller umatrikulerte eiendommer er dekket.",
  },
  {
    name: "Entur",
    url: "https://entur.no",
    icon: "🚌",
    tagline: "Kollektivtransportdata",
    description: "Entur er den nasjonale reiseplanleggeren for kollektivtransport i Norge. Verdikart bruker Enturs Journey Planner API (GraphQL) for å hente holdeplasser innen gangavstand, linjenumre og avganger for ethvert koordinat.",
    frequency: "Sanntids (live API med avgangsprognoser)",
    coverage: "Hele Norge — buss, trikk, T-bane, ferge, tog",
    license: "CC0 / Norsk lisens for offentlige data (NLOD)",
    licenseUrl: "https://developer.entur.org/pages-intro-licensing",
    endpoints: [
      { label: "Journey Planner GraphQL", url: "https://api.entur.io/journey-planner/v3/graphql" },
      { label: "Geocoder (holdeplassoppslag)", url: "https://api.entur.io/geocoder/v1/autocomplete" },
    ],
    limitations: "Avgangsprognoser er tilgjengelig for de neste 2 timene. Historiske avganger er ikke tilgjengelig via åpent API.",
  },
  {
    name: "SSB",
    url: "https://www.ssb.no",
    icon: "📊",
    tagline: "Boligprisstatistikk",
    description: "Statistisk sentralbyrå (SSB) publiserer offisiell boligprisstatistikk per kommune og bydel. Verdikart bruker SSBs åpne statistikk-API for å hente kvadratmeterpris, prisindeks og historisk utvikling.",
    frequency: "Kvartalsvis (oppdateres ~6 uker etter kvartalsslutt)",
    coverage: "Alle norske kommuner. Bydelsnivå for Oslo.",
    license: "Creative Commons CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/deed.no",
    endpoints: [
      { label: "Statistikktabell — boligpriser", url: "https://data.ssb.no/api/v0/no/table/06035" },
    ],
    limitations: "SSB-data er aggregert på kommunenivå, ikke per adresse. Kvadratmeterprisen er et kommunegjennomsnitt — prisen på en konkret bolig avhenger av etasje, stand, beliggenhet internt i kommunen m.m.",
  },
];

const methodology = [
  {
    title: "Prisanalyse",
    body: "Prisdata fra SSB er gjennomsnittlig kvadratmeterpris for omsatte boliger i kommunen, siste tilgjengelige kvartal. Vi viser YoY (år over år) endring som prosentpoeng mot samme kvartal forrige år. Kommunenummer brukes som nøkkel for å kople adresse til prisstastistikk.",
  },
  {
    title: "Kollektivdekning",
    body: "Vi sender koordinatene fra adresseoppslaget til Enturs Journey Planner API og spør etter alle holdeplasser innen 800 meters radius. Vi filtrerer på transport mode (buss, trikk, T-bane, ferge) og returnerer de 5 nærmeste med gangtid beregnet som luftlinjeavstand ÷ 80m/min.",
  },
  {
    title: "Støy og miljø",
    body: "Støydata hentes fra Kartverkets WMS-tjeneste for vei- og flystøy (Lden-verdier). Dataen er en modell basert på trafikkregistrering og er ikke en individuell måling. Usikkerhetsmarginen er ±3–5 dB.",
  },
  {
    title: "Sammenlignbare salg",
    body: "Vi bruker SSBs kommunebaserte kvadratmeterprisstatistikk som proxy for sammenlignbare salg. Individuelle transaksjonsdata fra Eiendomsverdi AS er ikke tilgjengelig via åpent API. Tallene er aggregerte gjennomsnitt og ikke individuelle salgspriser.",
  },
];

export default function DataPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Datakilder og metodologi — Verdikart",
    description: metadata.description,
    url: "https://verdikart.no/data",
  };

  return (
    <>
      <JsonLd schema={schema} />
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">

          <div className="mb-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Åpenhet</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Datakilder og metodologi</h1>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Verdikart er bygget på åpne offentlige data. Her er en fullstendig oversikt over hvilke datakilder vi bruker, oppdateringsfrekvenser og kjente begrensninger.
            </p>
          </div>

          {/* Sources */}
          <div className="space-y-6 mb-12">
            {sources.map((src) => (
              <div key={src.name} className="rounded-xl border border-card-border bg-card-bg p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden>{src.icon}</span>
                    <div>
                      <h2 className="font-bold text-lg leading-tight">{src.name}</h2>
                      <p className="text-xs text-text-tertiary">{src.tagline}</p>
                    </div>
                  </div>
                  <a href={src.url} target="_blank" rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-card-border bg-background px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground">
                    <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                    {src.url.replace("https://", "")}
                  </a>
                </div>

                <p className="mb-4 text-sm leading-relaxed text-text-secondary">{src.description}</p>

                <dl className="mb-4 grid grid-cols-1 gap-2 rounded-lg bg-background p-4 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-text-tertiary">Oppdatering</dt>
                    <dd className="font-medium text-foreground">{src.frequency}</dd>
                  </div>
                  <div>
                    <dt className="text-text-tertiary">Dekning</dt>
                    <dd className="font-medium text-foreground">{src.coverage}</dd>
                  </div>
                  <div>
                    <dt className="text-text-tertiary">Lisens</dt>
                    <dd>
                      <a href={src.licenseUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">
                        {src.license}
                      </a>
                    </dd>
                  </div>
                </dl>

                {src.endpoints.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">API-endepunkter vi bruker</p>
                    <ul className="space-y-1">
                      {src.endpoints.map(({ label, url }) => (
                        <li key={url} className="flex items-center gap-2 text-xs">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                          <span className="text-text-secondary">{label}:</span>
                          <a href={url} target="_blank" rel="noopener noreferrer"
                            className="truncate font-mono text-accent hover:underline">{url}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-400">
                  <strong>Begrensning: </strong>{src.limitations}
                </div>
              </div>
            ))}
          </div>

          {/* Methodology */}
          <section className="mb-10">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold">
              <RefreshCw className="h-5 w-5 text-accent" strokeWidth={1.5} />
              Metodologi
            </h2>
            <div className="space-y-4">
              {methodology.map(({ title, body }) => (
                <div key={title} className="rounded-xl border border-card-border bg-card-bg p-5">
                  <h3 className="mb-2 font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Privacy note */}
          <section className="rounded-xl border border-card-border bg-card-bg p-5">
            <h2 className="mb-2 flex items-center gap-2 font-semibold">
              <Shield className="h-4 w-4 text-accent" strokeWidth={1.5} />
              Ingen brukerdata
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Verdikart lagrer ikke adressene du søker på. Søk gjøres direkte mot tredjeparts-APIene uten å passere gjennom vår database. Se{" "}
              <Link href="/personvern" className="text-accent hover:underline">personvernerklæringen</Link> for detaljer.
            </p>
          </section>

        </div>
      </div>
    </>
  );
}
