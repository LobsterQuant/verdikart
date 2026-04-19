import { kv } from '@vercel/kv';
import type { MatrikkelData } from './types';

const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function buildCacheKey(params: {
  kommunenummer: string;
  gardsnummer: number;
  bruksnummer: number;
  festenummer?: number;
}): string {
  const { kommunenummer, gardsnummer, bruksnummer, festenummer = 0 } = params;
  return `matrikkel:${kommunenummer}-${gardsnummer}-${bruksnummer}-${festenummer}`;
}

export async function getCachedMatrikkel(params: {
  kommunenummer: string;
  gardsnummer: number;
  bruksnummer: number;
  festenummer?: number;
}): Promise<MatrikkelData | null> {
  try {
    const key = buildCacheKey(params);
    const data = await kv.get<MatrikkelData>(key);
    return data ?? null;
  } catch (error) {
    console.error('[matrikkel cache read error]', error);
    return null;
  }
}

export async function setCachedMatrikkel(
  params: {
    kommunenummer: string;
    gardsnummer: number;
    bruksnummer: number;
    festenummer?: number;
  },
  data: MatrikkelData
): Promise<void> {
  try {
    const key = buildCacheKey(params);
    await kv.set(key, data, { ex: CACHE_TTL_SECONDS });
  } catch (error) {
    console.error('[matrikkel cache write error]', error);
  }
}
