import { NextRequest, NextResponse } from 'next/server';
import { searchAdresse } from '@/lib/geonorge/search';
import { getGrunnbokData } from '@/lib/grunnbok/lookup';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const query = sp.get('q');
  const knr = sp.get('knr');
  const gnr = sp.get('gnr');
  const bnr = sp.get('bnr');

  if (knr && gnr && bnr) {
    const grunnbok = await getGrunnbokData({
      kommunenummer: knr,
      gardsnummer: Number(gnr),
      bruksnummer: Number(bnr),
      festenummer: Number(sp.get('fnr') ?? '0'),
      seksjonsnummer: Number(sp.get('snr') ?? '0'),
    });
    return NextResponse.json({
      mode: 'direct',
      grunnbok,
      error: grunnbok ? null : 'Grunnbok unavailable or no data',
    });
  }

  if (query) {
    const geoResults = await searchAdresse(query, 1);
    if (geoResults.length === 0) {
      return NextResponse.json(
        { error: 'No address found', query },
        { status: 404 }
      );
    }

    const geo = geoResults[0];
    const grunnbok = await getGrunnbokData({
      kommunenummer: geo.kommune.nummer,
      gardsnummer: geo.matrikkel.gardsnummer,
      bruksnummer: geo.matrikkel.bruksnummer,
      festenummer: geo.matrikkel.festenummer,
      seksjonsnummer: geo.matrikkel.seksjonsnummer,
    });

    return NextResponse.json({
      mode: 'address',
      geonorge: geo,
      grunnbok,
      error: grunnbok ? null : 'Grunnbok unavailable or no data',
    });
  }

  return NextResponse.json(
    { error: 'Missing parameters. Use ?q=address OR ?knr=X&gnr=Y&bnr=Z' },
    { status: 400 }
  );
}
