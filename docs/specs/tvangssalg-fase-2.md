# Tvangssalg Fase 2 — Per-adresse historikk via Grunnbok

**Status:** Venter på Kartverket Grunnbok-API-tilgang
**Forutsetninger:** Grunnbok `PermissionDeniedException`-fri, dokumenttype `TVANGSSALG` testet
**Estimert scope:** 1-2 dager
**Opprettet:** 2026-04-20

## Mål

Når Kartverket Grunnbok-API er tilgjengelig, skal Verdikart vise tinglyste tvangssalg per adresse som del av eiendomsrapporten.

Dette blir Verdikarts unike differensiering: ingen annen norsk tjeneste viser tvangssalg-historikk for enkeltadresser i en helhetlig eiendomsrapport.

## Strategisk verdi

**For brukere:**
- «Har denne boligen vært tvangssolgt før?» - direkte svar
- «Hvor mange ganger?»
- «Hvor lang tid har det gått siden?»
- Risikoindikator for potensielle kjøpere

**For Verdikart:**
- Eneste norske produkt med per-adresse tvangssalg-historikk integrert
- Styrker kontekst-posisjoneringen («Finn viser prisen, Verdikart forklarer konteksten»)
- Naturlig oppfølger til hytte-tvangssalg-rapporten (`/rapport/hytte-tvangssalg-2026`)
- Nytt datapunkt som ingen konkurrenter har

## Precondition

Før denne pakken kan startes:

1. Kartverket har bekreftet berettiget interesse (bekreftet 2026-04-20)
2. Grunnbok-API returnerer `PermissionDeniedException`-fri responser
3. Dokumenttype `TVANGSSALG` er testet og returnerer faktiske treff
4. Rate limits og kostnader fra Kartverket er avklart

## Scope

To leveranser i én PR:

### A. Data-lag: Tvangssalg-lookup via Grunnbok
### B. UI-lag: TvangssalgHistorikkKort i eiendomsrapport

---

## A. Data-lag

### Filer

    src/lib/grunnbok/
    ├── tvangssalg-lookup.ts       # Ny: hent tvangssalg-dokumenter for gnr/bnr
    └── tvangssalg-types.ts        # Ny: TypeScript-typer for respons

    src/app/api/tvangssalg/
    └── [slug]/route.ts            # Ny: API endpoint for frontend

    tests/grunnbok/
    └── tvangssalg-lookup.test.ts  # Ny: enhetstester

### Grunnbok-integrasjon

Gjenbruk eksisterende `src/lib/grunnbok/client.ts`. Legg til funksjon:

    export async function getTvangssalgHistorikk(
      matrikkelnummer: { 
        kommunenummer: string; 
        gardsnummer: number; 
        bruksnummer: number 
      }
    ): Promise<TvangssalgHistorikk> {
      const documents = await grunnbokClient.getDocuments({
        matrikkelnummer,
        documentTypes: ['TVANGSSALG'], // Eksakt type TBD fra Kartverket
        includeHistorical: true,
      });
      
      return {
        matrikkelnummer,
        documents: documents.map(doc => ({
          tinglysingsdato: doc.tinglysingsdato,
          dokumentnummer: doc.dokumentnummer,
          belop: doc.belop,
          partsforhold: doc.partsforhold, // Fjernes ved personvern
        })),
        totalCount: documents.length,
        lastEvent: documents[0]?.tinglysingsdato ?? null,
      };
    }

### Personvern

KRITISK: Grunnbok returnerer navngitte parter. Verdikart skal aldri vise personnavn i frontend.

Filter i API-laget før respons:
- Fjern alle person-navn
- Fjern organisasjonsnumre
- Vis kun: dato, dokumentnummer (intern), beløp (hvis offentlig)

### Cache

Cache aggressivt - tvangssalg endres ikke ofte:
- Upstash Redis, key: `tvangssalg:{gnr}:{bnr}:{kommunenr}`
- TTL: 24 timer
- Invalidate når nye tvangssalg-tinglysninger detekteres (fremtidig arbeid)

### API endpoint

`GET /api/tvangssalg/[slug]`

Returns:

    {
      "hasHistory": true,
      "totalCount": 2,
      "events": [
        {
          "year": 2019,
          "quarter": "Q3",
          "type": "Gjennomført tvangssalg"
        },
        {
          "year": 2003,
          "quarter": "Q1",
          "type": "Gjennomført tvangssalg"
        }
      ],
      "lastUpdated": "2026-04-20T13:45:00Z"
    }

