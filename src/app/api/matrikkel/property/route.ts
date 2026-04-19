import { NextRequest, NextResponse } from 'next/server';
import { searchAdresse } from '@/lib/geonorge/search';
import { getMatrikkelData } from '@/lib/matrikkel/enrichment';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  const knr = request.nextUrl.searchParams.get('knr');
  const gnr = request.nextUrl.searchParams.get('gnr');
  const bnr = request.nextUrl.searchParams.get('bnr');

  if (knr && gnr && bnr) {
    try {
      const data = await getMatrikkelData({
        kommunenummer: knr,
        gardsnummer: Number(gnr),
        bruksnummer: Number(bnr),
        festenummer: Number(request.nextUrl.searchParams.get('fnr') ?? '0'),
      });
      return NextResponse.json({ mode: 'direct', data });
    } catch (error) {
      return NextResponse.json(
        { error: 'Matrikkel lookup failed', message: String(error) },
        { status: 500 }
      );
    }
  }

  if (query) {
    try {
      const geoResults = await searchAdresse(query, 1);
      if (geoResults.length === 0) {
        return NextResponse.json(
          { error: 'No address found', query },
          { status: 404 }
        );
      }

      const geo = geoResults[0];
      const matrikkelData = await getMatrikkelData({
        kommunenummer: geo.matrikkel.gardsnummer > 0 ? geo.kommune.nummer : '0000',
        gardsnummer: geo.matrikkel.gardsnummer,
        bruksnummer: geo.matrikkel.bruksnummer,
        festenummer: geo.matrikkel.festenummer,
      });

      return NextResponse.json({
        mode: 'address',
        geonorge: geo,
        matrikkel: matrikkelData,
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Property lookup failed', message: String(error) },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: 'Missing parameters. Use ?q=address OR ?knr=X&gnr=Y&bnr=Z' },
    { status: 400 }
  );
}
