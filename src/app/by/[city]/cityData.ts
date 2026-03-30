export interface CityData {
  slug: string;
  name: string;
  county: string;
  kommunenummer: string;
  population: string;
  avgSqmPrice: number;          // kr/m²
  avgSqmPriceYoY: number;       // % change YoY
  medianPrice: number;          // kr
  avgCommute: number;           // minutes to centre
  topNeighbourhoods: string[];
  metaTitle: string;
  metaDescription: string;
  heroHeading: string;
  heroSubheading: string;
  introText: string;
  marketText: string;
  transitText: string;
  faq: Array<{ q: string; a: string }>;
}

const cities: Record<string, CityData> = {
  oslo: {
    slug: "oslo",
    name: "Oslo",
    county: "Oslo",
    kommunenummer: "0301",
    population: "717 000",
    avgSqmPrice: 94_200,
    avgSqmPriceYoY: 5.1,
    medianPrice: 5_200_000,
    avgCommute: 18,
    topNeighbourhoods: ["Frogner", "Grünerløkka", "Majorstuen", "St. Hanshaugen", "Sagene"],
    metaTitle: "Boligpriser Oslo 2026 – Se hva boliger koster i din bydel | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Oslo 2026. Se gjennomsnittlig kvadratmeterpris per bydel, prisutvikling og kollektivtransport for alle adresser i Oslo.",
    heroHeading: "Boligpriser i Oslo 2026",
    heroSubheading: "Se hva boliger faktisk koster i din bydel — med kollektivdata og prisutvikling i sanntid.",
    introText: "Oslo er Norges dyreste boligmarked. Med en gjennomsnittlig kvadratmeterpris på 94 200 kr og en prisoppgang på 5,1 % siste år, er det viktigere enn noen gang å ha oppdatert innsikt før du kjøper. Verdikart samler boligpriser, kollektivtransport og nabolagsdata for alle adresser i Oslo.",
    marketText: "Boligprisene i Oslo varierer kraftig mellom bydelene. Frogner og Vestre Aker topper prisoversikten med kvadratmeterpriser over 110 000 kr, mens bydeler som Søndre Nordstrand og Stovner tilbyr vesentlig lavere inngangspris. Markedet i indre Oslo har hatt stabil prisvekst siden 2021, og eksperter venter moderat vekst på 3–6 % gjennom 2026.",
    transitText: "Oslo har Norges beste kollektivnett. T-banen dekker store deler av byen med avganger hvert 3.–5. minutt i rushtiden. Trikk, buss og båt supplerer nettet. For boligkjøpere er avstand til nærmeste T-banestasjon en av de sterkeste prisdriverne i Oslo.",
    faq: [
      { q: "Hva koster en bolig i Oslo i 2026?", a: "Gjennomsnittlig kvadratmeterpris i Oslo er 94 200 kr (2026). Medianprisen for en bolig er ca. 5,2 millioner kroner. Prisene varierer mye mellom bydeler — fra 60 000 kr/m² i ytre bydeler til over 110 000 kr/m² på Frogner." },
      { q: "Hvilke bydeler i Oslo er billigst å kjøpe bolig?", a: "Søndre Nordstrand, Stovner og Alna er blant bydelene med lavest kvadratmeterpris i Oslo. Her kan du forvente priser mellom 55 000 og 70 000 kr/m²." },
      { q: "Er det lurt å kjøpe bolig i Oslo nå?", a: "Boligmarkedet i Oslo er sterkt, men prisveksten har avtatt sammenlignet med 2021–2022. Renten er fortsatt høy, og det er viktig å gjøre grundig research på beliggenhet, transport og nærområde før kjøp." },
      { q: "Hva er gjennomsnittlig reisetid med kollektivt i Oslo?", a: "Gjennomsnittlig reisetid med kollektivt til Oslo S fra boliger i Oslo er ca. 18 minutter. Boliger innenfor 5 minutters gange til T-bane prises typisk 8–12 % høyere enn tilsvarende boliger lenger unna." },
    ],
  },

  bergen: {
    slug: "bergen",
    name: "Bergen",
    county: "Vestland",
    kommunenummer: "4601",
    population: "287 000",
    avgSqmPrice: 62_400,
    avgSqmPriceYoY: 4.3,
    medianPrice: 3_800_000,
    avgCommute: 22,
    topNeighbourhoods: ["Fana", "Åsane", "Bergenhus", "Laksevåg", "Fyllingsdalen"],
    metaTitle: "Boligpriser Bergen 2026 – Kjøpe bolig i Bergen | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Bergen 2026. Gjennomsnittlig kvadratmeterpris, prisutvikling og kollektivdata for alle adresser i Bergen kommune.",
    heroHeading: "Kjøpe bolig i Bergen 2026",
    heroSubheading: "Komplett oversikt over boligprisene i Bergen — med kollektivtransport og nabolagsdata for hver adresse.",
    introText: "Bergen er Norges nest største by og har et boligmarked i sterk vekst. Med en gjennomsnittlig kvadratmeterpris på 62 400 kr og 4,3 % prisstigning siste år, kombinerer Bergen storbyfordeler med lavere priser enn Oslo. Bryggen, Fløyen og de historiske gatene gjør Bergen til et attraktivt sted å bo.",
    marketText: "Bergenhus bydel og Sentrum har de høyeste kvadratmeterprisene i Bergen, mens Åsane og Fyllingsdalen tilbyr god plass til lavere pris. Boligmarkedet i Bergen har vært stabilt med moderat vekst de siste tre årene. Utbygging av Bybanen har løftet prisene i bydelene langs banetraséen merkbart.",
    transitText: "Bybanen er ryggraden i Bergens kollektivnett og kobler sentrum med Flesland flyplass, Fana og Fyllingsdalen. Rutebuss supplerer Bybanen i alle bydeler. For boligkjøpere er nærhet til Bybanestasjon en viktig prisfaktor — særlig langs traseen mot sør.",
    faq: [
      { q: "Hva koster en bolig i Bergen i 2026?", a: "Gjennomsnittlig kvadratmeterpris i Bergen er 62 400 kr (2026). Medianprisen for en bolig er ca. 3,8 millioner kroner. Prisene er lavest i Åsane og høyest i Bergenhus." },
      { q: "Hvor er det billigst å kjøpe bolig i Bergen?", a: "Åsane, Arna og Fyllingsdalen er blant bydelene med de laveste boligprisene i Bergen, med kvadratmeterpriser mellom 48 000 og 56 000 kr." },
      { q: "Hva er Bybanen og hvordan påvirker den boligprisene?", a: "Bybanen er Bergens moderne sporvognnett. Boliger langs banetraséen prises typisk 6–10 % høyere enn tilsvarende boliger uten bybanetilgang, ifølge SSB-data." },
      { q: "Er Bergen billigere enn Oslo?", a: "Ja — gjennomsnittlig kvadratmeterpris i Bergen er ca. 34 % lavere enn i Oslo. For samme budsjett får du vesentlig mer areal, og Bergen scorer høyt på livskvalitet og natur." },
    ],
  },

  trondheim: {
    slug: "trondheim",
    name: "Trondheim",
    county: "Trøndelag",
    kommunenummer: "5001",
    population: "213 000",
    avgSqmPrice: 54_100,
    avgSqmPriceYoY: 6.2,
    medianPrice: 3_200_000,
    avgCommute: 20,
    topNeighbourhoods: ["Midtbyen", "Nidarvoll", "Heimdal", "Saupstad", "Lerkendal"],
    metaTitle: "Boligpriser Trondheim 2026 – Kjøpe bolig i Trondheim | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Trondheim 2026. Se kvadratmeterpris, prisutvikling og kollektivdata for alle adresser i Trondheim.",
    heroHeading: "Kjøpe bolig i Trondheim 2026",
    heroSubheading: "Alt du trenger å vite om boligmarkedet i Trondheim — priser, kollektivtransport og nabolagsdata.",
    introText: "Trondheim er Norges tredje største by og en av de raskest voksende. Med NTNU, sterk teknologisektor og et levende studentmiljø er boligetterspørselen høy. Gjennomsnittlig kvadratmeterpris er 54 100 kr, og prisene steg 6,2 % siste år — høyere enn Oslo og Bergen.",
    marketText: "Midtbyen og nærliggende bydeler som Nedre Elvehavn og Øya er de dyreste områdene i Trondheim. Studentbydelen Nedre Elvehavn er populær blant unge kjøpere, mens Heimdal og Saupstad tilbyr romslige boliger til rimeligere priser. Boligmarkedet er preget av høy aktivitet i studentperiodene.",
    transitText: "Trondheim har bybuss og Gråkallbanen — Norges eneste gjenværende trikkelinje utenfor Oslo. Metrobuss-systemet kobler alle bydeler med sentrum. Sykkel er også svært utbredt i Trondheim, og mange boligkjøpere vektlegger sykkelveinett i tillegg til kollektivtilbud.",
    faq: [
      { q: "Hva koster en bolig i Trondheim i 2026?", a: "Gjennomsnittlig kvadratmeterpris i Trondheim er 54 100 kr (2026). Medianprisen for en bolig er ca. 3,2 millioner kroner. Prisene er høyest i Midtbyen og lavest i Saupstad og Heimdal." },
      { q: "Hvor er det billigst å kjøpe bolig i Trondheim?", a: "Saupstad, Heimdal og Flatåsen har de laveste boligprisene i Trondheim, med kvadratmeterpriser mellom 40 000 og 48 000 kr." },
      { q: "Hvordan er kollektivtilbudet i Trondheim?", a: "Trondheim har metrobuss og Gråkallbanen (trikk). Metrobussen har høy frekvens og dekker alle bydeler. Reisetiden til sentrum er typisk 15–25 minutter fra de fleste boligområder." },
      { q: "Er Trondheim et godt sted å investere i bolig?", a: "Trondheim hadde Norges høyeste prosentvise prisvekst blant storbyene i 2025 (6,2 %). Kombinasjonen av stor studentbefolkning, sterk arbeidsmarked og relativt lav inngangspris gjør Trondheim attraktivt for boliginvestering." },
    ],
  },
};

export function getCityData(slug: string): CityData | null {
  return cities[slug] ?? null;
}

export const allCitySlugs = Object.keys(cities);
export { cities };
