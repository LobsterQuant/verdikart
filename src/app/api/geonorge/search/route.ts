import { NextRequest, NextResponse } from 'next/server';
import { searchAdresse } from '@/lib/geonorge/search';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  const maxResults = Number(request.nextUrl.searchParams.get('max') ?? '5');

  if (!query) {
    return NextResponse.json(
      { error: 'Missing query parameter q' },
      { status: 400 }
    );
  }

  try {
    const results = await searchAdresse(query, maxResults);
    return NextResponse.json({
      query,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('[geonorge search error]', error);
    return NextResponse.json(
      {
        error: 'Geonorge search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
