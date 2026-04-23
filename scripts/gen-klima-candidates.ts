/**
 * One-off generator for src/data/klima-poeng-candidates.ts that produces a
 * full-coverage list of all 357 norske kommuner.
 *
 * Strategy:
 *   1. Fetch the full kommune list from Kartverket (kommuneinfo v1).
 *   2. Fetch each kommune's `punktIOmrade` (a representative interior point)
 *      via the per-kommune endpoint, throttled.
 *   3. For the ~115 kommuner Verdikart has hand-curated sentrum coordinates
 *      for, override punktIOmrade — hand-picked rådhus/torget/stasjon points
 *      sit on populated terrain and avoid the "random fjell-koordinat"
 *      problem that punktIOmrade has for sprawling distrikt-kommuner.
 *   4. Sort by population (desc, where known) then alphabetic and write the
 *      new candidates file.
 *
 * Usage: npx tsx scripts/gen-klima-candidates.ts
 *
 * This is a build-time generator, not a runtime refresh script. Re-run only
 * when the kommune-strukturen endrer seg or when curated coords need editing.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { kommunePopulation } from "../src/data/kommune-population";

const OUTPUT_PATH = resolve(
  process.cwd(),
  "src/data/klima-poeng-candidates.ts",
);

const CONCURRENCY = 8;
const INTER_BATCH_DELAY_MS = 100;

interface KommuneListEntry {
  kommunenummer: string;
  kommunenavn: string;
  kommunenavnNorsk: string;
}

interface KommuneDetail {
  kommunenummer: string;
  kommunenavn: string;
  kommunenavnNorsk: string;
  punktIOmrade: { coordinates: [number, number]; type: string };
}

interface CuratedCoord {
  lat: number;
  lon: number;
  centerNote: string;
  /** Optional override for slug (e.g. nb-NO with diacritics → ASCII). */
  slug?: string;
  kommunenavnOverride?: string;
}

/**
 * Hand-curated sentrum coordinates for kommuner where Verdikart already has
 * a known rådhus / torget / stasjon point. These override punktIOmrade.
 */
