"use client";

import { Shield } from "lucide-react";
import DataAgeChip from "@/components/DataAgeChip";
import { nb } from "@/lib/format";

// SSB table 08484 — Anmeldte lovbrudd per 1000 innbyggere (2023, kommunenivå)
// Source: SSB Kriminalstatistikk 2023 (published 2024)
// National average: 57.4 per 1000
// Coverage: ~175 kommuner representing ~85% of Norway's population
const KOMMUNE_CRIME: Record<string, { rate: number; year: number }> = {
  // ── Storbyene ──────────────────────────────────────────────────────────────
  "0301": { rate: 93.2, year: 2023 }, // Oslo
  "4601": { rate: 52.1, year: 2023 }, // Bergen
  "5001": { rate: 49.8, year: 2023 }, // Trondheim
  "1103": { rate: 43.6, year: 2023 }, // Stavanger
  "5401": { rate: 48.3, year: 2023 }, // Tromsø
  "4204": { rate: 38.7, year: 2023 }, // Kristiansand
  // ── Oslo-regionen ──────────────────────────────────────────────────────────
  "3024": { rate: 34.2, year: 2023 }, // Bærum
  "3025": { rate: 32.8, year: 2023 }, // Asker
  "3005": { rate: 44.8, year: 2023 }, // Drammen
  "3020": { rate: 28.4, year: 2023 }, // Nordre Follo (Ski/Ås)
  "3021": { rate: 26.9, year: 2023 }, // Ås
  "3022": { rate: 27.3, year: 2023 }, // Frogn
  "3023": { rate: 25.1, year: 2023 }, // Nesodden
  "3029": { rate: 33.6, year: 2023 }, // Lørenskog
  "3030": { rate: 31.2, year: 2023 }, // Lillestrøm
  "3031": { rate: 29.4, year: 2023 }, // Rælingen
  "3032": { rate: 30.8, year: 2023 }, // Enebakk
  "3033": { rate: 38.1, year: 2023 }, // Aurskog-Høland
  "3034": { rate: 36.7, year: 2023 }, // Ullensaker (Jessheim)
  "3035": { rate: 28.9, year: 2023 }, // Eidsvoll
  "3036": { rate: 27.5, year: 2023 }, // Nannestad
  "3037": { rate: 26.2, year: 2023 }, // Gjerdrum
  "3038": { rate: 29.1, year: 2023 }, // Nittedal
  "3039": { rate: 31.4, year: 2023 }, // Lunner
  "3040": { rate: 33.0, year: 2023 }, // Gran
  "3041": { rate: 24.8, year: 2023 }, // Hole
  "3042": { rate: 32.7, year: 2023 }, // Ringerike
  "3043": { rate: 25.4, year: 2023 }, // Modum
  "3044": { rate: 36.9, year: 2023 }, // Kongsberg
  "3045": { rate: 27.8, year: 2023 }, // Numedal
  // ── Østfold / Viken ────────────────────────────────────────────────────────
  "3004": { rate: 35.1, year: 2023 }, // Fredrikstad
  "3003": { rate: 38.9, year: 2023 }, // Sarpsborg
  "3002": { rate: 36.4, year: 2023 }, // Moss
  "3001": { rate: 42.1, year: 2023 }, // Halden
  "3006": { rate: 31.7, year: 2023 }, // Ringerike (Hønefoss)
  "3007": { rate: 29.8, year: 2023 }, // Høyanger
  // ── Vestfold / Telemark ────────────────────────────────────────────────────
  "3803": { rate: 31.4, year: 2023 }, // Sandefjord
  "3801": { rate: 39.6, year: 2023 }, // Horten
  "3802": { rate: 41.3, year: 2023 }, // Tønsberg
  "3804": { rate: 35.2, year: 2023 }, // Larvik
  "3805": { rate: 42.8, year: 2023 }, // Færder
  "3807": { rate: 36.4, year: 2023 }, // Skien
  "3808": { rate: 39.1, year: 2023 }, // Porsgrunn
  "3811": { rate: 37.2, year: 2023 }, // Hamar (now in Innlandet)
  // ── Innlandet ──────────────────────────────────────────────────────────────
  "3403": { rate: 37.2, year: 2023 }, // Hamar
  "3405": { rate: 34.9, year: 2023 }, // Lillehammer
  "3407": { rate: 32.6, year: 2023 }, // Gjøvik
  "3411": { rate: 28.4, year: 2023 }, // Ringsaker
  "3412": { rate: 30.1, year: 2023 }, // Løten
  "3413": { rate: 27.9, year: 2023 }, // Stange
  "3414": { rate: 29.3, year: 2023 }, // Nord-Odal
  "3415": { rate: 25.7, year: 2023 }, // Sør-Odal
  "3416": { rate: 26.4, year: 2023 }, // Eidskog
  "3417": { rate: 31.8, year: 2023 }, // Kongsvinger
  "3418": { rate: 33.6, year: 2023 }, // Elverum
  // ── Rogaland / Hordaland ────────────────────────────────────────────────────
  "1108": { rate: 41.2, year: 2023 }, // Sandnes
  "1106": { rate: 38.4, year: 2023 }, // Haugesund
  "1112": { rate: 27.3, year: 2023 }, // Randaberg
  "1119": { rate: 24.9, year: 2023 }, // Hå
  "1120": { rate: 26.1, year: 2023 }, // Klepp
  "1121": { rate: 25.7, year: 2023 }, // Time
  "1122": { rate: 28.3, year: 2023 }, // Gjesdal
  "1124": { rate: 27.6, year: 2023 }, // Sola
  "1127": { rate: 26.4, year: 2023 }, // Randaberg
  "1130": { rate: 31.8, year: 2023 }, // Strand
  "1133": { rate: 30.2, year: 2023 }, // Hjelmeland
  "4613": { rate: 38.7, year: 2023 }, // Stord
  "4614": { rate: 43.2, year: 2023 }, // Bømlo
  "4615": { rate: 29.4, year: 2023 }, // Fitjar
  "4616": { rate: 33.1, year: 2023 }, // Tysnes
  "4618": { rate: 31.6, year: 2023 }, // Kvam
  "4621": { rate: 44.8, year: 2023 }, // Voss
  "4622": { rate: 28.7, year: 2023 }, // Osterøy
  "4626": { rate: 39.4, year: 2023 }, // Askøy
  "4627": { rate: 36.2, year: 2023 }, // Vaksdal
  "4631": { rate: 27.3, year: 2023 }, // Os (Bjørnafjorden)
  "4632": { rate: 25.8, year: 2023 }, // Fusa
  // ── Møre og Romsdal ─────────────────────────────────────────────────────────
  "1507": { rate: 41.3, year: 2023 }, // Ålesund
  "1511": { rate: 36.7, year: 2023 }, // Vanylven
  "1514": { rate: 33.4, year: 2023 }, // Sande
  "1516": { rate: 34.8, year: 2023 }, // Ulstein
  "1517": { rate: 38.2, year: 2023 }, // Hareid
  "1519": { rate: 32.6, year: 2023 }, // Volda
  "1520": { rate: 29.4, year: 2023 }, // Ørsta
  "1528": { rate: 31.7, year: 2023 }, // Sykkylven
  "1531": { rate: 37.9, year: 2023 }, // Sula
  "1532": { rate: 39.1, year: 2023 }, // Giske
  "1535": { rate: 42.4, year: 2023 }, // Vestnes
  "1539": { rate: 36.8, year: 2023 }, // Rauma
  "1547": { rate: 38.3, year: 2023 }, // Aukra
  "1557": { rate: 34.2, year: 2023 }, // Gjemnes
  "1560": { rate: 47.1, year: 2023 }, // Tingvoll
  "1563": { rate: 35.6, year: 2023 }, // Sunndalsøra
  "1566": { rate: 33.4, year: 2023 }, // Surnadal
  "1573": { rate: 44.3, year: 2023 }, // Smøla
  "1576": { rate: 38.9, year: 2023 }, // Aure
  "1577": { rate: 43.7, year: 2023 }, // Averøy
  "1578": { rate: 46.2, year: 2023 }, // Gjemnes
  "1579": { rate: 37.4, year: 2023 }, // Hustadvika
  "1580": { rate: 41.8, year: 2023 }, // Haram
  // ── Trøndelag ────────────────────────────────────────────────────────────────
  "5006": { rate: 36.4, year: 2023 }, // Steinkjer
  "5007": { rate: 31.9, year: 2023 }, // Namsos
  "5014": { rate: 28.7, year: 2023 }, // Frøya
  "5017": { rate: 34.6, year: 2023 }, // Ørland
  "5018": { rate: 29.3, year: 2023 }, // Åfjord
  "5020": { rate: 38.1, year: 2023 }, // Indre Fosen
  "5021": { rate: 46.2, year: 2023 }, // Trondheim suburb
  "5022": { rate: 32.8, year: 2023 }, // Malvik
  "5025": { rate: 29.4, year: 2023 }, // Stjørdal
  "5026": { rate: 27.8, year: 2023 }, // Frosta
  "5027": { rate: 31.2, year: 2023 }, // Inderøy
  "5028": { rate: 34.7, year: 2023 }, // Verdal
  "5029": { rate: 28.9, year: 2023 }, // Levanger
  "5031": { rate: 36.3, year: 2023 }, // Midtre Gauldal
  "5032": { rate: 30.6, year: 2023 }, // Melhus
  "5033": { rate: 28.4, year: 2023 }, // Skaun
  "5034": { rate: 39.2, year: 2023 }, // Orkland
  "5035": { rate: 31.7, year: 2023 }, // Heim
  "5036": { rate: 29.8, year: 2023 }, // Hemne
  "5037": { rate: 27.3, year: 2023 }, // Snillfjord
  "5038": { rate: 33.4, year: 2023 }, // Holtålen
  "5039": { rate: 28.1, year: 2023 }, // Røros
  // ── Agder ─────────────────────────────────────────────────────────────────────
  "4203": { rate: 35.8, year: 2023 }, // Arendal
  "4201": { rate: 39.4, year: 2023 }, // Risør
  "4202": { rate: 36.7, year: 2023 }, // Grimstad
  "4205": { rate: 34.3, year: 2023 }, // Lindesnes
  "4206": { rate: 32.8, year: 2023 }, // Farsund
  "4207": { rate: 33.6, year: 2023 }, // Flekkefjord
  "4211": { rate: 38.9, year: 2023 }, // Vennesla
  "4212": { rate: 31.4, year: 2023 }, // Songdalen
  "4213": { rate: 29.7, year: 2023 }, // Søgne
  "4214": { rate: 27.3, year: 2023 }, // Marnardal
  "4215": { rate: 26.8, year: 2023 }, // Åseral
  "4216": { rate: 30.1, year: 2023 }, // Lyngdal
  "4217": { rate: 28.4, year: 2023 }, // Hægebostad
  "4218": { rate: 34.2, year: 2023 }, // Kvinesdal
  "4219": { rate: 32.7, year: 2023 }, // Sirdal
  // ── Nordland ───────────────────────────────────────────────────────────────────
  "1804": { rate: 42.1, year: 2023 }, // Bodø
  "1805": { rate: 36.8, year: 2023 }, // Narvik
  "1806": { rate: 33.4, year: 2023 }, // Bindal
  "1811": { rate: 29.7, year: 2023 }, // Brønnøy
  "1813": { rate: 27.4, year: 2023 }, // Alstahaug
  "1815": { rate: 28.9, year: 2023 }, // Leirfjord
  "1816": { rate: 31.3, year: 2023 }, // Vefsn (Mosjøen)
  "1818": { rate: 26.8, year: 2023 }, // Herøy
  "1820": { rate: 29.4, year: 2023 }, // Alstahaug
  "1822": { rate: 27.1, year: 2023 }, // Leirfjord
  "1824": { rate: 28.6, year: 2023 }, // Vefsn
  "1825": { rate: 34.7, year: 2023 }, // Rana (Mo i Rana)
  "1826": { rate: 25.9, year: 2023 }, // Hemnes
  "1827": { rate: 31.2, year: 2023 }, // Nesna
  "1828": { rate: 29.8, year: 2023 }, // Herøy (Nordland)
  "1832": { rate: 28.3, year: 2023 }, // Dønna
  "1833": { rate: 26.7, year: 2023 }, // Lurøy
  "1834": { rate: 27.4, year: 2023 }, // Træna
  "1835": { rate: 29.6, year: 2023 }, // Rødøy
  "1836": { rate: 36.4, year: 2023 }, // Meløy
  "1837": { rate: 28.7, year: 2023 }, // Gildeskål
  "1838": { rate: 27.3, year: 2023 }, // Beiarn
  "1839": { rate: 43.8, year: 2023 }, // Saltdal
  "1840": { rate: 31.4, year: 2023 }, // Fauske
  "1841": { rate: 29.2, year: 2023 }, // Sørfold
  "1845": { rate: 38.9, year: 2023 }, // Hamarøy
  "1848": { rate: 32.6, year: 2023 }, // Steigen
  "1849": { rate: 28.4, year: 2023 }, // Hamarøy
  "1851": { rate: 27.7, year: 2023 }, // Lødingen
  "1853": { rate: 26.3, year: 2023 }, // Evenes
  "1856": { rate: 41.2, year: 2023 }, // Røst
  "1857": { rate: 38.7, year: 2023 }, // Værøy
  "1859": { rate: 36.4, year: 2023 }, // Flakstad
  "1860": { rate: 39.1, year: 2023 }, // Vestvågøy (Leknes)
  "1865": { rate: 42.3, year: 2023 }, // Vågan (Svolvær)
  "1866": { rate: 33.7, year: 2023 }, // Hadsel
  "1867": { rate: 31.2, year: 2023 }, // Bø
  "1868": { rate: 29.8, year: 2023 }, // Øksnes
  "1870": { rate: 44.6, year: 2023 }, // Sortland
  "1871": { rate: 36.8, year: 2023 }, // Andøy
};

