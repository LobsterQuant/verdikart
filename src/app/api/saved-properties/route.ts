import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { savedProperties } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  savedPropertiesPostSchema,
  savedPropertiesPatchSchema,
  savedPropertiesDeleteSchema,
} from "@/lib/validators/saved-properties";
import { parseOrBadRequest } from "@/lib/validators/parse";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const items = await db
    .select()
    .from(savedProperties)
    .where(eq(savedProperties.userId, session.user.id))
    .orderBy(desc(savedProperties.savedAt))
    .limit(50);

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json();
  const { data, error } = parseOrBadRequest(savedPropertiesPostSchema, body);
  if (error) return error;

  const { slug, address, lat, lon, kommunenummer, postnummer } = data;

  // Upsert: insert or update if already saved
  const existing = await db
    .select()
    .from(savedProperties)
    .where(and(eq(savedProperties.userId, session.user.id), eq(savedProperties.slug, slug)))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ item: existing[0], created: false });
  }

  const [item] = await db
    .insert(savedProperties)
    .values({
      userId: session.user.id,
      slug,
      address,
      lat,
      lon,
      kommunenummer: kommunenummer ?? null,
      postnummer: postnummer ?? null,
    })
    .returning();

  return NextResponse.json({ item, created: true }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json();
  const { data, error } = parseOrBadRequest(savedPropertiesPatchSchema, body);
  if (error) return error;

  const [updated] = await db
    .update(savedProperties)
    .set({ notes: data.notes ?? null })
    .where(and(eq(savedProperties.userId, session.user.id), eq(savedProperties.slug, data.slug)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });
  }

  return NextResponse.json({ item: updated });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json();
  const { data, error } = parseOrBadRequest(savedPropertiesDeleteSchema, body);
  if (error) return error;

  await db
    .delete(savedProperties)
    .where(and(eq(savedProperties.userId, session.user.id), eq(savedProperties.slug, data.slug)));

  return NextResponse.json({ deleted: true });
}
