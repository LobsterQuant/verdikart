import { NextResponse } from "next/server";
import { EMPTY_MATRIKKEL } from "@/lib/types/matrikkel";

/**
 * Matrikkel / Grunnbok stub.
 *
 * Real Grunnbok integration is on hold due to privacy regulations around
 * ownership and encumbrance data. Matrikkel (building year, area, floors)
 * requires a separate Kartverket API we don't yet have access to.
 *
 * This endpoint intentionally returns EMPTY_MATRIKKEL so the frontend
 * contract stays stable for the day one of those unblocks.
 */
export async function GET() {
  return NextResponse.json(EMPTY_MATRIKKEL);
}
