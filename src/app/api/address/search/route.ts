import { NextRequest, NextResponse } from "next/server";

interface GeonorgeAddress {
  adressetekst: string;
  representasjonspunkt?: {
    lat: number;
    lon: number;
  };
  kommunenummer?: string;
  postnummer?: string;
  poststed?: string;
}

interface AddressResult {
  adressetekst: string;
  lat: number;
  lon: number;
  kommunenummer: string;
  postnummer: string;
  poststed: string;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(q)}&fuzzy=true&treffPerSide=5`
    );

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = await res.json();
    const adresser: GeonorgeAddress[] = data.adresser ?? [];

    const results: AddressResult[] = adresser.map((a) => ({
      adressetekst: a.adressetekst,
      lat: a.representasjonspunkt?.lat ?? 0,
      lon: a.representasjonspunkt?.lon ?? 0,
      kommunenummer: a.kommunenummer ?? "",
      postnummer: a.postnummer ?? "",
      poststed: a.poststed ?? "",
    }));

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
