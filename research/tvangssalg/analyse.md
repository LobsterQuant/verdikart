# Tvangssalg-research — Fase 1.0

**Branch:** `research/tvangssalg-data-analyse`
**Dato:** 2026-04-20
**Kilde:** SSB PxWeb v1 API (`data.ssb.no/api/v0/no/table/`)

---

## TL;DR — Viktig oppdagelse før analyse

**SSB har ingen tabell med tvangssalg per kommune.** All tvangssalg-data i Statistikkbanken er kun på nasjonalt nivå. Dette bryter premisset i oppgaven. Se [Seksjon 0](#0-datatilgjengelighet--hva-ssb-ikke-har) for detaljer og forslag til alternativ datakilde.

**Det mest nyhetsverdige funnet fra de nasjonale tallene:**
Tvangssalgene snudde i 2024 og skyter fart i 2025. Hjemmelsoverføringer ved tvangssalg steg **+14 % i 2025** mot 2024, og **+21 % siden 2023**. Fritidseiendom leder kraftig: **+82 % siden 2023**. Borettslag i Q2 2025: **48 tvangssalg** — høyeste kvartal siden 2021.

---

## 0. Datatilgjengelighet — Hva SSB (ikke) har

### Hva som finnes

| Tabell | Innhold | Nivå | Periode | Status |
|---|---|---|---|---|
| **08948** | Omsetning av fast eiendom fordelt på omsetningsmåte og eiendomstype (inkl. tvangssalg) | **Nasjonalt** | 2000K1–2025K4 | Aktiv |
| **11500** | Omsetning av boliger i borettslag fordelt på omsetningsmåte og bruksformål (inkl. tvangssalg) | **Nasjonalt** | 2017K1–2025K4 | Aktiv |
| **07218** | Tvangssal begjært (fast eigedom + lausøyre) | **Nasjonalt** | 1995M01–2022M01 | **Stoppet jan 2022** |

SSB-notat i 07218: «På grunn av administrative endringer i Brønnøysundregistera, har ikkje SSB fått tal for tvangssal etter januar 2022.»

### Hva som *ikke* finnes i SSB

- **Per kommune (K) eller fylke (F)** finnes kun totalomsetning (`03222`, `11502`, `08949`) — **uten** splitt på omsetningsmåte. Altså ingen fylkes- eller kommune-delte tvangssalg-tall.
- Alle (K)-tabeller under `eiendomsomsetning` (06726, 04709, 11694, m.fl.) gjelder *kun fritt salg*.
- Ingen tabell under `sk` (Sosiale forhold og kriminalitet) har tvangssalg.

### Verifikasjon

- V2-beta-søk `query=tvangssalg`: **2 treff** (08948, 11500). Ingen med region-dimensjon.
- V2-beta-søk `query=tvangssal`: **1 treff** (07218). Ingen regionsdimensjon.
- V2-beta-søk `query=omsetningsmåte`: **2 treff**. Ingen med region.
- Manuell navigasjon gjennom `bb/bb03/eiendomsoms/*` bekrefter: ingen (K)-tabell har `ContentsCode: Tvangssalg`.

### Alternativ tilnærming for kommune-nivå

Siden SSB ikke har dette, må kommune-nivå tvangssalg hentes andre steder. Vurdert fra mest til minst løftbar for Verdikart:

1. **Kartverket Grunnbok** (tinglyste dokumenter med dokumenttype «Tvangssalg»). *Vi har søkt og venter på API-tilgang (memo: project_kartverket_api).* Dette gir komplette, autoritative tall per gnr/bnr → kommune. Mest robust.
2. **Brønnøysundregistrene, Løsøreregister + Tvangsregisteret** — har begjæringer, ikke utfall. Kommune utledes via debitor-adresse.
3. **Domstolenes kunngjøringer om tvangssalg** (tingrettene publiserer auksjonskunngjøringer). Skrapbart, men ikke sentralt indeksert.
4. **Finansavisen / E24 / DN egne datasett** — noen journalister har bygget egne oversikter basert på tingrettskunngjøringer. Nyhetsvinkel-verdi, men ikke reproduserbart uten grunnbok.

**Anbefaling:** Vent på grunnbok-API. Inntil da: bygg feature på nasjonal SSB-trend + generisk «siste tvangssalg i din kommune»-placeholder.

---

## 1. Nasjonal oversikt

**Datasett brukt:** SSB 08948 (hjemmelsoverføringer ved tvangssalg, kvartalsvis, alle eiendomstyper).

### Antall tvangssalg siste 12 måneder (kalenderåret 2025)

**818 tvangssalg** i 2025 — opp fra 716 i 2024.

| Metrikk | Verdi |
|---|---|
| 2025 (hele året) | **818** |
| 2024 | 716 |
| YoY-endring | **+14,2 %** |
| Endring fra 2023 | **+21,0 %** |
| 10-års-endring (2016 → 2025) | −15,6 % |

### Trend siste 5 år (rullerende 4-kvartalers sum)

| Kvartal (slutt) | Rullerende 4K-sum | Bolig andel |
|---|---|---|
| 2022K4 | 867 | 618 |
| 2023K2 | 755 | 567 |
| 2023K4 | **676** (bunn) | 508 |
| 2024K2 | 696 | 508 |
| 2024K4 | 716 | 535 |
| 2025K2 | 723 | 514 |
| 2025K4 | **818** (høyeste siden 2022Q3) | 598 |

**Tolkning:** Klar snuoperasjon. Bunnen var Q4 2023 (676 rullerende). Siden har trenden steget fem kvartaler på rad, og akselerer i andre halvår 2025 (Q3 208, Q4 208 — begge over Q2 2025).

### Historisk kontekst

- **Topp-år 2009–2015**: ~1000/år.
- **2019–2021**: stabile ~1050–1070/år.
- **2022–2023**: fall til 867 og 676 — trolig kombinasjon av pandemi-moratorier, sterk boligprisvekst (færre negative egenkapital) og den nevnte adminendring i Brønnøysund.
- **2024→**: rebound.

---

## 2. Topp 10 kommuner etter volum

**IKKE LEVERT.** SSB publiserer ikke tvangssalg per kommune (se Seksjon 0).

Forslag til erstatning når Kartverket grunnbok-API er åpent:
- Hent alle tinglyste dokumenter med `type = Tvangssalg` siste 12 mnd.
- Aggreger per gnr/bnr → kommune.
- Presenter absolutt antall + per 1000 innbyggere (SSB `07459` for folketall).

---

## 3. Topp 10 kommuner etter prosentvis økning

**IKKE LEVERT.** Samme årsak.

---

## 4. Topp 10 kommuner etter prosentvis nedgang

**IKKE LEVERT.** Samme årsak.

---

## 5. Regionale mønstre

**Ikke mulig med SSB-data alene.** Nærmeste tilnærming:

- Tabell **03222** gir totalomsetninger per fylke, men uten tvangssalg-splitt.
- Kan eventuelt *approksimere* regionale mønstre ved å anta nasjonal tvangssalgsrate (818 / total omsetninger i 2025) og multiplisere per fylke. Men dette er spekulativt og bryter rule «Ikke spekuler utover dataene» — så vi leverer ikke det.

---

## 6. Eiendomstype — den egentlige hovedhistorien

Siden geografisk splitt mangler, er **eiendomstype** den eneste dimensjonen vi faktisk kan bryte ned på. Og her ligger det et tydelig funn:

### Endring per eiendomstype (2023 → 2025)

| Eiendomstype | 2023 | 2024 | 2025 | 2023→2025 | YoY |
|---|---:|---:|---:|---:|---:|
| Alle eiendommer | 676 | 716 | **818** | **+21,0 %** | +14,2 % |
| Bolig med bygning | 482 | 511 | 578 | +19,9 % | +13,1 % |
| **Fritidseiendom med bygning** | 52 | 61 | **92** | **+76,9 %** | **+50,8 %** |
| Fritidseiendom i alt | 54 | 67 | 98 | **+81,5 %** | +46,3 % |
| Næring (kontor/forretning) | 14 | 12 | 18 | +28,6 % | +50,0 % |
| Industri med bygning | 6 | 7 | 10 | +66,7 % | +42,9 % |
| Landbruk med bygning | 30 | 26 | 32 | +6,7 % | +23,1 % |
| Borettslag (SSB 11500) | 127 | 121 | 156 | +22,8 % | +28,9 % |

**Nøkkelinnsikt:** Fritidseiendom er den klart mest aksellererende kategorien. Antall tvangssalg av hytter er nær doblet fra 2023 til 2025, og har gått opp 50 % bare fra 2024 til 2025. Næringseiendom og industri viser samme retning, men fra små tall.

Dette passer tematisk med offentlig kjente makrotrender: høyrenteregime holder stand inn i 2026, og hytte-gjeld er typisk førstelinjen å nedprioritere i husholdninger med stram likviditet.

---

## 7. Datakvalitet og definisjoner

### Viktig distinksjon

- **Hjemmelsoverføring, tvangssalg** (08948, 11500): tinglyste tvangssalg som er *gjennomført*. Dette er sluttresultatet.
- **Tvangssal begjært** (07218): antall begjæringer om tvangssalg levert til tingretten. Historisk ~15 000–18 000/år på fast eiendom (2018–2021). Mer enn 90 % av begjæringene ender ikke i gjennomført salg — de trekkes, innfris eller henlegges.

Volum-gapet: ~17 000 begjæringer → ~1000 gjennomførte salg. Et eventuelt produkt må være tydelig på hvilken målstokk som vises.

### Kvartalsvis foreløpighet

08948-notat: «De to siste kvartalene som er publisert er foreløpige tall.» 2025K3 og 2025K4 kan justeres når vi henter på nytt.

---

## 8. Nyhetsvinkler — forslag

Alle er basert på tall fra 08948/11500 som faktisk finnes. Geografiske vinkler krever grunnbok-tilgang.

1. **«Hytte-tvangssalgene nær dobler seg: opp 82 % på to år»**
   Tall: 54 (2023) → 98 (2025) fritidseiendommer. 92 av disse er hytter med bygning. Q4 2025 alene leverte mer enn hele 2023. Kobles til rentepress på husholdninger.

2. **«Tvangssalgene snur: 2025 ble året boligmarkedet sprakk»**
   Tall: Rullerende 4K-sum har steget fem kvartaler på rad, fra 676 (Q4 2023) til 818 (Q4 2025) — +21 %. Bolig med bygning alene opp +20 %.

3. **«Borettslags-krisen i Q2: 48 tvangssalg på tre måneder — høyeste siden pandemien»**
   Tall: 11500 viser 48 tvangssalg av borettslagsleiligheter i 2025K2 — høyeste enkeltkvartal siden 2021K4. Hele 2024: 121. Hele 2025: 156 (+29 % YoY).

4. **«Næringseiendom neste: kontor- og industri-tvangssalg opp 50 %»**
   Tall: Kontor/forretning 12 → 18 (+50 % YoY). Industri med bygning 7 → 10 (+43 % YoY). Fra lave tall, men klar retning.

5. **«SSB har ikke lenger tvangssalg-tall per kommune — her er hva journalister ikke får vite»**
   Meta-historie: 07218 stoppet jan 2022 grunnet Brønnøysund-endring. 08948/11500 er nasjonale kun. Reell geografisk overvåking av tvangssalg krever nå enten Kartverkets grunnbok-API (lukket), egen skraping av domstol-kunngjøringer, eller Finanstilsynet/banker. Demokratisk transparens-vinkel.

**Sterkeste enkelt-overskrift for DN/E24:** #1 (hytte-tvangssalgene). Konkret tallfaktor, uventet kategori, kobles tematisk til kjente historier om norsk hytteboble.

---

## 9. Implikasjoner for Verdikart

1. **«Tvangssalg siste 12 mnd i din kommune» som feature er ikke byggbar fra SSB.** Krever grunnbok eller alternativ skraping.
2. **Nasjonal trend-widget** («Tvangssalg i Norge: 818 i 2025, +14 % YoY») kan bygges i dag fra 08948, oppdateres kvartalsvis.
3. **«Hytte-tvangssalg»-sidelining på landing for fritidseiendom** har nyhetsaktualitet i 2026. Nasjonal statistikk kan drive en egen datahistorie-side (eiendom/tvangssalg).
4. **Kartverket grunnbok-API er låsen som åpner hele feature-spekteret** — bekrefter prioriteten i `project_kartverket_api.md`.

---

## 10. Uventede oppdagelser

- **Brønnøysund-hullet**: At 07218 har gått på tomgang siden januar 2022 er dårlig kjent. Den er fortsatt oppført som aktiv tabell, oppdatert 2026-04-09, men publiserer null-verdier for tvangssalg. Fire års blindsone for forskere og journalister som ikke leser SSB-notatet.
- **Q4 2025 er det sterkeste Q4 på tre år** (208 tvangssalg) — normalt er Q4 lavere enn Q2–Q3 pga. domstol-ferie og årsslutt. Denne sesongavvikende styrken er signal, ikke støy.
- **Fritidseiendom utenom bygning** (F2): 2 → 6 saker i 2023 → 2025 (+200 %). Men 6 saker er for lavt til å bære vinkel.
- **Offentlig vei** (K): 7 → 4 saker. Ingen historie her.

---

## Metode og reproduserbarhet

- Fetch: `research/tvangssalg/fetch-scripts.ts` (kjør med `npx tsx research/tvangssalg/fetch-scripts.ts`).
- Rådata: `research/tvangssalg/data-hentet.json` (~750 kB, tre tabeller).
- API: SSB PxWeb v1 på `data.ssb.no/api/v0/no/table/{ID}/`, JSON-stat2 output.
- All aggregering i denne rapporten er reproduserbar fra rådata-JSON-en med standard gruppering på `Tid[:4]` (år) og `EiendomType`.
