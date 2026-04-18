import { NextResponse, type NextRequest } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";

const MAX_REQUESTS_PER_MINUTE = 30;

export async function middleware(request: NextRequest) {
  // Only rate-limit API routes (exclude NextAuth routes)
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  if (request.nextUrl.pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (await isRateLimited(ip, MAX_REQUESTS_PER_MINUTE)) {
    return NextResponse.json(
      { error: "For mange forespørsler. Prøv igjen om litt." },
      {
        status: 429,
        headers: { "Retry-After": "60" },
      },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
