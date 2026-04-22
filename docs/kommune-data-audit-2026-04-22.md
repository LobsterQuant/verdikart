# Kommune Data Audit — 22 April 2026

Scope: 8 hand-curated data files that key on kommunenumre, audited against the
2024 kommune reform (Viken → Østfold 31 / Akershus 32 / Buskerud 33; Vestfold og
Telemark → Vestfold 39 / Telemark 40; Troms og Finnmark → Troms 55 / Finnmark 56).

The canonical rebuilt reference is `src/data/crime.ts` (PR #66, SSB table 08487,
355 kommuner, 2023–2024 average).

## Summary

| File | Entries | Pre-reform codes | Phantom risk | API-fetchable? |
|---|---|---|---|---|
| `src/app/by/[city]/cityData.ts` | 16 cities | 3003, 3004, 3005, 3024, 3807, 5401 | **Low** — editorial, not a data feed | No single API (editorial content + prices + population) |
| `src/app/eiendom/[slug]/opengraph-image.tsx` | 10 | 3004, 3005 | **High** — `3020` is a phantom code | No — small lookup map, hand-maintained |
| `src/lib/economics/monthly-cost.ts` | 8 in STORBY set | 3004, 3005, 5401 | **Low** — deliberate config, round fee tiers | No — config constants |
| `src/data/energimerke.ts` | 19 | 3003, 3004, 3005, 3024, 3025, 3803, 3807, 5401 | **Medium** — explicitly "estimates", all triplets sum to exactly 100 | Partial — Enova Energimerkeregister (building-level, needs aggregation) |
| `src/data/kommune-population.ts` | 46 | 3003, 3004, 3005, 3024, 3025, 3801, 3802, 3803, 3804, 3805, 3807, 5401 | **Critical** — phantom `3226 "Drammen (ny)"`, mislabeled `3301 "Drammen (gml)"`, duplicated kommuner under both old+new codes, `5501` labeled Alta (but 5501 is post-reform Tromsø) | Yes — SSB table 07459 (header already cites it) |
| `src/data/environmentalRisk.ts` | 19 | 3003, 3004, 3005, 3024, 3025, 3803, 3807, 5401 | **Medium** — purely qualitative, no source cited, Høy/Moderat/Lav is subjective | Partial — NVE flomsonekart + DSA radon map are per-address, not kommune-aggregated |
| `src/data/eiendomsskatt.ts` | 19 | 3003, 3004, 3005, 3024, 3025, 3803, 3807, 5401 | **Low** — promille values plausible, but no source cited | Yes — SSB table 12842/12843 (Eiendomsskatt, satser), or KOSTRA |
| `src/data/demographics.ts` | 19 | 3003, 3004, 3005, 3024, 3025, 3803, 3807, 5401 | **Medium** — every medianIncome ends in `000` (rounded, not raw SSB), header cites tables but values look editorialized | Yes — SSB 07459 (age), 09817 (income), 05212 (education) |

**Pre-reform code legend**
- Viken era (2020–2023): `3003` Sarpsborg, `3004` Fredrikstad, `3005` Drammen, `3024` Bærum, `3025` Asker → now `3105`, `3107`, `3301`, `3201`, `3203`
- Vestfold og Telemark era (2020–2023): `3801` Horten, `3802` Holmestrand, `3803` Sandefjord, `3804` Larvik, `3805` Porsgrunn, `3807` Skien → now `3901`, `3903`, `3907`, `3909`, `4001`, `4003`
- Troms og Finnmark era (2020–2023): `5401` Tromsø, `5403` Alta, `5406` Hammerfest, `5503` Harstad → now `5501` (Tromsø in Troms-only), `5601` Alta, `5603` Hammerfest, `5503` Harstad (unchanged)

**Unchanged fylker** (codes remain valid): Oslo 03, Rogaland 11, Møre og Romsdal 15,
Nordland 18, Innlandet 34, Agder 42, Vestland 46, Trøndelag 50.

---

## Per-file findings

### 1. `src/app/by/[city]/cityData.ts`

