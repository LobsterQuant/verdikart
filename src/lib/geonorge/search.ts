import type { GeonorgeSokResponse, GeonorgeAdresse, AdresseResult } from './types';

const GEONORGE_BASE = 'https://ws.geonorge.no/adresser/v1';

export async function searchAdresse(
  query: string,
  maxResults = 5
): Promise<AdresseResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const url = new URL(`${GEONORGE_BASE}/sok`);
  url.searchParams.set('sok', query.trim());
  url.searchParams.set('treffPerSide', String(maxResults));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
    // Revalidate every hour — addresses don't change often
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(
      `Geonorge API returned ${response.status}: ${response.statusText}`
    );
  }

  const data = (await response.json()) as GeonorgeSokResponse;

  return data.adresser.map(mapToAdresseResult);
}

function mapToAdresseResult(a: GeonorgeAdresse): AdresseResult {
  // Format matrikkelnummer: "kommunenr-gnr/bnr" (short) or "kommunenr-gnr/bnr/fnr/snr" (full)
  // Seksjonsnummer is not in Geonorge response — left as 0
  const matrikkelnummer = formatMatrikkelnummer({
    kommune: a.kommunenummer,
    gnr: a.gardsnummer,
    bnr: a.bruksnummer,
    fnr: a.festenummer,
    snr: 0,
  });

  return {
    adresseTekst: a.adressetekst,
    kommune: {
      nummer: a.kommunenummer,
      navn: titleCase(a.kommunenavn),
    },
    matrikkelnummer,
    matrikkel: {
      gardsnummer: a.gardsnummer,
      bruksnummer: a.bruksnummer,
      festenummer: a.festenummer,
      seksjonsnummer: 0,
    },
    husnummer: a.nummer,
    bokstav: a.bokstav,
    postnummer: a.postnummer,
    poststed: titleCase(a.poststed),
    koordinater: {
      lat: a.representasjonspunkt.lat,
      lon: a.representasjonspunkt.lon,
    },
    objtype: a.objtype,
  };
}

function formatMatrikkelnummer(parts: {
  kommune: string;
  gnr: number;
  bnr: number;
  fnr: number;
  snr: number;
}): string {
  const { kommune, gnr, bnr, fnr, snr } = parts;
  // Short form when fnr=0 and snr=0 (most common)
  if (fnr === 0 && snr === 0) {
    return `${kommune}-${gnr}/${bnr}`;
  }
  // Full form
  return `${kommune}-${gnr}/${bnr}/${fnr}/${snr}`;
}

function titleCase(s: string): string {
  // "KARL JOHANS GATE" → "Karl Johans Gate"
  // "HALDEN" → "Halden"
  return s
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
