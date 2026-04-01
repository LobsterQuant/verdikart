import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { priceAlerts } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const alerts = await db
    .select()
    .from(priceAlerts)
    .where(eq(priceAlerts.userId, session.user.id));

  return NextResponse.json({ alerts });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json();
  const { kommunenummer, postnummer, thresholdPct } = body;

  if (!kommunenummer) {
    return NextResponse.json({ error: "Mangler kommunenummer" }, { status: 400 });
  }

  // Check for duplicate
  const existing = await db
    .select()
    .from(priceAlerts)
    .where(
      and(
        eq(priceAlerts.userId, session.user.id),
        eq(priceAlerts.kommunenummer, kommunenummer),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ alert: existing[0], created: false });
  }

  const [alert] = await db
    .insert(priceAlerts)
    .values({
      userId: session.user.id,
      kommunenummer,
      postnummer: postnummer ?? null,
      thresholdPct: thresholdPct ?? 5.0,
    })
    .returning();

  return NextResponse.json({ alert, created: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Mangler id" }, { status: 400 });
  }

  await db
    .delete(priceAlerts)
    .where(and(eq(priceAlerts.id, id), eq(priceAlerts.userId, session.user.id)));

  return NextResponse.json({ deleted: true });
}