**Purpose.** Editorial city-landing pages under `/by/[slug]` — meta tags, hero
text, FAQs, top neighbourhoods, avg sqm price, related cities. Not a data
feed; a SEO content file.

**Data structure.** `Record<slug, CityData>`. Keys: lowercase slug (`"oslo"`,
`"baerum"`). Values include `kommunenummer: string`, `name`, `county`,
`population: string` (pre-formatted with spaces), `avgSqmPrice: number`,
`avgSqmPriceYoY`, `medianPrice`, `avgCommute`, `topNeighbourhoods`, meta/intro/
market/transit/uniqueNote text, `relatedCities`, `faq: [{q, a}]`.

**Entry count.** 16 cities: oslo, bergen, trondheim, stavanger, baerum,
kristiansand, fredrikstad, sandnes, drammen, tromso, sarpsborg, skien, bodo,
arendal, hamar (and `stavanger` paired with `sandnes`).

**Source annotation.** None. No header comment. No SSB tables cited. Prices,
avgCommute, and population are unsourced editorial figures.

**Pre-reform codes used:**
- `3024` baerum (Bærum) — post-reform `3201`
- `3005` drammen (Drammen) — post-reform `3301`
- `3004` fredrikstad (Fredrikstad) — post-reform `3107`
- `3003` sarpsborg (Sarpsborg) — post-reform `3105`
- `3807` skien (Skien) — post-reform `4003`
- `5401` tromso (Tromsø) — post-reform `5501`

**Phantom risk signals.**
- County labels are *current* (Akershus, Buskerud, Østfold, Telemark, Troms),
  but kommunenumre are *pre-reform*. Mixed-era data.
- Populations are string-formatted ("127 000", "717 000") and rounded to the
  nearest 1,000 — diverge from `kommune-population.ts` (Bærum: `127 000` here
  vs `131572` there; Oslo: `717 000` here vs `717710` there).
- avgSqmPrice values (94_200, 62_400, 54_100, …) end in hundreds — Eiendom
  Norge / Krogsveen publish these in a similar form, so plausible.
- avgCommute values (18, 22, 20, 28, 19, …) are guesses, no source.

**Cross-check samples.** Names match kommuner correctly (Bærum, Drammen,
Fredrikstad, Sarpsborg, Skien, Tromsø), just with outdated numbers.

**Public API source.** No single API. This is editorial content. If rebuilt,
pieces can be sourced:
- population → SSB 07459
- avg sqm price → Eiendom Norge boligprisindeks (monthly CSV, per kommune)
- everything else (text, neighbourhoods, FAQ, commute, uniqueNote) → editorial

**Consumers (7):**
- `src/app/by/[city]/page.tsx` — city landing page
- `src/app/by/page.tsx` — by-index page
- `src/app/by/_cityOgImage.tsx` — city OG image renderer
- `src/app/eiendom/[slug]/opengraph-image.tsx` — per-property OG card (via `getCityData`)
- `src/app/sammenlign/page.tsx` — comparison page
- `src/app/sitemap.ts` — sitemap generation (via `allCitySlugs`)
- `src/lib/soft-404.test.ts` — test of slug matching

---

### 2. `src/app/eiendom/[slug]/opengraph-image.tsx`

**Purpose.** Per-property OG image (1200×630). Parses kommunenummer from slug
and looks up a display name + `getCityData` for a price pill.

**Data structure.** Inline `KNR_TO_CITY: Record<string, { slug, name }>`, 10
entries. Keys are 4-digit kommunenumre.

**Entry count.** 10 (subset of cityData).

**Source annotation.** Inline comment at line 26–28:
> "Known kommunenummer → { slug, displayName } so we can resolve the city
> label from the slug without an external fetch. Only kommuner covered by
> cityData appear here; others render without a city subtitle."

So: hand-maintained, deliberately partial.

**Pre-reform codes used:**
- `3005` Drammen — pre-reform
- `3004` Fredrikstad — pre-reform
- `3020` Bærum — **PHANTOM** (see below)

