import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { priceAlerts, users } from "@/lib/schema";
import { runPriceAlertCheck, type AlertRow } from "@/lib/alerts/check";
import { fetchKommunePriceIndex } from "@/lib/alerts/price-index";
import { sendPriceAlertEmail } from "@/lib/alerts/send-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await runPriceAlertCheck({
    loadActiveAlerts: async (): Promise<AlertRow[]> => {
      const rows = await db
        .select({
          id: priceAlerts.id,
          userId: priceAlerts.userId,
          kommunenummer: priceAlerts.kommunenummer,
          thresholdPct: priceAlerts.thresholdPct,
          lastKnownValue: priceAlerts.lastKnownValue,
          active: priceAlerts.active,
          email: users.email,
        })
        .from(priceAlerts)
        .innerJoin(users, eq(priceAlerts.userId, users.id));
      return rows.filter((r) => r.active !== false);
    },
    fetchPriceIndex: fetchKommunePriceIndex,
    sendEmail: sendPriceAlertEmail,
    updateAlertValue: async (id, value) => {
      await db
        .update(priceAlerts)
        .set({ lastKnownValue: value })
        .where(eq(priceAlerts.id, id));
    },
    markNotified: async (id, value, notifiedAt) => {
      await db
        .update(priceAlerts)
        .set({ lastKnownValue: value, lastNotifiedAt: notifiedAt })
        .where(eq(priceAlerts.id, id));
    },
  });

  console.log("[cron:check-price-alerts]", JSON.stringify(summary));
  return NextResponse.json(summary);
}
