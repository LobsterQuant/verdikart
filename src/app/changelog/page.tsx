import type { Metadata } from "next";
import { GitCommit, Zap, Bug, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Endringslogg | Verdikart",
  description: "Se hva som er nytt i Verdikart. Vi oppdaterer jevnlig med nye funksjoner, forbedringer og feilrettinger.",
  alternates: { canonical: "https://verdikart.no/changelog" },
  openGraph: {
    title: "Endringslogg — Verdikart",
    description: "Se hva som er nytt i Verdikart. Nye funksjoner, forbedringer og feilrettinger.",
    url: "https://verdikart.no/changelog",
    siteName: "Verdikart",
    locale: "nb_NO",
    type: "website",
  },
};

type ChangeType = "feature" | "fix" | "improvement";

interface ChangeEntry {
  version: string;
  date: string;
  label: string;
  items: Array<{ type: ChangeType; text: string }>;
}

const changelog: ChangeEntry[] = [
  {
    version: "0.8",
    date: "31. mars 2026",
    label: "Kvalitet & pålitelighet",
    items: [
      { type: "fix", text: "URL-rute for blogg endret fra /blog til /blogg — korrekt norsk" },
      { type: "fix", text: "Støykortet viser nå en tydelig melding når data ikke er tilgjengelig for adressen, i stedet for å forsvinne stille" },
      { type: "improvement", text: "Kriminalitetskort: tydeligere kontekstuell advarsel om at tall gjelder hele kommunen, ikke enkeltbydeler" },
      { type: "improvement", text: "Oslo-spesifikk note: Frogner og Majorstuen har historisk lavere kriminalitet enn kommunesnittet" },
      { type: "improvement", text: "Sammenligningstabell: overskriftskort og avkrysningskolonner er nå i ett felles rutenett — ingen mer feiljustering" },
      { type: "improvement", text: "Brukeranmeldelser erstattet med spesifikke, situasjonsbaserte sitater fra norske boligkjøpere" },
      { type: "feature", text: "FAQ-seksjon og JSON-LD FAQPage-skjema lagt til for boligselgere" },
      { type: "feature", text: "Preconnect-hint for Kartverket, Entur og SSB — raskere rapportlasting" },
    ],
  },
  {
    version: "0.7",
    date: "30. mars 2026",
    label: "Navigasjon & innhold",
    items: [
      { type: "feature", text: "Felles SiteFooter-komponent på alle sider" },
      { type: "feature", text: "Sammenlign-siden har nå eksempelforhåndsvisning når ingen adresse er valgt" },
      { type: "feature", text: "\"Hvorfor er dette gratis?\"-seksjon på forsiden" },
      { type: "feature", text: "Avmeldingsside (/avmeld) med ett klikk — GDPR-krav" },
      { type: "fix", text: "Mobilvisning: hero-tekst og tabs fikset for xs-skjermer" },
      { type: "improvement", text: "Navigasjonsbar: transparent øverst, frostet glass ved scroll" },
      { type: "improvement", text: "Hero-kopi: fokus på utbytte («Er nabolaget verdt prisen?») i stedet for funksjoner" },
      { type: "feature", text: "Sosial bevisstripe med rapportteller og karusell" },
    ],
  },
  {
    version: "0.6",
    date: "30. mars 2026",
    label: "Rapportside & SEO",
    items: [
      { type: "improvement", text: "Rapportside: fullt-bred kartstripe øverst, AI-oppsummering over brettet" },
      { type: "improvement", text: "Redaksjonelt rutenett: 2/3 hovedinnhold + 1/3 sticky sidebar" },
      { type: "feature", text: "Nabolagssider med lenker til nærliggende nabolag" },
      { type: "feature", text: "Sammenligningstabell: 3-kolonne produktkort med ikonrekker" },
      { type: "feature", text: "JSON-LD FAQPage lagt til for førstegangskjøper, boliginvestor og barnefamilier" },
      { type: "improvement", text: "Open Graph og Twitter Card-metadata komplett på alle sider" },
      { type: "feature", text: "Apple Touch Icon (180×180)" },
    ],
  },
  {
    version: "0.5",
    date: "30. mars 2026",
    label: "Design & SEO",
    items: [
      { type: "feature", text: "By-landingssider for Oslo, Bergen og Trondheim med lokal SEO-innhold og FAQ" },
      { type: "feature", text: "JSON-LD strukturert data: FAQPage, LocalBusiness, BreadcrumbList og RealEstateListing" },
      { type: "improvement", text: "Ny fargepallette med indigo/slate-toner — dypere og mer profesjonelt utseende" },
      { type: "improvement", text: "Gradient headline og noise-tekstur på hero-seksjonen" },
      { type: "improvement", text: "Søkefelt med gradient border og glow-effekt" },
      { type: "improvement", text: "Feature cards med 3D-tilt og spotlight hover-effekter" },
      { type: "feature", text: "Animasjoner: staggered fade-up på hero, count-up tall i demoen, sparkline draw-animasjon" },
      { type: "feature", text: "Microsoft Clarity integrert for varmekart og sesjonopptak" },
      { type: "fix", text: "Kartvisning byttet til CartoDB DarkMatter tiles — ikke lenger svart" },
      { type: "fix", text: "Kontrastforhold for tertær tekst økt til 4.6:1 (WCAG AA)" },
    ],
  },
  {
    version: "0.4",
    date: "29. mars 2026",
    label: "Sikkerhet & ytelse",
    items: [
      { type: "feature", text: "Sikkerhetshoder: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy" },
      { type: "improvement", text: "Lighthouse: 96 ytelse / 100 tilgjengelighet / 100 beste praksis / 100 SEO" },
      { type: "feature", text: "Plausible Analytics — personvernvennlig, ingen cookies" },
      { type: "improvement", text: "GDPR-compliant e-postinnsamling med eksplisitt samtykke og avmeldingslenke" },
    ],
  },
  {
    version: "0.3",
    date: "28. mars 2026",
    label: "Delbare URL-er & ikoner",
    items: [
      { type: "feature", text: "Koordinater kodet direkte i URL-slug — resultatsider er selvstendige og delbare" },
      { type: "improvement", text: "Alle emoji byttet ut med Lucide SVG-ikoner" },
      { type: "improvement", text: "Produktforhåndsvisning på forsiden med reelle eksempeldata" },
      { type: "fix", text: "Ubrukt MapPin-import fjernet" },
    ],
  },
  {
    version: "0.2",
    date: "27. mars 2026",
    label: "Kollektivdata & søk",
    items: [
      { type: "feature", text: "Nærmeste holdeplasser med linje­numre, transportmode og avganger per time" },
      { type: "improvement", text: "Holdeplasser uten avganger filtreres ut automatisk" },
      { type: "improvement", text: "Linjesortering: metro → jernbane → trikk → buss → båt" },
      { type: "feature", text: "Formspree e-postabonnement for prisvarsler og nyhetsbrev" },
    ],
  },
  {
    version: "0.1",
    date: "25. mars 2026",
    label: "Lansering",
    items: [
      { type: "feature", text: "Adressesøk med autofullføring mot Kartverket" },
      { type: "feature", text: "Kollektivkort med Entur live-data" },
      { type: "feature", text: "Prisutviklingskort med SSB-data" },
      { type: "feature", text: "Sammenlignbare salg — gjennomsnittlig kr/m² per kommune" },
      { type: "feature", text: "Kartvisning med holdeplasser og eiendomsmarkør" },
    ],
  },
];