**Phantom risk signals. HIGH.**
- **`3020` for Bærum is not a valid kommunenummer at any point.** Bærum was
  `0219` pre-2020, `3024` under Viken (2020–2023), and `3201` since 2024.
  `3020` has never existed. This is a typo or fabricated entry. It also
  diverges from `cityData.ts` (which uses `3024`) — so the Bærum OG price
  pill never resolves correctly regardless of which era's codes are incoming.
- Other entries align with `cityData.ts` codes (i.e. also pre-reform for
  Drammen/Fredrikstad), so at least the file is internally consistent with
  cityData — except for `3020` vs `3024`.

**Cross-check samples.** 0301 Oslo ✓, 4601 Bergen ✓, 5001 Trondheim ✓,
1103 Stavanger ✓, 1108 Sandnes ✓, 4204 Kristiansand ✓, 1804 Bodø ✓.

**Public API source.** None applicable — this is a small lookup map. Should
simply be kept in sync with `cityData.ts` (derived, not curated).

**Consumers.** Not imported — this file *is* the Next.js OG image route for
`/eiendom/[slug]/opengraph-image`.

---

### 3. `src/lib/economics/monthly-cost.ts`

**Purpose.** Finanstilsynet stresstest + monthly-cost calculator for the
property report. Classifies a kommune into storby / mellomby / distrikt and
applies a tier-based municipal-fee estimate.

**Data structure.** `STORBY_KOMMUNER: ReadonlySet<string>` — 8 kommunenumre.
`MUNICIPAL_FEES_BY_CATEGORY: Record<category, number>` — 3 fee tiers (1800,
1500, 2200 NOK/mo).

**Entry count.** 8 kommuner in STORBY_KOMMUNER.

**Source annotation.** Line 4–7:
> "Finanstilsynet-stresstest rate per boliglånsforskriften § 5. Applied to
> every månedskostnad-display regardless of the market rate snapshot…"

No source for the fee tiers (1800/1500/2200).

**Pre-reform codes used:**
- `3005` Drammen — pre-reform
- `3004` Fredrikstad — pre-reform
- `5401` Tromsø — pre-reform

**Phantom risk signals. LOW.**
- Tier values (1800/1500/2200) are round estimates — no KOSTRA citation.
  Distrikt fee (2200) being higher than storby/mellomby is counter-intuitive
  but actually consistent with KOSTRA reality (small kommuner have higher
  per-capita water/sewage fees because of fixed costs). So this is plausible
  curation, not phantom data.
- The STORBY set is small and explicit — easy to update to post-reform codes.

**Cross-check samples.** 0301 Oslo ✓, 4601 Bergen ✓, 5001 Trondheim ✓,
1103 Stavanger ✓, 4204 Kristiansand ✓. Pre-reform entries are all real
kommuner, just on old codes.

**Public API source.** Fee tiers could be derived from SSB KOSTRA (communal
fees per kommune) but 3 hand-maintained tiers are reasonable. STORBY set is
fine as a hand-maintained set of 8.

**Consumers (4):**
- `src/components/ManedskostnadHero.tsx`
- `src/lib/propertyReportSummary.ts`
- `src/lib/finance/mortgage.ts` (STRESSTEST_RATE only)
- `src/lib/economics/monthly-cost.test.ts`

Also imports `getKommunePopulation` from `kommune-population.ts` — so this
file's category resolution inherits the phantom/duplication issues of that
file.

---

### 4. `src/data/energimerke.ts`

**Purpose.** Energy-label distribution (A–G) per kommune. Used by
`EnergimerkeCard` on property reports.

**Data structure.** `Record<kommunenummer, EnergimerkeData>` with
`dominantLabel`, `goodPct`, `moderatePct`, `poorPct`, `avgBuildYear`, optional
`note`.

**Entry count.** 19 kommuner.

**Source annotation.** Line 17–18:
> "Estimates based on SSB bygningsstatistikk and Enova energimerkeregister
> (2023/2024). Distribution reflects kommune building age profile, renovation
> rates, and new-build share."

**Explicitly "estimates"** — authored, not fetched.

**Pre-reform codes used:** 3003, 3004, 3005, 3024, 3025, 3803, 3807, 5401.

