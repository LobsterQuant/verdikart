import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Waves,
  Mountain,
  CloudRainWind,
  Activity,
  AlertTriangle,
  Thermometer,
  ArrowRight,
} from "lucide-react";
import AddressSearch from "@/components/AddressSearch";
import JsonLd from "@/components/JsonLd";
import {
  KLIMA_POENG_LANDING_DATA,
  type KlimaKommuneScoreRow,
  type KlimaComparisonRow,
  type KlimaComparisonSide,
} from "@/data/klima-poeng-landing-data";

const PAGE_URL = "https://verdikart.no/klima-poeng";

// ISR: rebuild the rendered HTML every 24h. The underlying NVE/Kartverket WMS
// queries live in src/data/klima-poeng-landing-data.ts (regenerated monthly
// via scripts/refresh-klima-poeng-landing.ts), so a rebuild only re-renders
// the pre-computed snapshot — no WMS load per page view.
export const revalidate = 86_400;

export const metadata: Metadata = {
  title: "Klima-poeng: Hvor trygg er din bolig fra klimarisiko? | Verdikart",
  description:
    "Klima-poeng måler klima- og naturrisiko per adresse, fra 0 til 100. Seks vektede komponenter — flom, kvikkleire, skred, stormflo 2100, radon og fylkesvis klimaprofil. Se top og bunn-10 kommuner og sammenligninger.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Klima-poeng: Er din bolig klimatrygg?",
    description:
      "0 – 100 score per adresse, basert på NVE, Kartverket, NCCS og DSA. Se hvor trygg eller utsatt din kommune er.",
    url: PAGE_URL,
    siteName: "Verdikart",
    locale: "nb_NO",
    type: "article",
    images: [
      {
        url: `${PAGE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Klima-poeng: Er din bolig klimatrygg?",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Klima-poeng: Er din bolig klimatrygg?",
    description:
      "0 – 100 score per adresse, basert på NVE, Kartverket, NCCS og DSA.",
    images: [
      {
        url: `${PAGE_URL}/opengraph-image`,
        alt: "Klima-poeng: Er din bolig klimatrygg?",
      },
    ],
  },
};

interface MethodologyComponent {
  id: string;
  weight: string;
  title: string;
  Icon: typeof Waves;
  blurb: string;
  thresholds: ReadonlyArray<readonly [string, string]>;
  source: string;
}

const METHODOLOGY: ReadonlyArray<MethodologyComponent> = [
  {
    id: "flom",
    weight: "20%",
    title: "Flomrisiko",
    Icon: Waves,
    blurb:
      "NVEs flomsonekart (200-års-flom) og aktsomhetskart for flom slås sammen til en tre-trinns vurdering. Punktet sammenlignes mot polygoner fra Norges hovedflomvarsler — utenfor flomsone og aktsomhet er Lav, innenfor aktsomhet er Moderat, innenfor selve flomsonen er Høy.",
    thresholds: [
      ["Lav (utenfor)", "100"],
      ["Ukjent (utenfor coverage)", "60"],
      ["Moderat (aktsomhet)", "40"],
      ["Høy (i flomsone)", "0"],
    ],
    source: "NVE Flomsone1 + FlomAktsomhet1 WMS",
  },
  {
    id: "kvikkleire",
    weight: "20%",
    title: "Kvikkleire-faresone",
    Icon: AlertTriangle,
    blurb:
      "NVEs kvikkleirefaresonekart angir områder med dokumentert risiko for kvikkleireskred — den utløsende faktoren bak Gjerdrum-skredet i 2020. Punktet er enten innenfor eller utenfor en faresone; binær scoring fordi konsekvensen ved utløsning er katastrofal.",
    thresholds: [
      ["Utenfor faresone", "100"],
      ["Innenfor faresone", "0"],
    ],
    source: "NVE Kvikkleire2 WMS",
  },
  {
    id: "skred",
    weight: "20%",
    title: "Skred (jord, stein, snø)",
    Icon: Mountain,
    blurb:
      "Tre NVE-aktsomhetskart slås sammen — jord-/flomskred, steinsprang og snøskred. Hvert lag er binært på punktet, men summen reflekterer kumulativ eksponering: ett treff drar moderat, to eller flere treff drar hardt. Urbane adresser treffer nesten aldri disse, så et treff er et reelt signal.",
    thresholds: [
      ["Ingen aktsomhet", "100"],
      ["1 aktsomhetsområde", "50"],
      ["2 eller flere", "20"],
    ],
    source: "NVE JordFlomskredAktsomhet, SkredSteinAktR, SnoskredAktsomhet WMS",
  },
  {
    id: "stormflo",
    weight: "15%",
    title: "Stormflo 2100",
    Icon: CloudRainWind,
    blurb:
      "Kartverkets stormflo-kart gir tre nestede klimaframskrivinger: 20-årsstormflo nå (allerede utsatt), 200-årsstormflo år 2100 (typisk klimaframskriving) og 1000-årsstormflo år 2100 (ekstremutfall). Mest umiddelbar sone vinner — 20-år-nå er et flomvarsel for normale stormer i dag.",
    thresholds: [
      ["Utenfor alle soner", "100"],
      ["I 1000-år 2100 (ekstremtilfelle)", "70"],
      ["I 200-år 2100", "50"],
      ["I 20-år nå (utsatt i dag)", "0"],
    ],
    source: "Kartverket stormflo havnivå WMS",
  },
  {
    id: "radon",
    weight: "10%",
    title: "Radon",
    Icon: Activity,
    blurb:
      "Per-kommune radonvurdering basert på DSA og NGUs aktsomhetskart. Kun ~18 kommuner har eksplisitt vurdering hos oss; for resten redistribueres vekten til de øvrige fem komponentene i stedet for å imputere et nøytralt tall. Radon varierer på meterskala (alunskifer ⇄ granitt) — DSA anbefaler alltid målinger.",
    thresholds: [
      ["Lav", "100"],
      ["Moderat", "60"],
      ["Høy", "20"],
      ["Ikke vurdert", "vekt redistribueres"],
    ],
    source: "DSA + NGU radon-aktsomhetskart (per-kommune sammendrag)",
  },
  {
    id: "klimaprofil",
    weight: "15%",
    title: "Klimaprofil (fylke)",
    Icon: Thermometer,
    blurb:
      "Norsk Klimaservicesenters fylkesvise klimaprofiler oppsummerer fem framskrivinger til 2100 under RCP8.5: temperaturendring (°C), nedbørendring (%), og tre kvalitative buckets for flom, tørke og skredøkning. Kun fylke-oppløsning — Hordaland og Nordland har høyere score-drag enn Oslo og Akershus.",
    thresholds: [
      ["Lav økning på de fleste indikatorene", "85+"],
      ["Moderat profil (typisk Østland)", "60-80"],
      ["Høy økning (vestkyst, Nord-Norge)", "30-55"],
    ],
    source: "Norsk Klimaservicesenter (NCCS) fylkesprofiler",
  },
];

const FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "Hva er Klima-poeng?",
    a: "Klima-poeng er Verdikarts kompositt-score for klima- og naturrisiko per adresse, en verdi fra 0 til 100 hvor høyere er tryggere. Seks komponenter — flom, kvikkleire, skred, stormflo 2100, radon og fylkesvis klimaprofil — vektes til en samlet sum. Tanken er å gi kjøpere ett tall som oppsummerer hvor utsatt en bolig er, uten å erstatte en geoteknisk rapport eller takst.",
  },
  {
    q: "Hvor kommer dataene fra?",
    a: "Flom, kvikkleire og skred kommer fra NVEs offentlige WMS-tjenester (CC BY 4.0 / NLOD). Stormflo 2100 kommer fra Kartverkets havnivå-WMS. Radon er per-kommune sammendrag fra DSA og NGUs aktsomhetskart. Klimaprofil er fylkesvise framskrivinger fra Norsk Klimaservicesenter. Vi gjør ingen modellering selv — vi henter punktdata fra disse tjenestene og kombinerer dem etter en åpen formel som er beskrevet i metodologi-seksjonen over.",
  },
  {
    q: "Hvorfor er radon \"Ikke vurdert\" for min kommune?",
    a: "Den autoritative radon-aktsomhetskartdatabasen (NGU + DSA, 1:50 000) klassifiserer på grunnforhold, ikke på kommunenivå — det finnes ingen offisielt publisert per-kommune oversikt vi kan hente automatisk. Vi har manuelt kodet de 18 kommunene der dataen er tydeligst (Oslo, Bergen, Trondheim, og lignende), men resten markeres som \"Ikke vurdert\". I de tilfellene redistribueres radonvekten (10 %) jevnt over de fem andre komponentene i stedet for å gjette et nøytralt tall.",
  },
  {
    q: "Hva betyr \"stormflo 200-år 2100\"?",
    a: "Kartverket beregner havnivå- og stormflo-kart for ulike returperioder (20, 200 og 1000 år) under klimaframskrivingen for år 2100. \"200-år 2100\" betyr et område som vil oversvømmes statistisk én gang per 200 år gitt det forventede havnivået i 2100. \"20-år nå\" betyr områder som allerede er utsatt for stormflo én gang per 20 år, altså adresser hvor flomrisiko er reell i dag og ikke bare i framtidsscenarier.",
  },
  {
    q: "Kan jeg stole på denne scoren for kjøpsbeslutning?",
    a: "Klima-poeng er et godt screening-verktøy, men ikke en erstatning for fagvurderinger. WMS-tjenestene har punktoppløsning ned til ~10 m, men kvikkleire og kvartærgeologi kan variere over noen titalls meter — en geoteknisk rapport er nødvendig før kjøp av tomt eller bolig i grenseland. Klimaprofilen er fylke-oppløst og fanger ikke lokale mikroklima. Bruk Klima-poeng for å prioritere hvilke adresser du vil grave dypere i, ikke som siste ord.",
  },
  {
    q: "Hvorfor er kommunesentrum brukt som målepunkt?",
    a: "Top- og bunn-listene scorer ett representativt punkt per kommune, ikke et snitt over alle adresser. For de største ~115 kommunene har vi hand-plukket sentrum (rådhus, torget, eller kollektivknutepunkt). For de øvrige distrikt-kommunene bruker vi Kartverkets representative interior-koordinat fra kommuneinfo-API. For sprawling fjell-kommuner kan dette punktet ligge på fjellsider som NVE-aktsomhetskartene flagger — det er reelt signal for det punktet, men ikke nødvendigvis for kommunesenteret der folk faktisk bor. Bruk per-adresse scoring for å sjekke din konkrete bolig.",
  },
  {
    q: "Oppdateres dataene?",
    a: "Per-adresse scoring slår mot live WMS-tjenestene hver gang en eiendomsside besøkes, med 24 timers cache per adresse. Top/bunn-listene og sammenligningene på denne siden oppdateres månedlig via et manuelt skript for å unngå unødig WMS-belastning. NVEs aktsomhetskart republiseres typisk én gang per år; Kartverkets stormflo er stabil siden 2018. Klimaprofilene fra NCCS er fra 2021 og venter på republisering på 2025-grunnlag.",
  },
  {
    q: "Hvorfor bruker dere pre-2024 fylker for klimaprofil?",
    a: "Norsk Klimaservicesenter publiserer fylkesvise klimaprofiler på den gamle fylkesstrukturen (Hedmark, Sogn og Fjordane, etc.). Miljødirektoratet annonserte i okt. 2025 at profilene skal republiseres på den nye 15-fylkers-strukturen, men ingen ferdigstillelsesdato er gitt. Vi mapper moderne kommunenummer til riktig pre-2024-fylkesprofil; når NCCS republiserer fjernes denne mappingen og fylkesnavnene blir konsistente med dagens administrative inndeling.",
  },
];

function scoreColorClass(score: number): string {
  if (score >= 85) return "text-accent";
  if (score >= 70) return "text-accent-hover";
  if (score >= 55) return "text-foreground";
  if (score >= 35) return "text-warm";
  return "text-text-secondary";
}

export default function KlimaPoengLanding() {
  const {
    topSafe,
    bottomExposed,
    comparisons,
    generatedAt,
    candidatesScored,
  } = KLIMA_POENG_LANDING_DATA;
  const safest = topSafe[0];
  const mostExposed = bottomExposed[0];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hjem", item: "https://verdikart.no" },
      { "@type": "ListItem", position: 2, name: "Klima-poeng", item: PAGE_URL },
    ],
  };

  return (
    <>
      <JsonLd schema={[faqSchema, breadcrumb]} />
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
          <nav
            aria-label="Brødsmuler"
            className="mb-10 flex items-center gap-1.5 text-xs text-text-tertiary"
          >
            <Link href="/" className="transition-colors hover:text-foreground">
              Hjem
            </Link>
            <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
            <span className="text-text-secondary">Klima-poeng</span>
          </nav>

          <HeroSection safest={safest} mostExposed={mostExposed} />

          <TopSafeSection
            rows={topSafe}
            generatedAt={generatedAt}
            candidatesScored={candidatesScored}
          />

          <BottomExposedSection rows={bottomExposed} />

          <MethodologySection />

          <ComparisonSection rows={comparisons} />

          <DataSourcesSection />

          <FaqSection />

          <CtaSection />

          <footer className="mt-8 border-t border-card-border pt-6 text-xs text-text-tertiary">
            <p>
              Klima-poeng er en del av Verdikarts komposittscorer for norsk
              bolig. Tall og metodologi oppdateres jevnlig. For
              presseforespørsler, kontakt{" "}
              <a
                href="mailto:presse@verdikart.no"
                className="underline underline-offset-2 hover:text-foreground"
              >
                presse@verdikart.no
              </a>
              .
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}

/* ── Hero ────────────────────────────────────────────────────────────────── */

function HeroSection({
  safest,
  mostExposed,
}: {
  safest: KlimaKommuneScoreRow | undefined;
  mostExposed: KlimaKommuneScoreRow | undefined;
}) {
  return (
    <header className="mb-20">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Komposittscore · 0 – 100
      </div>

      <h1 className="display-1 text-foreground">
        Hvor trygg er din bolig fra klimarisiko?
      </h1>

      <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
        Klima-poeng måler hvor utsatt en adresse er for flom, skred,
        kvikkleire, stormflo og radon. Et tall fra 0 til 100, basert på offisielle
        kart fra NVE, Kartverket, Norsk Klimaservicesenter og DSA — hvor høyere
        er tryggere.
      </p>

      <div className="mt-10">
        <AddressSearch />
        <p className="mt-3 text-center text-xs text-text-tertiary">
          Skriv en adresse for å se poenget med fullt komponent-brudd.
        </p>
      </div>

      {safest && mostExposed && (
        <div className="mt-12 grid gap-2 text-xs text-text-tertiary sm:grid-cols-2 sm:gap-x-8">
          <div className="flex flex-wrap items-center gap-x-2">
            <span>Tryggest av byene:</span>
            <span className="font-semibold text-foreground">{safest.kommunenavn}</span>
            <span className="h-1 w-1 rounded-full bg-card-border" aria-hidden />
            <span>
              <strong className="text-accent">{safest.total}</strong> poeng
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2">
            <span>Mest utsatt:</span>
            <span className="font-semibold text-foreground">{mostExposed.kommunenavn}</span>
            <span className="h-1 w-1 rounded-full bg-card-border" aria-hidden />
            <span>
              <strong className="text-warm">{mostExposed.total}</strong> poeng
            </span>
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Top safe kommuner ─────────────────────────────────────────────────── */

function TopSafeSection({
  rows,
  generatedAt,
  candidatesScored,
}: {
  rows: ReadonlyArray<KlimaKommuneScoreRow>;
  generatedAt: string;
  candidatesScored: number;
}) {
  const generated = new Date(generatedAt).toLocaleDateString("nb-NO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <section aria-labelledby="trygge-heading" className="mb-16">
      <div className="mb-6">
        <h2
          id="trygge-heading"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Kommuner med høyest gjennomsnittlig Klima-poeng
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">
          Rangert etter score for ett representativt punkt per kommune. Full
          dekning av alle {candidatesScored} norske kommuner. Tall ferske per{" "}
          {generated}.
        </p>
      </div>

      <KommuneList rows={rows} tone="safe" />

      <p className="mt-4 text-xs text-text-tertiary">
        Kommunesentrum er ett målepunkt — adresser i samme kommune kan ha
        vesentlig høyere eller lavere poeng (fjordbygd vs. dalbunn,
        kystadresse vs. innland). Bruk listen som retningsvisere, ikke fasit.
      </p>
    </section>
  );
}

function BottomExposedSection({
  rows,
}: {
  rows: ReadonlyArray<KlimaKommuneScoreRow>;
}) {
  return (
    <section aria-labelledby="utsatte-heading" className="mb-20">
      <div className="mb-6">
        <h2
          id="utsatte-heading"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Kommuner med lavest gjennomsnittlig Klima-poeng
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">
          Mest klimautsatte kommunesentrum av alle norske kommuner. Drag
          kommer oftest fra stormflo-soner ved kystbyer eller
          skred-aktsomhet rundt fjellfot.
        </p>
      </div>

      <KommuneList rows={rows} tone="exposed" />

      <p className="mt-4 text-xs text-text-tertiary">
        Lav score betyr ikke at boligen er utrygg — det betyr at minst én
        WMS-layer flagger sentrum-punktet. Sjekk komponent-bruddet på
        adresse-siden for å se hvilken risiko som driver tallet.
      </p>
    </section>
  );
}

function KommuneList({
  rows,
  tone,
}: {
  rows: ReadonlyArray<KlimaKommuneScoreRow>;
  tone: "safe" | "exposed";
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-card-border bg-card-bg p-5 text-sm text-text-secondary">
        Ingen data tilgjengelig — kjør oppfriskingsskriptet for å fylle listen.
      </p>
    );
  }
  return (
    <ol className="divide-y divide-card-border overflow-hidden rounded-2xl border border-card-border bg-card-bg">
      {rows.map((row) => (
        <li key={row.kommunenummer}>
          <Link
            href={`/by/${row.slug}`}
            className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-white/[0.02] sm:px-6"
          >
            <span className="w-6 shrink-0 text-center text-sm font-semibold tabular-nums text-text-tertiary">
              {row.rank}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="truncate text-base font-semibold text-foreground">
                  {row.kommunenavn}
                </span>
                <span className="hidden truncate text-xs text-text-tertiary sm:inline">
                  · {row.centerNote}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-text-tertiary">
                <span>{row.fylkesnavn ?? "Ingen klimaprofil"}</span>
                <span>{row.population.toLocaleString("nb-NO")} innb.</span>
                <span>{row.band}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-baseline gap-1">
              <span
                className={`text-2xl font-bold tabular-nums sm:text-3xl ${
                  tone === "safe"
                    ? scoreColorClass(row.total)
                    : "text-warm"
                }`}
              >
                {row.total}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-text-tertiary">
                /100
              </span>
            </div>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5"
              strokeWidth={1.5}
            />
          </Link>
        </li>
      ))}
    </ol>
  );
}

/* ── Methodology ─────────────────────────────────────────────────────── */

function MethodologySection() {
  return (
    <section
      id="metodologi"
      aria-labelledby="metodologi-heading"
      className="mb-20 scroll-mt-24"
    >
      <div className="mb-8">
        <h2
          id="metodologi-heading"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Slik beregnes Klima-poeng
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">
          Seks komponenter, hver scoret 0 til 100 og vektet til en sum. Full
          åpenhet rundt vekter og terskler så du kan etterprøve hvert tall.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-5">
        {METHODOLOGY.map(({ id, weight, title, Icon, blurb, thresholds, source }) => (
          <article
            key={id}
            id={`metodologi-${id}`}
            className="rounded-2xl border border-card-border bg-card-bg p-5 sm:p-6"
          >
            <header className="mb-3 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                  {title}
                </h3>
              </div>
              <span className="shrink-0 font-display text-4xl font-semibold leading-none text-accent tabular-nums sm:text-5xl">
                {weight}
              </span>
            </header>
            <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
              {blurb}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3">
              {thresholds.map(([label, score]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-2 border-b border-card-border/60 py-1 last:border-b-0"
                >
                  <dt className="truncate text-text-secondary">{label}</dt>
                  <dd className="shrink-0 font-semibold tabular-nums text-foreground">
                    {score}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[11px] uppercase tracking-widest text-text-tertiary">
              Kilde: {source}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/5 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Totalformel
        </p>
        <p className="mt-2 text-sm text-foreground sm:text-base">
          Totalscore = 0,20 × flom + 0,20 × kvikkleire + 0,20 × skred + 0,15 ×
          stormflo + 0,10 × radon + 0,15 × klimaprofil
        </p>
        <p className="mt-2 text-xs text-text-tertiary">
          Hver delscore er 0 – 100. Når radon er ikke vurdert (de fleste
          kommuner) redistribueres dens 0,10 jevnt: vektene blir 0,22 / 0,22 /
          0,22 / 0,17 / — / 0,17 og summen rundes til nærmeste hele tall.
        </p>
      </div>
    </section>
  );
}

/* ── Comparisons ─────────────────────────────────────────────────────── */

function ComparisonSection({ rows }: { rows: ReadonlyArray<KlimaComparisonRow> }) {
  if (rows.length === 0) {
    return (
      <section aria-labelledby="sammenligning-heading" className="mb-20">
        <div className="mb-6">
          <h2
            id="sammenligning-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            By-mot-by sammenligninger
          </h2>
        </div>
        <p className="rounded-2xl border border-card-border bg-card-bg p-5 text-sm text-text-secondary">
          Ingen sammenligninger tilgjengelig — kjør oppfriskingsskriptet.
        </p>
      </section>
    );
  }
  return (
    <section aria-labelledby="sammenligning-heading" className="mb-20">
      <div className="mb-6">
        <h2
          id="sammenligning-heading"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          By-mot-by sammenligninger
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">
          Fire klassiske kontraster, hver beregnet med samme motor. Spriket
          viser hvor stor forskjellen er mellom innland og kyst, fjord og
          slette, sør og nord.
        </p>
      </div>

      <div className="space-y-6">
        {rows.map((pair) => (
          <article
            key={pair.pairId}
            className="rounded-2xl border border-card-border bg-card-bg p-5 sm:p-6"
          >
            <header className="mb-4">
              <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                {pair.title}
              </h3>
              <p className="mt-1 text-xs text-text-secondary sm:text-sm">
                {pair.rationale}
              </p>
            </header>
            <div className="grid gap-4 sm:grid-cols-2">
              <ComparisonCard side={pair.left} />
              <ComparisonCard side={pair.right} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ComparisonCard({ side }: { side: KlimaComparisonSide }) {
  const bars: Array<{ label: string; value: string; score: number | null }> = [
    { label: "Flom", value: side.components.flood.value, score: side.components.flood.score },
    { label: "Kvikkleire", value: side.components.quickClay.value, score: side.components.quickClay.score },
    { label: "Skred", value: side.components.skred.value, score: side.components.skred.score },
    { label: "Stormflo", value: side.components.stormSurge.value, score: side.components.stormSurge.score },
    {
      label: "Radon",
      value: side.components.radon.value,
      score: side.components.radon.assessed ? side.components.radon.score : null,
    },
    { label: "Klimaprofil", value: side.components.klimaprofil.value, score: side.components.klimaprofil.score },
  ];
  return (
    <div className="rounded-xl border border-card-border bg-background/50 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-foreground">
            {side.label}
          </h4>
          <p className="mt-0.5 text-[11px] text-text-tertiary">{side.kommunenavn}</p>
        </div>
        <div className="flex shrink-0 items-baseline gap-1">
          <span className={`text-3xl font-bold tabular-nums ${scoreColorClass(side.total)}`}>
            {side.total}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-text-tertiary">
            /100
          </span>
        </div>
      </div>
      <p className="mt-1 text-[11px] text-text-tertiary">
        Band: {side.band}
        {side.fylkesnavn && ` · ${side.fylkesnavn}`}
      </p>
      <dl className="mt-3 space-y-1.5 text-xs">
        {bars.map((b) => (
          <div
            key={b.label}
            className="flex items-baseline justify-between gap-2 border-b border-card-border/40 py-0.5 last:border-b-0"
          >
            <dt className="text-text-secondary">{b.label}</dt>
            <dd className="text-right">
              <span className="text-foreground">{b.value}</span>
              {b.score !== null && (
                <span className="ml-1 font-semibold tabular-nums text-text-tertiary">
                  ({b.score})
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ── Data sources ───────────────────────────────────────────────────────── */

function DataSourcesSection() {
  return (
    <section aria-labelledby="datakilder-heading" className="mb-20">
      <h3
        id="datakilder-heading"
        className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-tertiary"
      >
        Data og kilder
      </h3>
      <dl className="divide-y divide-card-border overflow-hidden rounded-2xl border border-card-border bg-card-bg">
        {[
          {
            k: "NVE — flom, kvikkleire, skred",
            v: "Norges vassdrags- og energidirektorat. Flomsone, aktsomhetskart, kvikkleirefaresoner og tre skred-aktsomhetslag (jord-/flomskred, steinsprang, snøskred). NLOD 2.0 / CC BY 4.0.",
            href: "https://www.nve.no/karttjenester/",
          },
          {
            k: "Kartverket — stormflo og havnivå 2100",
            v: "Statlig kartdataetat. Stormflo-kart for 20-, 200- og 1000-årsstormflo under klimaframskriving 2100. CC BY 4.0.",
            href: "https://kartkatalog.geonorge.no/",
          },
          {
            k: "Norsk Klimaservicesenter (NCCS)",
            v: "Fylkesvise klimaprofiler basert på RCP8.5-framskriving til 2100. Pre-2024 fylkesstruktur (republisering varslet av Miljødirektoratet okt. 2025). NLOD 1.0 + CC BY 4.0.",
            href: "https://klimaservicesenter.no/kss/klimaprofiler/",
          },
          {
            k: "DSA + NGU — radon",
            v: "Direktoratet for strålevern og atomsikkerhet, kombinert med NGUs radon-aktsomhetskart. Per-kommune sammendrag for ~18 kommuner; resten markeres ikke-vurdert.",
            href: "https://www.dsa.no/radon",
          },
        ].map(({ k, v, href }) => (
          <div key={k} className="flex flex-col gap-1 px-5 py-4 sm:px-6">
            <dt className="text-sm font-semibold text-foreground">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-accent"
              >
                {k}
                <ArrowRight className="h-3 w-3 -rotate-45" strokeWidth={1.5} />
              </a>
            </dt>
            <dd className="text-xs text-text-tertiary sm:text-sm">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ── FAQ ────────────────────────────────────────────────────────────────── */

function FaqSection() {
  return (
    <section aria-labelledby="faq-heading" className="mb-20">
      <h2
        id="faq-heading"
        className="mb-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
      >
        Ofte stilte spørsmål
      </h2>
      <div className="divide-y divide-card-border overflow-hidden rounded-2xl border border-card-border bg-card-bg">
        {FAQ.map(({ q, a }) => (
          <details
            key={q}
            className="group px-5 py-4 open:bg-white/[0.02] sm:px-6"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground marker:hidden">
              <span>{q}</span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-text-tertiary transition-transform group-open:rotate-90"
                strokeWidth={1.5}
              />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              {a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ── Bottom CTA ─────────────────────────────────────────────────────────── */

function CtaSection() {
  return (
    <section aria-labelledby="cta-heading" className="mb-16">
      <div className="rounded-3xl border border-accent/30 bg-accent/5 p-6 sm:p-10">
        <h2
          id="cta-heading"
          className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
        >
          Finn klima-poenget for din adresse
        </h2>
        <p className="mt-2 text-sm text-text-secondary sm:text-base">
          Live mot NVE og Kartverket. Du får fullt komponent-brudd, band, og
          alle seks delscorer per adresse.
        </p>
        <div className="mt-6">
          <AddressSearch />
        </div>
      </div>
    </section>
  );
}
