import { NextRequest, NextResponse } from "next/server";

// Redirect /api/price → /api/price-trend for forward compatibility
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams.toString();
  const knr = request.nextUrl.searchParams.get("kommunenummer") ?? request.nextUrl.searchParams.get("knr") ?? "";
  const redirectUrl = new URL(`/api/price-trend?knr=${knr}${params ? `&${params}` : ""}`, request.url);
  return NextResponse.redirect(redirectUrl, 307);
}