**Phantom risk signals. MEDIUM.**
- Every `goodPct + moderatePct + poorPct` sums to **exactly 100**. Real Enova
  aggregate percentages won't always round to that exactly — this is the
  signature of hand-curated numbers adjusted to sum to 100.
- No single Enova export was plausibly used; the values are estimate-shaped
  (Oslo E / Bergen F / Stavanger D / Sandnes C / Bærum D) which aligns with
  intuition about building age but isn't verifiable against a source.
- avgBuildYear values (1952, 1968, 1946, 1985, …) are guesses — SSB's
  bygningsstatistikk publishes a median build year per kommune, but these
  numbers don't cite it.
- No duplicates; values within-file are all distinct.

**Cross-check samples.**
- 1507 Ålesund ✓
- 3803 Sandefjord ✓ (pre-reform V&T, now 3907)
- 3807 Skien ✓ (pre-reform V&T, now 4003)
- 4203 Arendal ✓

**Public API source.** Enova's Energimerkeregister API is open
(data.enova.no). Building-level data could be aggregated to kommune
percentages. SSB bygningsstatistikk (tabell 05940) gives avgBuildYear per
kommune. Rebuild is feasible but non-trivial (building-level → kommune
aggregation).

**Consumers (1):**
- `src/components/EnergimerkeCard.tsx`

---

### 5. `src/data/kommune-population.ts`

**Purpose.** Kommune population lookup, used to bucket kommuner into storby /
mellomby / distrikt tiers in `monthly-cost.ts`.

**Data structure.** `Record<kommunenummer, { kommunenummer, name, population: number }>`.

**Entry count.** 46 entries.

**Source annotation.** Line 1–4:
> "SSB tabell 07459 — kommune population (approx 2024 figures). Used by
> economics/monthly-cost to tier municipal-fee estimates as storby / mellomby
> / distrikt. Only kommunes at or above ~20k pop are listed; everything else
> is treated as distrikt by the category function."

Cites SSB 07459 — **the citation is misleading** given the phantom entries
(see below).

**Pre-reform codes used:** 3003, 3004, 3005, 3024, 3025, 3801, 3802, 3803,
3804, 3805, 3807, 5401.

**Phantom risk signals. CRITICAL.**

1. **Phantom entry `3226: "Drammen (ny)"` with population 103560.**
   - `3226` is actually **Aurskog-Høland** (confirmed against the canonical
     `src/data/crime.ts` line 133, which has `"3226": { rate: 34.1, year: 2024 }, // Aurskog-Høland`).
   - Drammen is never `3226`. This is an invented entry with a wrong label
     AND a duplicated population value.

2. **Mislabeled `3301: "Drammen (gml)"`.** `3301` is the *current*
   post-2024-reform code for Drammen. Label says "gml" (old) — the author
   had old/new inverted.

3. **Triplicate Drammen:** `3005`, `3301`, `3226` all have population `103560`.
   Drammen appears three times, including once under a phantom code.

4. **Duplicate Bærum:** `3024` (pre-reform) and `3201` (post-reform) both
   have population `131572`.

5. **Duplicate Asker:** `3025` (pre-reform) and `3203` (post-reform) both
   have population `97714`.

6. **Collision on `5501`:** file labels `5501` as "Alta" with pop 21606. But
   post-2024 reform, `5501` is **Tromsø** (not Alta — Alta is now `5601`).
   Under the old Troms og Finnmark codes, Alta was `5403`. `5501` was never
   Alta. This is a wrong code for Alta AND would collide with Tromsø if a
   modern Tromsø kommunenummer ever gets fed into this lookup.

7. **Suspicious pop value `3411 Ringsaker 35234`:** real Ringsaker 2024
   population is ~35,200 — so value plausible, but worth confirming against
   07459.

8. **`1871 Andøy: 4705`** — the comment says "Only kommunes at or above ~20k"
   but Andøy (pop ~4,700) and Vestvågøy (11,708) and several other <20k
   entries are listed. The stated filter is inaccurate.