const CURATED: Record<string, CuratedCoord> = {
  "0301": { lat: 59.9127, lon: 10.7461, centerNote: "Karl Johans gate", slug: "oslo" },
  "4601": { lat: 60.3927, lon:  5.3242, centerNote: "Bryggen", slug: "bergen" },
  "5001": { lat: 63.4305, lon: 10.3951, centerNote: "Torvet", slug: "trondheim" },
  "1103": { lat: 58.9700, lon:  5.7340, centerNote: "Stavanger sentrum", slug: "stavanger" },
  "3201": { lat: 59.8918, lon: 10.5234, centerNote: "Sandvika", slug: "baerum" },
  "4204": { lat: 58.1467, lon:  7.9956, centerNote: "Kvadraturen", slug: "kristiansand" },
  "3301": { lat: 59.7440, lon: 10.2045, centerNote: "Drammen stasjon", slug: "drammen" },
  "3203": { lat: 59.8337, lon: 10.4345, centerNote: "Asker sentrum", slug: "asker" },
  "3205": { lat: 59.9554, lon: 11.0494, centerNote: "Lillestrøm stasjon", slug: "lillestrom" },
  "3107": { lat: 59.2113, lon: 10.9374, centerNote: "Fredrikstad stasjon", slug: "fredrikstad" },
  "1108": { lat: 58.8516, lon:  5.7355, centerNote: "Sandnes sentrum", slug: "sandnes" },
  "5501": { lat: 69.6489, lon: 18.9551, centerNote: "Tromsø sentrum", slug: "tromso" },
  "3907": { lat: 59.1310, lon: 10.2270, centerNote: "Sandefjord sentrum", slug: "sandefjord" },
  "3207": { lat: 59.7189, lon: 10.8352, centerNote: "Ski sentrum", slug: "nordre-follo" },
  "3105": { lat: 59.2840, lon: 11.1104, centerNote: "Sarpsborg sentrum", slug: "sarpsborg" },
  "3905": { lat: 59.2675, lon: 10.4080, centerNote: "Tønsberg sentrum", slug: "tonsberg" },
  "1508": { lat: 62.4722, lon:  6.1549, centerNote: "Ålesund sentrum", slug: "alesund" },
  "4003": { lat: 59.2090, lon:  9.6059, centerNote: "Skien sentrum", slug: "skien" },
  "1804": { lat: 67.2804, lon: 14.3750, centerNote: "Bodø sentrum", slug: "bodo" },
  "3103": { lat: 59.4344, lon: 10.6576, centerNote: "Moss sentrum", slug: "moss" },
  "3222": { lat: 59.9269, lon: 10.9613, centerNote: "Lørenskog sentrum", slug: "lorenskog" },
  "3909": { lat: 59.0537, lon: 10.0357, centerNote: "Larvik sentrum", slug: "larvik" },
  "3118": { lat: 59.4167, lon: 11.2300, centerNote: "Askim sentrum", slug: "indre-ostfold" },
  "4203": { lat: 58.4622, lon:  8.7711, centerNote: "Arendal sentrum", slug: "arendal" },
  "3209": { lat: 60.1305, lon: 11.1745, centerNote: "Jessheim", slug: "ullensaker" },
  "1149": { lat: 59.2783, lon:  5.2870, centerNote: "Kopervik", slug: "karmoy" },
  "4626": { lat: 60.5380, lon:  4.9450, centerNote: "Straume sentrum", slug: "oygarden" },
  "1106": { lat: 59.4133, lon:  5.2680, centerNote: "Haugesund sentrum", slug: "haugesund" },
  "4001": { lat: 59.1408, lon:  9.6561, centerNote: "Porsgrunn sentrum", slug: "porsgrunn" },
  "3411": { lat: 60.7867, lon: 10.9460, centerNote: "Brumunddal", slug: "ringsaker" },
  "3403": { lat: 60.7945, lon: 11.0675, centerNote: "Hamar sentrum", slug: "hamar" },
  "1506": { lat: 62.7372, lon:  7.1607, centerNote: "Molde sentrum", slug: "molde" },
  "3101": { lat: 59.1235, lon: 11.3870, centerNote: "Halden sentrum", slug: "halden" },
  "3305": { lat: 60.1683, lon: 10.2570, centerNote: "Hønefoss", slug: "ringerike" },
  "3407": { lat: 60.7965, lon: 10.6916, centerNote: "Gjøvik sentrum", slug: "gjovik" },
  "4627": { lat: 60.4056, lon:  5.2286, centerNote: "Kleppestø", slug: "askoy" },
  "4631": { lat: 60.5370, lon:  5.2340, centerNote: "Knarvik", slug: "alver" },
  "3405": { lat: 61.1153, lon: 10.4662, centerNote: "Lillehammer sentrum", slug: "lillehammer" },
  "1124": { lat: 58.8881, lon:  5.6042, centerNote: "Sola sentrum", slug: "sola" },
  "3303": { lat: 59.6633, lon:  9.6476, centerNote: "Kongsberg sentrum", slug: "kongsberg" },
  "3312": { lat: 59.7833, lon: 10.2470, centerNote: "Lierbyen", slug: "lier" },
  "3240": { lat: 60.3270, lon: 11.2620, centerNote: "Sundet (Eidsvoll)", slug: "eidsvoll" },
  "3901": { lat: 59.4170, lon: 10.4830, centerNote: "Horten sentrum", slug: "horten" },
  "3911": { lat: 59.1670, lon: 10.4060, centerNote: "Borgheim", slug: "faerder" },
  "3903": { lat: 59.4900, lon: 10.3120, centerNote: "Holmestrand sentrum", slug: "holmestrand" },
  "4624": { lat: 60.1830, lon:  5.4690, centerNote: "Osøyro", slug: "bjornafjorden" },
  "3232": { lat: 60.0532, lon: 10.8613, centerNote: "Rotnes", slug: "nittedal" },
  "1833": { lat: 66.3127, lon: 14.1428, centerNote: "Mo i Rana", slug: "rana" },
  "4202": { lat: 58.3403, lon:  8.5933, centerNote: "Grimstad sentrum", slug: "grimstad" },
  "5503": { lat: 68.7984, lon: 16.5418, centerNote: "Harstad sentrum", slug: "harstad" },
  "5035": { lat: 63.4693, lon: 10.9195, centerNote: "Stjørdalshalsen", slug: "stjordal" },
  "3228": { lat: 60.1240, lon: 11.4750, centerNote: "Årnes", slug: "nes-akershus" },
  "1505": { lat: 63.1109, lon:  7.7280, centerNote: "Kristiansund sentrum", slug: "kristiansund" },
  "5006": { lat: 64.0150, lon: 11.4960, centerNote: "Steinkjer sentrum", slug: "steinkjer" },
  "4205": { lat: 58.0050, lon:  7.4950, centerNote: "Mandal", slug: "lindesnes" },
  "4647": { lat: 61.5985, lon:  5.9000, centerNote: "Førde", slug: "sunnfjord" },
  "3218": { lat: 59.6640, lon: 10.7910, centerNote: "Ås sentrum", slug: "aas" },
  "5601": { lat: 69.9690, lon: 23.2710, centerNote: "Alta sentrum", slug: "alta" },
  "3420": { lat: 60.8800, lon: 11.5640, centerNote: "Elverum sentrum", slug: "elverum" },
  "3413": { lat: 60.7180, lon: 11.1900, centerNote: "Stangebyen", slug: "stange" },
  "1806": { lat: 68.4385, lon: 17.4272, centerNote: "Narvik sentrum", slug: "narvik" },
  "1120": { lat: 58.7720, lon:  5.6380, centerNote: "Kleppe", slug: "klepp" },
  "3212": { lat: 59.8608, lon: 10.6644, centerNote: "Tangen brygge", slug: "nesodden" },
  "3314": { lat: 59.7470, lon:  9.9180, centerNote: "Hokksund", slug: "ovre-eiker" },
  "3224": { lat: 59.9353, lon: 11.0864, centerNote: "Fjerdingby", slug: "raelingen" },
  "5037": { lat: 63.7470, lon: 11.2980, centerNote: "Levanger sentrum", slug: "levanger" },
  "1121": { lat: 58.7170, lon:  5.7080, centerNote: "Bryne", slug: "time" },
  "3216": { lat: 59.6042, lon: 10.7464, centerNote: "Vestby sentrum", slug: "vestby" },
  "1119": { lat: 58.6090, lon:  5.7060, centerNote: "Varhaug", slug: "haa" },
  "4614": { lat: 59.7790, lon:  5.5070, centerNote: "Leirvik", slug: "stord" },
  "5059": { lat: 63.3060, lon:  9.8470, centerNote: "Orkanger", slug: "orkland" },
  "3226": { lat: 59.9085, lon: 11.5680, centerNote: "Bjørkelangen", slug: "aurskog-hoeland" },
  "3401": { lat: 60.1900, lon: 12.0010, centerNote: "Kongsvinger sentrum", slug: "kongsvinger" },
  "5028": { lat: 63.2840, lon: 10.2730, centerNote: "Melhus sentrum", slug: "melhus" },
  "4602": { lat: 61.5990, lon:  5.0330, centerNote: "Florø", slug: "kinn" },
  "3238": { lat: 60.2200, lon: 11.0150, centerNote: "Nannestad sentrum", slug: "nannestad" },
  "4621": { lat: 60.6297, lon:  6.4137, centerNote: "Vossevangen", slug: "voss" },
  "3214": { lat: 59.6650, lon: 10.6280, centerNote: "Drøbak", slug: "frogn" },
  "4223": { lat: 58.2750, lon:  7.9750, centerNote: "Vennesla sentrum", slug: "vennesla" },
  "1101": { lat: 58.4530, lon:  5.9990, centerNote: "Egersund", slug: "eigersund" },
  "5038": { lat: 63.7910, lon: 11.4810, centerNote: "Verdalsøra", slug: "verdal" },
  "5007": { lat: 64.4670, lon: 11.4980, centerNote: "Namsos sentrum", slug: "namsos" },
  "5031": { lat: 63.4385, lon: 10.6667, centerNote: "Hommelvik", slug: "malvik" },
  "5530": { lat: 69.2390, lon: 17.4070, centerNote: "Finnsnes", slug: "senja" },
  "3442": { lat: 60.6770, lon: 10.8780, centerNote: "Lena", slug: "ostre-toten" },
  "3316": { lat: 59.9690, lon: 10.0170, centerNote: "Vikersund", slug: "modum" },
  "4012": { lat: 59.0410, lon:  9.5650, centerNote: "Langesund", slug: "bamble" },
  "1130": { lat: 59.0510, lon:  6.0240, centerNote: "Jørpeland", slug: "strand" },
  "3446": { lat: 60.3920, lon: 10.5780, centerNote: "Jaren", slug: "gran" },
  "3443": { lat: 60.6800, lon: 10.6700, centerNote: "Raufoss", slug: "vestre-toten" },
  "1579": { lat: 62.9450, lon:  7.2470, centerNote: "Elnesvågen", slug: "hustadvika" },
  "1824": { lat: 65.8330, lon: 13.2310, centerNote: "Mosjøen", slug: "vefsn" },
  "4005": { lat: 59.5580, lon:  9.2570, centerNote: "Notodden sentrum", slug: "notodden" },
  "4617": { lat: 59.9740, lon:  5.9610, centerNote: "Husnes", slug: "kvinnherad" },
  "1122": { lat: 58.7440, lon:  6.0090, centerNote: "Ålgård", slug: "gjesdal" },
  "4640": { lat: 61.2320, lon:  7.1010, centerNote: "Sogndalsfjøra", slug: "sogndal" },
  "4613": { lat: 59.7610, lon:  5.2150, centerNote: "Svortland", slug: "bomlo" },
  "1127": { lat: 59.0010, lon:  5.6610, centerNote: "Randaberg sentrum", slug: "randaberg" },
  "4215": { lat: 58.2510, lon:  8.3760, centerNote: "Lillesand sentrum", slug: "lillesand" },
  "1146": { lat: 59.4530, lon:  5.5450, centerNote: "Aksdal", slug: "tysvaer" },
  "3220": { lat: 59.7600, lon: 11.1400, centerNote: "Kirkebygda", slug: "enebakk" },
  "1860": { lat: 68.1320, lon: 13.6250, centerNote: "Leknes", slug: "vestvagoy" },
  "5603": { lat: 70.6634, lon: 23.6821, centerNote: "Hammerfest sentrum", slug: "hammerfest" },
  "4020": { lat: 59.4060, lon:  9.0670, centerNote: "Bø", slug: "midt-telemark" },
  "1520": { lat: 62.1990, lon:  6.1310, centerNote: "Ørsta sentrum", slug: "orsta" },
  "1577": { lat: 62.1460, lon:  6.0700, centerNote: "Volda sentrum", slug: "volda" },
  "4618": { lat: 60.0750, lon:  6.5470, centerNote: "Odda", slug: "ullensvang" },
  "4225": { lat: 58.1390, lon:  7.0680, centerNote: "Lyngdal sentrum", slug: "lyngdal" },
  "1870": { lat: 68.6940, lon: 15.4070, centerNote: "Sortland sentrum", slug: "sortland" },
  "5057": { lat: 63.6960, lon:  9.6850, centerNote: "Brekstad", slug: "orland" },
  "4014": { lat: 58.8680, lon:  9.4120, centerNote: "Kragerø sentrum", slug: "kragero" },
  "5054": { lat: 63.5800, lon: 10.0780, centerNote: "Vanvikan", slug: "indre-fosen" },
  "4641": { lat: 60.9050, lon:  7.1900, centerNote: "Aurlandsvangen", slug: "aurland" },
  "3347": { lat: 60.5342, lon:  8.2064, centerNote: "Geilo sentrum", slug: "hol" },
  "1865": { lat: 68.2340, lon: 14.5693, centerNote: "Svolvær", slug: "vagan" },
  "1539": { lat: 62.5670, lon:  7.6897, centerNote: "Åndalsnes", slug: "rauma" },
};

