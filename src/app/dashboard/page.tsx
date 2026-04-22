import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { savedProperties, priceAlerts } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import DashboardClient from "./DashboardClient";
import { demoSavedProperties, demoPriceAlerts } from "@/lib/dashboard-demo-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mine eiendommer: Verdikart",
  description: "Dine lagrede eiendommer og prisvarsler på Verdikart.",
  robots: { index: false },
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [properties, alerts] = userId
    ? await Promise.all([
        db
          .select()
          .from(savedProperties)
          .where(eq(savedProperties.userId, userId))
          .orderBy(desc(savedProperties.savedAt))
          .limit(50),
        db
          .select()
          .from(priceAlerts)
          .where(eq(priceAlerts.userId, userId))
          .orderBy(desc(priceAlerts.createdAt))
          .limit(50),
      ])
    : [demoSavedProperties, demoPriceAlerts];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Mine eiendommer
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Dine lagrede adresser og prisvarsler
          </p>
        </header>

        <DashboardClient
          initialProperties={JSON.parse(JSON.stringify(properties))}
          initialAlerts={JSON.parse(JSON.stringify(alerts))}
          isDemo={!userId}
        />
      </div>
    </div>
  );
}
