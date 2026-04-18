import type { Metadata } from "next";
import { GitCommit, Zap, Bug, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Endringslogg | Verdikart",
  description: "Se hva som er nytt i Verdikart. Vi oppdaterer jevnlig med nye funksjoner, forbedringer og feilrettinger.",
  alternates: { canonical: "https://verdikart.no/changelog" },
  openGraph: {
    title: "Endringslogg — Verdikart",
    description: "Se hva som er nytt i Verdikart. Nye funksjoner, forbedringer og feilrettinger.",
    url: "https://verdikart.no/changelog",
    siteName: "Verdikart",
    locale: "nb_NO",
    type: "website",
  },
};

type ChangeType = "feature" | "fix" | "improvement";

interface ChangeEntry {
  version: string;
  date: string;
  label: string;
  items: Array<{ type: ChangeType; text: string }>;
}

const changelog: ChangeEntry[] = [
  {
    version: "2.2",
    date: "18. april 2026",
    label: "Nytt designsystem, egne ikoner, hero-forhåndsvisning og animasjoner",
    items: [
      { type: "improvement", text: "Nytt designsystem fra bunnen. Nye farger med mint-cyan som signaturfarge, ny serif-skrift for overskrifter, og et konsistent rytmesystem for mellomrom." },
      { type: "improvement", text: "22 håndtegnede ikoner erstatter emoji på tvers av siden. Emoji rendret forskjellig på Windows, Mac og Android, og gjorde siden mindre gjenkjennelig." },
      { type: "feature", text: "Hero-seksjonen viser nå en levende forhåndsvisning av eiendomsrapporten. Ekte data fra Karl Johans gate 1 viser kart, estimert kvadratmeterpris, prisutvikling og nærmeste kollektivholdeplass før du søker selv." },
      { type: "improvement", text: "Ny hero-overskrift satt i serif, med større og mer lesbare statistikker (2,5 millioner adresser, 47 kommuner, 13 datapunkter, 8 datakilder)." },
      { type: "feature", text: "Animasjoner på tvers av siden. Hero-elementer animeres inn i rekkefølge, statistikktall teller opp når du scroller til dem, kort løfter seg subtilt ved hover, og adresseforslagene i søket dukker opp med mykere timing." },
      { type: "improvement", text: "Raskere sideinnlasting ved å laste animasjonskoden bare der den trengs. Innhold vises først, animasjoner aktiveres etter." },
      { type: "improvement", text: "Bedre kontrast og lesbarhet på tvers av siden. Spesielt for små tekster i hero, sammenligningstabellen og i samtykkebanneret." },
      { type: "fix", text: "Fjernet en unødvendig stor Leaflet-kart-stilfil fra forsiden. Kartet lastes nå bare på sider som faktisk viser et kart." },
      { type: "fix", text: "Fjernet ubrukte forhåndstilkoblinger til eksterne API-er på forsiden. Data hentes på serversiden, så tilkoblingene fra nettleseren var bortkastet." },
      { type: "improvement", text: "Respekterer OS-innstilling for redusert bevegelse. Brukere som har valgt «reduser bevegelse» får instant overganger i stedet for animasjoner." },
    ],
  },
  {
    version: "2.1",
    date: "18. april 2026",
    label: "Større designoppdatering, ny månedskostnadskalkulator og prisvarsler",
    items: [
      { type: "feature", text: "Månedskostnadskalkulator med deeplink fra verdiestimat. Klikk «Hva koster dette per måned?» på en eiendomsrapport, og lån, eiendomsskatt og stresstest fylles inn automatisk." },
      { type: "feature", text: "Prisvarsler-dashboard med faner. Administrer alle aktive varsler, terskelverdier og historikk på én side." },
      { type: "fix", text: "Oslo eiendomsskatt korrigert til 1,7 promille med bunnfradrag på 4,9 millioner (promillesatsen var feil)." },
      { type: "fix", text: "Verdiestimat advarer nå når bygningens totalareal brukes. Energiattester returnerer hele bygningens BRA for flerbolighus, og dette kunne tidligere gi urealistiske estimater. Appen krever nå manuell BRA over 500 m²." },
      { type: "fix", text: "Svart viewport ved scroll fikset. Løsningen: fjernet en sideanimasjon som promoterte hele dokumentet til et grafikklag, og justerte animasjonssluttilstanden." },
      { type: "improvement", text: "Norske desimaltegn brukes konsekvent overalt. Tall som tidligere viste «5.1%» vises nå som «5,1 %» med mellomrom før prosenttegnet." },
      { type: "improvement", text: "Nye datakortanimasjoner og mer luft i designet. Konsistente fade-animasjoner og klarere hierarki på forsiden." },
      { type: "improvement", text: "Datavalidering mot Entur, SSB og Geonorge. API-et validerer nå responser på kjøringstid og feiler trygt hvis en datakilde endrer format." },
      { type: "improvement", text: "Automatiske tester kjører på hver oppdatering. Dekker blant annet priscache, postnummer-parsing, SSB-data og kartvisning." },
    ],
  },
  {
    version: "2.0",
    date: "1. april 2026",
    label: "Enova energimerke per bolig — offisielle energikarakterer fra A til G",
    items: [
      { type: "feature", text: "Energimerke per bolig: Verdikart henter nå offisielt energimerke (A-G) fra Enovas Energimerkesystem for hver enkelt adresse. Viser energikarakter, kWh/m², byggeår, materialvalg og lenke til full energiattest (PDF)." },
      { type: "feature", text: "Visuell energiskala (A–G fargekodert bar) på hver eiendomsrapport. Grønn for A–C, gul for D–E, rød for F–G." },
      { type: "improvement", text: "Erstatter den gamle «Energimerke — kommer snart»-plassholderen med ekte data fra Enova." },
      { type: "improvement", text: "API-rute med 4-timers in-memory cache — minimerer antall nedlastinger fra Enova per serverinstans." },
    ],
  },
  {
    version: "1.9",
    date: "1. april 2026",
    label: "100 bloggartikler, lagrede adresser og 179 statiske sider",
    items: [
      { type: "feature", text: "Blogg: 100 artikler — nye nabolagsguider (Frogner, Grünerløkka), bydelsoversikter (Bergen, Trondheim), pluss guider for rekkehus, kjæledyr, takst vs. prisantydning, overtagelse, skjulte feil, utlendinger, leiemarkedet, borettslag vs. sameie, næringsbygg, rentekutt-effekt og forbrukslån." },
      { type: "feature", text: "Lagrede adresser — brukere kan nå lagre favoritadresser med hjerte-knappen på eiendomsrapporter. Lagrede adresser vises på forsiden under søkefeltet. Alle data i localStorage, ingen registrering nødvendig." },
      { type: "improvement", text: "179 statiske sider (opp fra 164)." },
    ],
  },
  {
    version: "1.8",
    date: "1. april 2026",
    label: "85 bloggartikler, energimerke-kort og 164 statiske sider",
    items: [
      { type: "feature", text: "Blogg utvidet til 85 artikler — nye bykjøperguider (Lillehammer, Hamar, Ålesund, Sandefjord, Skien, Sarpsborg, Arendal), oppussingsverdier, nabostøy, boligforsikring, tinglysing, reguleringsplaner, meglervalg, barnefamilier, småbruk, nedskalering for seniorer, vannlekkasje, tomtekjøp, nabolagstrygghet, prisprognose 2027, studentbolig, garasje/parkering og forhåndstilsagn." },
      { type: "feature", text: "Energimerke-kort på alle 18 bysider. Viser dominerende energimerke (A–G), fordeling mellom gode/middels/svake merker, og gjennomsnittlig byggeår per kommune." },
      { type: "fix", text: "To ødelagte relatedSlugs-referanser i eksisterende bloggartikler rettet (pekte på poster som aldri eksisterte)." },
      { type: "fix", text: "Tre nye bloggkategorier (Økonomiguide, Livsendringer, Strategi) manglet farger — lagt til yellow, pink og indigo." },
      { type: "improvement", text: "Demografikort og energimerkekort vises nå side om side i 2-kolonne rutenett på bysider." },
    ],
  },
  {
    version: "1.7",
    date: "1. april 2026",
    label: "Befolkningsdata, fellesgjeld-påminnelse og 50 bloggartikler",
    items: [
      { type: "feature", text: "Befolkningsprofil-kort på alle 18 bysider. Viser medianinntekt, andel med høyere utdanning, aldersfordeling (barn/voksen/eldre) og befolkningsvekst. Data fra SSB 2023." },
      { type: "feature", text: "Fellesgjeld-påminnelse i rapportsidebar. Amber varslingskort med huskeliste for prospektlesing og lenke til fellesgjeld-artikkel." },
      { type: "feature", text: "4 nye bykjøperguider: Drammen, Fredrikstad, Bodø og Sandnes — alle byer har nå dedikerte bloggartikler." },
      { type: "fix", text: "Befolkningsdata lagt til for Sarpsborg, Skien og Arendal (manglet for 3 av 18 byer — nå 100% dekning)." },
    ],
  },
  {
    version: "1.6",
    date: "1. april 2026",
    label: "Innholdsekspansjon, nye datakort og Finn.no-integrasjon",
    items: [
      { type: "feature", text: "Blogg utvidet til 46 artikler — dekker nå alle store byer, budrunde, fellesgjeld, dokumentavgift, boligtyper, refinansiering, klimarisiko, arv/gave, elbil-lading og mer." },
      { type: "feature", text: "Eiendomsskatt-kort på alle 15+ bysider. Viser promillesats, beregnet årlig kostnad for 3M/5M/8M, og grønn badge for kommuner uten eiendomsskatt." },
      { type: "feature", text: "Miljørisiko-kort (radon + flom) på alle bysider. Fargekodede risikobadger med lenker til NGU radonkart og NVE flomsonekart." },
      { type: "feature", text: "Leieavkastningskalkulator på investorsiden. Beregner brutto/netto yield og breakeven-tid basert på kjøpesum, leie, fellesgjeld og felleskostnader." },
      { type: "feature", text: "Finn.no-dyplenke i rapportsidebar. Filtrerer på postnummer for å vise aktive boligannonser i samme område. Tydelig disclaimer om at Verdikart ikke er tilknyttet Finn.no." },
      { type: "improvement", text: "Kriminalitetsdata utvidet fra 15 til ~175 kommuner — dekker nå ~85% av Norges befolkning." },
      { type: "fix", text: "Radon-lenke (NGU) og flomsonekart-lenke (NVE) var begge 404. Rettet til geo.ngu.no/kart/radon/ og temakart.nve.no/tema/flomsoner." },
      { type: "fix", text: "To nye bloggkategorier (Teknisk, Investering) manglet farger — lagt til slate og teal." },
      { type: "fix", text: "Eiendomsskatt- og miljørisiko-data lagt til for Sarpsborg, Skien og Arendal (manglet for 3 av 15 byer)." },
      { type: "fix", text: "Kriminalitetskort-fallback oppdatert fra «90 kommuner» til korrekt «~175 kommuner»." },
    ],
  },
  {
    version: "1.5",
    date: "1. april 2026",
    label: "Full revisjon — dataærlighet, tilgjengelighet og kodekvalitet",
    items: [
      { type: "fix", text: "Presseside: dansk «Hvad» rettet til norsk «Hva» i FAQ-seksjon." },
      { type: "fix", text: "Statistikkstripe: «47 kommuner brukt» endret til «47 kommuner med prisdata» — ærlig om at dette gjelder SSB prisdekning, ikke alle funksjoner." },
      { type: "fix", text: "Kriminalitetskort: vises nå med forklaring for kommuner uten data, i stedet for å forsvinne stille." },
      { type: "fix", text: "Støykort: skiller nå mellom API-feil og ingen registrert støy. Forklarer at dekningen primært gjelder tettbygde strøk og hovedveier." },
      { type: "fix", text: "Blogg: tre kategorier (Kjøperguide, Markedsanalyse, Prisanalyse) manglet farger i fargekartet — alle vises nå med unike fargebadger." },
      { type: "fix", text: "Blogg: «prisdriver-faktorene» (ikke-standard norsk) rettet til «prisdrivende faktorene» i to artikler." },
      { type: "fix", text: "Blogg: «bad lys» (engelskisme) rettet til «godt lys» i sammenligningsartikkel." },
      { type: "fix", text: "Knapptekst: inkonsistent text-black på accent-knapper rettet til text-white (e-postskjema, feilside)." },
      { type: "fix", text: "BSU-info: fjernet utdatert «(2024)»-referanse i førstegangskjøper-FAQ." },
      { type: "improvement", text: "Pristrend: bydelspris viser nå disclaimer om at verdiene er estimert via bydelsindeks, ikke faktiske transaksjonsdata." },
      { type: "improvement", text: "AI-oppsummering: fallback-tekst forbedret fra generisk «dette er en norsk adresse» til kontekstuell melding om tilgjengelige datakort." },
      { type: "improvement", text: "Avmeldingsskjema: lagt til label, name, autoComplete og aria-label for skjermleser-tilgjengelighet (WCAG 2.1 AA)." },
      { type: "improvement", text: "Formspree-ID er nå miljøvariabel i alle klientkomponenter (kontaktskjema, avmelding). Server-side subscribe-rute feiler eksplisitt med 503 hvis ikke konfigurert." },
      { type: "improvement", text: "Feillogging lagt til i alle 7 API-ruter (adresse, kollektiv, støy, pris, skoler, salg, AI). Feil som før ble svelget stille logges nå med kontekst." },
      { type: "improvement", text: "Fjernet 77 linjer død kode (ubrukt footer-duplikat) fra forsiden." },
    ],
  },
  {
    version: "1.4",
    date: "31. mars 2026",
    label: "Tillit, tilgjengelighet, SEO og mobil UX",
    items: [
      { type: "fix", text: "Karusellanekdoter med fiktive personas ('Førstegangskjøper, Oslo' etc.) erstattet med produktbeskrivende kort merket 'Illustrativt eksempel'. Eliminerer troverdighetsrisiko fra uverifisert sosial bevis." },
      { type: "fix", text: "Nyhetsbrevskjemaer (Varsle meg + Abonnér): lagt til name=\"email\" og autoComplete=\"email\" på begge input-felt. Fikser skjermleser-tilgjengelighet, nettleser-autofyll og graceful degradation uten JS." },
      { type: "fix", text: "Informasjonskapselbanner dekket innhold på 390px iPhone. Fikset: full-bredde bunnark på mobil (rounded-t-2xl, bottom-0) — hero-innhold er nå synlig over banneret. Desktop-variant uendret (hjørnekort)." },
      { type: "improvement", text: "Bysider: alle 15 bysider har nå en unik 'Hva du bør vite'-seksjon med lokalt differensiert innhold (Bodøs flyplass-transformasjon, Bergens Bybane-priseffekt, Stavanger-oljesyklus-risiko, Tromsøs øy-knapphet m.fl.). Eliminerer tynt malklisjéinnhold." },
      { type: "improvement", text: "Bysider: 'Sammenlign med nabobyer'-seksjon lagt til med priskryss-kobling mellom relaterte byer. Skaper intern lenking på tvers av alle 15 bysider." },
      { type: "improvement", text: "Om oss: lagt til 'Et lite, fokusert team'-seksjon som adresserer longevity og driftsikkerhet. Metabeskrivelse oppdatert bort fra enpersonsframing." },
      { type: "improvement", text: "Rapportside: 'Rapport generert [dato]' vises nå ved siden av datakilder-lenker. Delte rapporter viser tydelig når de ble generert." },
    ],
  },
  {
    version: "1.3",
    date: "31. mars 2026",
    label: "Hydration-fiks, Bergen/Trondheim reisetid, søk og dataryddighet",
    items: [
      { type: "fix", text: "React hydration #418/#423 — rotårsak funnet: PageTransition og CardsCascade brukte Framer Motion initial={{opacity:0}} på server-renderte elementer → SSR/CSR mismatch. Erstattet med CSS-keyframe-animasjon (animate-page-enter / animate-card-enter). Ingen synlig endring for brukere." },
      { type: "fix", text: "Bergen reisetid blank (\"___ min til Bergen sentrum\") — Entur returnerer ingen rute når adresse er innenfor 1km av sentrum. Fikset: durationMinutes=null vises nå som «Sentrum» med grønn badge." },
      { type: "fix", text: "Trondheim 51 min fra sentrum til sentrum — Entur valgte langsom rute. Fikset: henter 3 alternativer og bruker den raskeste; sanity-sjekk avviser ruter >30min for adresser <1.5km fra sentrum." },
      { type: "fix", text: "Sammenlign-adressesøk returnerte Bogane (Bergen) for 'Bogstadveien 45, Oslo' — fuzzy-søk matchet uten by-kontekst. Fikset: exact-søk prioriteres, resultater boostes der poststed matcher spørringen." },
      { type: "fix", text: "Sammenlign: gammel eksempelreferanse 'Grenseveien 80' i sammendraget stemte ikke med eksempeladressene. Rettet til Fossveien 20 (eks.)." },
      { type: "fix", text: "Kriminalitetsnivå-ikon feil: Bergen (under landssnitt) fikk amber varselikon i stedet for blått info-ikon. Fikset: storbyer med ratio <1.1 bruker nå 'Storbysnitt' (blå info) i stedet for amber varsel." },
      { type: "improvement", text: "Sammenligningstabell: 'Støykart (beta)' → 'Støykart — der data fins' (ærlig om begrenset dekning)" },
      { type: "improvement", text: "Sidefot: 'Om oss'-kolonnens overskrift omdøpt til 'Selskapet' (eliminerer duplikat med lenken under)" },
      { type: "improvement", text: "Selger-FAQ: feilaktig påstand om individuelle ComparableSales-transaksjoner er rettet — vi viser SSB-kommunegjennomsnitt" },
    ],
  },
  {
    version: "1.2",
    date: "31. mars 2026",
    label: "AI-tekst, mobilvisning og dataærlighet",
    items: [
      { type: "fix", text: "AI-oppsummering viste sammenklumpet tekst uten mellomrom («Bogstadveien45,Osloer...»). Rotårsak: fallback delte ord i separate SSE-tokens og klienten strippet mellomrom. Fikset: full tekst sendes som én hendelse; SSE-klient deler nå korrekt på \\n\\n-grense." },
      { type: "fix", text: "Sammenligningstabell: kolonneoverskrifter (Verdikart / Finn.no / Google Maps) var usynlige på 390px iPhone. Fikset: grid bruker minmax(140px,1fr) + w-max på scroll-container." },
      { type: "fix", text: "Delknapper på mobilrapport sto i vertikal kolonne og dekte innhold. Fikset: kompakt horisontal layout; Skriv ut skjules på mobil (desktop-funksjon); Del-knapp bruker innebygd native share." },
      { type: "fix", text: "React hydration-feil #418 fra animated table rows (motion.div initial={{opacity:0}}) — erstattet med vanlige div-elementer uten animasjon." },
      { type: "improvement", text: "Sammenligningstabell: «Sammenlignbare salg» korrigert til «Kommunalt prissnitt» (SSB kommunegjennomsnitt, ikke individuelle transaksjoner); Finn.no-hake fjernet (de har ekte transaksjonsdata, vi har ikke)" },
      { type: "improvement", text: "Kriminalitetsnivå-rad i sammenligningstabell annotert med «(kommunenivå)» — tydeliggjør at data gjelder hele kommunen, ikke bydel eller nabolag" },
      { type: "improvement", text: "Hero-statistikk: «kommuner dekket» → «kommuner m/prisdata» (47 gjelder SSB prisdekning, ikke produktdekning totalt)" },
    ],
  },
  {
    version: "1.1",
    date: "31. mars 2026",
    label: "Kritiske feilrettinger — koordinater, AI og datanøyaktighet",
    items: [
      { type: "fix", text: "Bergen-koordinater i demo-lenke var 10× feil (60374 → 603893) — alle ikke-Oslo-adresser fikk feil by i kollektivtransportkortet (viste f.eks. «Kristiansand sentrum» i Bergen)" },
      { type: "fix", text: "AI-oppsummering: modell byttet fra google/gemini-2.0-flash-lite-001 (tom respons) til openai/gpt-oss-20b:free; SSE-buffer-parsing rettet for fragmenterte chunks" },
      { type: "fix", text: "Sammenlign-eksempel viste fiktive støydata for Bogstadveien 45 som ikke stemte med rapportsiden — erstattet med tydelig merkede illustrative eksempeladresser" },
      { type: "fix", text: "Hydration-feil (#418) i sidefot: new Date().getFullYear() ga SSR/CSR-mismatch — fikset med suppressHydrationWarning" },
      { type: "improvement", text: "«Sammenlignbare salg» omdøpt til «Kommunalt prissnitt» — gjenspeiler at tallene er kommunegjennomsnitt fra SSB, ikke individuelle transaksjoner" },
      { type: "improvement", text: "Nabolagssider: kvadratmeterpris nå merket «Estimert basert på SSB kommunedata 2024» (ikke direkte SSB-tall, men bydeljustert estimat)" },
    ],
  },
  {
    version: "1.0",
    date: "31. mars 2026",
    label: "Datakvalitet, GDPR & SEO",
    items: [
      { type: "feature", text: "Skoler hentes nå fra Nasjonalt skoleregister (Udir) — viser trinnintervall (1–7 Barneskole, 8–10 Ungdomsskole), elevtall, skolens nettside og offentlig/privat-badge" },
      { type: "feature", text: "Adressesammenligner (/sammenlign) fungerer nå fullt ut — transport og støydata ble ikke hentet riktig pga. API-parsing-feil. Begge er nå rettet" },
      { type: "feature", text: "Strukturerte data utvidet: HowTo-skjema på /kalkulator, SoftwareApplication på /sammenlign — kan gi rikere treff i Google" },
      { type: "improvement", text: "Kriminalitetskort: storbykommune (Oslo, Bergen, Trondheim, Stavanger) viser nå «Storbysnitt» i nøytral blå i stedet for alarmerende oransje — kontekst om bydelsforskjeller inkludert" },
      { type: "improvement", text: "Datakildeetiketter på by- og nabolagssider: alle prisdata merkes nå med «SSB årsgjennomsnitt 2024» direkte under tallene" },
      { type: "improvement", text: "Barnehagesøk: «Søk barnehageplass i kommunen»-lenke lagt til, Oslo/Bergen/Trondheim/Stavanger har egne kommunesider" },
      { type: "improvement", text: "Mobil (390px): statistikkstripe viser ikke lenger avklipt høyre kolonne — padding lagt til" },
      { type: "improvement", text: "AI-oppsummering: tittellinje wrapper ikke lenger over 3 linjer på smal skjerm — badge og tittel holder seg på én linje" },
      { type: "fix", text: "GDPR: «Ikke nå» erstattet med «Avvis alle» + granulær samtykkepanel med separate kategorier for Plausible (nødvendig) og Microsoft Clarity (UX-måling)" },
      { type: "fix", text: "SEO: HTML lang-attributt rettet fra «no» til «nb» (korrekt BCP 47 for bokmål)" },
      { type: "fix", text: "SEO: Ødelagt SearchAction (Google Sitelinks søkeboks) fjernet — URL-mønsteret fungerte ikke og ville gitt tomme resultater" },
      { type: "fix", text: "SEO: OG-bilde og Twitter-kortbilde pekte på ulike filer — begge peker nå på /opengraph-image" },
    ],
  },
  {
    version: "0.9",
    date: "31. mars 2026",
    label: "Stabilitet, ærlighet & AI",
    items: [
      { type: "fix", text: "React hydration-feil (#418/#423) fjernet på hjemmeside og rapportsider — animerte komponenter bruker nå Framer Motions innebygde viewport-detektor i stedet for React state" },
      { type: "fix", text: "AI-oppsummering fungerer igjen — OpenRouter-modell oppdatert fra avviklet gemini-flash-1.5-8b til gemini-2.0-flash-lite-001" },
      { type: "fix", text: "Tallmotsigelse i hero-statistikk rettet: begge steder viser nå 47 kommuner og 4 datakilder" },
      { type: "fix", text: "Støynivå-illustrasjon i «Slik fungerer det»-seksjonen viste oppdiktet verdi for en ekte adresse — erstattet med nøytral kildeetikkett" },
      { type: "fix", text: "Feil OpenGraph-tittel på FAQ, Kontakt, Endringslogg, Datakilder og Presse — alle sider har nå unike OG-titler for korrekt deling i sosiale medier" },
      { type: "improvement", text: "SSB-periode vises nå som «Årsgjennomsnitt 2024» i sammenlignbare salg, og «Q4 2024» i pristrend — med forklaring om SSBs publiseringsfrekvens" },
      { type: "improvement", text: "Cookiebanner vises igjen etter 30 dager for brukere som tidligere valgte «Ikke nå»" },
      { type: "improvement", text: "Kriminalitetskort: Oslo-spesifikk kontekstuell note plassert direkte ved siden av badge" },
      { type: "improvement", text: "Søkefelt i navbar: «Kontakt»-lenke synlig på alle skjermstørrelser" },
      { type: "improvement", text: "Sammenligningstabell: kortere radtekster for bedre lesbarhet på mobil (390px)" },
    ],
  },
  {
    version: "0.8",
    date: "31. mars 2026",
    label: "Kvalitet & pålitelighet",
    items: [
      { type: "fix", text: "URL-rute for blogg endret fra /blog til /blogg — korrekt norsk" },
      { type: "fix", text: "Støykortet viser nå en tydelig melding når data ikke er tilgjengelig for adressen, i stedet for å forsvinne stille" },
      { type: "improvement", text: "Kriminalitetskort: tydeligere kontekstuell advarsel om at tall gjelder hele kommunen, ikke enkeltbydeler" },
      { type: "improvement", text: "Sammenligningstabell: overskriftskort og avkrysningskolonner er nå i ett felles rutenett — ingen mer feiljustering" },
      { type: "feature", text: "FAQ-seksjon og JSON-LD FAQPage-skjema lagt til for boligselgere" },
      { type: "feature", text: "Preconnect-hint for Kartverket, Entur og SSB — raskere rapportlasting" },
    ],
  },
  {
    version: "0.7",
    date: "30. mars 2026",
    label: "Navigasjon & innhold",
    items: [
      { type: "feature", text: "Felles SiteFooter-komponent på alle sider" },
      { type: "feature", text: "Sammenlign-siden har nå eksempelforhåndsvisning når ingen adresse er valgt" },
      { type: "feature", text: "\"Hvorfor er dette gratis?\"-seksjon på forsiden" },
      { type: "feature", text: "Avmeldingsside (/avmeld) med ett klikk — GDPR-krav" },
      { type: "fix", text: "Mobilvisning: hero-tekst og tabs fikset for xs-skjermer" },
      { type: "improvement", text: "Navigasjonsbar: transparent øverst, frostet glass ved scroll" },
      { type: "improvement", text: "Hero-kopi: fokus på utbytte («Er nabolaget verdt prisen?») i stedet for funksjoner" },
      { type: "feature", text: "Sosial bevisstripe med rapportteller og karusell" },
    ],
  },
  {
    version: "0.6",
    date: "30. mars 2026",
    label: "Rapportside & SEO",
    items: [
      { type: "improvement", text: "Rapportside: fullt-bred kartstripe øverst, AI-oppsummering over brettet" },
      { type: "improvement", text: "Redaksjonelt rutenett: 2/3 hovedinnhold + 1/3 sticky sidebar" },
      { type: "feature", text: "Nabolagssider med lenker til nærliggende nabolag" },
      { type: "feature", text: "Sammenligningstabell: 3-kolonne produktkort med ikonrekker" },
      { type: "feature", text: "JSON-LD FAQPage lagt til for førstegangskjøper, boliginvestor og barnefamilier" },
      { type: "improvement", text: "Open Graph og Twitter Card-metadata komplett på alle sider" },
      { type: "feature", text: "Apple Touch Icon (180×180)" },
    ],
  },
  {
    version: "0.5",
    date: "30. mars 2026",
    label: "Design & SEO",
    items: [
      { type: "feature", text: "By-landingssider for Oslo, Bergen og Trondheim med lokal SEO-innhold og FAQ" },
      { type: "feature", text: "JSON-LD strukturert data: FAQPage, LocalBusiness, BreadcrumbList og RealEstateListing" },
      { type: "improvement", text: "Ny fargepallette med indigo/slate-toner — dypere og mer profesjonelt utseende" },
      { type: "improvement", text: "Gradient headline og noise-tekstur på hero-seksjonen" },
      { type: "improvement", text: "Søkefelt med gradient border og glow-effekt" },
      { type: "improvement", text: "Feature cards med 3D-tilt og spotlight hover-effekter" },
      { type: "feature", text: "Animasjoner: staggered fade-up på hero, count-up tall i demoen, sparkline draw-animasjon" },
      { type: "feature", text: "Microsoft Clarity integrert for varmekart og sesjonopptak" },
      { type: "fix", text: "Kartvisning byttet til CartoDB DarkMatter tiles — ikke lenger svart" },
      { type: "fix", text: "Kontrastforhold for tertær tekst økt til 4.6:1 (WCAG AA)" },
    ],
  },
  {
    version: "0.4",
    date: "29. mars 2026",
    label: "Sikkerhet & ytelse",
    items: [
      { type: "feature", text: "Sikkerhetshoder: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy" },
      { type: "improvement", text: "Lighthouse: 96 ytelse / 100 tilgjengelighet / 100 beste praksis / 100 SEO" },
      { type: "feature", text: "Plausible Analytics — personvernvennlig, ingen cookies" },
      { type: "improvement", text: "GDPR-compliant e-postinnsamling med eksplisitt samtykke og avmeldingslenke" },
    ],
  },
  {
    version: "0.3",
    date: "28. mars 2026",
    label: "Delbare URL-er & ikoner",
    items: [
      { type: "feature", text: "Koordinater kodet direkte i URL-slug — resultatsider er selvstendige og delbare" },
      { type: "improvement", text: "Alle emoji byttet ut med Lucide SVG-ikoner" },
      { type: "improvement", text: "Produktforhåndsvisning på forsiden med reelle eksempeldata" },
      { type: "fix", text: "Ubrukt MapPin-import fjernet" },
    ],
  },
  {
    version: "0.2",
    date: "27. mars 2026",
    label: "Kollektivdata & søk",
    items: [
      { type: "feature", text: "Nærmeste holdeplasser med linje­numre, transportmode og avganger per time" },
      { type: "improvement", text: "Holdeplasser uten avganger filtreres ut automatisk" },
      { type: "improvement", text: "Linjesortering: metro → jernbane → trikk → buss → båt" },
      { type: "feature", text: "Formspree e-postabonnement for prisvarsler og nyhetsbrev" },
    ],
  },
  {
    version: "0.1",
    date: "25. mars 2026",
    label: "Lansering",
    items: [
      { type: "feature", text: "Adressesøk med autofullføring mot Kartverket" },
      { type: "feature", text: "Kollektivkort med Entur live-data" },
      { type: "feature", text: "Prisutviklingskort med SSB-data" },
      { type: "feature", text: "Sammenlignbare salg — gjennomsnittlig kr/m² per kommune" },
      { type: "feature", text: "Kartvisning med holdeplasser og eiendomsmarkør" },
    ],
  },
];

