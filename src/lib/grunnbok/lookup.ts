import { getGrunnbokClient, grunnbokConfigured } from './client';
import { grunnbokContext } from './context';
import { getCachedGrunnbok, setCachedGrunnbok } from './cache';
import type {
  GrunnbokData,
  GrunnbokHjemmelshaver,
  GrunnbokOverdragelse,
  GrunnbokHeftelse,
  GrunnbokLookupParams,
} from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BubbleObject = Record<string, any> & {
  attributes?: { 'xsi:type'?: string; 'i:type'?: string };
};

export async function getGrunnbokData(
  params: GrunnbokLookupParams
): Promise<GrunnbokData | null> {
  if (!grunnbokConfigured()) {
    return null;
  }

  const cached = await getCachedGrunnbok(params);
  if (cached) return cached;

  try {
    const matrikkelenhetId = await resolveMatrikkelenhetId(params);
    if (!matrikkelenhetId) return null;

    const [overdragelserTransfer, heftelserTransfer] = await Promise.all([
      callFindOverdragelser(matrikkelenhetId),
      callFindHeftelser(matrikkelenhetId),
    ]);

    const personIndex = indexPersonsByBubbleId([
      ...(overdragelserTransfer?.bubbleObjects ?? []),
      ...(heftelserTransfer?.bubbleObjects ?? []),
    ]);

    const overdragelser = extractOverdragelser(
      overdragelserTransfer?.bubbleObjects ?? [],
      personIndex
    );
    const heftelser = extractHeftelser(heftelserTransfer?.bubbleObjects ?? []);

    const sistOverdratt = overdragelser.find((o) => !o.historisk) ?? null;
    const hjemmelshaver = sistOverdratt?.erverver?.length
      ? sistOverdratt.erverver
      : null;

    const data: GrunnbokData = {
      kilde: 'grunnbok',
      hentet: new Date().toISOString(),
      matrikkelnummer: formatMatrikkelnummer(params),
      hjemmelshaver,
      skjermet: false,
      overdragelser,
      heftelser,
      sistOverdratt,
    };

    setCachedGrunnbok(params, data).catch((err) =>
      console.error('[grunnbok cache set failed]', err)
    );

    return data;
  } catch (error) {
    logSafe('[grunnbok lookup error]', error);
    return null;
  }
}

