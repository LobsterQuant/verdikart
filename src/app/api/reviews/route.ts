import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { neighborhoodReviews, users } from "@/lib/schema";
import { eq, desc, avg, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const postnummer = request.nextUrl.searchParams.get("postnummer") ?? "";
  const kommunenummer = request.nextUrl.searchParams.get("kommunenummer") ?? "";

  if (!kommunenummer) {
    return NextResponse.json({ reviews: [], avgRating: null, count: 0 });
  }

  // Get reviews with user names
  const reviews = await db
    .select({
      id: neighborhoodReviews.id,
      rating: neighborhoodReviews.rating,
      pros: neighborhoodReviews.pros,
      cons: neighborhoodReviews.cons,
      livedYears: neighborhoodReviews.livedYears,
      createdAt: neighborhoodReviews.createdAt,
      userName: users.name,
    })
    .from(neighborhoodReviews)
    .leftJoin(users, eq(neighborhoodReviews.userId, users.id))
    .where(eq(neighborhoodReviews.kommunenummer, kommunenummer))
    .orderBy(desc(neighborhoodReviews.createdAt))
    .limit(20);

  // Get aggregate stats
  const [stats] = await db
    .select({
      avgRating: avg(neighborhoodReviews.rating),
      totalCount: count(),
    })
    .from(neighborhoodReviews)
    .where(eq(neighborhoodReviews.kommunenummer, kommunenummer));

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      ...r,
      userName: r.userName ? r.userName.split(" ")[0] : "Anonym",
    })),
    avgRating: stats?.avgRating ? parseFloat(String(stats.avgRating)) : null,
    count: stats?.totalCount ?? 0,
    postnummer,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json();
  const { kommunenummer, postnummer, rating, pros, cons, livedYears } = body;

  if (!kommunenummer || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Ugyldig data" }, { status: 400 });
  }

  // Basic content filter
  const forbidden = ["fuck", "faen", "jævla", "hore", "dritt"];
  const allText = `${pros ?? ""} ${cons ?? ""}`.toLowerCase();
  if (forbidden.some((w) => allText.includes(w))) {
    return NextResponse.json({ error: "Innholdet inneholder upassende språk" }, { status: 400 });
  }

  const [review] = await db
    .insert(neighborhoodReviews)
    .values({
      userId: session.user.id,
      kommunenummer,
      postnummer: postnummer ?? null,
      rating,
      pros: pros?.slice(0, 500) ?? null,
      cons: cons?.slice(0, 500) ?? null,
      livedYears: livedYears ?? null,
    })
    .returning();

  return NextResponse.json({ review }, { status: 201 });
}
