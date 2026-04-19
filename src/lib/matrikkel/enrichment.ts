import { getMatrikkelClient, matrikkelContext } from './client';
import { getCachedMatrikkel, setCachedMatrikkel } from './cache';
import type {
  MatrikkelData,
  MatrikkelEnhet,
  MatrikkelBygning,
  MatrikkelBruksenhet,
  MatrikkelLookupParams,
} from './types';

export async function getMatrikkelData(
  params: MatrikkelLookupParams
): Promise<MatrikkelData | null> {
  const cached = await getCachedMatrikkel(params);
  if (cached) {
    return cached;
  }

  try {
    const enhet = await fetchMatrikkelEnhet(params);
    if (!enhet) return null;

    const data: MatrikkelData = {
      kilde: 'matrikkel',
      hentet: new Date().toISOString(),
      enhet,
    };

    setCachedMatrikkel(params, data).catch((err) =>
      console.error('[matrikkel cache set failed]', err)
    );

    return data;
  } catch (error) {
    console.error('[matrikkel enrichment error]', error);
    return null;
  }
}

async function fetchMatrikkelEnhet(
  params: MatrikkelLookupParams
): Promise<MatrikkelEnhet | null> {
  const adresseClient = await getMatrikkelClient('AdresseService');

  const searchResult = await adresseClient.findAdresseInfoObjekterAsync({
    model: {
      kommunenummer: params.kommunenummer,
      gardsnummer: String(params.gardsnummer),
      bruksnummer: String(params.bruksnummer),
      festenummer: params.festenummer ?? 0,
    },
    matrikkelContext,
  });

  const adresseInfoList = searchResult[0]?.return?.item ?? [];
  if (adresseInfoList.length === 0) {
    console.warn('[matrikkel] no adresse info found', params);
    return null;
  }

  const adresseInfo = adresseInfoList[0];
  const matrikkelenhetDTO = adresseInfo.matrikkelenhetDTO;

  if (!matrikkelenhetDTO) {
    console.warn('[matrikkel] no matrikkelenhetDTO', params);
    return null;
  }

  const matrikkelenhetId = matrikkelenhetDTO.matrikkelenhetId?.value;
  const gnr = matrikkelenhetDTO.matrikkelenhetIdent?.gardsnummer ?? params.gardsnummer;
  const bnr = matrikkelenhetDTO.matrikkelenhetIdent?.bruksnummer ?? params.bruksnummer;
  const fnr = matrikkelenhetDTO.matrikkelenhetIdent?.festenummer ?? 0;
  const snr = matrikkelenhetDTO.matrikkelenhetIdent?.seksjonsnummer ?? 0;
  const kommunenavn = matrikkelenhetDTO.kommunenavn ?? '';
  const kommunenr = matrikkelenhetDTO.kommunenr ?? params.kommunenummer;

  const bygninger = matrikkelenhetId
    ? await fetchBygninger(matrikkelenhetId)
    : [];

  const bruksenheter = extractBruksenheter(adresseInfo);

  const totalBruksareal = bygninger.reduce(
    (sum, b) => sum + (b.bruksareal ?? 0),
    0
  ) || null;

  const matrikkelnummer = formatMatrikkelnummer(kommunenr, gnr, bnr, fnr, snr);
  const erSeksjonert = snr > 0;

  return {
    matrikkelnummer,
    kommunenummer: kommunenr,
    kommunenavn: titleCase(kommunenavn),
    gardsnummer: gnr,
    bruksnummer: bnr,
    festenummer: fnr,
    seksjonsnummer: snr,
    matrikkelenhetstype: null,
    erSeksjonert,
    totalBruksareal,
    bygninger,
    bruksenheter,
  };
}

async function fetchBygninger(matrikkelenhetId: number): Promise<MatrikkelBygning[]> {
  try {
    const bygningClient = await getMatrikkelClient('BygningService');
    const storeClient = await getMatrikkelClient('StoreService');

    const byggResult = await bygningClient.findByggForMatrikkelenhetAsync({
      matrikkelenhetId: { value: matrikkelenhetId },
      matrikkelContext,
    });

    const byggIds = (byggResult[0]?.return?.item ?? []).map(
      (b: { value: number }) => b.value
    );

    if (byggIds.length === 0) return [];

    const byggData = await storeClient.getObjectsAsync({
      ids: { item: byggIds.map((id: number) => ({ value: id })) },
      matrikkelContext,
    });

    const byggList = byggData[0]?.return?.item ?? [];

    return byggList.map(mapBygningFromStore);
  } catch (error) {
    console.error('[matrikkel bygninger fetch error]', error);
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBygningFromStore(raw: any): MatrikkelBygning {
  return {
    bygningsnummer: raw.bygningsnummer ?? 0,
    byggeaar: raw.byggeaar ?? null,
    bruksareal: raw.bruksareal ?? null,
    bruksarealBolig: raw.bruksarealBolig ?? null,
    bygningstype: raw.bygningstypeKode?.kodebeskrivelse ?? null,
    bygningstypeKode: raw.bygningstypeKode?.value ?? null,
    bygningsstatus: raw.bygningsstatus ?? null,
    antallEtasjer: raw.antallEtasjer ?? null,
    antallBruksenheter: raw.antallBruksenheter ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractBruksenheter(adresseInfo: any): MatrikkelBruksenhet[] {
  const list = adresseInfo?.bruksenheter?.item ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return list.map((b: any) => ({
    bruksenhetsnummer: b.bruksenhetsnummer ?? '',
    etasje: b.etasjeKode?.value ?? null,
    etasjenummer: b.etasjenummer ?? null,
    bruksareal: b.bruksareal ?? null,
    bruksenhetstype: b.bruksenhetstypeKode?.kodebeskrivelse ?? null,
    antallRom: b.antallRom ?? null,
    antallBaderom: b.antallBaderom ?? null,
  }));
}

function formatMatrikkelnummer(
  knr: string,
  gnr: number,
  bnr: number,
  fnr: number,
  snr: number
): string {
  if (fnr === 0 && snr === 0) {
    return `${knr}-${gnr}/${bnr}`;
  }
  return `${knr}-${gnr}/${bnr}/${fnr}/${snr}`;
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/(\s|-)/)
    .map((w) => (w === ' ' || w === '-' ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join('');
}
