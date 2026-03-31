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
    version: "1.1",
    date: "31. mars 2026",
    label: "Kritiske feilrettinger — koordinater, AI og datanøyaktighet",
    items: [
      { type: "fix", text: "Bergen-koordinater i demo-lenke var 10× feil (60374 → 603893) — alle ikke-Oslo-adresser fikk feil by i kollektivtransportkortet (viste f.eks. «Kristiansand sentrum» i Bergen)" },
      { type: "fix", text: "AI-oppsummering: modell byttet fra google/gemini-2.0-flash-lite-001 (tom respons) til openai/gpt-oss-20b:free; SSE-buffer-parsing rettet for fragmenterte chunks" },
      { type: "fix", text: "Sammenlign-eksempel viste fiktive støydata for Bogstadveien 45 som ikke stemte med rapportsiden — erstattet med tydelig merkede illustrative eksempeladresser" },
      { type: "fix", text: "Hydration-feil (#418) i sidefot: new Date().getFullYear() ga SSR/CSR-mismatch — fikset med suppressHydrationWarning" },
      { type: "improvement", text: "«Sammenlignbare salg» omdøpt til «Kommunalt prissnitt» — gjenspeiler at tallene er kommunegjennomsnitt fra SSB, ikke individuelle transaksjoner" },
      { type: "improvement", text: "Nabolagssider: kvadratmeterpris nå merket «Estimert basert på SSB kommunedata 2024» (ikke direkte SSB-tall, men bydeljustert estimat)" },
    ],
  },
  {
    version: "1.0",
    date: "31. mars 2026",
    label: "Datakvalitet, GDPR & SEO",
    items: [
      { type: "feature", text: "Skoler hentes nå fra Nasjonalt skoleregister (Udir) — viser trinnintervall (1–7 Barneskole, 8–10 Ungdomsskole), elevtall, skolens nettside og offentlig/privat-badge" },
      { type: "feature", text: "Adressesammenligner (/sammenlign) fungerer nå fullt ut — transport og støydata ble ikke hentet riktig pga. API-parsing-feil. Begge er nå rettet" },
      { type: "feature", text: "Strukturerte data utvidet: HowTo-skjema på /kalkulator, SoftwareApplication på /sammenlign — kan gi rikere treff i Google" },
      { type: "improvement", text: "Kriminalitetskort: storbykommune (Oslo, Bergen, Trondheim, Stavanger) viser nå «Storbysnitt» i nøytral blå i stedet for alarmerende oransje — kontekst om bydelsforskjeller inkludert" },
      { type: "improvement", text: "Datakildeetiketter på by- og nabolagssider: alle prisdata merkes nå med «SSB årsgjennomsnitt 2024» direkte under tallene" },
      { type: "improvement", text: "Barnehagesøk: «Søk barnehageplass i kommunen»-lenke lagt til, Oslo/Bergen/Trondheim/Stavanger har egne kommunesider" },
      { type: "improvement", text: "Mobil (390px): statistikkstripe viser ikke lenger avklipt høyre kolonne — padding lagt til" },
      { type: "improvement", text: "AI-oppsummering: tittellinje wrapper ikke lenger over 3 linjer på smal skjerm — badge og tittel holder seg på én linje" },
      { type: "fix", text: "GDPR: «Ikke nå» erstattet med «Avvis alle» + granulær samtykkepanel med separate kategorier for Plausible (nødvendig) og Microsoft Clarity (UX-måling)" },
      { type: "fix", text: "SEO: HTML lang-attributt rettet fra «no» til «nb» (korrekt BCP 47 for bokmål)" },
      { type: "fix", text: "SEO: Ødelagt SearchAction (Google Sitelinks søkeboks) fjernet — URL-mønsteret fungerte ikke og ville gitt tomme resultater" },
      { type: "fix", text: "SEO: OG-bilde og Twitter-kortbilde pekte på ulike filer — begge peker nå på /opengraph-image" },
    ],
  },
  {
    version: "0.9",
    date: "31. mars 2026",
    label: "Stabilitet, ærlighet & AI",
    items: [
      { type: "fix", text: "React hydration-feil (#418/#423) fjernet på hjemmeside og rapportsider — animerte komponenter bruker nå Framer Motions innebygde viewport-detektor i stedet for React state" },
      { type: "fix", text: "AI-oppsummering fungerer igjen — OpenRouter-modell oppdatert fra avviklet gemini-flash-1.5-8b til gemini-2.0-flash-lite-001" },
      { type: "fix", text: "Tallmotsigelse i hero-statistikk rettet: begge steder viser nå 47 kommuner og 4 datakilder" },
      { type: "fix", text: "Støynivå-illustrasjon i «Slik fungerer det»-seksjonen viste oppdiktet verdi for en ekte adresse — erstattet med nøytral kildeetikkett" },
      { type: "fix", text: "Feil OpenGraph-tittel på FAQ, Kontakt, Endringslogg, Datakilder og Presse — alle sider har nå unike OG-titler for korrekt deling i sosiale medier" },
      { type: "improvement", text: "SSB-periode vises nå som «Årsgjennomsnitt 2024» i sammenlignbare salg, og «Q4 2024» i pristrend — med forklaring om SSBs publiseringsfrekvens" },
      { type: "improvement", text: "Cookiebanner vises igjen etter 30 dager for brukere som tidligere valgte «Ikke nå»" },
      { type: "improvement", text: "Kriminalitetskort: Oslo-spesifikk kontekstuell note plassert direkte ved siden av badge" },
      { type: "improvement", text: "Søkefelt i navbar: «Kontakt»-lenke synlig på alle skjermstørrelser" },
      { type: "improvement", text: "Sammenligningstabell: kortere radtekster for bedre lesbarhet på mobil (390px)" },
    ],
  },
  {
    version: "0.8",
    date: "31. mars 2026",
    label: "Kvalitet & pålitelighet",
    items: [
      { type: "fix", text: "URL-rute for blogg endret fra /blog til /blogg — korrekt norsk" },
      { type: "fix", text: "Støykortet viser nå en tydelig melding når data ikke er tilgjengelig for adressen, i stedet for å forsvinne stille" },
      { type: "improvement", text: "Kriminalitetskort: tydeligere kontekstuell advarsel om at tall gjelder hele kommunen, ikke enkeltbydeler" },
      { type: "improvement", text: "Sammenligningstabell: overskriftskort og avkrysningskolonner er nå i ett felles rutenett — ingen mer feiljustering" },
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