Eller for rene adresser:

    {
      "hasHistory": false,
      "totalCount": 0,
      "events": [],
      "lastUpdated": "2026-04-20T13:45:00Z"
    }

---

## B. UI-lag: TvangssalgHistorikkKort

### Ny komponent

`src/components/cards/TvangssalgHistorikkKort.tsx`

### Tre visnings-modus

**Modus 1: Ingen tvangssalg (vanligste)**

Vis et diskret positivt signal med «Ingen tinglyste tvangssalg» og kilde-notis.

**Modus 2: Tvangssalg finnes (sjeldent men viktig)**

Vis tydelig med tidslinje:
- Antall tvangssalg
- Liste med år og kvartal
- Lenke til `/ordbok/tvangssalg` for forklaring

**Modus 3: Data utilgjengelig**

Vis «Tvangssalg-data ikke tilgjengelig for denne eiendommen» når API feiler eller returnerer 404.

### Plassering på eiendomsrapport

I eksisterende kort-kaskade, etter Eiendomsskatt og før RapportKort (hytte-rapport-lenken).

Rasjonale: Tvangssalg-historikk hører hjemme i «historisk kontekst»-seksjonen.

### Mobile

Samme design som desktop, full bredde, kompakt padding.

---

## Forklarings-side: `/ordbok/tvangssalg`

Ny side under ordbok-seksjonen.

### Innhold

Fire seksjoner på norsk:
1. **Hva er tvangssalg?** - Definisjon, siste steg i prosess
2. **Hva betyr det for en eiendom med tvangssalg-historikk?** - Eiendom er ikke «skadet», nye eiere overtar uten heftelser
3. **Bør tvangssalg-historikk påvirke kjøpsbeslutningen?** - Vanligvis ikke direkte, men kontekst-verdig
4. **Hvordan oppdaterer Verdikart denne informasjonen?** - Kartverket grunnbok, automatisk, kun tinglyste

## SEO og JSON-LD

Ordbok-siden får `@type: DefinedTerm` JSON-LD med Verdikart-ordbok som `inDefinedTermSet`.

## Tester

**Enhetstester for `getTvangssalgHistorikk`:**
- Returnerer tom liste når ingen tvangssalg
- Parser dato-felt korrekt
- Filtrerer personvern-data
- Håndterer rate limit
- Cache-hit og cache-miss

**Integrasjonstester:**
- API endpoint returnerer korrekt struktur
- 404 når adresse ikke finnes
- 500 når Grunnbok er nede

---

## Rules - strict

1. Ingen personnavn i frontend-respons eller UI, noen gang
2. Ingen beløp i UI - kun datoer og antall
3. Kortet skal aldri blokkere eller forstyrre eiendomsrapport hvis API feiler - vis «ikke tilgjengelig»-modus
4. Cache aggressivt for å minimere Kartverket-trafikk
5. Lenke til `/ordbok/tvangssalg` må åpne i samme fane (intern lenke)
6. Modus 2-visning skal ikke skape panikk - ordlegg det nøytralt, ikke sensasjonelt

## Acceptance

1. `npm run build` clean
2. `npx tsc --noEmit` clean
3. `npm test` grønn (alle eksisterende + nye)
4. Karl Johans gate 1 eiendomsrapport: kortet vises med «Ingen tvangssalg»
5. En adresse med kjent tvangssalg-historikk: viser tidslinje
6. Grunnbok-API nede: kortet viser «ikke tilgjengelig»-modus
7. `/ordbok/tvangssalg`-siden rendres med prosa
8. Mobil 390px: kort fungerer uten overflow
9. Cache-hit målbar i Upstash-dashbord
10. Ingen personnavn i API-respons noensinne

## Report back

1. Grunnbok-API-kall nødvendig (antall per eiendom)
2. Gjennomsnittlig response-tid
3. Cache hit-rate etter 24 timer
4. Screenshots av 3 modus
5. PR URL

---

## Relaterte filer (når pakken skal implementeres)

Eksisterende filer som vil bli utvidet:
- `src/lib/grunnbok/client.ts` - legg til tvangssalg-funksjon
- `src/lib/grunnbok/types.ts` - legg til dokumenttype
- `src/app/eiendom/[slug]/page.tsx` - integrer nytt kort

Eksisterende filer som vil bli gjenbrukt:
- `src/lib/matrikkel/client.ts` - gnr/bnr fra adresse
- Upstash Redis-instans - cache

## Oppdateringslogg

- **2026-04-20:** Spec opprettet etter tvangssalg Fase 1 (hytte-rapport) ble publisert. Venter på Martinsens Kartverket Jira-sak.