const typeConfig: Record<ChangeType, { icon: React.ElementType; color: string; label: string }> = {
  feature: { icon: Star, color: "text-accent", label: "Ny funksjon" },
  improvement: { icon: Zap, color: "text-yellow-400", label: "Forbedring" },
  fix: { icon: Bug, color: "text-green-400", label: "Feilretting" },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <GitCommit className="h-5 w-5 text-accent" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Endringslogg</h1>
          <p className="mt-3 text-text-secondary">Verdikart er i aktiv utvikling. Her er en oversikt over hva som er nytt.</p>
        </div>

        <div className="space-y-10">
          {changelog.map((entry) => (
            <div key={entry.version}>
              {/* Version header */}
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent">
                  v{entry.version}
                </span>
                <span className="font-semibold">{entry.label}</span>
                <span className="ml-auto text-xs text-text-tertiary">{entry.date}</span>
              </div>

              {/* Items */}
              <div className="space-y-2 rounded-xl border border-card-border bg-card-bg p-4">
                {entry.items.map(({ type, text }) => {
                  const { icon: Icon, color } = typeConfig[type];
                  return (
                    <div key={text} className="flex items-start gap-2.5 py-1">
                      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} strokeWidth={1.5} />
                      <span className="text-sm text-text-secondary">{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-xs text-text-tertiary">
          Har du forslag til forbedringer?{" "}
          <a href="/kontakt" className="text-accent hover:underline">Send oss en melding.</a>
        </div>
      </div>
    </div>
  );
}