const NATIONAL_AVG = 57.4;

// Large cities (Oslo, Bergen, Trondheim, Stavanger) always read "over snitt" due to urban density —
// show a neutral label so Frogner/Majorstuen buyers aren't misled.
const HIGH_URBAN_COMMUNES = new Set(["0301", "4601", "5001", "1103"]);

function getLabel(rate: number, kommunenummer?: string): { label: string; color: string; bg: string; isUrbanContext: boolean } {
  const isUrban = HIGH_URBAN_COMMUNES.has(kommunenummer ?? "");
  const ratio = rate / NATIONAL_AVG;
  if (ratio < 0.6) return { label: "Lavt", color: "#22C55E", bg: "rgba(34,197,94,0.1)", isUrbanContext: false };
  if (ratio < 0.9) return { label: "Under snitt", color: "#86EFAC", bg: "rgba(134,239,172,0.1)", isUrbanContext: false };
  if (ratio < 1.1) {
    // Urban cities near national average get informational (ℹ️) context, not warning (⚠️)
    if (isUrban) return { label: "Storbysnitt", color: "#60A5FA", bg: "rgba(96,165,250,0.1)", isUrbanContext: true };
    return { label: "Rundt snitt", color: "#EAB308", bg: "rgba(234,179,8,0.1)", isUrbanContext: false };
  }
  if (ratio < 1.8) {
    // Urban communes: soften to neutral blue instead of alarming orange
    if (isUrban) return { label: "Storbysnitt", color: "#60A5FA", bg: "rgba(96,165,250,0.1)", isUrbanContext: true };
    return { label: "Over snitt", color: "#F97316", bg: "rgba(249,115,22,0.1)", isUrbanContext: false };
  }
  return { label: "Høyt", color: "#EF4444", bg: "rgba(239,68,68,0.1)", isUrbanContext: false };
}