**Cross-check samples.**
- `3024` Bærum 131572 ✓ matches SSB 2024
- `3301` Drammen 103560 — code is right, label "gml" is wrong
- `3226` Drammen 103560 — **phantom** (actual 3226 is Aurskog-Høland)
- `5501` Alta 21606 — **wrong code** (5501 is Tromsø; Alta is 5601)
- `5514` Harstad 24703 — 5514 is not Harstad. Real post-reform Harstad is
  `5503`. Pre-reform under T&F was also `5503`. `5514` was never Harstad.
  **Potentially phantom.**
- `5532` Hammerfest 11493 — 5532 is not Hammerfest. Real pre-reform T&F was
  `5406`, post-reform is `5603`. `5532` was never Hammerfest. **Phantom.**

**Public API source.** SSB PX-API table 07459 (Folkemengde) — returns every
kommune's population with the current kommunenummer. Rebuildable cleanly.

**Consumers (1):**
- `src/lib/economics/monthly-cost.ts` (via `getKommunePopulation`)

---

### 6. `src/data/environmentalRisk.ts`

**Purpose.** Radon + flood risk level per kommune (qualitative: Høy / Moderat
/ Lav / Ukjent), with optional prose notes. Used by `EnvironmentalRiskCard`.

**Data structure.** `Record<kommunenummer, { kommunenummer, radonRisk,
radonNote?, floodRisk, floodNote? }>`.

**Entry count.** 19.

**Source annotation.** **None.** No header comment, no API cited, no DSA
radon atlas reference, no NVE flomsonekart reference. The individual notes
mention NVE flomsonekart in-passing, but no sourcing metadata for the risk
assessments themselves.

**Pre-reform codes used:** 3003, 3004, 3005, 3024, 3025, 3803, 3807, 5401.

**Phantom risk signals. MEDIUM.**
- Purely qualitative — no numeric data to check, but also means there's
  nothing verifiable.
- Some risk assessments match intuitive geology (Østfold granitt → høy radon;
  Bergen → høy flood) but others are less justifiable without a source
  (Drammen flood "Høy" is defensible; Hamar flood "Høy" because of Mjøsa is
  less clearly substantiated — Mjøsa has a regulated water level).
- Notes read as human prose, not as output from a dataset.

**Cross-check samples.** All names implicit from kommunenummer — no `name`
field in this file, so no mismatch risk.

**Public API source.** Not cleanly available:
- Radon: DSA (Direktoratet for strålevern) has a radon risk atlas at
  1×1 km raster. Not kommune-aggregated via API.
- Flood: NVE flomsonekart WMS/REST is per-adresse/geometry, not a
  kommune-level aggregate.
- A kommune-level risk summary would still require expert judgment. Best
  path: keep hand-curated but add explicit source citations per note, and
  commit only kommuner with published NVE/DSA evidence.

**Consumers (1):**
- `src/components/EnvironmentalRiskCard.tsx`

---

### 7. `src/data/eiendomsskatt.ts`

**Purpose.** Property tax (eiendomsskatt) configuration per kommune — does
the kommune levy it, at what promille, with what bunnfradrag, and what
reduction factor. Used in the monthly-cost breakdown.

**Data structure.** `Record<kommunenummer, { kommunenummer, name, hasTax,
promille?, bunnfradrag?, reductionFactor?, note? }>`.

**Entry count.** 19.

**Source annotation.** **None.** No header comment, no SSB reference, no
kommune-budget citation. Only Oslo has full detail (1.7 promille, bunnfradrag
4.9 MNOK, reduction factor 0.7) — others are promille-only.

**Pre-reform codes used:** 3003, 3004, 3005, 3024, 3025, 3803, 3807, 5401.

**Phantom risk signals. LOW-MEDIUM.**
- Promille values are round (1.7, 2.0, 2.5, 2.8, 3.0, 3.3, 3.5) — but
  promille *is* typically set at round values by kommune budget, so this is
  consistent with real data.
- `hasTax: false` for Sandnes, Bærum, Asker, Sandefjord, Drammen is claimed
  — Drammen's note says "fjernet eiendomsskatt på bolig i 2024", which is
  verifiable and sounds correct. Bærum/Asker/Sandefjord have historically
  been non-collecting kommuner.
