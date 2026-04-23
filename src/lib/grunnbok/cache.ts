import { kv } from '@vercel/kv';
import type { GrunnbokData } from './types';

const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;

function buildCacheKey(params: {
  kommunenummer: string;
  gardsnummer: number;
  bruksnummer: number;
  festenummer?: number;
  seksjonsnummer?: number;
}): string {
  const {
    kommunenummer,
    gardsnummer,
    bruksnummer,
    festenummer = 0,
    seksjonsnummer = 0,
  } = params;
  return `grunnbok:${kommunenummer}-${gardsnummer}-${bruksnummer}-${festenummer}-${seksjonsnummer}`;
}

export async function getCachedGrunnbok(params: {
  kommunenummer: string;
  gardsnummer: number;
  bruksnummer: number;
  festenummer?: number;
  seksjonsnummer?: number;
}): Promise<GrunnbokData | null> {
  try {
    const data = await kv.get<GrunnbokData>(buildCacheKey(params));
    return data ?? null;
  } catch (error) {
    console.error('[grunnbok cache read error]', error);
    return null;
  }
}

export async function setCachedGrunnbok(
  params: {
    kommunenummer: string;
    gardsnummer: number;
    bruksnummer: number;
    festenummer?: number;
    seksjonsnummer?: number;
  },
  data: GrunnbokData
): Promise<void> {
  try {
    await kv.set(buildCacheKey(params), data, { ex: CACHE_TTL_SECONDS });
  } catch (error) {
    console.error('[grunnbok cache write error]', error);
  }
}
