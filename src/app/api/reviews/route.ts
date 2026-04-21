import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { neighborhoodReviews, users } from "@/lib/schema";
import { eq, desc, avg, count } from "drizzle-orm";
import { reviewsPostSchema, reviewsGetQuerySchema } from "@/lib/validators/reviews";
import { parseOrBadRequest } from "@/lib/validators/parse";
import { containsForbidden } from "@/lib/validators/profanity";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(
    Array.from(request.nextUrl.searchParams).filter(([, v]) => v !== ""),
  );
  const { data, error } = parseOrBadRequest(reviewsGetQuerySchema, params);
  if (error) return error;

  const { kommunenummer, postnummer } = data;

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
    postnummer: postnummer ?? "",
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json();
  const { data, error } = parseOrBadRequest(reviewsPostSchema, body);
  if (error) return error;

  const { kommunenummer, postnummer, rating, pros, cons, livedYears } = data;

  if (containsForbidden(`${pros ?? ""} ${cons ?? ""}`)) {
    return NextResponse.json({ error: "Innholdet inneholder upassende språk" }, { status: 400 });
  }

  const [review] = await db
    .insert(neighborhoodReviews)
    .values({
      userId: session.user.id,
      kommunenummer,
      postnummer: postnummer ?? null,
      rating,
      pros: pros ?? null,
      cons: cons ?? null,
      livedYears: livedYears ?? null,
    })
    .returning();

  return NextResponse.json({ review }, { status: 201 });
}