- Bergen note says "innførte eiendomsskatt fra 2024" — also verifiable.
- Oslo's detailed numbers (1.7 promille, 4.9 MNOK bunnfradrag, 70%
  reduction) should be checked against Oslo kommune's 2026 budget — these
  were correct around 2023–2024 but the threshold has been adjusted since.

**Cross-check samples.** Names match kommuner; no mismatches spotted.

**Public API source.** SSB tabell 12842 "Eiendomsskatt. Antall kommuner,
skattesatser og inntekter fra eiendomsskatt" and 12843 (promille per kommune)
give official data. KOSTRA also exposes it. Rebuildable — medium effort.

**Consumers (5):**
- `src/app/eiendom/[slug]/page.tsx`
- `src/components/EiendomsskattCard.tsx`
- `src/components/MonthlyCostCalculator.tsx`
- `src/components/cards/ManedskostnadKort.tsx`
- `src/lib/propertyReportSummary.ts`

---

### 8. `src/data/demographics.ts`

**Purpose.** Demographic indicators per kommune (median income, higher-ed %,
children/elderly %, 5-year growth). Used in property reports and the
/sammenlign page.

**Data structure.** `Record<kommunenummer, { kommunenummer, name,
medianIncome, higherEducationPct, childrenPct, elderlyPct,
populationGrowthPct, year }>`.

**Entry count.** 19.

**Source annotation.** Line 1–2:
> "SSB Befolkningsstatistikk 2024 — selected demographic indicators per
> kommune. Sources: SSB tabell 07459 (aldersfordeling), SSB tabell 09817
> (medianinntekt), SSB tabell 05212 (utdanning)"

Cites 3 SSB tables. **But values look editorialized** (see below).

**Pre-reform codes used:** 3003, 3004, 3005, 3024, 3025, 3803, 3807, 5401.

**Phantom risk signals. MEDIUM.**
- **Every `medianIncome` value ends in `000`.** SSB's actual median
  household-income values are to-the-krone (e.g., `672430`), not rounded
  thousands. Every value here is suspiciously rounded — these were not
  pulled from SSB 09817 as the header claims. At best they're rounded, at
  worst they're estimated.
- `higherEducationPct` values to one decimal place (52.4, 48.2, 51.1 …) —
  these are plausible for SSB 05212 format. Stavanger at 49.3% and Oslo at
  52.4% align with rough reality.
- `populationGrowthPct` values look reasonable (0.8–4.2% over 5 years).
  Tromsø at 4.2% and Skien at 0.8% match directional intuition.
- `year: 2023` on every entry — but header says "SSB Befolkningsstatistikk
  2024". Minor inconsistency.
- `childrenPct + elderlyPct` don't follow an obvious rule; values plausible
  for the named kommune.

