import { NextResponse, type NextRequest } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";
import { isValidEiendomSlug } from "@/lib/eiendom-slug";

const MAX_REQUESTS_PER_MINUTE = 30;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /eiendom/<slug> accepts arbitrary address slugs but every real one suffixes
  // `--<lat>-<lon>-<knr>`. Without this edge check, invalid slugs hit page.tsx
  // and stream loading.tsx (HTTP 200) before notFound() fires — a soft-404 that
  // Google indexes against the root canonical. See audit C-NEW-2 (2026-04-20).
  if (pathname.startsWith("/eiendom/")) {
    const slug = pathname.slice("/eiendom/".length).split("/")[0] ?? "";
    if (slug && !isValidEiendomSlug(slug)) {
      return NextResponse.rewrite(new URL("/404", request.url), { status: 404 });
    }
    return NextResponse.next();
  }

  // Only rate-limit API routes (exclude NextAuth routes)
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/auth/")) {
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
  matcher: ["/api/:path*", "/eiendom/:slug*"],
};
