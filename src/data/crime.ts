/**
 * Kommune-level crime rates.
 *
 * Source: SSB table 08487 — Lovbrudd anmeldt etter utvalgte lovbruddsgrupper
 * og gjerningssted (kommune). To års gjennomsnitt. Antall og per 1 000 innbyggere.
 * Period: 2023-2024 (2-year average). License: CC BY 4.0.
 * Last refreshed: 2026-04-21
 *
 * Re-run `npx tsx scripts/test-ssb-crime.ts` to regenerate with newer data.
 */

export interface KommuneCrime {
  rate: number;
  year: number;
}

export const KOMMUNE_CRIME: Record<string, KommuneCrime> = {
  "0301": { rate: 97.8, year: 2024 }, // Oslo - Oslove
  "1101": { rate: 47.2, year: 2024 }, // Eigersund
  "1103": { rate: 67.7, year: 2024 }, // Stavanger
  "1106": { rate: 75.3, year: 2024 }, // Haugesund
  "1108": { rate: 52.9, year: 2024 }, // Sandnes
  "1111": { rate: 37.3, year: 2024 }, // Sokndal
  "1112": { rate: 24.2, year: 2024 }, // Lund
  "1114": { rate: 28.7, year: 2024 }, // Bjerkreim
  "1119": { rate: 34.2, year: 2024 }, // Hå
  "1120": { rate: 47.1, year: 2024 }, // Klepp
  "1121": { rate: 49.7, year: 2024 }, // Time
  "1122": { rate: 38.7, year: 2024 }, // Gjesdal
  "1124": { rate: 48.7, year: 2024 }, // Sola
  "1127": { rate: 33.2, year: 2024 }, // Randaberg
  "1130": { rate: 32.9, year: 2024 }, // Strand
  "1133": { rate: 27.6, year: 2024 }, // Hjelmeland
  "1134": { rate: 23.9, year: 2024 }, // Suldal
  "1135": { rate: 30.8, year: 2024 }, // Sauda
  "1144": { rate: 11.0, year: 2024 }, // Kvitsøy
  "1145": { rate: 40.8, year: 2024 }, // Bokn
  "1146": { rate: 39.2, year: 2024 }, // Tysvær
  "1149": { rate: 44.4, year: 2024 }, // Karmøy
  "1160": { rate: 47.5, year: 2024 }, // Vindafjord
  "1505": { rate: 61.1, year: 2024 }, // Kristiansund
  "1506": { rate: 41.7, year: 2024 }, // Molde
  "1508": { rate: 58.2, year: 2024 }, // Ålesund
  "1511": { rate: 28.4, year: 2024 }, // Vanylven
  "1514": { rate: 26.3, year: 2024 }, // Sande
  "1515": { rate: 33.6, year: 2024 }, // Herøy (Møre og Romsdal)
  "1516": { rate: 35.7, year: 2024 }, // Ulstein
  "1517": { rate: 27.6, year: 2024 }, // Hareid
  "1520": { rate: 31.0, year: 2024 }, // Ørsta
  "1525": { rate: 33.1, year: 2024 }, // Stranda
  "1528": { rate: 23.6, year: 2024 }, // Sykkylven
  "1531": { rate: 27.6, year: 2024 }, // Sula
  "1532": { rate: 31.9, year: 2024 }, // Giske
  "1535": { rate: 35.0, year: 2024 }, // Vestnes
  "1539": { rate: 42.1, year: 2024 }, // Rauma
  "1547": { rate: 25.8, year: 2024 }, // Aukra
  "1554": { rate: 32.7, year: 2024 }, // Averøy
  "1557": { rate: 46.3, year: 2024 }, // Gjemnes
  "1560": { rate: 31.6, year: 2024 }, // Tingvoll
  "1563": { rate: 41.6, year: 2024 }, // Sunndal
  "1566": { rate: 25.2, year: 2024 }, // Surnadal
  "1573": { rate: 19.9, year: 2024 }, // Smøla
  "1576": { rate: 24.1, year: 2024 }, // Aure
  "1577": { rate: 34.2, year: 2024 }, // Volda
  "1578": { rate: 26.5, year: 2024 }, // Fjord
  "1579": { rate: 32.2, year: 2024 }, // Hustadvika
  "1580": { rate: 22.4, year: 2024 }, // Haram
  "1804": { rate: 47.7, year: 2024 }, // Bodø
  "1806": { rate: 49.1, year: 2024 }, // Narvik
  "1811": { rate: 17.2, year: 2024 }, // Bindal
  "1812": { rate: 19.2, year: 2024 }, // Sømna
  "1813": { rate: 36.8, year: 2024 }, // Brønnøy
  "1815": { rate: 22.4, year: 2024 }, // Vega
  "1816": { rate: 25.0, year: 2024 }, // Vevelstad
  "1818": { rate: 25.5, year: 2024 }, // Herøy (Nordland)
  "1820": { rate: 48.4, year: 2024 }, // Alstahaug
  "1822": { rate: 37.0, year: 2024 }, // Leirfjord
  "1824": { rate: 46.2, year: 2024 }, // Vefsn
  "1825": { rate: 55.3, year: 2024 }, // Grane
  "1826": { rate: 21.0, year: 2024 }, // Aarborte - Hattfjelldal
  "1827": { rate: 33.6, year: 2024 }, // Dønna
  "1828": { rate: 21.0, year: 2024 }, // Nesna
  "1832": { rate: 31.9, year: 2024 }, // Hemnes
  "1833": { rate: 48.7, year: 2024 }, // Rana - Raane
  "1834": { rate: 26.5, year: 2024 }, // Lurøy
  "1835": { rate: 22.6, year: 2024 }, // Træna
  "1836": { rate: 16.7, year: 2024 }, // Rødøy
  "1837": { rate: 52.6, year: 2024 }, // Meløy
  "1838": { rate: 33.2, year: 2024 }, // Gildeskål
  "1839": { rate: 23.5, year: 2024 }, // Beiarn
  "1840": { rate: 47.7, year: 2024 }, // Saltdal
  "1841": { rate: 52.7, year: 2024 }, // Fauske - Fuossko
  "1845": { rate: 36.1, year: 2024 }, // Sørfold - Fuolldá
  "1848": { rate: 28.4, year: 2024 }, // Steigen
  "1851": { rate: 32.0, year: 2024 }, // Lødingen
  "1853": { rate: 106.8, year: 2024 }, // Evenes - Evenássi
  "1856": { rate: 28.3, year: 2024 }, // Røst
  "1857": { rate: 41.0, year: 2024 }, // Værøy
  "1859": { rate: 39.1, year: 2024 }, // Flakstad
  "1860": { rate: 41.9, year: 2024 }, // Vestvågøy
  "1865": { rate: 39.1, year: 2024 }, // Vågan
  "1866": { rate: 33.5, year: 2024 }, // Hadsel
  "1867": { rate: 36.4, year: 2024 }, // Bø
  "1868": { rate: 28.7, year: 2024 }, // Øksnes
  "1870": { rate: 50.0, year: 2024 }, // Sortland - Suortá
  "1871": { rate: 33.8, year: 2024 }, // Andøy
  "1874": { rate: 36.7, year: 2024 }, // Moskenes
  "1875": { rate: 30.4, year: 2024 }, // Hábmer - Hamarøy
  "3101": { rate: 85.8, year: 2024 }, // Halden
  "3103": { rate: 59.2, year: 2024 }, // Moss
  "3105": { rate: 62.4, year: 2024 }, // Sarpsborg
  "3107": { rate: 60.9, year: 2024 }, // Fredrikstad
  "3110": { rate: 53.3, year: 2024 }, // Hvaler
  "3112": { rate: 63.3, year: 2024 }, // Råde
  "3114": { rate: 31.1, year: 2024 }, // Våler (Østfold)
  "3116": { rate: 35.5, year: 2024 }, // Skiptvet
  "3118": { rate: 56.1, year: 2024 }, // Indre Østfold
  "3120": { rate: 32.5, year: 2024 }, // Rakkestad
  "3122": { rate: 76.3, year: 2024 }, // Marker
  "3124": { rate: 25.2, year: 2024 }, // Aremark
  "3201": { rate: 49.7, year: 2024 }, // Bærum
  "3203": { rate: 44.2, year: 2024 }, // Asker
  "3205": { rate: 56.2, year: 2024 }, // Lillestrøm
  "3207": { rate: 44.9, year: 2024 }, // Nordre Follo
  "3209": { rate: 142.3, year: 2024 }, // Ullensaker
  "3212": { rate: 29.1, year: 2024 }, // Nesodden
  "3214": { rate: 41.7, year: 2024 }, // Frogn
  "3216": { rate: 44.6, year: 2024 }, // Vestby
  "3218": { rate: 56.7, year: 2024 }, // Ås
  "3220": { rate: 37.7, year: 2024 }, // Enebakk
  "3222": { rate: 48.2, year: 2024 }, // Lørenskog
  "3224": { rate: 42.7, year: 2024 }, // Rælingen
  "3226": { rate: 34.1, year: 2024 }, // Aurskog-Høland
  "3228": { rate: 34.8, year: 2024 }, // Nes
  "3230": { rate: 23.1, year: 2024 }, // Gjerdrum
  "3232": { rate: 31.4, year: 2024 }, // Nittedal
  "3234": { rate: 53.2, year: 2024 }, // Lunner
  "3236": { rate: 29.3, year: 2024 }, // Jevnaker
  "3238": { rate: 31.9, year: 2024 }, // Nannestad
  "3240": { rate: 47.5, year: 2024 }, // Eidsvoll
  "3242": { rate: 35.2, year: 2024 }, // Hurdal
  "3301": { rate: 65.4, year: 2024 }, // Drammen
  "3303": { rate: 41.6, year: 2024 }, // Kongsberg
  "3305": { rate: 50.7, year: 2024 }, // Ringerike
  "3310": { rate: 42.2, year: 2024 }, // Hole
  "3312": { rate: 42.9, year: 2024 }, // Lier
  "3314": { rate: 44.3, year: 2024 }, // Øvre Eiker
  "3316": { rate: 37.1, year: 2024 }, // Modum
  "3318": { rate: 51.8, year: 2024 }, // Krødsherad
  "3320": { rate: 57.4, year: 2024 }, // Flå
  "3322": { rate: 43.6, year: 2024 }, // Nesbyen
  "3324": { rate: 51.7, year: 2024 }, // Gol
  "3326": { rate: 85.1, year: 2024 }, // Hemsedal
  "3328": { rate: 39.3, year: 2024 }, // Ål
  "3330": { rate: 69.2, year: 2024 }, // Hol
  "3332": { rate: 31.2, year: 2024 }, // Sigdal
  "3334": { rate: 34.9, year: 2024 }, // Flesberg
  "3336": { rate: 30.1, year: 2024 }, // Rollag
  "3338": { rate: 40.6, year: 2024 }, // Nore og Uvdal
  "3401": { rate: 67.8, year: 2024 }, // Kongsvinger
  "3403": { rate: 62.2, year: 2024 }, // Hamar
  "3405": { rate: 40.0, year: 2024 }, // Lillehammer
  "3407": { rate: 52.6, year: 2024 }, // Gjøvik
  "3411": { rate: 41.2, year: 2024 }, // Ringsaker
  "3412": { rate: 87.9, year: 2024 }, // Løten
  "3413": { rate: 44.1, year: 2024 }, // Stange
  "3414": { rate: 35.1, year: 2024 }, // Nord-Odal
  "3415": { rate: 46.4, year: 2024 }, // Sør-Odal
  "3416": { rate: 75.2, year: 2024 }, // Eidskog
  "3417": { rate: 45.9, year: 2024 }, // Grue
  "3418": { rate: 36.8, year: 2024 }, // Åsnes
  "3419": { rate: 38.2, year: 2024 }, // Våler (Innlandet)
  "3420": { rate: 68.8, year: 2024 }, // Elverum
  "3421": { rate: 74.9, year: 2024 }, // Trysil
  "3422": { rate: 51.1, year: 2024 }, // Åmot
  "3423": { rate: 58.9, year: 2024 }, // Stor-Elvdal
  "3424": { rate: 62.1, year: 2024 }, // Rendalen
  "3425": { rate: 36.7, year: 2024 }, // Engerdal
  "3426": { rate: 24.3, year: 2024 }, // Tolga
  "3427": { rate: 50.4, year: 2024 }, // Tynset
  "3428": { rate: 113.6, year: 2024 }, // Alvdal
  "3429": { rate: 24.2, year: 2024 }, // Folldal
  "3430": { rate: 19.0, year: 2024 }, // Os
  "3431": { rate: 61.9, year: 2024 }, // Dovre
  "3432": { rate: 79.7, year: 2024 }, // Lesja
  "3433": { rate: 38.8, year: 2024 }, // Skjåk
  "3434": { rate: 27.1, year: 2024 }, // Lom
  "3435": { rate: 22.7, year: 2024 }, // Vågå
  "3436": { rate: 33.3, year: 2024 }, // Nord-Fron
  "3437": { rate: 66.0, year: 2024 }, // Sel
  "3438": { rate: 26.0, year: 2024 }, // Sør-Fron
  "3439": { rate: 48.5, year: 2024 }, // Ringebu
  "3440": { rate: 67.5, year: 2024 }, // Øyer
  "3441": { rate: 22.7, year: 2024 }, // Gausdal
  "3442": { rate: 33.6, year: 2024 }, // Østre Toten
  "3443": { rate: 44.0, year: 2024 }, // Vestre Toten
  "3446": { rate: 50.0, year: 2024 }, // Gran
  "3447": { rate: 31.7, year: 2024 }, // Søndre Land
  "3448": { rate: 27.5, year: 2024 }, // Nordre Land
  "3449": { rate: 29.3, year: 2024 }, // Sør-Aurdal
  "3450": { rate: 32.2, year: 2024 }, // Etnedal
  "3451": { rate: 57.0, year: 2024 }, // Nord-Aurdal
  "3452": { rate: 39.3, year: 2024 }, // Vestre Slidre
  "3453": { rate: 47.0, year: 2024 }, // Øystre Slidre
  "3454": { rate: 29.8, year: 2024 }, // Vang
  "3901": { rate: 54.5, year: 2024 }, // Horten
  "3903": { rate: 48.1, year: 2024 }, // Holmestrand
  "3905": { rate: 68.0, year: 2024 }, // Tønsberg
  "3907": { rate: 58.3, year: 2024 }, // Sandefjord
  "3909": { rate: 48.4, year: 2024 }, // Larvik
  "3911": { rate: 40.4, year: 2024 }, // Færder
  "4001": { rate: 68.5, year: 2024 }, // Porsgrunn
  "4003": { rate: 64.4, year: 2024 }, // Skien
  "4005": { rate: 52.8, year: 2024 }, // Notodden
  "4010": { rate: 25.2, year: 2024 }, // Siljan
  "4012": { rate: 54.9, year: 2024 }, // Bamble
  "4014": { rate: 84.8, year: 2024 }, // Kragerø
  "4016": { rate: 36.7, year: 2024 }, // Drangedal
  "4018": { rate: 44.5, year: 2024 }, // Nome
  "4020": { rate: 42.2, year: 2024 }, // Midt-Telemark
  "4022": { rate: 47.3, year: 2024 }, // Seljord
  "4024": { rate: 43.6, year: 2024 }, // Hjartdal
  "4026": { rate: 31.3, year: 2024 }, // Tinn
  "4028": { rate: 46.0, year: 2024 }, // Kviteseid
  "4030": { rate: 43.5, year: 2024 }, // Nissedal
  "4032": { rate: 35.0, year: 2024 }, // Fyresdal
  "4034": { rate: 33.0, year: 2024 }, // Tokke
  "4036": { rate: 49.1, year: 2024 }, // Vinje
  "4201": { rate: 41.3, year: 2024 }, // Risør
  "4202": { rate: 46.5, year: 2024 }, // Grimstad
  "4203": { rate: 63.3, year: 2024 }, // Arendal
  "4204": { rate: 81.4, year: 2024 }, // Kristiansand
  "4205": { rate: 56.4, year: 2024 }, // Lindesnes
  "4206": { rate: 47.5, year: 2024 }, // Farsund
  "4207": { rate: 34.3, year: 2024 }, // Flekkefjord
  "4211": { rate: 37.6, year: 2024 }, // Gjerstad
  "4212": { rate: 32.2, year: 2024 }, // Vegårshei
  "4213": { rate: 54.1, year: 2024 }, // Tvedestrand
  "4214": { rate: 44.1, year: 2024 }, // Froland
  "4215": { rate: 47.9, year: 2024 }, // Lillesand
  "4216": { rate: 31.2, year: 2024 }, // Birkenes
  "4217": { rate: 40.5, year: 2024 }, // Åmli
  "4218": { rate: 30.4, year: 2024 }, // Iveland
  "4219": { rate: 48.7, year: 2024 }, // Evje og Hornnes
  "4220": { rate: 47.5, year: 2024 }, // Bygland
  "4221": { rate: 50.6, year: 2024 }, // Valle
  "4222": { rate: 80.1, year: 2024 }, // Bykle
  "4223": { rate: 52.8, year: 2024 }, // Vennesla
  "4224": { rate: 29.3, year: 2024 }, // Åseral
  "4225": { rate: 49.2, year: 2024 }, // Lyngdal
  "4226": { rate: 28.2, year: 2024 }, // Hægebostad
  "4227": { rate: 37.6, year: 2024 }, // Kvinesdal
  "4228": { rate: 53.9, year: 2024 }, // Sirdal
  "4601": { rate: 63.6, year: 2024 }, // Bergen
  "4602": { rate: 35.2, year: 2024 }, // Kinn
  "4611": { rate: 34.6, year: 2024 }, // Etne
  "4612": { rate: 32.6, year: 2024 }, // Sveio
  "4613": { rate: 24.9, year: 2024 }, // Bømlo
  "4614": { rate: 43.1, year: 2024 }, // Stord
  "4615": { rate: 28.4, year: 2024 }, // Fitjar
  "4616": { rate: 33.9, year: 2024 }, // Tysnes
  "4617": { rate: 27.0, year: 2024 }, // Kvinnherad
  "4618": { rate: 45.7, year: 2024 }, // Ullensvang
  "4619": { rate: 55.8, year: 2024 }, // Eidfjord
  "4620": { rate: 36.7, year: 2024 }, // Ulvik
  "4621": { rate: 39.2, year: 2024 }, // Voss
  "4622": { rate: 24.1, year: 2024 }, // Kvam
  "4623": { rate: 28.4, year: 2024 }, // Samnanger
  "4624": { rate: 32.3, year: 2024 }, // Bjørnafjorden
  "4625": { rate: 34.0, year: 2024 }, // Austevoll
  "4626": { rate: 39.6, year: 2024 }, // Øygarden
  "4627": { rate: 32.2, year: 2024 }, // Askøy
  "4628": { rate: 34.8, year: 2024 }, // Vaksdal
  "4630": { rate: 21.2, year: 2024 }, // Osterøy
  "4631": { rate: 33.2, year: 2024 }, // Alver
  "4632": { rate: 37.1, year: 2024 }, // Austrheim
  "4633": { rate: 30.8, year: 2024 }, // Fedje
  "4634": { rate: 25.4, year: 2024 }, // Masfjorden
  "4635": { rate: 17.0, year: 2024 }, // Gulen
  "4636": { rate: 16.0, year: 2024 }, // Solund
  "4637": { rate: 26.0, year: 2024 }, // Hyllestad
  "4638": { rate: 31.7, year: 2024 }, // Høyanger
  "4639": { rate: 26.3, year: 2024 }, // Vik
  "4640": { rate: 40.7, year: 2024 }, // Sogndal
  "4641": { rate: 33.9, year: 2024 }, // Aurland
  "4642": { rate: 69.0, year: 2024 }, // Lærdal
  "4643": { rate: 17.6, year: 2024 }, // Årdal
  "4644": { rate: 22.2, year: 2024 }, // Luster
  "4645": { rate: 22.4, year: 2024 }, // Askvoll
  "4646": { rate: 18.5, year: 2024 }, // Fjaler
  "4647": { rate: 38.5, year: 2024 }, // Sunnfjord
  "4648": { rate: 29.8, year: 2024 }, // Bremanger
  "4649": { rate: 26.7, year: 2024 }, // Stad
  "4650": { rate: 23.5, year: 2024 }, // Gloppen
  "4651": { rate: 29.7, year: 2024 }, // Stryn
  "5001": { rate: 66.7, year: 2024 }, // Trondheim - Tråante
  "5006": { rate: 54.7, year: 2024 }, // Steinkjer - Stïentje
  "5007": { rate: 44.2, year: 2024 }, // Namsos - Nåavmesjenjaelmie
  "5014": { rate: 43.8, year: 2024 }, // Frøya
  "5020": { rate: 15.6, year: 2024 }, // Osen
  "5021": { rate: 41.1, year: 2024 }, // Oppdal
  "5022": { rate: 57.2, year: 2024 }, // Rennebu
  "5025": { rate: 32.2, year: 2024 }, // Røros - Rosse
  "5026": { rate: 19.7, year: 2024 }, // Holtålen
  "5027": { rate: 44.0, year: 2024 }, // Midtre Gauldal
  "5028": { rate: 31.1, year: 2024 }, // Melhus
  "5029": { rate: 36.7, year: 2024 }, // Skaun
  "5031": { rate: 29.8, year: 2024 }, // Malvik
  "5032": { rate: 28.5, year: 2024 }, // Selbu
  "5033": { rate: 33.6, year: 2024 }, // Tydal
  "5034": { rate: 41.2, year: 2024 }, // Meråker
  "5035": { rate: 67.4, year: 2024 }, // Stjørdal
  "5036": { rate: 79.0, year: 2024 }, // Frosta
  "5037": { rate: 40.3, year: 2024 }, // Levanger - Levangke
  "5038": { rate: 47.4, year: 2024 }, // Verdal
  "5041": { rate: 26.5, year: 2024 }, // Snåase - Snåsa
  "5042": { rate: 28.4, year: 2024 }, // Lierne
  "5043": { rate: 42.6, year: 2024 }, // Raarvihke - Røyrvik
  "5044": { rate: 43.2, year: 2024 }, // Namsskogan
  "5045": { rate: 58.1, year: 2024 }, // Grong
  "5046": { rate: 30.3, year: 2024 }, // Høylandet
  "5047": { rate: 27.5, year: 2024 }, // Overhalla
  "5049": { rate: 26.0, year: 2024 }, // Flatanger
  "5052": { rate: 24.8, year: 2024 }, // Leka
  "5053": { rate: 26.4, year: 2024 }, // Inderøy
  "5054": { rate: 37.3, year: 2024 }, // Indre Fosen
  "5055": { rate: 31.5, year: 2024 }, // Heim
  "5056": { rate: 56.0, year: 2024 }, // Hitra
  "5057": { rate: 39.2, year: 2024 }, // Ørland
  "5058": { rate: 30.4, year: 2024 }, // Åfjord
  "5059": { rate: 54.1, year: 2024 }, // Orkland
  "5060": { rate: 40.5, year: 2024 }, // Nærøysund
  "5061": { rate: 14.8, year: 2024 }, // Rindal
  "5501": { rate: 57.3, year: 2024 }, // Tromsø
  "5503": { rate: 51.4, year: 2024 }, // Harstad - Hárstták
  "5510": { rate: 40.8, year: 2024 }, // Kvæfjord
  "5512": { rate: 37.6, year: 2024 }, // Dielddanuorri - Tjeldsund
  "5514": { rate: 32.0, year: 2024 }, // Ibestad
  "5516": { rate: 47.7, year: 2024 }, // Gratangen - Rivtták
  "5518": { rate: 39.6, year: 2024 }, // Loabák - Lavangen
  "5520": { rate: 49.7, year: 2024 }, // Bardu
  "5522": { rate: 35.3, year: 2024 }, // Salangen
  "5524": { rate: 59.1, year: 2024 }, // Målselv
  "5526": { rate: 23.5, year: 2024 }, // Sørreisa
  "5528": { rate: 32.6, year: 2024 }, // Dyrøy
  "5530": { rate: 47.2, year: 2024 }, // Senja
  "5532": { rate: 66.1, year: 2024 }, // Balsfjord
  "5534": { rate: 38.9, year: 2024 }, // Karlsøy
  "5536": { rate: 36.1, year: 2024 }, // Lyngen - Ivgu - Yykeä
  "5538": { rate: 105.8, year: 2024 }, // Storfjord - Omasvuotna - Omasvuono
  "5540": { rate: 48.1, year: 2024 }, // Gáivuotna - Kåfjord - Kaivuono
  "5542": { rate: 28.6, year: 2024 }, // Skjervøy
  "5544": { rate: 49.0, year: 2024 }, // Nordreisa - Ráisa - Raisi
  "5546": { rate: 47.5, year: 2024 }, // Kvænangen
  "5601": { rate: 73.4, year: 2024 }, // Alta
  "5603": { rate: 67.6, year: 2024 }, // Hammerfest - Hámmerfeasta
  "5605": { rate: 59.3, year: 2024 }, // Sør-Varanger
  "5607": { rate: 49.3, year: 2024 }, // Vadsø
  "5610": { rate: 45.2, year: 2024 }, // Kárásjohka - Karasjok
  "5612": { rate: 74.1, year: 2024 }, // Guovdageaidnu - Kautokeino
  "5614": { rate: 26.6, year: 2024 }, // Loppa
  "5616": { rate: 39.8, year: 2024 }, // Hasvik
  "5618": { rate: 44.0, year: 2024 }, // Måsøy
  "5620": { rate: 47.4, year: 2024 }, // Nordkapp
  "5622": { rate: 69.2, year: 2024 }, // Porsanger - Porsángu - Porsanki
  "5624": { rate: 65.0, year: 2024 }, // Lebesby
  "5626": { rate: 49.5, year: 2024 }, // Gamvik
  "5628": { rate: 58.4, year: 2024 }, // Deatnu - Tana
  "5630": { rate: 57.2, year: 2024 }, // Berlevåg
  "5632": { rate: 43.5, year: 2024 }, // Båtsfjord
  "5634": { rate: 48.7, year: 2024 }, // Vardø
  "5636": { rate: 72.2, year: 2024 }, // Unjárga - Nesseby
};

export const NATIONAL_CRIME_AVG = 58.6;

/** Large cities always read "over snitt" due to urban density — flagged as urban
    context so UI can soften the label. */
export const HIGH_URBAN_COMMUNES = new Set(["0301", "4601", "5001", "1103"]);
