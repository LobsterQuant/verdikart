/**
 * Index of Verdikart markedsrapporter.
 *
 * Each report has its own dedicated route at /rapport/<slug>. This file is the
 * authoritative list used by /rapporter (index), the nav dropdown, and the
 * footer. When a new report ships, add an entry here and a nav entry. Nowhere
 * else needs touching.
 *
 * Upcoming reports (not yet shipped) are surfaced on /rapporter to signal
 * editorial ambition. Keep the list short and plausibly near-term.
 */

export type Rapport = {
  slug: string;
  title: string;
  excerpt: string;
  headlineStat: string; // short and punchy, e.g. "+82%"
  headlineStatLabel: string; // one line describing the stat
  publishedAt: string; // ISO date
  reportNumber: string; // "VK-2026-01"
  dataSources: string[]; // short display names, e.g. ["SSB", "Kartverket"]
};

export type KommendeRapport = {
  title: string;
  teaser: string;
  expectedQuarter: string; // e.g. "Q3 2026"
};

export const rapporter: Rapport[] = [
  {
    slug: "hytte-tvangssalg-2026",
    title: "Hytte-tvangssalgene nær doblet på to år",
    excerpt:
      "Tvangssalg av fritidseiendommer steg fra 54 i 2023 til 98 i 2025. Rapporten bryter ned tallene kvartalsvis, mot resten av eiendomsmarkedet, og ser på drivere bak utviklingen.",
    headlineStat: "+82%",
    headlineStatLabel: "Økning i hytte-tvangssalg, 2023 → 2025",
    publishedAt: "2026-04-20",
    reportNumber: "VK-2026-01",
    dataSources: ["SSB 08948", "SSB 11500"],
  },
];

export const kommendeRapporter: KommendeRapport[] = [
  {
    title: "T-bane-premium: hva en T-banestasjon er verdt",
    teaser:
      "Prisforskjellen mellom boliger innenfor og utenfor 500 meter fra nærmeste T-banestopp, brutt ned per linje og bydel.",
    expectedQuarter: "Q3 2026",
  },
  {
    title: "Skolekrets og boligpris",
    teaser:
      "Hvor mye mer koster en bolig fordi den ligger i kretsen til en ettertraktet barneskole? Isolert effekt etter kontroll for størrelse, stand og beliggenhet.",
    expectedQuarter: "Q4 2026",
  },
  {
    title: "Nyere leiligheter vs eldre: totaløkonomi",
    teaser:
      "Når man regner inn felleskostnader, energibruk, vedlikehold og dokumentavgift: hvilken alder på boligen gir lavest årlig kostnad per kvadratmeter?",
    expectedQuarter: "Q1 2027",
  },
];