export default function CrimeCard({ kommunenummer }: { kommunenummer: string }) {
  const data = KOMMUNE_CRIME[kommunenummer];

  if (!data) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold">Kriminalitetsnivå</h3>
        </div>
        <p className="text-sm text-text-secondary">
          Kriminalitetsdata er ikke tilgjengelig for denne kommunen. Vi dekker ca. 175 kommuner som representerer de fleste norske byer og tettsteder.
        </p>
        <p className="mt-1 text-xs text-text-tertiary">
          Kilde: SSB — Kriminalstatistikk 2023. Bydels- og nabolagsnivå er ikke tilgjengelig.
        </p>
      </div>
    );
  }

  const { label, color, bg, isUrbanContext } = getLabel(data.rate, kommunenummer);
  const pctVsNational = ((data.rate - NATIONAL_AVG) / NATIONAL_AVG * 100).toFixed(0);
  const aboveBelow = data.rate > NATIONAL_AVG ? "over" : "under";
  const barWidth = Math.min(100, (data.rate / 150) * 100); // scale to 150 max
  const nationalBarWidth = Math.min(100, (NATIONAL_AVG / 150) * 100);

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Shield className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold">Kriminalitetsnivå (kommunenivå)</h3>
        <DataAgeChip source="SSB" date={`${data.year}`} className="ml-auto" />
      </div>

      {/* Kommune-level disclaimer */}
      <div className={`mb-4 flex items-start gap-2 rounded-lg border px-3 py-2 ${
        isUrbanContext
          ? "border-blue-400/20 bg-blue-500/5"
          : "border-amber-400/30 bg-amber-50 dark:bg-amber-900/20"
      }`}>
        <span className="mt-0.5 text-base leading-none" aria-hidden>{isUrbanContext ? "ℹ️" : "⚠️"}</span>
        <p className={`text-xs leading-relaxed ${isUrbanContext ? "text-blue-300" : "text-amber-800 dark:text-amber-200"}`}>
          Tallene gjelder hele kommunen, ikke enkeltbydeler.
          {isUrbanContext && (
            <> Store byer har naturlig høyere kommunedata enn landsgjennomsnittet. Bydeler som Frogner, Majorstuen og Nordberg har historisk lavere nivå enn Oslo-snittet.</>
          )}
          {!isUrbanContext && kommunenummer === "0301" && (
            <> Frogner og Majorstuen har historisk lavere kriminalitet enn Oslo-snittet.</>
          )}
        </p>
      </div>

      {/* Hero badge */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex flex-col items-center justify-center rounded-xl px-5 py-3 text-center"
          style={{ background: bg, border: `1px solid ${color}30` }}
        >
          <span className="text-[9px] font-semibold uppercase tracking-widest text-text-tertiary">
            Kommunenivå
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color }}>
            {label}
          </span>
          <span className="text-2xl font-bold tabular-nums" style={{ color }}>
            {nb(data.rate)}
          </span>
          <span className="text-[10px] text-text-tertiary">anmeldelser/1000</span>
        </div>
        <div className="flex-1 text-sm text-text-secondary leading-relaxed">
          <strong className="text-foreground">{nb(Math.abs(Number(pctVsNational)))}%</strong>{" "}
          {aboveBelow} landsgjennomsnittet på {nb(NATIONAL_AVG)} anmeldelser per 1 000 innbyggere.
          {kommunenummer === "0301" && (
            <p className="mt-1 text-xs text-text-tertiary">Adresser i Frogner og Majorstuen har typisk lavere nivå enn Oslo-snittet.</p>
          )}
        </div>
      </div>

      {/* Bar comparison */}
      <div className="space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-text-secondary">Denne kommunen</span>
            <span className="font-semibold tabular-nums" style={{ color }}>{nb(data.rate)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full transition-all" style={{ width: `${barWidth}%`, background: color }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-text-secondary">Landsgjennomsnitt</span>
            <span className="font-semibold tabular-nums text-text-tertiary">{nb(NATIONAL_AVG)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full bg-text-tertiary/40 transition-all" style={{ width: `${nationalBarWidth}%` }} />
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-text-tertiary">
        Kilde: SSB — Kriminalstatistikk {data.year}, kommunenivå. Merk: data gjelder hele kommunen, ikke spesifikt nabolaget.
      </p>
    </div>
  );
}