/** Norwegian → ASCII slug. Lowercase, hyphens, drop everything else. */
function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface ResolvedCandidate {
  kommunenummer: string;
  kommunenavn: string;
  slug: string;
  lat: number;
  lon: number;
  centerNote: string;
  population: number;
  curated: boolean;
}

async function fetchKommuneList(): Promise<KommuneListEntry[]> {
  const res = await fetch("https://ws.geonorge.no/kommuneinfo/v1/kommuner");
  if (!res.ok) throw new Error(`Kommune list fetch failed: ${res.status}`);
  return (await res.json()) as KommuneListEntry[];
}

async function fetchKommuneDetail(knr: string): Promise<KommuneDetail> {
  const res = await fetch(`https://ws.geonorge.no/kommuneinfo/v1/kommuner/${knr}`);
  if (!res.ok) throw new Error(`Detail ${knr} fetch failed: ${res.status}`);
  return (await res.json()) as KommuneDetail;
}

async function main() {
  console.log("Fetching kommune list…");
  const list = await fetchKommuneList();
  console.log(`Got ${list.length} kommuner. Fetching details…`);

  const details: KommuneDetail[] = new Array(list.length);
  let done = 0;
  for (let i = 0; i < list.length; i += CONCURRENCY) {
    const batch = list.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map((k) => fetchKommuneDetail(k.kommunenummer)),
    );
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.status === "fulfilled") {
        details[i + j] = r.value;
      } else {
        console.error(`  ✗ ${batch[j].kommunenummer} ${batch[j].kommunenavn} — ${r.reason}`);
      }
      done++;
    }
    if (done % 40 === 0 || done === list.length) {
      console.log(`  ${done}/${list.length}`);
    }
    if (i + CONCURRENCY < list.length) {
      await new Promise((r) => setTimeout(r, INTER_BATCH_DELAY_MS));
    }
  }

  const candidates: ResolvedCandidate[] = [];
  for (const d of details) {
    if (!d) continue;
    const knr = d.kommunenummer;
    const curated = CURATED[knr];
    const navn = curated?.kommunenavnOverride ?? d.kommunenavnNorsk ?? d.kommunenavn;
    const pop = kommunePopulation[knr]?.population ?? 0;
    if (curated) {
      candidates.push({
        kommunenummer: knr,
        kommunenavn: navn,
        slug: curated.slug ?? toSlug(navn),
        lat: curated.lat,
        lon: curated.lon,
        centerNote: curated.centerNote,
        population: pop,
        curated: true,
      });
    } else {
      const [lon, lat] = d.punktIOmrade.coordinates;
      candidates.push({
        kommunenummer: knr,
        kommunenavn: navn,
        slug: toSlug(navn),
        lat,
        lon,
        centerNote: "Kommunesentrum",
        population: pop,
        curated: false,
      });
    }
  }

  // Sort: population desc, then kommunenavn asc.
  candidates.sort((a, b) => {
    if (b.population !== a.population) return b.population - a.population;
    return a.kommunenavn.localeCompare(b.kommunenavn, "nb");
  });

  // Deduplicate slugs by appending kommunenummer.
  const slugCount: Record<string, number> = {};
  for (const c of candidates) slugCount[c.slug] = (slugCount[c.slug] ?? 0) + 1;
  for (const c of candidates) {
    if (slugCount[c.slug] > 1) c.slug = `${c.slug}-${c.kommunenummer}`;
  }

  console.log(`\nResolved ${candidates.length} candidates.`);
  console.log(
    `  Curated: ${candidates.filter((c) => c.curated).length}, ` +
      `Kartverket punktIOmrade: ${candidates.filter((c) => !c.curated).length}`,
  );

  const file = renderCandidatesFile(candidates);
  writeFileSync(OUTPUT_PATH, file, "utf8");
  console.log(`\nWrote ${OUTPUT_PATH}`);
}