async function resolveMatrikkelenhetId(
  params: GrunnbokLookupParams
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any | null> {
  const client = await getGrunnbokClient('IdentService');
  if (!client) return null;

  const ident = {
    kommunenummer: params.kommunenummer,
    gaardsnummer: params.gardsnummer,
    bruksnummer: params.bruksnummer,
    festenummer: params.festenummer ?? 0,
    seksjonsnummer: params.seksjonsnummer ?? 0,
  };

  const result = await client.findMatrikkelenhetIdsForIdentsAsync({
    idents: { item: [ident] },
    grunnbokContext,
  });

  const entries = result[0]?.return?.entry ?? [];
  if (entries.length === 0) return null;

  const first = Array.isArray(entries) ? entries[0] : entries;
  return first?.value ?? null;
}

async function callFindOverdragelser(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerenhetId: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any | null> {
  const client = await getGrunnbokClient('InformasjonService');
  if (!client) return null;
  const result = await client.findOverdragelserAvRegisterenhetsrettAsync({
    registerenhetId,
    grunnbokContext,
  });
  return result[0]?.return ?? null;
}

async function callFindHeftelser(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerenhetId: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any | null> {
  const client = await getGrunnbokClient('InformasjonService');
  if (!client) return null;
  try {
    const result = await client.findHeftelserAsync({
      registerenhetId,
      grunnbokContext,
    });
    return result[0]?.return ?? null;
  } catch (error) {
    logSafe('[grunnbok heftelser fetch error]', error);
    return null;
  }
}

function indexPersonsByBubbleId(
  objects: BubbleObject[]
): Map<string, GrunnbokHjemmelshaver> {
  const map = new Map<string, GrunnbokHjemmelshaver>();
  for (const obj of objects) {
    const type = bubbleType(obj);
    const id = obj.id?.value;
    if (!id || !type) continue;
    if (type === 'JuridiskPerson') {
      const navn =
        obj.organisasjonsnavn1 ||
        obj.organisasjonsnavn2 ||
        obj.organisasjonsnavn3 ||
        obj.navn ||
        '';
      map.set(id, {
        type: 'organisasjon',
        navn: String(navn).trim(),
        orgnummer: typeof obj.identifikasjonsnummer === 'string'
          ? obj.identifikasjonsnummer
          : null,
      });
    } else if (type === 'FysiskPerson' || type === 'Person') {
      map.set(id, {
        type: 'person',
        navn: String(obj.navn ?? '').trim(),
      });
    }
  }
  return map;
}

function extractOverdragelser(
  objects: BubbleObject[],
  personIndex: Map<string, GrunnbokHjemmelshaver>
): GrunnbokOverdragelse[] {
  const out: GrunnbokOverdragelse[] = [];
  for (const obj of objects) {
    const type = bubbleType(obj);
    if (!type || !type.includes('OverdragelseAvRegisterenhetsrett')) continue;

    const omsetning = obj.omsetning ?? {};
    const vederlag = omsetning.vederlag ?? null;
    const beloepsverdi = vederlag?.beloepsverdi;

    const erververIds: string[] = collectErververIds(obj);
    const erverver = erververIds
      .map((id) => personIndex.get(id))
      .filter((p): p is GrunnbokHjemmelshaver => Boolean(p));

    out.push({
      rettsstiftelsesnummer:
        typeof obj.rettsstiftelsesnummer === 'number'
          ? obj.rettsstiftelsesnummer
          : null,
      historisk: Boolean(obj.historisk),
      vederlag:
        beloepsverdi != null
          ? {
              beloep: Number(beloepsverdi),
              valuta: vederlag?.valutakodeId?.value ?? null,
            }
          : null,
      dokumentavgift:
        omsetning?.dokumentavgift?.beloepsverdi != null
          ? Number(omsetning.dokumentavgift.beloepsverdi)
          : null,
      brukstype: firstOmsattBrukstype(omsetning),
      erverver,
    });
  }
  return out;
}

function extractHeftelser(objects: BubbleObject[]): GrunnbokHeftelse[] {
  const out: GrunnbokHeftelse[] = [];
  for (const obj of objects) {
    const type = bubbleType(obj);
    if (!type) continue;
    if (!/Heftelse|Pant|Servitutt|Urådighet/i.test(type)) continue;

    const beloep = obj.beloep?.beloepsverdi ?? obj.paalydende?.beloepsverdi;
    out.push({
      rettsstiftelsesnummer:
        typeof obj.rettsstiftelsesnummer === 'number'
          ? obj.rettsstiftelsesnummer
          : null,
      type,
      historisk: Boolean(obj.historisk),
      beloep: beloep != null ? Number(beloep) : null,
    });
  }
  return out;
}

function collectErververIds(overdragelseObj: BubbleObject): string[] {
  const ids: string[] = [];
  const candidates = [
    overdragelseObj.erververIds,
    overdragelseObj.nyeEiereIds,
    overdragelseObj.nyHjemmelshaverIds,
    overdragelseObj.personkoblingsendringIds,
  ];
  for (const list of candidates) {
    if (!list) continue;
    const items = Array.isArray(list.item)
      ? list.item
      : list.item
      ? [list.item]
      : [];
    for (const item of items) {
      const id = item?.value ?? item?.cachedValue?.value;
      if (typeof id === 'string') ids.push(id);
    }
  }
  return ids;
}

function firstOmsattBrukstype(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  omsetning: any
): string | null {
  const list = omsetning?.omsatteRegisterenhetsretter?.item;
  const items = Array.isArray(list) ? list : list ? [list] : [];
  for (const item of items) {
    const code = item?.brukstypeId?.value;
    if (typeof code === 'string') return code;
  }
  return null;
}

function bubbleType(obj: BubbleObject): string | null {
  const t = obj?.attributes?.['xsi:type'] ?? obj?.attributes?.['i:type'];
  if (typeof t !== 'string') return null;
  const parts = t.split(':');
  return parts[parts.length - 1];
}

function formatMatrikkelnummer(params: GrunnbokLookupParams): string {
  const fnr = params.festenummer ?? 0;
  const snr = params.seksjonsnummer ?? 0;
  if (fnr === 0 && snr === 0) {
    return `${params.kommunenummer}-${params.gardsnummer}/${params.bruksnummer}`;
  }
  return `${params.kommunenummer}-${params.gardsnummer}/${params.bruksnummer}/${fnr}/${snr}`;
}

function logSafe(prefix: string, error: unknown): void {
  if (error instanceof Error) {
    console.error(prefix, error.name, error.message);
  } else {
    console.error(prefix, 'non-Error thrown');
  }
}