**Cross-check samples.**
- Bærum (3024) medianIncome 842000, higherEdPct 62.8 — directionally
  correct (Bærum is Norway's wealthiest large kommune) but `842000`
  rounded suspicious.
- Skien (3807) medianIncome 536000, higherEdPct 33.8 — plausible.
- Oslo (0301) 672000 — real SSB 2023 household median gross income for
  Oslo was ~687k (varies by exact definition). Off by ~2%.

**Public API source.** All three cited SSB tables are available via PX-API.
Rebuildable cleanly — likely the highest-value rebuild after population,
because the tables are well-defined and values are exact integers.

**Consumers (3):**
- `src/app/sammenlign/page.tsx`
- `src/components/DemographicsCard.tsx`
- `src/lib/propertyReportSummary.ts`

---

## Recommendations

### Files with a clear SSB path (rebuild candidates, in priority order)

1. **`kommune-population.ts` — REBUILD FIRST.** The phantom `3226` entry,
   mislabeled `3301`, and dup-across-eras show this file is actively
   misleading. SSB 07459 gives every current kommunenummer's population in
   one call. Blast radius is limited (1 consumer: `monthly-cost.ts`) but
   that consumer shapes municipal-fee tiers for every property report.
2. **`demographics.ts`.** Header already cites 07459 / 09817 / 05212. Current
   values are rounded thousands that betray editorialization. Direct SSB
   fetch will yield exact integers and full 355-kommune coverage.
3. **`eiendomsskatt.ts`.** SSB 12842 / 12843 + kommune budgets. Requires
   some parsing (bunnfradrag and reduction factor are kommune-specific and
   not in the SSB table — need to enrich from KOSTRA or kommune PDFs for
   the top ~20 kommuner).
4. **`energimerke.ts`.** Enova has an open API; building-level → kommune
   aggregation is real work. Header is honest ("estimates") so lower
   priority.

### Files best left hand-curated with source annotation

1. **`environmentalRisk.ts`.** No clean kommune-aggregate API exists (NVE is
   per-adresse, DSA is raster). Add explicit source citations per note and
   drop kommuner where no published NVE/DSA evidence exists. Qualitative-but-
   defensible is better than numeric-and-phantom.
2. **`monthly-cost.ts` STORBY_KOMMUNER.** 8 curated kommuner is fine — just
   update to post-reform codes.
3. **`cityData.ts`.** Editorial content by design. Prices can be refreshed
   from Eiendom Norge monthly CSVs; population from SSB; rest stays
   editorial.
4. **`opengraph-image.tsx` KNR_TO_CITY.** 10 hand-maintained entries. Just
   fix `3020` → `3024` (or better, derive from cityData).

### Files with phantom entries to investigate immediately

- **`kommune-population.ts` line 67:** `"3226": "Drammen (ny)"` — phantom
  code, actual `3226` is Aurskog-Høland per SSB 08487.
- **`kommune-population.ts` line 53:** `"3301": "Drammen (gml)"` — mislabeled
  (3301 is the *current* Drammen code).
- **`kommune-population.ts` line 36:** `"5501": "Alta"` — wrong code (post-reform 5501 is Tromsø; Alta is 5601).
- **`kommune-population.ts` line 71:** `"5514": "Harstad"` — wrong code (real
  Harstad is 5503 in both pre- and post-reform).
- **`kommune-population.ts` line 70:** `"5532": "Hammerfest"` — wrong code (real Hammerfest was 5406 pre-reform, 5603 post-reform).
- **`opengraph-image.tsx` line 34:** `"3020": "Bærum"` — phantom, likely typo
  for `3024` or `3201`.

### Suggested sprint plan

**Sprint 1 (data integrity — unblock property reports):**
1. Rebuild `kommune-population.ts` from SSB 07459. Remove all phantom
   codes. One code per kommune, post-reform only. Ship with
   `scripts/test-ssb-population.ts` per the test-script convention.
2. Patch `opengraph-image.tsx`: fix `3020` → `3024` (migrate to post-reform
   `3201` once other files follow), or better, derive `KNR_TO_CITY` from
   `cityData.ts` so there's one source of truth.
3. Migrate `monthly-cost.ts` STORBY_KOMMUNER to post-reform codes (swap
   3004→3107, 3005→3301, 5401→5501).

**Sprint 2 (migrate kommune keys everywhere):**
4. Rebuild `demographics.ts` from SSB 07459 + 09817 + 05212. Post-reform
   codes only. Full 355-kommune coverage where tables allow.
5. Migrate `energimerke.ts`, `environmentalRisk.ts`, `eiendomsskatt.ts`,
   `cityData.ts` to post-reform codes. These are smaller than the demographics
   rebuild — at minimum, swap pre-reform codes to post-reform equivalents
   while keeping the current curated content.

**Sprint 3 (data sourcing — reduce editorial burden):**
6. Rebuild `eiendomsskatt.ts` from SSB 12842/12843.
7. Rebuild `energimerke.ts` from Enova API (building-level aggregation).
8. Add explicit source citations to `environmentalRisk.ts` entries; drop
   unsourced ones.

**Not in scope** (but worth noting): any `kommunenummer` lookup that feeds
from Kartverket-provided addresses will receive *current* post-reform codes.
Until Sprint 2 is done, every pre-reform key in these files is a guaranteed
cache-miss for affected kommuner.