function renderCandidatesFile(candidates: ResolvedCandidate[]): string {
  const lines = candidates.map((c) => {
    const knr = `"${c.kommunenummer}"`.padEnd(8);
    const navn = `"${c.kommunenavn}"`.padEnd(28);
    const slug = `"${c.slug}"`.padEnd(28);
    const lat = c.lat.toFixed(4).padStart(8);
    const lon = c.lon.toFixed(4).padStart(8);
    const note = `"${c.centerNote}"`;
    return `  { kommunenummer: ${knr}, kommunenavn: ${navn}, slug: ${slug}, lat: ${lat}, lon: ${lon}, centerNote: ${note} },`;
  });

  return `/**
 * Candidate kommuner and comparison addresses for the /klima-poeng landing
 * page. Input to \`scripts/refresh-klima-poeng-landing.ts\`, which scores each
 * via NVE + Kartverket WMS and writes top/bottom rankings to
 * \`klima-poeng-landing-data.ts\`.
 *
 * Coverage: all ${candidates.length} norske kommuner (post-2024 reform).
 *
 * Coordinate strategy:
 *   - For ${candidates.filter((c) => c.curated).length} kommuner Verdikart har hand-curated sentrum coords
 *     (rådhus, torget, stasjon) — those are used directly. Hand-picked points
 *     sit on populated terrain.
 *   - For the remaining ${candidates.filter((c) => !c.curated).length} (mest distrikt-kommuner) we use
 *     Kartverkets \`punktIOmrade\` — et representativt indre punkt fra
 *     kommuneinfo-API. For sprawling fjell-kommuner kan punktet ligge i
 *     ubebodd terreng; det betyr at klimaprofilen reflekterer hva en
 *     adresse i kommunen i snitt ville fått, ikke nødvendigvis
 *     kommunesenteret.
 *
 * Refresh: re-run \`scripts/gen-klima-candidates.ts\` if kommune-strukturen
 * endrer seg eller hvis sentrum-koordinater må oppdateres.
 */

export interface KlimaKommuneCandidate {
  kommunenummer: string;
  kommunenavn: string;
  slug: string;
  lat: number;
  lon: number;
  /** Short note shown under the kommune row, naming the sampled point. */
  centerNote: string;
}

export const KLIMA_KOMMUNE_CANDIDATES: ReadonlyArray<KlimaKommuneCandidate> = [
${lines.join("\n")}
];

/**
 * City-pair comparisons rendered as side-by-side breakdowns. Each pair
 * surfaces a contrast: classic urban rivalry, or coast-vs-inland geometry
 * that the score should distinguish clearly.
 */
export interface KlimaCityComparison {
  pairId: string;
  /** Headline shown above the pair. */
  title: string;
  /** Why this pair was chosen — shown as a short subtitle. */
  rationale: string;
  left: KlimaComparisonPoint;
  right: KlimaComparisonPoint;
}

export interface KlimaComparisonPoint {
  label: string;
  kommunenavn: string;
  kommunenummer: string;
  lat: number;
  lon: number;
}

export const KLIMA_CITY_COMPARISONS: ReadonlyArray<KlimaCityComparison> = [
  {
    pairId: "oslo-bergen",
    title: "Oslo vs. Bergen",
    rationale: "Innland mot vestkyst — stormflo og høy nedbør drar Bergen ned, mens Oslo trekkes ned av høy radon.",
    left:  { label: "Karl Johans gate, Oslo", kommunenavn: "Oslo",   kommunenummer: "0301", lat: 59.9127, lon: 10.7461 },
    right: { label: "Bryggen, Bergen",        kommunenavn: "Bergen", kommunenummer: "4601", lat: 60.3927, lon:  5.3242 },
  },
  {
    pairId: "stavanger-trondheim",
    title: "Stavanger vs. Trondheim",
    rationale: "To kystbyer — kvikkleirebåndet rundt Trondheimsfjorden vs. flomutsatte kanaler i Stavanger sentrum.",
    left:  { label: "Stavanger sentrum",    kommunenavn: "Stavanger",  kommunenummer: "1103", lat: 58.9700, lon:  5.7340 },
    right: { label: "Trondheim torg",       kommunenavn: "Trondheim",  kommunenummer: "5001", lat: 63.4305, lon: 10.3951 },
  },
  {
    pairId: "kristiansand-tromso",
    title: "Kristiansand vs. Tromsø",
    rationale: "Sørlandskyst mot arktisk by — milde stormer kontra stigende permafrost-temperatur og snøskredfare.",
    left:  { label: "Kvadraturen, Kristiansand", kommunenavn: "Kristiansand", kommunenummer: "4204", lat: 58.1467, lon:  7.9956 },
    right: { label: "Tromsø sentrum",            kommunenavn: "Tromsø",       kommunenummer: "5501", lat: 69.6489, lon: 18.9551 },
  },
  {
    pairId: "flam-elverum",
    title: "Flåm vs. Elverum",
    rationale: "Fjordbygd under stupbratte fjellsider mot rolig innland — skred mot ingen-skred i samme tabell.",
    left:  { label: "Flåm sentrum",   kommunenavn: "Aurland", kommunenummer: "4641", lat: 60.8635, lon:  7.1138 },
    right: { label: "Elverum sentrum", kommunenavn: "Elverum", kommunenummer: "3420", lat: 60.8800, lon: 11.5640 },
  },
];
`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
