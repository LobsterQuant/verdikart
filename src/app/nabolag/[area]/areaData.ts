export interface AreaData {
  slug: string;
  name: string;
  city: string;
  citySlug: string;
  kommunenummer: string;
  population: string;
  avgSqmPrice: number;
  avgSqmPriceYoY: number;
  priceSegment: "Lavt" | "Middels" | "Høyt" | "Svært høyt";
  transitScore: "Utmerket" | "Godt" | "Middels" | "Begrenset";
  topStreets: string[];
  metaTitle: string;
  metaDescription: string;
  heroHeading: string;
  heroSubheading: string;
  introText: string;
  transitText: string;
  faq: Array<{ q: string; a: string }>;
}

export const areas: Record<string, AreaData> = {
  // ── Oslo bydeler ──
  frogner: {
    slug: "frogner",
    name: "Frogner",
    city: "Oslo",
    citySlug: "oslo",
    kommunenummer: "0301",
    population: "60 000",
    avgSqmPrice: 151900,
    avgSqmPriceYoY: 5.2,
    priceSegment: "Svært høyt",
    transitScore: "Utmerket",
    topStreets: ["Bygdøy allé", "Frognerveien", "Drammensveien", "Kirkeveien"],
    metaTitle: "Frogner Oslo — Boligpriser og nabolagsdata 2026 | Verdikart",
    metaDescription: "Boligpriser, kollektivtransport og nabolagsdata for Frogner i Oslo. Gjennomsnittlig kvadratmeterpris: 151 900 kr/m². Se full analyse på Verdikart.",
    heroHeading: "Frogner — Oslos dyreste bydel",
    heroSubheading: "Ambassadestrøk, villa og art nouveau-bygg langs fjorden",
    introText: "Frogner er blant Norges mest attraktive boområder. Bydelen strekker seg fra Frognerparken ned mot Bygdøy og kjennetegnes av store leiligheter i klassiske murgårder, ambassader og strandlinje. Kvadratmeterprisen er blant de høyeste i landet.",
    transitText: "Frogner er svært godt dekket av kollektivtransport. T-bane linje 1 (Frognerseteren), trikkelinjene 12 og 19 samt en rekke busslinjer gir rask tilgang til Oslo S og Nationaltheatret.",
    faq: [
      { q: "Hva er gjennomsnittsprisen per m² i Frogner?", a: "Gjennomsnittlig kvadratmeterpris i Frogner er ca. 151 900 kr/m² (SSB, siste kvartal 2024). Dette er blant de høyeste i landet." },
      { q: "Er Frogner et godt sted å bo?", a: "Frogner scorer høyt på nærhet til parker, restauranter, kafeer og kulturtilbud. Skoletilbudet er godt, og bydelen er trygg med lav kriminalitetsrate." },
      { q: "Hvilke T-banelinjer dekker Frogner?", a: "Linje 1 (Frognerseteren–Bergkrystallen) har stasjoner på Nationaltheatret og Majorstuen, begge innen gangavstand fra de fleste adresser i Frogner." },
    ],
  },
  grunerløkka: {
    slug: "grunerlokka",
    name: "Grünerløkka",
    city: "Oslo",
    citySlug: "oslo",
    kommunenummer: "0301",
    population: "55 000",
    avgSqmPrice: 112400,
    avgSqmPriceYoY: 6.1,
    priceSegment: "Høyt",
    transitScore: "Utmerket",
    topStreets: ["Thorvald Meyers gate", "Markveien", "Grüners gate", "Olaf Ryes plass"],
    metaTitle: "Grünerløkka Oslo — Boligpriser og nabolagsdata 2026 | Verdikart",
    metaDescription: "Boligpriser, kollektivtransport og nabolagsdata for Grünerløkka i Oslo. Gjennomsnittlig kvadratmeterpris: 112 400 kr/m². Se full analyse på Verdikart.",
    heroHeading: "Grünerløkka — Kultur, kaffe og mangfold",
    heroSubheading: "Oslos hippe bydel med trikk, elvepark og streetfood",
    introText: "Grünerløkka er en av Oslos mest levende bydeler med et rikt uteliv, uavhengige butikker og Akerselva som grønn ryggrad. Boligmassen domineres av mursteinsbygg fra 1880–1920-tallet, nå omgjort til attraktive leiligheter.",
    transitText: "Trikkelinjene 11, 12 og 18 løper gjennom bydelen og gir rask tilgang til sentrum og Majorstuen. Busslinjer 37 og 54 dekker østre del.",
    faq: [
      { q: "Hva er prisen per m² på Grünerløkka?", a: "Gjennomsnittlig kvadratmeterpris er ca. 112 400 kr/m², opp 6,1 % siste år. Bydelen har hatt sterk prisvekst de siste 10 årene." },
      { q: "Er Grünerløkka trygt?", a: "Grünerløkka har moderat kriminalitetsrate sammenlignet med Oslo sentrum. Det har blitt tryggere de siste årene i takt med gentrifiseringen." },
      { q: "Finnes det familieleiligheter på Grünerløkka?", a: "Ja, særlig i randsonene mot Sinsen og Sofienberg finner man større leiligheter. Olaf Ryes plass-området er populært blant barnefamilier." },
    ],
  },
  // Alias for URL slug
  grunerlokka: {
    slug: "grunerlokka",
    name: "Grünerløkka",
    city: "Oslo",
    citySlug: "oslo",
    kommunenummer: "0301",
    population: "55 000",
    avgSqmPrice: 112400,
    avgSqmPriceYoY: 6.1,
    priceSegment: "Høyt",
    transitScore: "Utmerket",
    topStreets: ["Thorvald Meyers gate", "Markveien", "Grüners gate", "Olaf Ryes plass"],
    metaTitle: "Grünerløkka Oslo — Boligpriser og nabolagsdata 2026 | Verdikart",
    metaDescription: "Boligpriser, kollektivtransport og nabolagsdata for Grünerløkka i Oslo. Gjennomsnittlig kvadratmeterpris: 112 400 kr/m². Se full analyse på Verdikart.",
    heroHeading: "Grünerløkka — Kultur, kaffe og mangfold",
    heroSubheading: "Oslos hippe bydel med trikk, elvepark og streetfood",
    introText: "Grünerløkka er en av Oslos mest levende bydeler med et rikt uteliv, uavhengige butikker og Akerselva som grønn ryggrad. Boligmassen domineres av mursteinsbygg fra 1880–1920-tallet, nå omgjort til attraktive leiligheter.",
    transitText: "Trikkelinjene 11, 12 og 18 løper gjennom bydelen og gir rask tilgang til sentrum og Majorstuen. Busslinjer 37 og 54 dekker østre del.",
    faq: [
      { q: "Hva er prisen per m² på Grünerløkka?", a: "Gjennomsnittlig kvadratmeterpris er ca. 112 400 kr/m², opp 6,1 % siste år." },
      { q: "Er Grünerløkka trygt?", a: "Grünerløkka har moderat kriminalitetsrate sammenlignet med Oslo sentrum. Det har blitt tryggere de siste årene." },
      { q: "Finnes det familieleiligheter på Grünerløkka?", a: "Ja, særlig i randsonene mot Sinsen og Sofienberg finner man større leiligheter." },
    ],
  },
  majorstuen: {
    slug: "majorstuen",
    name: "Majorstuen",
    city: "Oslo",
    citySlug: "oslo",
    kommunenummer: "0301",
    population: "28 000",
    avgSqmPrice: 134200,
    avgSqmPriceYoY: 4.8,
    priceSegment: "Svært høyt",
    transitScore: "Utmerket",
    topStreets: ["Bogstadveien", "Vibes gate", "Sørkedalsveien", "Kirkeveien"],
    metaTitle: "Majorstuen Oslo — Boligpriser og nabolagsdata 2026 | Verdikart",
    metaDescription: "Boligpriser, kollektivtransport og nabolagsdata for Majorstuen i Oslo. Gjennomsnittlig kvadratmeterpris: 134 200 kr/m². Se full analyse på Verdikart.",
    heroHeading: "Majorstuen — Shoppegaten og T-baneknuten",
    heroSubheading: "Vest-Oslos pulserende knutepunkt med alt innen gangavstand",
    introText: "Majorstuen er et av Oslos viktigste kollektivknutepunkter og shoppingstrøk. Bogstadveien er en av Norges mest populære handlegater. Boligmassen er variert — fra klassiske murgårder til nyere leiligheter.",
    transitText: "Majorstuen stasjon er knutepunkt for T-banelinje 1, 2, 3 og 6, samt trikkelinjene 11 og 12. Det er svært sjelden man venter mer enn 3 minutter på neste avgang.",
    faq: [
      { q: "Hva er kvadratmeterprisen på Majorstuen?", a: "Gjennomsnittlig kvadratmeterpris er ca. 134 200 kr/m², noe lavere enn Frogner men fortsatt i øverste sjikt i Oslo." },
      { q: "Hvilket kollektivtilbud finnes på Majorstuen?", a: "Majorstuen er et av Oslos beste kollektivknutepunkter — 4 T-banelinjer og 2 trikkelinjer. Reisetid til Oslo S: ~8 minutter." },
      { q: "Passer Majorstuen for barnefamilier?", a: "Ja — gode skoler, Frognerparken i umiddelbar nærhet, lite gjennomgangstrafikk i boliggatene og høy trygghet." },
    ],
  },
  // ── Bergen bydeler ──
  "nordnes": {
    slug: "nordnes",
    name: "Nordnes",
    city: "Bergen",
    citySlug: "bergen",
    kommunenummer: "4601",
    population: "9 000",
    avgSqmPrice: 72400,
    avgSqmPriceYoY: 4.1,
    priceSegment: "Høyt",
    transitScore: "Godt",
    topStreets: ["Nordnesparken", "Nedre Korskirkeallmenning", "Nøstegaten"],
    metaTitle: "Nordnes Bergen — Boligpriser og nabolagsdata 2026 | Verdikart",
    metaDescription: "Boligpriser, kollektivtransport og nabolagsdata for Nordnes i Bergen. Gjennomsnittlig kvadratmeterpris: 72 400 kr/m². Se full analyse på Verdikart.",
    heroHeading: "Nordnes — Bergen ut mot Byfjorden",
    heroSubheading: "Tett og sjarmerende trebyhusbebyggelse med fjordutsikt",
    introText: "Nordnes er en halvøy vest i Bergen sentrum med en unik blanding av sjøhus, trebyer og det populære Nordnesparken med sjøbadet. Et av Bergens mest ettertraktede boligområder.",
    transitText: "Busslinjer fra Bergen sentrum dekker Nordnes. Bysykkel er populært. Gange til Bryggen: ~10 minutter.",
    faq: [
      { q: "Hva er boligprisene på Nordnes?", a: "Gjennomsnittlig kvadratmeterpris er ca. 72 400 kr/m². Prisene er høye sammenlignet med Bergen generelt, men lave sett mot Oslo." },
      { q: "Er det lett å komme seg kollektivt fra Nordnes?", a: "Buss er det primære alternativet. Bybanen går ikke til Nordnes, men til sentrum er det kort sykkel- eller gangtid." },
    ],
  },
};

export function getArea(slug: string): AreaData | undefined {
  return areas[slug];
}

export function getAllAreaSlugs(): Array<{ area: string }> {
  return Object.keys(areas)
    .filter((key) => areas[key].slug === key) // deduplicate aliases
    .map((area) => ({ area }));
}
