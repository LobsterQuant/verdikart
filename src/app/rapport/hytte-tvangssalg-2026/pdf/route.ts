import { NextResponse } from "next/server";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import { TVANGSSALG_2026_DATA } from "@/data/rapport/tvangssalg-2026";

export const runtime = "nodejs";
export const dynamic = "force-static";

const COLORS = {
  bg: "#0A0B0D",
  ink: "#111111",
  muted: "#555555",
  subtle: "#7a7a7a",
  accent: "#0E6B5A",
  accentBg: "#E6F7F3",
  border: "#D9D9D9",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COLORS.ink,
    lineHeight: 1.5,
  },
  coverPage: {
    paddingTop: 96,
    paddingHorizontal: 56,
    paddingBottom: 56,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COLORS.ink,
  },
  badge: {
    fontSize: 9,
    color: COLORS.accent,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  h1: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.15,
    marginBottom: 16,
  },
  lede: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 1.5,
    marginBottom: 32,
  },
  bigFigure: {
    fontSize: 72,
    fontFamily: "Helvetica-Bold",
    color: COLORS.accent,
    marginBottom: 8,
  },
  bigFigureLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 48,
  },
  metaRow: {
    flexDirection: "row",
    fontSize: 9,
    color: COLORS.subtle,
    marginTop: 8,
  },
  metaItem: {
    marginRight: 16,
  },
  h2: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginTop: 24,
    marginBottom: 10,
  },
  h3: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.accent,
    marginBottom: 4,
    marginTop: 12,
  },
  p: {
    marginBottom: 8,
    lineHeight: 1.55,
  },
  keyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  keyBox: {
    width: "48%",
    marginRight: "2%",
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  keyBoxHighlight: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentBg,
  },
  keyValue: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  keyLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  keySub: {
    fontSize: 8,
    color: COLORS.subtle,
  },
  table: {
    marginTop: 8,
    marginBottom: 12,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 5,
  },
  thRow: {
    backgroundColor: "#F5F5F5",
  },
  td: {
    fontSize: 9,
  },
  tdType: {
    flex: 2.5,
    paddingRight: 6,
  },
  tdNum: {
    flex: 1,
    textAlign: "right",
  },
  highlightRow: {
    backgroundColor: COLORS.accentBg,
  },
  highlightText: {
    color: COLORS.accent,
    fontFamily: "Helvetica-Bold",
  },
  footnote: {
    fontSize: 8,
    color: COLORS.subtle,
    marginTop: 4,
    marginBottom: 8,
  },
  pageFooter: {
    position: "absolute",
    bottom: 24,
    left: 56,
    right: 56,
    fontSize: 8,
    color: COLORS.subtle,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nb-NO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPct(pct: number) {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1).replace(".", ",")}%`;
}

function ReportDocument() {
  const d = TVANGSSALG_2026_DATA;

  return createElement(
    Document,
    {
      title: "Hytte-tvangssalg 2026: Verdikart",
      author: "Michael Hansen",
      subject: "Tvangssalg av fritidseiendommer i Norge",
      keywords: "tvangssalg, hytte, fritidseiendom, SSB, Verdikart",
    },
    // Cover
    createElement(
      Page,
      { size: "A4", style: styles.coverPage },
      createElement(Text, { style: styles.badge }, "VERDIKART · RAPPORT VK-2026-01"),
      createElement(
        Text,
        { style: styles.h1 },
        "Hytte-tvangssalgene\nnær doblet på to år"
      ),
      createElement(
        Text,
        { style: styles.lede },
        `Nye tall fra SSB viser at antall tinglyste tvangssalg av fritidseiendommer har steget fra ${d.headlineFigure.from} i ${d.headlineFigure.yearFrom} til ${d.headlineFigure.to} i ${d.headlineFigure.yearTo}: en økning på ${d.headlineFigure.changePct} prosent.`
      ),
      createElement(Text, { style: styles.bigFigure }, `+${d.headlineFigure.changePct}%`),
      createElement(
        Text,
        { style: styles.bigFigureLabel },
        `Økning i hytte-tvangssalg ${d.headlineFigure.yearFrom} → ${d.headlineFigure.yearTo}`
      ),
      createElement(
        View,
        { style: styles.metaRow },
        createElement(Text, { style: styles.metaItem }, `Publisert ${formatDate(d.publicationDate)}`),
        createElement(Text, { style: styles.metaItem }, "Datakilde: SSB tabell 08948, 11500"),
        createElement(Text, { style: styles.metaItem }, "Forfatter: Michael Hansen")
      ),
      createElement(
        View,
        { style: styles.pageFooter, fixed: true },
        createElement(Text, null, "verdikart.no/rapport/hytte-tvangssalg-2026"),
        createElement(Text, null, "VK-2026-01")
      )
    ),
    // Body page
    createElement(
      Page,
      { size: "A4", style: styles.page },
      createElement(Text, { style: styles.h2 }, "Nøkkeltall"),
      createElement(
        View,
        { style: styles.keyGrid },
        ...d.keyNumbers.map((n, i) =>
          createElement(
            View,
            { key: n.label, style: [styles.keyBox, i === 0 ? styles.keyBoxHighlight : {}] },
            createElement(
              Text,
              { style: [styles.keyValue, i === 0 ? styles.highlightText : {}] },
              n.value
            ),
            createElement(Text, { style: styles.keyLabel }, n.label),
            createElement(Text, { style: styles.keySub }, n.sub)
          )
        )
      ),

      createElement(Text, { style: styles.h2 }, "Hvorfor øker hytte-tvangssalgene?"),
      createElement(Text, { style: styles.h3 }, "Rentepress"),
      createElement(
        Text,
        { style: styles.p },
        "Norges Bank har holdt styringsrenten på 4 prosent siden september 2025. Boliglånsrenten ligger over 5 prosent. For husholdninger med både hytte og bolig er hyttegjelden førstelinjen å nedprioritere når økonomien strammer til."
      ),
      createElement(Text, { style: styles.h3 }, "Sekundærboligen taper først"),
      createElement(
        Text,
        { style: styles.p },
        "I motsetning til primærboligen (der det finnes betydelige sikkerhetsventiler for å unngå tvangssalg) har hytte-eiere færre juridiske beskyttelser. Banker kan og gjør ofte tvangssalg raskere på sekundær eiendom."
      ),
      createElement(Text, { style: styles.h3 }, "Hva tallene ikke fanger opp"),
      createElement(
        Text,
        { style: styles.p },
        "De 98 gjennomførte tvangssalgene i 2025 er toppen av isfjellet. For hvert gjennomført tvangssalg finnes det mange frivillige salg hvor eieren selger før tingretten stadfester. Det faktiske antall nødsalg av hytter er høyere."
      ),
      createElement(
        View,
        { style: styles.pageFooter, fixed: true },
        createElement(Text, null, "verdikart.no/rapport/hytte-tvangssalg-2026"),
        createElement(Text, null, "VK-2026-01")
      )
    ),
    // Table page
    createElement(
      Page,
      { size: "A4", style: styles.page },
      createElement(Text, { style: styles.h2 }, "Tvangssalg per eiendomstype"),
      createElement(
        Text,
        { style: styles.footnote },
        "Gjennomførte tvangssalg, hele kalenderåret. Fritidseiendom er fremhevet."
      ),
      createElement(
        View,
        { style: styles.table },
        createElement(
          View,
          { style: [styles.tr, styles.thRow] },
          createElement(Text, { style: [styles.td, styles.tdType] }, "Eiendomstype"),
          createElement(Text, { style: [styles.td, styles.tdNum] }, "2023"),
          createElement(Text, { style: [styles.td, styles.tdNum] }, "2024"),
          createElement(Text, { style: [styles.td, styles.tdNum] }, "2025"),
          createElement(Text, { style: [styles.td, styles.tdNum] }, "23→25"),
          createElement(Text, { style: [styles.td, styles.tdNum] }, "YoY")
        ),
        ...d.byCategory.map((r) =>
          createElement(
            View,
            { key: r.type, style: [styles.tr, r.highlight ? styles.highlightRow : {}] },
            createElement(
              Text,
              {
                style: [
                  styles.td,
                  styles.tdType,
                  r.highlight ? styles.highlightText : {},
                ],
              },
              r.type
            ),
            createElement(Text, { style: [styles.td, styles.tdNum] }, String(r.y2023)),
            createElement(Text, { style: [styles.td, styles.tdNum] }, String(r.y2024)),
            createElement(
              Text,
              {
                style: [styles.td, styles.tdNum, r.highlight ? styles.highlightText : {}],
              },
              String(r.y2025)
            ),
            createElement(
              Text,
              {
                style: [styles.td, styles.tdNum, r.highlight ? styles.highlightText : {}],
              },
              formatPct(r.changeFrom2023Pct)
            ),
            createElement(Text, { style: [styles.td, styles.tdNum] }, formatPct(r.yoyPct))
          )
        )
      ),
      createElement(
        Text,
        { style: styles.footnote },
        "Kilde: SSB 08948 for alle kategorier unntatt borettslag (SSB 11500). De to siste kvartalene som er publisert er foreløpige tall."
      ),

      createElement(Text, { style: styles.h2 }, "Siste seks kvartaler"),
      createElement(
        View,
        { style: styles.table },
        createElement(
          View,
          { style: [styles.tr, styles.thRow] },
          createElement(Text, { style: [styles.td, styles.tdType] }, "Kvartal"),
          createElement(Text, { style: [styles.td, styles.tdNum] }, "Totalt"),
          createElement(Text, { style: [styles.td, styles.tdNum] }, "Hytte")
        ),
        ...d.quarterlyDetail.map((r) =>
          createElement(
            View,
            { key: r.quarter, style: [styles.tr, r.strong ? styles.highlightRow : {}] },
            createElement(
              Text,
              {
                style: [
                  styles.td,
                  styles.tdType,
                  r.strong ? styles.highlightText : {},
                ],
              },
              r.label
            ),
            createElement(
              Text,
              {
                style: [styles.td, styles.tdNum, r.strong ? styles.highlightText : {}],
              },
              String(r.total)
            ),
            createElement(Text, { style: [styles.td, styles.tdNum] }, String(r.fritidAlt))
          )
        )
      ),
      createElement(
        View,
        { style: styles.pageFooter, fixed: true },
        createElement(Text, null, "verdikart.no/rapport/hytte-tvangssalg-2026"),
        createElement(Text, null, "VK-2026-01")
      )
    ),
    // Method page
    createElement(
      Page,
      { size: "A4", style: styles.page },
      createElement(Text, { style: styles.h2 }, "Metodologi og definisjoner"),
      createElement(Text, { style: styles.h3 }, "Datakilder"),
      ...d.dataSources.map((s) =>
        createElement(
          Text,
          { key: s.id, style: styles.p },
          `• ${s.name}: ${s.description}. ${s.url}`
        )
      ),
      createElement(
        Text,
        { style: styles.h3 },
        "Hva «tvangssalg» betyr i SSB-statistikken"
      ),
      createElement(
        Text,
        { style: styles.p },
        "Et hjemmelsoverføringstall. Alle tall viser tinglyste, gjennomførte tvangssalg, altså der tingretten har stadfestet salget og ny eier er registrert. SSB-tabellen teller overføringsdokumentet, ikke den bakenforliggende begjæringen."
      ),
      createElement(Text, { style: styles.h3 }, "Begjæring vs. gjennomført"),
      createElement(
        Text,
        { style: styles.p },
        "Mer enn 90 prosent av begjæringene om tvangssalg ender ikke i gjennomført salg: de trekkes, innfris eller henlegges. Begjæringsstatistikken (SSB 07218) har ikke publisert tall siden januar 2022 på grunn av administrative endringer i Brønnøysundregistrene."
      ),
      createElement(Text, { style: styles.h3 }, "Anonymisering og foreløpige tall"),
      createElement(
        Text,
        { style: styles.p },
        "SSB publiserer ikke kvartals-tall under 3 saker per kategori. De to siste publiserte kvartalene er foreløpige og kan revideres. Rullerende 4-kvartalers sum er brukt i trendgrafen for å glatte ut sesongvariasjon."
      ),
      createElement(Text, { style: styles.h3 }, "Hvorfor ingen kommune-tall?"),
      createElement(
        Text,
        { style: styles.p },
        "SSB publiserer ikke tvangssalg per kommune eller fylke. Per-adresse historikk krever tilgang til Kartverkets grunnbok-API. Verdikart har søkt om tilgang og jobber med neste fase av denne rapporten."
      ),

      createElement(Text, { style: styles.h2 }, "Om Verdikart"),
      createElement(
        Text,
        { style: styles.p },
        "Verdikart er en uavhengig data-tjeneste for norsk eiendom, basert på offentlige kilder. For presseforespørsler om denne rapporten, kontakt presse@verdikart.no."
      ),
      createElement(
        View,
        { style: styles.pageFooter, fixed: true },
        createElement(Text, null, "verdikart.no/rapport/hytte-tvangssalg-2026"),
        createElement(Text, null, "VK-2026-01")
      )
    )
  );
}

export async function GET() {
  const blob = await pdf(ReportDocument()).toBlob();
  const buffer = Buffer.from(await blob.arrayBuffer());
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'inline; filename="verdikart-hytte-tvangssalg-2026.pdf"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
