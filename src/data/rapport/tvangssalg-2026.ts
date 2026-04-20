/**
 * Data for Verdikart rapport: Hytte-tvangssalg 2026.
 *
 * Kilder:
 *   - SSB 08948 (hjemmelsoverføringer ved tvangssalg, kvartalsvis per eiendomstype)
 *   - SSB 11500 (omsetning av borettslagsboliger, tvangssalg)
 *
 * Alle tall er reproduserbare fra `research/tvangssalg/data-hentet.json`.
 * Se `research/tvangssalg/analyse.md` for metodikk og funn.
 */

export type QuarterPoint = {
  quarter: string; // "2023K4"
  label: string; // "Q4 2023"
  rolling4qTotal: number;
  rolling4qResidential: number;
  rolling4qFritid: number;
};

export type CategoryRow = {
  type: string;
  y2023: number;
  y2024: number;
  y2025: number;
  changeFrom2023Pct: number;
  yoyPct: number;
  highlight?: boolean;
};

export type QuarterlyDetailRow = {
  quarter: string; // "2025K4"
  label: string; // "Q4 2025"
  total: number;
  fritidAlt: number;
  strong?: boolean;
};

export const TVANGSSALG_2026_DATA = {
  publicationDate: "2026-04-20",
  lastDataQuarter: "2025K4",
  lastDataLabel: "Q4 2025",
  dataSources: [
    {
      id: "08948",
      name: "SSB tabell 08948",
      description:
        "Omsetning av fast eiendom, fordelt på omsetningsmåte og eiendomstype",
      url: "https://www.ssb.no/statbank/table/08948",
    },
    {
      id: "11500",
      name: "SSB tabell 11500",
      description:
        "Omsetning av boliger i borettslag, fordelt på omsetningsmåte og bruksformål",
      url: "https://www.ssb.no/statbank/table/11500",
    },
  ],

  // "Hytte-tvangssalgene nær doblet på to år"
  headlineFigure: {
    category: "Fritidseiendom i alt",
    from: 54,
    to: 98,
    yearFrom: 2023,
    yearTo: 2025,
    changePct: 82,
  },

  // Nøkkeltall-grid (4 bokser)
  keyNumbers: [
    {
      value: "+82%",
      label: "Hytte-tvangssalg 2023 → 2025",
      sub: "Fritidseiendom i alt, antall gjennomførte tvangssalg",
    },
    {
      value: "818",
      label: "Totalt tvangssalg i 2025",
      sub: "Alle eiendomstyper, hele kalenderåret",
    },
    {
      value: "+14,2%",
      label: "Totalt YoY 2024 → 2025",
      sub: "Opp fra 716 i 2024",
    },
    {
      value: "5",
      label: "Kvartaler på rad med vekst",
      sub: "Rullerende 4K-sum siden bunn i Q4 2023",
    },
  ],

  // Rullerende 4-kvartalers sum — Q4 2019 → Q4 2025
  nationalTrend: [
    { quarter: "2019K4", label: "Q4 2019", rolling4qTotal: 1070, rolling4qResidential: 725, rolling4qFritid: 105 },
    { quarter: "2020K1", label: "Q1 2020", rolling4qTotal: 1075, rolling4qResidential: 733, rolling4qFritid: 105 },
    { quarter: "2020K2", label: "Q2 2020", rolling4qTotal: 1060, rolling4qResidential: 727, rolling4qFritid: 107 },
    { quarter: "2020K3", label: "Q3 2020", rolling4qTotal: 1034, rolling4qResidential: 727, rolling4qFritid: 104 },
    { quarter: "2020K4", label: "Q4 2020", rolling4qTotal: 1033, rolling4qResidential: 752, rolling4qFritid: 99 },
    { quarter: "2021K1", label: "Q1 2021", rolling4qTotal: 1047, rolling4qResidential: 765, rolling4qFritid: 108 },
    { quarter: "2021K2", label: "Q2 2021", rolling4qTotal: 1035, rolling4qResidential: 751, rolling4qFritid: 117 },
    { quarter: "2021K3", label: "Q3 2021", rolling4qTotal: 1093, rolling4qResidential: 791, rolling4qFritid: 120 },
    { quarter: "2021K4", label: "Q4 2021", rolling4qTotal: 1069, rolling4qResidential: 748, rolling4qFritid: 121 },
    { quarter: "2022K1", label: "Q1 2022", rolling4qTotal: 1030, rolling4qResidential: 711, rolling4qFritid: 106 },
    { quarter: "2022K2", label: "Q2 2022", rolling4qTotal: 1007, rolling4qResidential: 699, rolling4qFritid: 96 },
    { quarter: "2022K3", label: "Q3 2022", rolling4qTotal: 916, rolling4qResidential: 614, rolling4qFritid: 99 },
    { quarter: "2022K4", label: "Q4 2022", rolling4qTotal: 867, rolling4qResidential: 584, rolling4qFritid: 93 },
    { quarter: "2023K1", label: "Q1 2023", rolling4qTotal: 795, rolling4qResidential: 549, rolling4qFritid: 84 },
    { quarter: "2023K2", label: "Q2 2023", rolling4qTotal: 755, rolling4qResidential: 536, rolling4qFritid: 76 },
    { quarter: "2023K3", label: "Q3 2023", rolling4qTotal: 712, rolling4qResidential: 506, rolling4qFritid: 64 },
    { quarter: "2023K4", label: "Q4 2023", rolling4qTotal: 676, rolling4qResidential: 482, rolling4qFritid: 54 },
    { quarter: "2024K1", label: "Q1 2024", rolling4qTotal: 685, rolling4qResidential: 488, rolling4qFritid: 57 },
    { quarter: "2024K2", label: "Q2 2024", rolling4qTotal: 696, rolling4qResidential: 488, rolling4qFritid: 62 },
    { quarter: "2024K3", label: "Q3 2024", rolling4qTotal: 729, rolling4qResidential: 515, rolling4qFritid: 65 },
    { quarter: "2024K4", label: "Q4 2024", rolling4qTotal: 716, rolling4qResidential: 511, rolling4qFritid: 67 },
    { quarter: "2025K1", label: "Q1 2025", rolling4qTotal: 713, rolling4qResidential: 485, rolling4qFritid: 88 },
    { quarter: "2025K2", label: "Q2 2025", rolling4qTotal: 723, rolling4qResidential: 497, rolling4qFritid: 92 },
    { quarter: "2025K3", label: "Q3 2025", rolling4qTotal: 757, rolling4qResidential: 537, rolling4qFritid: 93 },
    { quarter: "2025K4", label: "Q4 2025", rolling4qTotal: 818, rolling4qResidential: 578, rolling4qFritid: 98 },
  ] satisfies QuarterPoint[],

  // Kategori-tabell — kalenderår-summer
  byCategory: [
    { type: "Alle eiendommer", y2023: 676, y2024: 716, y2025: 818, changeFrom2023Pct: 21.0, yoyPct: 14.2 },
    { type: "Boligeiendom med bygning", y2023: 482, y2024: 511, y2025: 578, changeFrom2023Pct: 19.9, yoyPct: 13.1 },
    { type: "Fritidseiendom med bygning", y2023: 52, y2024: 61, y2025: 92, changeFrom2023Pct: 76.9, yoyPct: 50.8, highlight: true },
    { type: "Fritidseiendom i alt", y2023: 54, y2024: 67, y2025: 98, changeFrom2023Pct: 81.5, yoyPct: 46.3, highlight: true },
    { type: "Forretnings-/kontoreiendom", y2023: 14, y2024: 12, y2025: 18, changeFrom2023Pct: 28.6, yoyPct: 50.0 },
    { type: "Industrieiendom med bygning", y2023: 6, y2024: 7, y2025: 10, changeFrom2023Pct: 66.7, yoyPct: 42.9 },
    { type: "Landbrukseiendom med bygning", y2023: 30, y2024: 26, y2025: 32, changeFrom2023Pct: 6.7, yoyPct: 23.1 },
    { type: "Borettslagsboliger (SSB 11500)", y2023: 127, y2024: 121, y2025: 156, changeFrom2023Pct: 22.8, yoyPct: 28.9 },
  ] satisfies CategoryRow[],

  // Siste seks kvartaler — raw kvartals-tall, ikke rullerende
  quarterlyDetail: [
    { quarter: "2024K3", label: "Q3 2024", total: 174, fritidAlt: 15 },
    { quarter: "2024K4", label: "Q4 2024", total: 147, fritidAlt: 16 },
    { quarter: "2025K1", label: "Q1 2025", total: 192, fritidAlt: 38 },
    { quarter: "2025K2", label: "Q2 2025", total: 210, fritidAlt: 23, strong: true },
    { quarter: "2025K3", label: "Q3 2025", total: 208, fritidAlt: 16 },
    { quarter: "2025K4", label: "Q4 2025", total: 208, fritidAlt: 21, strong: true },
  ] satisfies QuarterlyDetailRow[],
} as const;

export type TvangssalgData = typeof TVANGSSALG_2026_DATA;
