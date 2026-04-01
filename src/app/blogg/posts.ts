export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO date
  updatedAt?: string;
  readingMinutes: number;
  category?: string;
  /** Related post slugs for "Les også" section — 2–3 entries */
  relatedSlugs?: string[];
  sections: Section[];
}

export interface Section {
  heading?: string;
  body: string; // plain paragraphs, newline-separated
  body2?: string; // optional second paragraph block after list
  list?: string[];
  tip?: string;
}

export const posts: BlogPost[] = [
  {
    slug: "hva-sjekke-for-boligkjop",
    title: "Sjekkliste boligkjøp 2026: 12 ting du MÅ undersøke",
    description:
      "En komplett sjekkliste for boligkjøp i 2026. Fra kollektivtransport og støynivå til prishistorikk og fellesgjeld — her er alt du bør undersøke før du legger inn bud.",
    publishedAt: "2026-03-20",
    readingMinutes: 6,
    category: "Kjøperguide",
    relatedSlugs: ["boligkjop-feil-nybegynnere", "kollektivtransport-og-boligpris", "sammenligne-boliger-sjekkliste"],
    sections: [
      {
        body: "Boligkjøp er den største finansielle beslutningen de fleste nordmenn tar. Likevel er det mange som legger inn bud uten å ha sjekket alt som egentlig betyr noe — og det kan koste deg dyrt. Her er en praktisk sjekkliste med 12 punkter du bør gå gjennom før visning, og helst igjen før budet.",
      },
      {
        heading: "1. Kollektivtransport og gangavstand",
        body: "Nærhet til T-bane, trikk eller buss er en av de sterkeste prisdrivende faktorene i norske byer. En bolig som er 400 meter fra nærmeste T-banestasjon kan være 10–15 % dyrere enn en tilsvarende bolig 1,2 km unna.\n\nSjekk ikke bare at det finnes en holdeplass — sjekk faktisk avgangshyppighet. 2 avganger per time i rushtiden er svært annerledes enn 8. Med Verdikart kan du søke på adressen og se nøyaktig hvilke holdeplasser som er innen gangavstand og hvor mange avganger per time du faktisk har.",
        tip: "Avganger i sanntid hentes fra Entur. Søk på adressen på verdikart.no for å se din faktiske dekning.",
      },
      {
        heading: "2. Støy fra trafikk og fly",
        body: "Støykart er tilgjengelig via Kartverket og Miljødirektoratet, men få boligkjøpere sjekker det. Boliger langs Ring 3, E6 eller E18 kan ha støynivåer over 65 dB — tilsvarende en travel restaurant. Sjekk også flystøy hvis du ser på boliger i Bærum, Skedsmo eller Flesland-korridoren.",
      },
      {
        heading: "3. Prishistorikk for nabolaget",
        body: "Hva har boliger i dette nabolaget blitt solgt for de siste 12–24 månedene? En bolig som prises 20 % over snittet for sammenlignbare objekter er ikke nødvendigvis verdt det — selv om den er fin.\n\nSSB publiserer boligprisindeks per kommunenivå. Kombiner dette med faktiske salgspriser fra Eiendomsverdi.no eller Finn.no for å danne deg et realistisk bilde av markedet.",
      },
      {
        heading: "4. Fellesgjeld og månedlige kostnader",
        body: "I borettslag og sameier er det ikke bare kjøpesummen som teller. Et borettslag med høy fellesgjeld kan gi deg månedlige felleskostnader på 5 000–10 000 kr, noe som effektivt øker den reelle boligkostnaden betydelig. Sjekk:\n",
        list: [
          "Totalt fellesgjeld og din andel",
          "Rente og nedbetalingsplan på fellesgjelden",
          "Planlagte rehabiliteringer (tak, fasade, rør)",
          "Årsrapport og regnskap for borettslaget/sameiet",
        ],
      },
      {
        heading: "5. Teknisk tilstand og alder",
        body: "Tilstandsrapporten (tidligere boligsalgsrapporten) er obligatorisk ved boligsalg i Norge siden 2022. Les den nøye — spesielt TG2 (avvik) og TG3 (store avvik). Vær særlig oppmerksom på:\n",
        list: [
          "Våtrom og fukt (den vanligste kilden til tvister)",
          "Elektrisk anlegg (FG-godkjent?)",
          "Vinduer og balkong (alder og tilstand)",
          "Isolasjon og energimerking",
        ],
      },
      {
        heading: "6. Planlagte utbygginger i nabolaget",
        body: "En leilighet med havutsikt kan miste halve verdien hvis det bygges en ny boligblokk rett foran. Sjekk kommunens reguleringsplaner på kommunens nettsider eller på PBE.oslo.kommune.no for Oslo. Søk etter planforslag, byggesaker og igangsettingstillatelser i nærheten.",
      },
      {
        heading: "7. Radon",
        body: "Radon er en naturlig forekommende radioaktiv gass som er den nest vanligste årsaken til lungekreft etter røyking i Norge. Særlig aktuelt i:\n",
        list: [
          "Boliger med rom under bakkenivå",
          "Deler av Oslo, Akershus, Hedmark og Oppland med berggrunn av gneis og granitt",
          "Eldre boliger uten tetting",
        ],
        tip: "Radonkart finnes på NGU.no. Selger er pliktig til å opplyse om kjente radonnivåer.",
      },
      {
        heading: "8. Parkeringsmuligheter og bil",
        body: "I Oslo sentrum er dette mindre relevant, men i forstadsstrøk og Vestlandet er parkering en reell daglig faktor. Er det garasjeplass inkludert, eller må du leie? Hva koster det? I tette bystrøk: sjekk om det er beboerparkering og hva det koster.",
      },
      {
        heading: "9. Internett og mobildekning",
        body: "Hjemmekontor er normalen for mange. Sjekk om adressen har tilgang til fiber eller kun kobber/koaksialt bredbånd. Telenor og Altibox har dekningskart. Fiber gir deg typisk 500 Mbit/s–1 Gbit/s symmetrisk. Kobber topper ut på 50–100 Mbit/s nedlasting.",
      },
      {
        heading: "10. Solforhold og orientering",
        body: "Sørvendt balkong og gode solforhold er ikke bare trivielt — det påvirker energikostnadene og livskvaliteten. Sjekk:\n",
        list: [
          "Hvilken retning vender stue og balkong?",
          "Er det nabobygg, åser eller trær som kaster skygge?",
          "Bruk Google Maps satellittbilde for å vurdere orientering",
        ],
      },
      {
        heading: "11. Skolekrets og barnehagedekning",
        body: "Selv om du ikke har barn, påvirker skolekrets boligprisene. Noen skolekretser i Oslo har vesentlig høyere priser enn nabokretsen. For barnefamilier: sjekk venteliste og kapasitet på nærmeste barnehage. Oslo kommunes barnehagefinner.no gir god oversikt.",
      },
      {
        heading: "12. Egen økonomi og boliglånsforskriften",
        body: "Husk boliglånsforskriften: bankene kan som hovedregel ikke låne deg mer enn 5 ganger bruttoinntekten, og du trenger 10 % egenkapital (15 % i Oslo). Bruk en uavhengig boliglånskalkulator og regn inn alle kostnader:\n",
        list: [
          "Dokumentavgift (2,5 % av kjøpesummen for selveier)",
          "Tinglysingsgebyr",
          "Eierskifteforsikring og innbo",
          "Oppussing og tilpasninger",
        ],
      },
      {
        heading: "Oppsummering",
        body: "Å kjøpe bolig krever at du gjør jobben selv. Verken megleren, selgeren eller banken har dine interesser 100 % i fokus. En grundig sjekk tar kanskje 2–3 timer ekstra, men kan spare deg for hundretusenvis av kroner i overraskelser.\n\nVerdikart gir deg innsikt i kollektivtransport, støy og prisutvikling for enhver norsk adresse — gratis, uten registrering.",
      },
    ],
  },
  {
    slug: "kollektivtransport-og-boligpris",
    title: "Slik påvirker kollektivtransport boligprisen — og hva du bør sjekke",
    description:
      "Nærhet til T-bane og trikk er en av de sterkeste prisdrivende faktorene i norske byer. Vi ser på sammenhengen mellom kollektivdekning og boligpris, og hva du faktisk bør sjekke.",
    publishedAt: "2026-03-24",
    readingMinutes: 5,
    category: "Markedsanalyse",
    relatedSlugs: ["hva-er-en-god-kollektivscore", "boligpris-per-kvm-norge-2026", "sammenligne-boliger-sjekkliste"],
    sections: [
      {
        body: "Det er vel kjent at beliggenhet er den viktigste faktoren for boligpris. Men beliggenhet er ikke bare adresse — det handler i stor grad om tilgjengelighet. Og tilgjengelighet handler om kollektivtransport.",
      },
      {
        heading: "Forskning: T-banenærhet øker boligverdien med 10–20 %",
        body: "Flere norske og internasjonale studier dokumenterer en klar sammenheng mellom T-banenærhet og boligpris. En rapport fra Ruter og TØI (Transportøkonomisk institutt) viser at boliger innen 400 meters gangavstand fra en T-banestasjon i Oslo typisk prises 10–20 % høyere enn sammenlignbare boliger 1 km unna.\n\nEffekten er sterkest for:\n",
        list: [
          "Stasjoner med høy avgangshyppighet (6+ avganger per time i rush)",
          "Stasjoner som betjener sentrum direkte uten bytte",
          "Nye stasjoner ved utbygging av Fornebubanen og Grorudbanen",
        ],
      },
      {
        heading: "Avgangshyppighet betyr mer enn avstand",
        body: "Mange boligkjøpere sjekker om det finnes en busstopp i nærheten, men overser det viktigste: hvor ofte går bussen? En holdeplass 300 meter unna med 2 avganger per time gir deg dårligere tilgjengelighet enn en stasjon 600 meter unna med 10 avganger per time.\n\nFor Oslo er T-bane og trikk klart best — disse har typisk 6–12 avganger per time i rush og kjører til langt ut på natten. Bussruter varierer enormt: alt fra 2 til 15 avganger per time.",
        tip: "Søk på en adresse på verdikart.no for å se akkurat hvilke holdeplasser som er innen gangavstand, hvilke linjer som stopper der, og avganger per time.",
      },
      {
        heading: "Fornebubanen: verdiløft allerede i gang",
        body: "Fornebubanen åpner i 2027 og vil koble Fornebu til Majorstuen på under 12 minutter. Analyser fra Ruter og private meglerhus indikerer at boliger langs den planlagte traseen — Lysaker, Vækerø, Skøyen og Fornebu — allerede har steget 5–10 % mer enn markedssnittet de siste 3 årene, priset inn i forventningene.\n\nDette er et generelt mønster: nye kollektivutbygginger prises inn i boligmarkedet lenge før linjen åpner.",
      },
      {
        heading: "Hva du bør sjekke — utover avstand",
        body: "Bruk ikke bare Google Maps for å vurdere kollektivtilbudet. Det forteller deg om det finnes en holdeplass, men ikke:\n",
        list: [
          "Faktisk avgangshyppighet (spesielt utenfor rushtiden og i helger)",
          "Nattavganger (relevant for pendlere og unge)",
          "Planlagte endringer i rutetilbudet (Ruter publiserer dette på ruter.no)",
          "Om holdeplassen er for buss (kan flyttes) eller skinnegående (permanent)",
        ],
      },
      {
        heading: "Skinnegående transport er mer verdifullt enn buss",
        body: "Det finnes en klar hierarki i hvilke transportmidler som påvirker boligpris:\n",
        list: [
          "T-bane: sterkest effekt — faste spor, høy frekvens, langt nett",
          "Trikk: nesten på nivå med T-bane i Oslo-markedet",
          "Jernbane/lokaltog: sterk effekt for pendlerboliger utenfor Ring 3",
          "Buss: begrenset effekt — ruter kan endres, stopper kan flyttes",
          "Bysykkel: moderat tilleggsverdi i sentrumsstrøk",
        ],
        tip: "Bussholdeplassen 100 meter unna gir deg ikke den samme priseffekten som T-banen 400 meter unna. Skinnegående transport er en mer permanent infrastruktur som markedet priser mer stabilt.",
      },
      {
        heading: "Bergen og Trondheim: Bybanen og Gråkallbanen",
        body: "Oslo er ikke alene om dette mønsteret. I Bergen er det godt dokumentert at boliger langs Bybanens trasé — særlig i Fana, Landås og mot Nesttun — har steget mer enn markedssnittet etter at Bybanen åpnet. I Trondheim er nærhet til Gråkallbanen og Metrobuss 1 prisdrivende faktorer.\n\nFor Stavanger er situasjonen mer usikker siden Bybanen ble lagt på is — et eksempel på at planlagte kollektivprosjekter ikke alltid materialiserer seg.",
      },
      {
        heading: "Praktisk: slik bruker du Verdikart for å vurdere kollektivdekning",
        body: "Verdikart henter sanntidsdata fra Entur, Norges nasjonale kollektivdataplattform. Når du søker på en adresse, ser du:\n",
        list: [
          "Holdeplasser innen gangavstand (600–1000 meter)",
          "Transporttype: T-bane, trikk, jernbane, buss, båt",
          "Linjenumre som stopper der",
          "Estimert avganger per time basert på live rutedata",
        ],
        tip: "Sjekk kollektivdekningen på hverdager i rushtiden (07:00–09:00) — og husk å sjekke om dekningen er like god i helger og på kveld.",
      },
    ],
  },
  {
    slug: "boligpriser-oslo-2026-bydeler",
    title: "Boligpriser Oslo 2026: Komplett oversikt over alle bydeler",
    description:
      "Hva koster bolig i Oslo i 2026? Vi gir deg en oversikt over kvadratmeterpris, prisutvikling og hva som driver prisnivået i alle Oslos bydeler — fra Frogner til Stovner.",
    publishedAt: "2026-03-28",
    readingMinutes: 7,
    category: "Prisanalyse",
    relatedSlugs: ["boligpris-per-kvm-norge-2026", "kollektivtransport-og-boligpris", "hva-sjekke-for-boligkjop"],
    sections: [
      {
        body: "Oslo er Norges dyreste boligmarked, men prisene varierer enormt mellom bydeler. Kvadratmeterprisen i Frogner er mer enn dobbelt så høy som i Stovner — og gapet har økt de siste fem årene. Her er en fullstendig oversikt over boligprisene i Oslo 2026.",
      },
      {
        heading: "Oslo totalt: snitt 94 200 kr/m² i 2026",
        body: "Gjennomsnittlig kvadratmeterpris i Oslo er nå 94 200 kr, opp 5,1 % fra 2025. Prisveksten har vært sterkest i indre by og langs nye kollektivprosjekter. For første gang passerer snittprisen for en 2-roms leilighet i Oslo nå 4,5 millioner kroner.",
      },
      {
        heading: "Vest: Norges dyreste kvadratmeter",
        body: "Bydelene vest i Oslo — Frogner, Ullern, Vestre Aker og Nordre Aker — er Norges dyreste boligmarked:\n",
        list: [
          "Frogner: 130 000–160 000 kr/m² (topp i Oslo)",
          "Ullern: 95 000–115 000 kr/m²",
          "Vestre Aker: 90 000–110 000 kr/m²",
          "Nordre Aker: 85 000–105 000 kr/m²",
        ],
        tip: "Frogner og Bygdøy alléstrøket holder seg på europeisk metropolnivå for prisnivå. Tilflytting fra utlandet og begrenset nybygg bidrar til vedvarende press.",
      },
      {
        heading: "Sentrum og indre øst: sterk vekst",
        body: "St. Hanshaugen, Grünerløkka og Gamle Oslo har opplevd den sterkeste prosentvise veksten de siste 10 årene. Disse bydelene har gått fra å være «billige» til å nærme seg vestkant-nivå:\n",
        list: [
          "St. Hanshaugen: 95 000–115 000 kr/m²",
          "Grünerløkka: 85 000–105 000 kr/m²",
          "Gamle Oslo (Grønland, Tøyen): 75 000–95 000 kr/m²",
          "Sagene: 80 000–100 000 kr/m²",
        ],
      },
      {
        heading: "Nord og øst: Oslos vekstmarkeder",
        body: "Bydeler som Grorud, Alna, Stovner og Søndre Nordstrand har vesentlig lavere prisnivå og er der man finner mest for pengene. Groruddalsatsingen og investeringer i kollektivtransport har bidratt til moderat prisvekst:\n",
        list: [
          "Bjerke: 65 000–80 000 kr/m²",
          "Grorud: 55 000–70 000 kr/m²",
          "Stovner: 52 000–65 000 kr/m²",
          "Alna: 58 000–72 000 kr/m²",
          "Søndre Nordstrand: 50 000–63 000 kr/m²",
        ],
        tip: "Alna og Bjerke ligger langs T-banens Furusetlinje og har bedre kollektivdekning enn prisene tilsier — potensielle «underprisede» bydeler for pendlere til sentrum.",
      },
      {
        heading: "Hva driver prisgapet mellom bydelene?",
        body: "Prisforskjellene mellom Oslos bydeler handler om mer enn prestisje. De konkrete faktorene:\n",
        list: [
          "Kollektivtransport: T-banenærhet er den sterkeste enkeltfaktoren",
          "Skolekrets: noen vestkantbydeler har historisk høyere karaktersnitt",
          "Næringsstruktur: nærhet til CBD og Barcode øker priser i Bjørvika/Gamlebyen",
          "Nybygg: presset på Ensjø og Hovinbyen fra nybygg holder prisene nede",
          "Havnepromenade: Tjuvholmen, Aker Brygge og Bjørvika priset med sjøutsikt-premium",
        ],
      },
      {
        heading: "Prisutvikling 2020–2026",
        body: "Oslo har hatt sterk boligprisvekst totalt, men med store lokale variasjoner:\n",
        list: [
          "Hele Oslo: +34 % over 6 år (+5,0 % annualisert)",
          "Frogner/Ullern: +28 % (allerede høyt prisnivå demper vekst)",
          "Grünerløkka/Gamle Oslo: +48 % (konvergens mot vest)",
          "Grorud/Stovner: +22 % (svakere vekst, men fra lavt nivå)",
        ],
      },
      {
        heading: "Hva betyr dette for deg som boligkjøper?",
        body: "Når du vurderer bolig i Oslo, er det viktig å ikke bare se på absoluttprisen, men på verdidriverne bak:\n",
        list: [
          "Er bydelen i en konvergensperiode (som Grünerløkka 2010–2020)?",
          "Ligger boligen i en skolekrets med høy etterspørsel?",
          "Er det planlagte kollektivinvesteringer i nærheten?",
          "Hva er nybyggaktiviteten — økt tilbud demper prisvekst",
        ],
        tip: "Bruk Verdikart til å sjekke kollektivdekning for den konkrete adressen. Kombinert med SSB-prisdata gir det deg et godt beslutningsgrunnlag.",
      },
      {
        heading: "Boligprisene fremover: hva sier analytikerne?",
        body: "De fleste norske meglerhus og Norges Bank forventer moderat prisvekst i Oslo i 2026–2027, drevet av:\n",
        list: [
          "Lav arbeidsledighet og sterk realinntektsvekst",
          "Forventning om lavere Nibor-rente i H2 2026",
          "Begrenset nybygg pga. høye byggekostnader",
          "Fornebubanen-effekt langs Lysaker–Fornebu-korridoren",
        ],
        body2: "Risikofaktorene er høyere renter lenger enn ventet og svak internasjonal økonomi.",
      },
    ],
  },

  // ── Post 4 ──────────────────────────────────────────────────────────────
  {
    slug: "boligkjop-feil-nybegynnere",
    title: "7 vanlige feil førstegangskjøpere gjør — og hvordan du unngår dem",
    description: "Boligkjøp er den største finansielle beslutningen de fleste tar. Vi har samlet de syv vanligste tabbene og hva du kan gjøre for å unngå dem.",
    category: "Boligkjøp",
    readingMinutes: 6,
    publishedAt: "2026-03-01",
    relatedSlugs: ["hva-sjekke-for-boligkjop", "sammenligne-boliger-sjekkliste", "kollektivtransport-og-boligpris"],
    sections: [
      {
        heading: "Å hoppe over visningsrunden",
        body: "Mange førstegangskjøpere rekker ikke alle visninger de vil — men å kjøpe bolig basert på bilder alene er et klassisk eksempel på FOMO-kjøp. Bildene er alltid stylet. Lukt, støy og lysforhold er usynlig på nett.",
        tip: "Bruk Verdikart til å sjekke støynivå og kollektivtilbud FØR du setter av tid til visning. Slik prioriterer du riktig.",
      },
      {
        heading: "Undervurdere totalkostnaden",
        body: "Kjøpesummen er bare starten. Husk å budsjettere for:",
        list: [
          "Dokumentavgift (2,5% av kjøpesum for selveier)",
          "Tinglysingsgebyr (~875 kr)",
          "Eierskifteforsikring (3 000–8 000 kr)",
          "Oppussingsbuffer — sett av 5% av kjøpesummen",
          "Fellesgjeld i borettslag som ikke vises i prisantydning",
        ],
        body2: "En leilighet til 4 millioner kan koste nærmere 4,4 millioner totalt.",
      },
      {
        heading: "Ikke sjekke reguleringsplanen",
        body: "Det vakre utsiktet kan forsvinne. Naboeiendommen kan bli 10 etasjer høy. Reguleringsplaner er offentlig tilgjengelig via kommunens innsynsportal — og megler er ikke forpliktet til å nevne planlagte prosjekter i nærheten.",
      },
      {
        heading: "Stole blindt på meglers prisvurdering",
        body: "Meglers takst er et salgsverktøy, ikke en nøytral analyse. Sammenlign med faktiske kvadratmeterpriser fra SSB for samme postnummer — noe du får gratis på Verdikart.",
      },
      {
        heading: "Budgivning uten maksgrense",
        body: "Mange setter ikke et hardt tak på hva de vil betale. Budrunder er stressende, og det er lett å bli revet med. Bestem deg på forhånd — skriv ned beløpet og hold deg til det.",
        tip: "Bruk Verdikart Boligkalkulator til å beregne din reelle kjøpekraft inkl. stresstest (+5pp rente) før du begynner å by.",
      },
      {
        heading: "Glemme sameiets økonomi",
        body: "For borettslag og sameier: sjekk alltid årsregnskap, vedlikeholdsplan og om det er planlagte rehabiliteringer. En pipe-rehab eller løfting av kloakk kan koste 100 000–300 000 kr per enhet.",
      },
      {
        heading: "Ikke bruke fagfolk",
        body: "Bygningssakkyndig gjennomgang koster 5 000–15 000 kr og avdekker feil som ikke synes ved visning. Det er billig forsikring mot kjøp av en bolig med skjulte skader.",
        tip: "Er du i tvil om et nabolag: sjekk Verdikart for støynivå, bussfrekvens og nærliggende salg. Gratis, og tar 3 minutter.",
      },
    ],
  },

  // ── Post 5 ──────────────────────────────────────────────────────────────
  {
    slug: "hva-er-en-god-kollektivscore",
    title: "Hva betyr egentlig en god kollektivscore — og hvorfor er det viktig for boligprisen?",
    description: "Nærhet til kollektivtransport er en av de sterkeste prisdriverne i norske byer. Her er hva tallene faktisk betyr og hva du bør se etter.",
    category: "Analyse",
    readingMinutes: 5,
    publishedAt: "2026-03-10",
    relatedSlugs: ["kollektivtransport-og-boligpris", "boligpris-per-kvm-norge-2026", "hva-sjekke-for-boligkjop"],
    sections: [
      {
        heading: "Gangavstand er alt",
        body: "Boligforskning fra NTNU og Eiendomsverdi viser at tommelfingerregelen er enkel: for hver 100 meter du beveger deg fra en T-banestasjon i Oslo, faller boligprisen med 0,3–0,8%. Det virker lite, men 500 meter utgjør opp mot 4% — det er 160 000 kr på en 4 millioners leilighet.",
      },
      {
        heading: "Hva vi måler på Verdikart",
        body: "Verdikart henter data fra Entur — Norges nasjonale trafikkdatabank — og beregner:",
        list: [
          "Antall holdeplasser innen 300m, 500m og 1000m",
          "Avganger per time på rushtid (07–09 og 15–17)",
          "Transportmidler: T-bane, buss, trikk, tog, bysykkel",
          "Gjennomsnittlig ventetid mellom avganger",
        ],
      },
      {
        heading: "Hva er en god score?",
        body: "Vi bruker fire nivåer basert på nærmeste holdeplass og avganger:\n",
        list: [
          "🟢 Utmerket: Holdeplass under 300m + minst 4 avganger/time",
          "🟡 Godt: 300–600m + 2–4 avganger/time",
          "🟠 Middels: 600–1000m eller sjeldnere avganger",
          "🔴 Begrenset: Over 1000m eller under 1 avgang/time",
        ],
        body2: "I Oslo sentrum er 'Utmerket' normen. I Bærum og Groruddalen varierer det kraftig mellom nabolag.",
      },
      {
        heading: "Fremtidig utbygging teller",
        body: "Fornebubanen åpner i 2027 og vil endre prisbildet langs hele Lysaker–Fornebu-korridoren dramatisk. Oslonavet (ny togstasjon under Nationaltheatret) forventes ferdig 2034. Kjøper du nær fremtidige stasjoner i dag, priser du deg inn i en infrastrukturinvestering.",
        tip: "Sjekk naboadresser på Verdikart og sammenlign kollektivscore — selv 200 meters forskjell kan gi et meningsfylt prisutslag.",
      },
    ],
  },

  // ── Post 6 ──────────────────────────────────────────────────────────────
  {
    slug: "boligpris-per-kvm-norge-2026",
    title: "Boligpriser per kvadratmeter i norske byer 2026 — komplett oversikt",
    description: "Oppdatert oversikt over kvadratmeterpriser i Norges 15 største byer basert på SSB-data. Fra Oslo på topp til Skien i bunn.",
    category: "Markedsdata",
    readingMinutes: 4,
    publishedAt: "2026-03-18",
    relatedSlugs: ["boligpriser-oslo-2026-bydeler", "kollektivtransport-og-boligpris", "sammenligne-boliger-sjekkliste"],
    sections: [
      {
        heading: "Oslo er fortsatt dyrest",
        body: "Oslo kommune har en gjennomsnittlig kvadratmeterpris på 94 200 kr/m² per Q1 2026 — en prisvekst på 5,1% siste 12 måneder. Innenfor Oslo er spredningen enorm: Frogner ligger på 151 900 kr/m², mens Søndre Nordstrand er nede på 43 000 kr/m².",
      },
      {
        heading: "Prisutvikling 2025–2026",
        body: "De norske byene med sterkest prisvekst siste 12 måneder er:",
        list: [
          "Stavanger: +7,4% (olje-relatert etterspørsel + begrenset nybygg)",
          "Sandnes: +6,8%",
          "Trondheim: +6,2% (studentvekst + ny T-bane planlagt)",
          "Bodø: +6,5% (ny by-investering + Nord-Norge-effekt)",
          "Fredrikstad: +6,1% (pendleravstand til Oslo)",
        ],
        body2: "Oslo, Bergen og Tromsø vokser mer moderat — men fra et mye høyere prisnivå.",
      },
      {
        heading: "Byer under 45 000 kr/m²",
        body: "For kjøpere med begrenset egenkapital eller lav inntekt er Skien (28 900 kr/m²), Sarpsborg (32 400 kr/m²) og Fredrikstad (36 900 kr/m²) de mest tilgjengelige markedene med togforbindelse til Oslo.",
        tip: "Sjekk kollektivscore på Verdikart for konkrete adresser i disse byene — pendlertid til Oslo er en kritisk variabel for langsiktig prisvekst.",
      },
      {
        heading: "Slik bruker du dataene",
        body: "SSB publiserer kommunenivå-data hvert kvartal via tabell 06035. Verdikart henter disse dataene i sanntid og viser dem kontekstualisert for den spesifikke adressen du søker på — inkludert sammenlignbare salg og prisvekst.",
      },
    ],
  },

  // ── Post 7 ──────────────────────────────────────────────────────────────
  {
    slug: "sammenligne-boliger-sjekkliste",
    title: "Slik sammenligner du to boliger objektivt — en praktisk sjekkliste",
    description: "Visning av to boliger på én dag og vet ikke hvilken du skal velge? Denne sjekklisten hjelper deg å sammenligne objektivt — med data, ikke magefølelse.",
    category: "Boligkjøp",
    readingMinutes: 5,
    relatedSlugs: ["hva-sjekke-for-boligkjop", "boligkjop-feil-nybegynnere", "hva-er-en-god-kollektivscore"],
    publishedAt: "2026-03-25",
    sections: [
      {
        heading: "Start med faktaene, ikke følelsene",
        body: "Det er lett å bli forelsket i en bolig med bra styling og godt lys — og se bort fra støy, dårlig kollektivtilbud eller høy fellesgjeld. En strukturert sammenligningsmodell hjelper deg å skille hva som faktisk er bedre fra hva som bare ser bedre ut.",
      },
      {
        heading: "De 5 viktigste faktorene å sammenligne",
        body: "For hver bolig: noter en score fra 1–5 på disse punktene:",
        list: [
          "Pris per kvadratmeter (inkl. fellesgjeld) — bruk SSB-tall for postnummeret",
          "Kollektivscore — næreste holdeplass og avganger per time",
          "Støynivå — veitrafikkstøy er den viktigste langsiktige faktoren",
          "Byggeår og vedlikeholdshistorikk — ask om siste pipe/kloakk-rehab",
          "Sollys og planløsning — lysforhold endres gjennom dagen; besøk på ulike tidspunkt",
        ],
        body2: "Legg til en sjette kolonne for 'magefølelse' — men la den veie maks 20% av totalscoren.",
      },
      {
        heading: "Bruk Verdikart Sammenlign",
        body: "På verdikart.no/sammenlign kan du søke på begge adressene og se transport, pris og støy side ved side. Det tar 2 minutter og erstatter 30 minutter med Google-søk.",
        tip: "Del sammenligningslenken med partneren eller foreldrene dine — det er lettere å ta en felles beslutning når dataene er synlige for alle.",
      },
      {
        heading: "Når du er i tvil",
        body: "Hvis scorene er omtrent like, velg boligen i nabolaget med best langsiktig prisvekst-potensial. Kollektivinvesteringer (T-bane, bybane) er den sterkeste enkeltindikatoren — sjekk kommunens arealplaner.",
      },
    ],
  },
];

export function getAllSlugs() {
  return posts.map((p) => ({ slug: p.slug }));
}

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
