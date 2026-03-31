export interface CityData {
  slug: string;
  name: string;
  county: string;
  kommunenummer: string;
  population: string;
  avgSqmPrice: number;
  avgSqmPriceYoY: number;
  medianPrice: number;
  avgCommute: number;
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
    slug: "oslo", name: "Oslo", county: "Oslo", kommunenummer: "0301", population: "717 000",
    avgSqmPrice: 94_200, avgSqmPriceYoY: 5.1, medianPrice: 5_200_000, avgCommute: 18,
    topNeighbourhoods: ["Frogner", "Grünerløkka", "Majorstuen", "St. Hanshaugen", "Sagene"],
    metaTitle: "Boligpriser Oslo 2026 – Se hva boliger koster i din bydel | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Oslo 2026. Se gjennomsnittlig kvadratmeterpris per bydel, prisutvikling og kollektivtransport for alle adresser i Oslo.",
    heroHeading: "Boligpriser i Oslo 2026",
    heroSubheading: "Se hva boliger faktisk koster i din bydel — med kollektivdata og prisutvikling i sanntid.",
    introText: "Oslo er Norges dyreste boligmarked. Med en gjennomsnittlig kvadratmeterpris på 94 200 kr og en prisoppgang på 5,1 % siste år, er det viktigere enn noen gang å ha oppdatert innsikt. Verdikart samler boligpriser, kollektivtransport og nabolagsdata for alle adresser i Oslo.",
    marketText: "Boligprisene i Oslo varierer kraftig. Frogner og Vestre Aker topper prisoversikten med over 110 000 kr/m², mens Søndre Nordstrand og Stovner tilbyr vesentlig lavere inngangspris. Markedet i indre Oslo har hatt stabil vekst siden 2021.",
    transitText: "Oslo har Norges beste kollektivnett — T-bane med avganger hvert 3–5 minutt i rush, trikk, buss og båt. Avstand til nærmeste T-banestasjon er en av de sterkeste prisdriverne.",
    faq: [
      { q: "Hva koster en bolig i Oslo i 2026?", a: "Gjennomsnittlig kvadratmeterpris er 94 200 kr. Medianpris ca. 5,2 mill. Prisene varierer fra 60 000 kr/m² i ytre bydeler til over 110 000 kr/m² på Frogner." },
      { q: "Hvilke bydeler i Oslo er billigst?", a: "Søndre Nordstrand, Stovner og Alna er blant de billigste, med priser mellom 55 000 og 70 000 kr/m²." },
      { q: "Er det lurt å kjøpe bolig i Oslo nå?", a: "Prisveksten har avtatt fra toppårene 2021–2022. Renten er fortsatt høy, men forventning om rentekutt i H2 2026 gir markedet medvind." },
      { q: "Hva er gjennomsnittlig reisetid med kollektivt i Oslo?", a: "Ca. 18 minutter til Oslo S fra boliger i Oslo. Boliger innenfor 5 minutters gange til T-bane prises typisk 8–12 % høyere." },
    ],
  },

  bergen: {
    slug: "bergen", name: "Bergen", county: "Vestland", kommunenummer: "4601", population: "287 000",
    avgSqmPrice: 62_400, avgSqmPriceYoY: 4.3, medianPrice: 3_800_000, avgCommute: 22,
    topNeighbourhoods: ["Nordnes", "Fana", "Sandviken", "Bergenhus", "Åsane"],
    metaTitle: "Boligpriser Bergen 2026 – Kjøpe bolig i Bergen | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Bergen 2026. Gjennomsnittlig kvadratmeterpris, prisutvikling og kollektivdata for alle adresser i Bergen.",
    heroHeading: "Kjøpe bolig i Bergen 2026",
    heroSubheading: "Komplett oversikt over boligprisene i Bergen — med kollektivtransport og nabolagsdata.",
    introText: "Bergen er Norges nest største by med et boligmarked i sterk vekst. Gjennomsnittlig kvadratmeterpris er 62 400 kr og steg 4,3 % siste år. Bergen kombinerer storbyfordeler med lavere priser enn Oslo og en enestående beliggenhet mellom fjell og fjord.",
    marketText: "Bergenhus og Sentrum har de høyeste kvadratmeterprisene. Åsane og Fyllingsdalen tilbyr god plass til lavere pris. Bybanen har løftet prisene langs traseen merkbart siden 2010.",
    transitText: "Bybanen kobler sentrum med Flesland, Fana og Fyllingsdalen. Rutebuss supplerer i alle bydeler. Nærhet til Bybanestasjon er en viktig prisfaktor i Bergen.",
    faq: [
      { q: "Hva koster en bolig i Bergen i 2026?", a: "Gjennomsnittlig kvadratmeterpris er 62 400 kr. Medianpris ca. 3,8 mill. Lavest i Åsane og høyest i Bergenhus." },
      { q: "Hvor er det billigst å kjøpe bolig i Bergen?", a: "Åsane, Arna og Fyllingsdalen, med kvadratmeterpriser mellom 48 000 og 56 000 kr." },
      { q: "Hva er Bybanen og hvordan påvirker den boligprisene?", a: "Bybanen er Bergens sporvognnett. Boliger langs traseen prises typisk 6–10 % høyere enn tilsvarende boliger uten tilgang." },
      { q: "Er Bergen billigere enn Oslo?", a: "Ja — ca. 34 % lavere gjennomsnittspris. For samme budsjett får du vesentlig mer areal i Bergen." },
    ],
  },

  trondheim: {
    slug: "trondheim", name: "Trondheim", county: "Trøndelag", kommunenummer: "5001", population: "213 000",
    avgSqmPrice: 54_100, avgSqmPriceYoY: 6.2, medianPrice: 3_200_000, avgCommute: 20,
    topNeighbourhoods: ["Bakklandet", "Lade", "Moholt", "Midtbyen", "Heimdal"],
    metaTitle: "Boligpriser Trondheim 2026 – Kjøpe bolig i Trondheim | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Trondheim 2026. Kvadratmeterpris, prisutvikling og kollektivdata for alle adresser i Trondheim.",
    heroHeading: "Kjøpe bolig i Trondheim 2026",
    heroSubheading: "Alt du trenger å vite om boligmarkedet i Trondheim — priser, kollektivtransport og nabolagsdata.",
    introText: "Trondheim er Norges tredje største by og en av de raskest voksende. Med NTNU, sterk teknologisektor og levende studentmiljø er boligetterspørselen høy. Kvadratmeterpris 54 100 kr, prisvekst 6,2 % — høyest blant norske storbyer.",
    marketText: "Midtbyen og Nedre Elvehavn er de dyreste delene. Heimdal og Saupstad tilbyr romslige boliger til rimeligere priser. Markedet er preget av sterk etterspørsel fra unge og studenter.",
    transitText: "Trondheim har metrobuss og Gråkallbanen — Norges eneste trikkelinje utenfor Oslo. Metrobussen dekker alle bydeler med høy frekvens. Sykkel er svært utbredt.",
    faq: [
      { q: "Hva koster en bolig i Trondheim i 2026?", a: "Gjennomsnittlig kvadratmeterpris er 54 100 kr. Medianpris ca. 3,2 mill. Høyest i Midtbyen, lavest i Saupstad." },
      { q: "Hvor er det billigst å kjøpe bolig i Trondheim?", a: "Saupstad, Heimdal og Flatåsen, med kvadratmeterpriser mellom 40 000 og 48 000 kr." },
      { q: "Hvordan er kollektivtilbudet i Trondheim?", a: "Metrobuss og Gråkallbanen. Reisetid til sentrum typisk 15–25 minutter fra de fleste boligområder." },
      { q: "Er Trondheim et godt sted å investere i bolig?", a: "Trondheim hadde høyest prosentvis prisvekst blant norske storbyer i 2025 (6,2 %). Sterk studentøkonomi og arbeidsmarked driver etterspørselen." },
    ],
  },

  stavanger: {
    slug: "stavanger", name: "Stavanger", county: "Rogaland", kommunenummer: "1103", population: "145 000",
    avgSqmPrice: 57_800, avgSqmPriceYoY: 7.4, medianPrice: 3_600_000, avgCommute: 19,
    topNeighbourhoods: ["Stavanger sentrum", "Hundvåg", "Hillevåg", "Hinna", "Madla"],
    metaTitle: "Boligpriser Stavanger 2026 – Kjøpe bolig i Stavanger | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Stavanger 2026. Se kvadratmeterpris, prisutvikling og kollektivdata for alle adresser i Stavanger.",
    heroHeading: "Kjøpe bolig i Stavanger 2026",
    heroSubheading: "Boligprisene i Stavanger har steget kraftig — her er alt du trenger å vite.",
    introText: "Stavanger er Norges olje- og energihovedstad. Med høy sysselsetting i energisektoren og stabilt lønnsnivå er boligmarkedet sterkt. Kvadratmeterpris 57 800 kr, prisoppgang 7,4 % siste år — blant Norges høyeste vekstrater.",
    marketText: "Stavanger sentrum og Våland er de dyreste boligområdene. Hundvåg og Hinna tilbyr gode boliger til noe lavere priser. Energisektorens sykluser påvirker boligmarkedet, og det er for tiden høy aktivitet.",
    transitText: "Stavanger har bybuss og tidligere planlagt Bybane (nå satt på vent). Bussvei 2020 er regionens raskte bussforbindelse. Sandnes er nærmeste storby og er lett tilgjengelig med tog og buss.",
    faq: [
      { q: "Hva koster en bolig i Stavanger i 2026?", a: "Gjennomsnittlig kvadratmeterpris er 57 800 kr. Medianpris ca. 3,6 mill. Prisveksten var 7,4 % siste år — blant landets høyeste." },
      { q: "Hvorfor stiger boligprisene i Stavanger?", a: "Økt aktivitet i oljesektoren, høy sysselsetting og begrenset nybygg driver prisene. Energiomstillingen bidrar også til økt etterspørsel fra teknologiselskaper." },
      { q: "Hva er kollektivtilbudet i Stavanger?", a: "Stavanger har bybuss med godt dekningstilbud. Bussvei 2020 er en høyfrekvens busstrasé mot Sandnes. Tog mot Egersund og Oslo." },
      { q: "Er Stavanger dyrere enn Bergen og Trondheim?", a: "Kvadratmeterprisen i Stavanger (57 800 kr) er noe høyere enn Trondheim (54 100 kr) og lavere enn Bergen (62 400 kr) i 2026." },
    ],
  },

  baerum: {
    slug: "baerum", name: "Bærum", county: "Akershus", kommunenummer: "3024", population: "127 000",
    avgSqmPrice: 72_500, avgSqmPriceYoY: 4.8, medianPrice: 4_800_000, avgCommute: 28,
    topNeighbourhoods: ["Sandvika", "Bekkestua", "Lysaker", "Jar", "Fornebu"],
    metaTitle: "Boligpriser Bærum 2026 – Kjøpe bolig i Bærum | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Bærum 2026. Kvadratmeterpris, prisutvikling og kollektivdata for Sandvika, Bekkestua, Lysaker og Fornebu.",
    heroHeading: "Kjøpe bolig i Bærum 2026",
    heroSubheading: "En av Norges dyreste kommuner — her er prisoversikten du trenger.",
    introText: "Bærum er en av Norges dyreste boligkommuner, med høy gjennomsnittsinntekt, grønne omgivelser og nær tilknytning til Oslo. Kvadratmeterpris 72 500 kr, stabile 4,8 % prisvekst siste år. Fornebubanen som åpner 2027 vil ytterligere koble kommunen til Oslo.",
    marketText: "Lysaker og Fornebu er i sterk utvikling med nye boligprosjekter. Sandvika er kommunesentrum med god handel og kollektiv. Bekkestua er populær blant barnefamilier. Prisene er høye over hele kommunen, men variasjonen er stor — fra 60 000 til 90 000+ kr/m².",
    transitText: "Bærum har T-bane til Kolsås og Østerås, regiontog fra Sandvika, og buss. Fornebubanen vil fra 2027 koble Fornebu direkte til Majorstuen på under 12 minutter — og vil trolig løfte prisene langs traseen.",
    faq: [
      { q: "Hva koster en bolig i Bærum i 2026?", a: "Gjennomsnittlig kvadratmeterpris er 72 500 kr. Medianpris ca. 4,8 mill. Dyreste i Lysaker/Fornebu, noe lavere i indre Bærum." },
      { q: "Hva er Fornebubanen og hva betyr den for boligprisene?", a: "Fornebubanen er en ny T-banelinje som åpner 2027 og kobler Fornebu til Oslo sentrum. Forventningseffekten har allerede løftet prisene i Lysaker og Fornebu-korridoren." },
      { q: "Er Bærum trygt å kjøpe bolig i?", a: "Bærum er en av Norges sterkeste boligmarkeder med lav ledighet, høy inntekt og stabil etterspørsel. Risikoen for større prisfall er historisk lav." },
      { q: "Hva er kollektivalternativene i Bærum?", a: "T-bane (Kolsås og Østerås-linjen), regiontog fra Sandvika mot Oslo S, og bybuss. Fra Fornebubanen åpner i 2027 vil direkteforbindelsen til sentrum bli vesentlig bedre." },
    ],
  },

  kristiansand: {
    slug: "kristiansand", name: "Kristiansand", county: "Agder", kommunenummer: "4204", population: "112 000",
    avgSqmPrice: 42_600, avgSqmPriceYoY: 5.9, medianPrice: 2_900_000, avgCommute: 17,
    topNeighbourhoods: ["Kvadraturen", "Lund", "Kongsgård", "Søgne", "Vågsbygd"],
    metaTitle: "Boligpriser Kristiansand 2026 – Kjøpe bolig i Kristiansand | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Kristiansand 2026. Se kvadratmeterpris, prisutvikling og kollektivdata for alle adresser i Kristiansand.",
    heroHeading: "Kjøpe bolig i Kristiansand 2026",
    heroSubheading: "Sørlandets største by — alt du trenger å vite om boligmarkedet.",
    introText: "Kristiansand er Sørlandets hovedstad og en av Norges mest solrike byer. Med relativt lave boligpriser sammenlignet med storbyene, god infrastruktur og voksende arbeidsmarked er Kristiansand attraktivt for boligkjøpere. Kvadratmeterpris 42 600 kr, prisvekst 5,9 %.",
    marketText: "Kvadraturen er byens historiske sentrum med høyest kvadratmeterpris. Lund og Kongsgård er populære for barnefamilier. Søgne og Songdalen (nå innlemmet i kommunen) tilbyr romslige eneboliger til lavere priser.",
    transitText: "Kristiansand har bybuss som hovednett. Tog mot Oslo og Stavanger. Arendal er nærliggende og nåes med bil eller tog. Kollektivdekningen er god i sentrumsstrøk, men svakere i ytre deler av kommunen.",
    faq: [
      { q: "Hva koster en bolig i Kristiansand i 2026?", a: "Gjennomsnittlig kvadratmeterpris er 42 600 kr. Medianpris ca. 2,9 mill. Prisene er vesentlig lavere enn i Oslo og Bergen." },
      { q: "Er Kristiansand rimelig å kjøpe bolig?", a: "Ja — Kristiansand er en av Norges rimeligste storbyer å kjøpe bolig i, men prisene har steget 5,9 % siste år." },
      { q: "Hva er kollektivtilbudet i Kristiansand?", a: "Bybuss dekker sentrumsstrøk godt. Tog mot Oslo (ca. 4,5 timer) og Stavanger (ca. 3 timer). AKT er regionens kollektivselskap." },
      { q: "Hvilke bydeler er best for barnefamilier i Kristiansand?", a: "Lund, Kongsgård og Sølvberget er populære for familier med god skole og gode boforhold. Randesund er mer rolig og har naturnærhet." },
    ],
  },

  fredrikstad: {
    slug: "fredrikstad", name: "Fredrikstad", county: "Østfold", kommunenummer: "3004", population: "83 000",
    avgSqmPrice: 36_900, avgSqmPriceYoY: 6.1, medianPrice: 2_600_000, avgCommute: 15,
    topNeighbourhoods: ["Gamlebyen", "Sentrum", "Rolvsøy", "Østsiden", "Kråkerøy"],
    metaTitle: "Boligpriser Fredrikstad 2026 – Kjøpe bolig i Fredrikstad | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Fredrikstad 2026. Se kvadratmeterpris, prisutvikling og kollektivdata for alle adresser i Fredrikstad.",
    heroHeading: "Kjøpe bolig i Fredrikstad 2026",
    heroSubheading: "En av Norges raskest voksende byer — lavere priser, god tilknytning til Oslo.",
    introText: "Fredrikstad er en historisk festningsby med Norges best bevarte gamlebyen. Pendleravstand til Oslo (ca. 1 time med tog) og lave boligpriser gjør byen attraktiv for unge kjøpere. Kvadratmeterpris 36 900 kr, prisvekst 6,1 %.",
    marketText: "Gamlebyen er Fredrikstads mest særpregede og prisede boligområde. Kråkerøy og Gressvik tilbyr sjønære boliger. Sentrumsstrøket er preget av urban utvikling med nye leilighetsprosjekter.",
    transitText: "Tog til Oslo S tar ca. 55–65 minutter fra Fredrikstad stasjon. Lokalbuss i kommunen. God pendlertilgjengelighet gjør Fredrikstad attraktivt for Oslo-pendlere.",
    faq: [
      { q: "Hva koster en bolig i Fredrikstad i 2026?", a: "Gjennomsnittlig kvadratmeterpris er 36 900 kr. Medianpris ca. 2,6 mill — blant de lavere i østlandsregionen." },
      { q: "Hvor lang er pendlertid til Oslo fra Fredrikstad?", a: "Ca. 55–65 minutter med tog fra Fredrikstad stasjon til Oslo S. Direkte IC-tog avgår jevnlig." },
      { q: "Er Fredrikstad bra for unge boligkjøpere?", a: "Ja — lave priser, god tog-tilknytning til Oslo og et voksende kulturliv gjør Fredrikstad attraktivt for unge førstegangsboligkjøpere." },
      { q: "Hva er spesielt med Gamlebyen i Fredrikstad?", a: "Norges best bevarte festningsby fra 1600-tallet. Svært attraktivt boligområde med historiske trehus — men begrenset tilbud og høye priser for størrelsen." },
    ],
  },

  sandnes: {
    slug: "sandnes", name: "Sandnes", county: "Rogaland", kommunenummer: "1108", population: "79 000",
    avgSqmPrice: 49_200, avgSqmPriceYoY: 6.8, medianPrice: 3_300_000, avgCommute: 22,
    topNeighbourhoods: ["Sandnes sentrum", "Ganddal", "Lura", "Hana", "Stangeland"],
    metaTitle: "Boligpriser Sandnes 2026 – Kjøpe bolig i Sandnes | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Sandnes 2026. Se kvadratmeterpris, prisutvikling og kollektivdata for alle adresser i Sandnes.",
    heroHeading: "Kjøpe bolig i Sandnes 2026",
    heroSubheading: "Stavangers naboby — god kollektivforbindelse og lavere priser.",
    introText: "Sandnes er Rogalands nest største by og grenser til Stavanger. Med lavere priser enn nabokommunen og god kollektivforbindelse via buss og tog er Sandnes populær blant pendlere. Kvadratmeterpris 49 200 kr, prisvekst 6,8 %.",
    marketText: "Sentrumsstrøket langs Gandsfjorden er det mest attraktive. Ganddal og Lura er godt utbygde boligområder. Hana er kjent for eneboligområder og god natur.",
    transitText: "Jernbane og Bussvei 2020 kobler Sandnes til Stavanger på ca. 15–20 minutter. Lokalbuss i kommunen. Sandnes er blant de beste pendlerkommunene i Rogaland.",
    faq: [
      { q: "Hva koster en bolig i Sandnes i 2026?", a: "Gjennomsnittlig kvadratmeterpris er 49 200 kr. Medianpris ca. 3,3 mill — ca. 15 % lavere enn i naboen Stavanger." },
      { q: "Hva er pendlertiden til Stavanger fra Sandnes?", a: "Ca. 15–20 minutter med tog eller Bussvei 2020. En av Norges beste pendlerforbindelser mellom nabobyer." },
      { q: "Er Sandnes billigere enn Stavanger?", a: "Ja — gjennomsnittlig ca. 15 % lavere kvadratmeterpris i Sandnes. Mange velger å bo i Sandnes og pendle til Stavanger." },
      { q: "Hva er de beste boligstrøkene i Sandnes?", a: "Sentrum langs Gandsfjorden, Lura (nær Stavanger) og Hana (eneboligstrøk med god natur) er populære valg." },
    ],
  },

  drammen: {
    slug: "drammen", name: "Drammen", county: "Viken", kommunenummer: "3005", population: "101 000",
    avgSqmPrice: 44_700, avgSqmPriceYoY: 5.3, medianPrice: 3_000_000, avgCommute: 24,
    topNeighbourhoods: ["Bragernes", "Strømsø", "Fjell", "Konnerud", "Åssiden"],
    metaTitle: "Boligpriser Drammen 2026 – Kjøpe bolig i Drammen | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Drammen 2026. Se kvadratmeterpris, prisutvikling og kollektivdata for alle adresser i Drammen.",
    heroHeading: "Kjøpe bolig i Drammen 2026",
    heroSubheading: "Oslo-nær med Norges beste by-transformasjon — se boligprisene her.",
    introText: "Drammen har gjennomgått en bemerkelsesverdig bytransformasjon de siste 20 årene. Elvepromenaden, kulturhuset og nye boligprosjekter har løftet byens profil. Med tog til Oslo på 30–35 minutter er Drammen en populær pendlerby. Kvadratmeterpris 44 700 kr.",
    marketText: "Bragernes og Strømsø er de mest sentrale og attraktive boligstrøkene. Fjell og Konnerud er mer naturpregede boligområder med eneboliger. Ytre deler av kommunen tilbyr romslige boliger til lavere priser.",
    transitText: "Tog til Oslo S tar 30–35 minutter fra Drammen stasjon. Lokalbuss i kommunen. Drammen er en av de raskest voksende pendlerbyene for Oslo-ansatte.",
    faq: [
      { q: "Hva koster en bolig i Drammen i 2026?", a: "Gjennomsnittlig kvadratmeterpris er 44 700 kr. Medianpris ca. 3,0 mill." },
      { q: "Hva er pendlertiden til Oslo fra Drammen?", a: "Ca. 30–35 minutter med tog fra Drammen til Oslo S. Høy frekvens i rushtiden." },
      { q: "Er Drammen et godt alternativ til Oslo for boligkjøpere?", a: "Ja — Drammen har ca. 52 % lavere kvadratmeterpris enn Oslo, med tog til sentrum på 35 minutter. Populært blant unge og barnefamilier som vil ut av Oslo." },
      { q: "Hvilke bydeler er mest attraktive i Drammen?", a: "Bragernes sentrum og elvepromenaden er mest prestisjefylt. Konnerud er populær for barnefamilier med naturnærhet og eneboligstrøk." },
    ],
  },

  tromso: {
    slug: "tromso", name: "Tromsø", county: "Troms", kommunenummer: "5401", population: "77 000",
    avgSqmPrice: 52_300, avgSqmPriceYoY: 4.1, medianPrice: 3_100_000, avgCommute: 16,
    topNeighbourhoods: ["Tromsøya sentrum", "Tromsdalen", "Kvaløysletta", "Langnes", "Kroken"],
    metaTitle: "Boligpriser Tromsø 2026 – Kjøpe bolig i Tromsø | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Tromsø 2026. Se kvadratmeterpris, prisutvikling og kollektivdata for alle adresser i Tromsø.",
    heroHeading: "Kjøpe bolig i Tromsø 2026",
    heroSubheading: "Nordens Paris — her er boligprisene i Norges nordligste storby.",
    introText: "Tromsø er Norges nordligste storby og en internasjonal hub for arktisk forskning og reiseliv. Med UiT, universitetssykehus og voksende reiselivsnæring er boligmarkedet aktivt. Kvadratmeterpris 52 300 kr, moderat vekst 4,1 %.",
    marketText: "Tromsøya er øya der mesteparten av sentrum ligger — og de høyeste prisene finnes her. Tromsdalen på fastlandet er mer rimelig. Kvaløysletta er populær for barnefamilier med mer plass.",
    transitText: "Tromsø har bybuss som hovednett. Ingen T-bane eller bybane. Fly er primærtransport til resten av landet — Tromsø lufthavn er blant Norges travleste.",
    faq: [
      { q: "Hva koster en bolig i Tromsø i 2026?", a: "Gjennomsnittlig kvadratmeterpris er 52 300 kr. Medianpris ca. 3,1 mill." },
      { q: "Er Tromsø dyrt å bo i?", a: "Boligprisene er moderate sammenlignet med Oslo og Bergen, men levekostnadene er noe høyere enn landssnittet pga. nordlig beliggenhet." },
      { q: "Hva er kollektivtilbudet i Tromsø?", a: "Bybuss er primærnettet. Pendelbåt mellom øyer. Tromsø mangler skinnegående transport — det finnes planer, men ikke vedtatt." },
      { q: "Er Tromsø et godt sted å investere i bolig?", a: "Tromsø har stabil etterspørsel fra studenter, forskere og helsepersonell. Begrensede muligheter for nybygg (øy) holder tilbudet lavt og prisene stabile." },
    ],
  },

  sarpsborg: {
    slug: "sarpsborg", name: "Sarpsborg", county: "Østfold", kommunenummer: "3003", population: "62 000",
    avgSqmPrice: 32_400, avgSqmPriceYoY: 5.7, medianPrice: 2_400_000, avgCommute: 14,
    topNeighbourhoods: ["Sentrum", "Kurland", "Borgen", "Opsund", "Hafslundsøy"],
    metaTitle: "Boligpriser Sarpsborg 2026 – Kjøpe bolig i Sarpsborg | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Sarpsborg 2026. Se kvadratmeterpris, prisutvikling og kollektivdata for alle adresser i Sarpsborg.",
    heroHeading: "Kjøpe bolig i Sarpsborg 2026",
    heroSubheading: "En av Norges rimeligste pendlerbyer — se boligprisene her.",
    introText: "Sarpsborg er en av Norges eldste byer og grenser til Fredrikstad. Med togforbindelse til Oslo og svært lave boligpriser er Sarpsborg attraktivt for pendlere. Kvadratmeterpris 32 400 kr — blant landets laveste i en by av denne størrelsen.",
    marketText: "Sentrum og Kurland er de mest etterspurte boligstrøkene. Hafslundsøy er en øy med rolige eneboligstrøk. Ytre deler tilbyr store eneboliger til lave priser.",
    transitText: "Tog til Oslo S tar ca. 1 time fra Sarpsborg stasjon. IC-tog med god frekvens i rushtiden. Lokalbuss i kommunen. Samlastpunkt med Fredrikstad for mange pendlere.",
    faq: [
      { q: "Hva koster en bolig i Sarpsborg i 2026?", a: "Gjennomsnittlig kvadratmeterpris er 32 400 kr — blant landets laveste for en by over 50 000 innbyggere." },
      { q: "Hva er pendlertiden til Oslo fra Sarpsborg?", a: "Ca. 60 minutter med IC-tog fra Sarpsborg til Oslo S. Togfrekvens i rush er god." },
      { q: "Er Sarpsborg og Fredrikstad like bra pendlerbyer?", a: "Begge er gode alternativer. Sarpsborg er litt billigere og har noe kortere togreise. Fredrikstad har mer kulturliv og Gamlebyen." },
      { q: "Hva er de billigste boligstrøkene i Sarpsborg?", a: "Ytre bydeler og Hafslundsøy tilbyr store eneboliger til svært lave priser. Sentrum er dyrere relativt sett, men fortsatt rimelig nasjonalt." },
    ],
  },

  skien: {
    slug: "skien", name: "Skien", county: "Telemark", kommunenummer: "3807", population: "55 000",
    avgSqmPrice: 28_900, avgSqmPriceYoY: 4.9, medianPrice: 2_100_000, avgCommute: 15,
    topNeighbourhoods: ["Sentrum", "Gulset", "Gjerpen", "Moflag", "Brekkeby"],
    metaTitle: "Boligpriser Skien 2026 – Kjøpe bolig i Skien | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Skien 2026. Se kvadratmeterpris, prisutvikling og kollektivdata for alle adresser i Skien.",
    heroHeading: "Kjøpe bolig i Skien 2026",
    heroSubheading: "Telemarks fylkeshovedstad — blant Norges rimeligste byer å kjøpe bolig.",
    introText: "Skien er Telemarks største by og Ibsens fødested. Med svært lave boligpriser og en voksende offentlig og privat sektor er Skien attraktivt for de som ønsker mer plass for pengene. Kvadratmeterpris 28 900 kr — blant de laveste i landet.",
    marketText: "Sentrum har høyest prisnivå, men er fortsatt svært rimelig nasjonalt. Gulset og Gjerpen er populære boligstrøk. Moflag tilbyr romslige eneboliger til svært lave priser.",
    transitText: "Skien har bybuss og tog fra Skien stasjon. Jernbanen mot Porsgrunn og videre mot Oslo er viktig for pendlere. Grenland er en felles arbeidsmarkedsregion med Porsgrunn.",
    faq: [
      { q: "Hva koster en bolig i Skien i 2026?", a: "Gjennomsnittlig kvadratmeterpris er 28 900 kr — blant de laveste i Norge for en by over 50 000 innbyggere." },
      { q: "Er Skien et godt alternativ til dyre byer?", a: "Absolutt — for pengene som tilsvarer en liten leilighet i Oslo, kan du kjøpe en romslig enebolig i Skien. Toget mot Oslo tar ca. 2 timer." },
      { q: "Hva er kollektivtilbudet i Skien?", a: "Bybuss og tog. Grenlandsregionen har et samlet kollektivnett. Skien-Porsgrunn-Bamble er kokt tettere med felles buss." },
      { q: "Hva er populært å gjøre i Skien?", a: "Telemark kanal, Ibsen-muséet, Brekkeparken og nærhet til fjell og fjord. Skien har en voksende kulturscene." },
    ],
  },

  bodoe: {
    slug: "bodoe", name: "Bodø", county: "Nordland", kommunenummer: "1804", population: "55 000",
    avgSqmPrice: 41_200, avgSqmPriceYoY: 6.5, medianPrice: 2_700_000, avgCommute: 14,
    topNeighbourhoods: ["Sentrum", "Rønvikfjæra", "Mørkved", "Hunstad", "Tverlandet"],
    metaTitle: "Boligpriser Bodø 2026 – Kjøpe bolig i Bodø | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Bodø 2026. Se kvadratmeterpris, prisutvikling og kollektivdata for alle adresser i Bodø.",
    heroHeading: "Kjøpe bolig i Bodø 2026",
    heroSubheading: "Europas kulturhovedstad 2024 — se boligprisene i Nord-Norges nestørste by.",
    introText: "Bodø er Nord-Norges nest største by og ble utpekt til Europas kulturhovedstad i 2024. Med ny flyplass under utbygging, sterk forsvarsnærvær og voksende servicesektor er boligmarkedet aktivt. Kvadratmeterpris 41 200 kr, prisvekst 6,5 %.",
    marketText: "Sentrum har de høyeste prisene. Mørkved og Hunstad er store boligområder med gode skoler, populær for barnefamilier. Rønvikfjæra tilbyr sjønære leiligheter.",
    transitText: "Bodø har bybuss og fly som primære transporter til resten av landet. Nordlandsbanen går gjennom Bodø — tog til Trondheim tar ca. 9 timer. Intern transport domineres av buss.",
    faq: [
      { q: "Hva koster en bolig i Bodø i 2026?", a: "Gjennomsnittlig kvadratmeterpris er 41 200 kr. Medianpris ca. 2,7 mill." },
      { q: "Hva betyr kulturhovedstaden 2024 for Bodø?", a: "Store investeringer i kultur og infrastruktur, økt turisme og internasjonal oppmerksomhet. Påvirker boligmarkedet positivt på lang sikt." },
      { q: "Hva er kollektivtilbudet i Bodø?", a: "Bybuss er primærnettet. Nordlandsbanen (tog). Bodø lufthavn er viktigst for regional tilgjengelighet." },
      { q: "Er Bodø et godt sted å bosette seg?", a: "Ja — Bodø scorer høyt på livskvalitet, natur og kultur. Boligprisene er moderate og arbeidsmarkedet er stabilt med offentlig sektor som dominerende arbeidsgiver." },
    ],
  },

  arendal: {
    slug: "arendal", name: "Arendal", county: "Agder", kommunenummer: "4203", population: "47 000",
    avgSqmPrice: 36_100, avgSqmPriceYoY: 5.2, medianPrice: 2_500_000, avgCommute: 13,
    topNeighbourhoods: ["Tyholmen", "Sentrum", "Hisøy", "Moland", "Tromøy"],
    metaTitle: "Boligpriser Arendal 2026 – Kjøpe bolig i Arendal | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Arendal 2026. Se kvadratmeterpris, prisutvikling og kollektivdata for alle adresser i Arendal.",
    heroHeading: "Kjøpe bolig i Arendal 2026",
    heroSubheading: "Sørlandets perle — sjøkant og rimelige boligpriser.",
    introText: "Arendal er en pittoresk sørlendsby kjent for Tyholmen trehusbebyggelse, øyene i Aust-Agder og lange somre. Boligmarkedet er aktivt med god balanse mellom tilbud og etterspørsel. Kvadratmeterpris 36 100 kr, prisvekst 5,2 %.",
    marketText: "Tyholmen er den historiske bykjernen med trehus og høy attraktivitet. Tromøya er en øy med sjønære boliger svært populær om sommeren. Moland er et voksende område med nyere boliger og god infrastruktur.",
    transitText: "Arendal har bybuss og noe båttransport til øyene. Tog via Arendalslinjen (Nelaug). Nærhet til E18 og Kristiansand er viktig for pendlere mot storbyene.",
    faq: [
      { q: "Hva koster en bolig i Arendal i 2026?", a: "Gjennomsnittlig kvadratmeterpris er 36 100 kr. Medianpris ca. 2,5 mill." },
      { q: "Hva er spesielt med Tyholmen i Arendal?", a: "Norges best bevarte trehusbymiljø fra 1800-tallet. Svært attraktivt og prestisjefylt, men begrenset tilgang gjør det dyrt relativt til resten av Arendal." },
      { q: "Hva er pendlertiden til Kristiansand fra Arendal?", a: "Ca. 45 minutter med bil via E18. Buss tar noe lengre. Mange pendler daglig mellom byene." },
      { q: "Er Arendal dyrt om sommeren?", a: "Sommerbolig-effekten er merkbar — spesielt på øyene som Tromøy. Helårsboligmarkedet er mer stabilt, men sommersesongen påvirker attraktiviteten." },
    ],
  },

  hamar: {
    slug: "hamar", name: "Hamar", county: "Innlandet", kommunenummer: "3403", population: "41 000",
    avgSqmPrice: 30_800, avgSqmPriceYoY: 5.0, medianPrice: 2_200_000, avgCommute: 16,
    topNeighbourhoods: ["Sentrum", "Martodden", "Jessnes", "Storhamar", "Åkersvika"],
    metaTitle: "Boligpriser Hamar 2026 – Kjøpe bolig i Hamar | Verdikart",
    metaDescription: "Oppdaterte boligpriser i Hamar 2026. Se kvadratmeterpris, prisutvikling og kollektivdata for alle adresser i Hamar.",
    heroHeading: "Kjøpe bolig i Hamar 2026",
    heroSubheading: "Innlandets store by — rimelig, romslig og med gode tog-forbindelser til Oslo.",
    introText: "Hamar er Innlandets største by og ligger vakkert til ved Mjøsa. Med tog til Oslo på under 1,5 time og svært lave boligpriser er Hamar et godt alternativ for de som ønsker mer plass. Kvadratmeterpris 30 800 kr.",
    marketText: "Sentrum og Martodden (sjønært område) er mest attraktive. Storhamar er et rolig eneboligstrøk. Prisene er lave over hele kommunen, og du får mye for pengene.",
    transitText: "Tog fra Hamar stasjon til Oslo S tar ca. 1 time og 20 minutter. IC-tog med god frekvens. Lokalbuss. Hamar er en av de raskest voksende IC-pendlerbyene.",
    faq: [
      { q: "Hva koster en bolig i Hamar i 2026?", a: "Gjennomsnittlig kvadratmeterpris er 30 800 kr — blant Norges laveste for en by over 40 000 innbyggere." },
      { q: "Hva er pendlertiden til Oslo fra Hamar?", a: "Ca. 1 time og 20 minutter med IC-tog fra Hamar til Oslo S. Direkte tog med god frekvens." },
      { q: "Er Hamar et godt sted å bosette seg?", a: "For de som ønsker rolig, plass og natur — ja. Mjøsa og Hedmarksvidda er rett utenfor. Kulturliv med Hedmarksmuseet og OL-arenaene." },
      { q: "Hvilke områder i Hamar er best for barnefamilier?", a: "Storhamar og Jessnes er rolige eneboligstrøk med gode skoler. Martodden er populær for sjønærhet." },
    ],
  },
};

export function getCityData(slug: string): CityData | null {
  return cities[slug] ?? null;
}

export const allCitySlugs = Object.keys(cities);
export { cities };