const typeConfig: Record<ChangeType, { icon: React.ElementType; color: string; label: string }> = {
  feature: { icon: Star, color: "text-accent", label: "Ny funksjon" },
  improvement: { icon: Zap, color: "text-yellow-400", label: "Forbedring" },
  fix: { icon: Bug, color: "text-green-400", label: "Feilretting" },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <GitCommit className="h-5 w-5 text-accent" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Endringslogg</h1>
          <p className="mt-3 text-text-secondary">Verdikart er i aktiv utvikling. Her er en oversikt over hva som er nytt.</p>
        </div>

        <div className="space-y-10">
          {changelog.map((entry) => (
            <div key={entry.version}>
              {/* Version header */}
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent">
                  v{entry.version}
                </span>
                <span className="font-semibold">{entry.label}</span>
                <span className="ml-auto text-xs text-text-tertiary">{entry.date}</span>
              </div>

              {/* Items */}
              <div className="space-y-2 rounded-xl border border-card-border bg-card-bg p-4">
                {entry.items.map(({ type, text }) => {
                  const { icon: Icon, color } = typeConfig[type];
                  return (
                    <div key={text} className="flex items-start gap-2.5 py-1">
                      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} strokeWidth={1.5} />
                      <span className="text-sm text-text-secondary">{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-xs text-text-tertiary">
          Har du forslag til forbedringer?{" "}
          <a href="/kontakt" className="text-accent hover:underline">Send oss en melding.</a>
        </div>
      </div>
    </div>
  );
}
