import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Clock,
  Repeat,
  Footprints,
  GitBranch,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import AddressSearch from "@/components/AddressSearch";
import JsonLd from "@/components/JsonLd";
import {
  PENDLINGS_POENG_LANDING_DATA,
  type KommuneScoreRow,
  type ComparisonRow,
} from "@/data/pendlings-poeng-landing-data";
import {
  bandForScore,
  fmtMinutes,
  fmtPerHour,
  fmtKr,
} from "@/lib/scoring/pendlings-poeng-display";

const PAGE_URL = "https://verdikart.no/pendlings-poeng";

// ISR: refresh the rendered HTML every 24h. The underlying Entur numbers come
// from src/data/pendlings-poeng-landing-data.ts (regenerated weekly via
// scripts/refresh-pendlings-poeng-landing.ts) — so a rebuild picks up the
// latest cached snapshot without re-hitting Entur per request.
export const revalidate = 86_400;

export const metadata: Metadata = {
  title: "Pendlings-poeng: Hvor godt egner en adresse seg for pendling? | Verdikart",
  description:
    "Pendlings-poeng måler hvor godt en adresse fungerer for pendling til arbeid. Fra 0 til 100, basert på reisetid, frekvens, gangavstand, bytter og pris. Se top 10 kommuner og metodologien.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Pendlings-poeng: Norges beste pendlings-kommuner",
    description:
      "Live data fra Entur og offentlige kilder. Se hvor godt din adresse scorer.",
    url: PAGE_URL,
    siteName: "Verdikart",
    locale: "nb_NO",
    type: "article",
    images: [
      {
        url: `${PAGE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Pendlings-poeng: Norges beste pendlings-kommuner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pendlings-poeng: Norges beste pendlings-kommuner",
    description:
      "Live data fra Entur og offentlige kilder. Se hvor godt din adresse scorer.",
    images: [
      {
        url: `${PAGE_URL}/opengraph-image`,
        alt: "Pendlings-poeng: Norges beste pendlings-kommuner",
      },
    ],
  },
};

const METHODOLOGY: Array<{
  id: string;
  weight: string;
  title: string;
  Icon: typeof Clock;
  blurb: string;
  thresholds: Array<[string, string]>;
}> = [
  {
    id: "reise",
    weight: "35%",
    title: "Reise til sentrum",
    Icon: Clock,
    blurb:
      "Hvor lang tid tar det å komme seg fra adressen til byens sentrum i rushtiden. Entur planlegger raskeste reise med tog, buss, t-bane eller trikk, kombinert med nødvendig gange. Dette er den tyngst vektede komponenten fordi reisetid er det folk merker mest i hverdagen.",
    thresholds: [
      ["Under 20 min", "100"],
      ["30 min", "80"],
      ["45 min", "60"],
      ["60 min", "40"],
      ["90 min eller mer", "0"],
    ],
  },
  {
    id: "frekvens",
    weight: "25%",
    title: "Avgangsfrekvens",
    Icon: Repeat,
    blurb:
      "Hvor mange avganger det er per time på raskeste linje i morgenrushet (07 til 09). Høy frekvens betyr at en tapt avgang ikke velter planen. Tall under en i timen tyder på at du i praksis må planlegge reisen rundt rutetabellen.",
    thresholds: [
      ["8 eller flere per time", "100"],
      ["6 per time", "80"],
      ["4 per time", "60"],
      ["2 per time", "30"],
      ["1 per time", "10"],
    ],
  },
  {
    id: "gangavstand",
    weight: "15%",
    title: "Gangavstand til holdeplass",
    Icon: Footprints,
    blurb:
      "Hvor langt det er å gå til første holdeplass eller stasjon. Kort gangavstand betyr mindre friksjon når det regner, haster, eller du har barn med. Regnet som meter fra adressekoordinatet til første påstigning i raskeste reisevei.",
    thresholds: [
      ["Under 200 m", "100"],
      ["400 m", "80"],
      ["600 m", "60"],
      ["1 000 m", "30"],
      ["1 500 m eller mer", "0"],
    ],
  },
  {
    id: "bytter",
    weight: "15%",
    title: "Antall bytter",
    Icon: GitBranch,
    blurb:
      "Antall ganger du må bytte transportmiddel for å nå sentrum. Direkteforbindelse gir full score. Hvert bytte reduserer komforten og øker sårbarheten for forsinkelser.",
    thresholds: [
      ["Direkte (0 bytter)", "100"],
      ["1 bytte", "70"],
      ["2 bytter", "40"],
      ["3 eller flere", "0"],
    ],
  },
  {
    id: "pris",
    weight: "10%",
    title: "Månedskort",
    Icon: CreditCard,
    blurb:
      "Estimert pris på månedskort hos kommunens kollektivselskap, basert på avstand og sonestruktur. Lav vekt (10%) fordi pris varierer mindre mellom adresser enn de fire andre komponentene.",
    thresholds: [
      ["≤ 900 kr", "100"],
      ["1 200 kr", "80"],
      ["1 500 kr", "60"],
      ["1 800 kr", "40"],
      ["2 000 kr eller mer", "0"],
    ],
  },
];

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Hvorfor bruker dere rushtid?",
    a: "De fleste pendler mellom 07 og 09 og igjen mellom 15 og 17. Rushtiden er ofte langsommere enn midt på dagen, og frekvensen på noen linjer topper seg bare i denne perioden. Å måle utenom rush ville overvurdert flere adresser betydelig. Vi bruker førstkommende tirsdag 08:00 Oslo-tid som referansetidspunkt.",
  },
  {
    q: "Hva hvis jeg pendler til en annen by enn deres referansesenter?",
    a: "Pendlings-poeng måler mot nærmeste av seks regionale sentra: Oslo S, Bergen Torgallmenningen, Trondheim sentralstasjon, Stavanger stasjon, Tromsø sentrum og Kristiansand rutebilstasjon. For mange vestlandskommuner betyr det Bergen, for Østfold og Vestfold betyr det Oslo. Hvis din arbeidsplass ligger et annet sted, er poenget fortsatt en god proxy for kollektivtilbudet fra adressen.",
  },
  {
    q: "Tar dere høyde for forsinkelser?",
    a: "Nei. Entur gir oss planlagt reisetid, ikke sanntids-avvik. Erfaringsmessig er norsk kollektivtransport punktlig nok til at planlagt tid er en rimelig proxy. Unntakene (Bergensbanen ved ras, Østfoldbanen ved feil på signalanlegg) vises ikke i poenget.",
  },
  {
    q: "Hva menes med 'sentrum'?",
    a: "For hver av de seks byene er sentrum definert som byens viktigste kollektivknutepunkt. Oslo S, Bergen Torgallmenningen, Trondheim sentralstasjon, Stavanger stasjon, Storgata i Tromsø og Kristiansand rutebilstasjon. Dette er punkter de fleste jobbmuligheter ligger i gangavstand til.",
  },
  {
    q: "Kan jeg stole på dataen?",
    a: "Reisetid, frekvens, antall bytter og gangavstand kommer direkte fra Entur Journey Planner v3, som er Norges offentlige ruteplanlegger. Månedskortpris er estimert ut fra operatørens sonestruktur og reiselengde. Alle tall er ferske ved beregning, og landingssiden regenereres jevnlig.",
  },
  {
    q: "Hvor ofte oppdateres poenget?",
    a: "Scoringsmotoren kjører ferskt mot Entur hver gang en adresseside besøkes, med 24 timers cache per adresse. Top 10 og sammenligningene på denne siden oppdateres ukentlig via et manuelt skript for å unngå å belaste Enturs rate limit.",
  },
  {
    q: "Hvorfor vekt 35 % på reisetid?",
    a: "Reisetid er det som faktisk påvirker hverdagen mest. En adresse med 25 minutter til jobb føles fundamentalt annerledes enn en med 55 minutter, selv om frekvens og pris er like. Vekten 35 % gir reisetiden dominans, mens frekvens (25 %) hindrer at en adresse med én buss-avgang i timen scorer like høyt som en med T-bane hvert femte minutt.",
  },
  {
    q: "Hvorfor inkludere pris i poenget?",
    a: "Pendling er en økonomisk beslutning. Et månedskort på 2 000 kr gir ca. 24 000 kr i året i tillegg til boligkostnaden, nok til å påvirke hvor mye bolig du har råd til. Vekten er lav (10 %) fordi pris varierer mindre enn reisetid, men utelukkelse ville vært en feil.",
  },
];

function scoreColorClass(score: number): string {
  if (score >= 85) return "text-accent";
  if (score >= 70) return "text-accent-hover";
  if (score >= 55) return "text-foreground";
  return "text-text-secondary";
}

export default function PendlingsPoengLanding() {
  const { workCenterKommuner, topPendlerKommuner, comparisons, generatedAt } =
    PENDLINGS_POENG_LANDING_DATA;
  // Feature the top work-center kommune in the hero meta-row and OG. After the
  // population-weighted tiebreaker this is Oslo; falls back to the first
  // pendler-kommune if the work-center list is empty (test-seed state only).
  const featured = workCenterKommuner[0] ?? topPendlerKommuner[0];
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
      { "@type": "ListItem", position: 2, name: "Pendlings-poeng", item: PAGE_URL },
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
            <span className="text-text-secondary">Pendlings-poeng</span>
          </nav>

          <HeroSection topCommune={featured} />

          <WorkCenterKommunerSection
            rows={workCenterKommuner}
            generatedAt={generatedAt}
          />

          <TopPendlerKommunerSection rows={topPendlerKommuner} />

          <MethodologySection />

          <ComparisonSection rows={comparisons} />

          <DataSourcesSection />

          <FaqSection />

          <CtaSection />

          <footer className="mt-8 border-t border-card-border pt-6 text-xs text-text-tertiary">
            <p>
              Pendlings-poeng er en del av Verdikarts komposittscorer for norsk
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

function HeroSection({ topCommune }: { topCommune: KommuneScoreRow | undefined }) {
  return (
    <header className="mb-20">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Komposittscore · 0 – 100
      </div>

      <h1 className="display-1 text-foreground">Pendlings-poeng</h1>

      <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
        Hvor godt egner en adresse seg for pendling til arbeid? Et poeng fra 0
        til 100, basert på fem vitenskapelig valgte komponenter. Live data fra
        Entur og offentlige kilder.
      </p>

      <div className="mt-10">
        <AddressSearch />
        <p className="mt-3 text-center text-xs text-text-tertiary">
          Skriv en adresse for å se poenget med fullt metodikkbrudd.
        </p>
      </div>

      {topCommune && (
        <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-tertiary">
          <span>Beste kommune akkurat nå:</span>
          <span className="font-semibold text-foreground">{topCommune.kommunenavn}</span>
          <span className="h-1 w-1 rounded-full bg-card-border" aria-hidden />
          <span>
            <strong className="text-accent">{topCommune.total}</strong> poeng
          </span>
          <span className="h-1 w-1 rounded-full bg-card-border" aria-hidden />
          <span>{topCommune.centerNote}</span>
        </div>
      )}
    </header>
  );
}

/* ── Work-center kommuner grid ─────────────────────────────────────────── */

function WorkCenterKommunerSection({
  rows,
  generatedAt,
}: {
  rows: ReadonlyArray<KommuneScoreRow>;
  generatedAt: string;
}) {
  const generated = new Date(generatedAt).toLocaleDateString("nb-NO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <section aria-labelledby="byer-heading" className="mb-20">
      <div className="mb-6">
        <h2
          id="byer-heading"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Byer med best pendling
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">
          Bor du i sentrum av en storby? Pendlingen er i praksis et kort
          minutts-anliggende. Tall ferske per {generated}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {rows.map((row) => (
          <Link
            key={row.kommunenummer}
            href={`/by/${row.slug}`}
            className="group flex flex-col rounded-2xl border border-card-border bg-card-bg p-4 transition-colors hover:border-accent/40 sm:p-5"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-base font-semibold text-foreground sm:text-lg">
                {row.kommunenavn}
              </span>
              <div className="flex shrink-0 items-baseline gap-0.5">
                <span
                  className={`text-2xl font-bold tabular-nums ${scoreColorClass(row.total)} sm:text-3xl`}
                >
                  {row.total}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-text-tertiary">
                  /100
                </span>
              </div>
            </div>
            <p className="mt-1 text-xs text-text-tertiary">→ egen sentrum</p>
            <p className="mt-3 text-[11px] text-text-tertiary">
              {fmtMinutes(row.doorToDoorMinutes)} · {fmtPerHour(row.frequencyPerHour)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── Top 10 pendler-kommuner (outside the six work-center cities) ───────── */

function TopPendlerKommunerSection({
  rows,
}: {
  rows: ReadonlyArray<KommuneScoreRow>;
}) {
  return (
    <section aria-labelledby="pendler-kommuner-heading" className="mb-20">
      <div className="mb-6">
        <h2
          id="pendler-kommuner-heading"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Beste pendler-kommuner rundt storbyene
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">
          Topp 10 kommuner utenfor storby-sentrene selv, rangert etter
          gjennomsnittlig pendlings-poeng for kommunesentrum.
        </p>
      </div>

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
                  <span>→ {row.centerName}</span>
                  <span>{fmtMinutes(row.doorToDoorMinutes)}</span>
                  <span>{fmtPerHour(row.frequencyPerHour)}</span>
                  <span>{fmtKr(row.monthlyPriceNok)}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-baseline gap-1">
                <span
                  className={`text-2xl font-bold tabular-nums ${scoreColorClass(row.total)} sm:text-3xl`}
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

      <p className="mt-4 text-xs text-text-tertiary">
        Basert på kommunesentrum. Enkeltadresser innen kommunen kan ha vesentlig
        høyere eller lavere poeng.
      </p>
    </section>
  );
}

/* ── Methodology ─────────────────────────────────────────────────────────── */

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
          Slik beregnes Pendlings-poeng
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">
          Fem komponenter, hver scoret 0 til 100 etter fastsatte terskler, vektet
          til en sum. Full åpenhet rundt vektene og tersklene så du kan etterprøve
          hvert tall.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-5">
        {METHODOLOGY.map(({ id, weight, title, Icon, blurb, thresholds }) => (
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
                <div key={label} className="flex items-baseline justify-between gap-2 border-b border-card-border/60 py-1 last:border-b-0">
                  <dt className="truncate text-text-secondary">{label}</dt>
                  <dd className="shrink-0 font-semibold tabular-nums text-foreground">
                    {score}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/5 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Totalformel
        </p>
        <p className="mt-2 text-sm text-foreground sm:text-base">
          Totalscore = 0,35 × reise + 0,25 × frekvens + 0,15 × gangavstand + 0,15
          × bytter + 0,10 × pris
        </p>
        <p className="mt-2 text-xs text-text-tertiary">
          Hver delscore er mellom 0 og 100. Summen rundes til nærmeste hele tall.
        </p>
      </div>
    </section>
  );
}

/* ── Comparison ─────────────────────────────────────────────────────────── */

function ComparisonSection({ rows }: { rows: ReadonlyArray<ComparisonRow> }) {
  return (
    <section aria-labelledby="sammenligning-heading" className="mb-20">
      <div className="mb-6">
        <h2
          id="sammenligning-heading"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Pendling mellom norske byer
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">
          Seks representative adresser beregnet med samme motor. Spriket viser
          hvor stor forskjellen er mellom urbant sentrum og spredtbygd strøk.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((row) => {
          const noTransit = row.total === 0 && row.doorToDoorMinutes === 0;
          return (
            <article
              key={row.label}
              className="flex flex-col rounded-2xl border border-card-border bg-card-bg p-5 sm:p-6"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground sm:text-lg">
                    {row.label}
                  </h3>
                  <p className="mt-0.5 text-xs text-text-tertiary">
                    {row.kommunenavn} → {row.centerName}
                  </p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-3xl font-bold tabular-nums ${scoreColorClass(row.total)} sm:text-4xl`}
                  >
                    {row.total}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-text-tertiary">
                    /100
                  </span>
                </div>
              </div>
              <p className="mt-3 text-xs text-text-secondary sm:text-sm">
                {row.context}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-card-border bg-background/50 p-3 text-center text-xs">
                <Metric
                  label="Reise"
                  value={noTransit ? "–" : fmtMinutes(row.doorToDoorMinutes)}
                />
                <Metric
                  label="Frekvens"
                  value={noTransit ? "–" : fmtPerHour(row.frequencyPerHour)}
                />
                <Metric label="Pris/mnd" value={fmtKr(row.monthlyPriceNok)} />
              </div>
              <p className="mt-3 text-[11px] text-text-tertiary">
                Band: {bandForScore(row.total)}
                {!row.rushHourTested && !noTransit && " · beregnet utenfor rushtid"}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-text-tertiary">
        {label}
      </div>
      <div className="mt-0.5 font-semibold tabular-nums text-foreground">
        {value}
      </div>
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
            k: "Entur Journey Planner v3",
            v: "Reisetid, frekvens, gangavstand og antall bytter. CC BY 4.0.",
            href: "https://developer.entur.org/",
          },
          {
            k: "Operatørenes månedskortpriser",
            v: "Ruter, Skyss, AtB, Kolumbus, Svipper og AKT. Manuelt vedlikeholdt sonestruktur.",
            href: null,
          },
          {
            k: "Kartverket / Geonorge",
            v: "Adressekoordinater via Matrikkelens adresseregister. CC BY 4.0.",
            href: "https://ws.geonorge.no/adresser/v1/",
          },
        ].map(({ k, v, href }) => (
          <div key={k} className="flex flex-col gap-1 px-5 py-4 sm:px-6">
            <dt className="text-sm font-semibold text-foreground">
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-accent"
                >
                  {k}
                  <ArrowRight className="h-3 w-3 -rotate-45" strokeWidth={1.5} />
                </a>
              ) : (
                k
              )}
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
          Finn pendlings-poenget for din adresse
        </h2>
        <p className="mt-2 text-sm text-text-secondary sm:text-base">
          Samme motor, live mot Entur. Du får fullt metodikkbrudd, band og alle
          fem delscorer.
        </p>
        <div className="mt-6">
          <AddressSearch />
        </div>
      </div>
    </section>
  );
}
