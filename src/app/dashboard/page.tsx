import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { savedProperties, priceAlerts } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import SiteFooter from "@/components/SiteFooter";
import DashboardClient from "./DashboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mine eiendommer: Verdikart",
  description: "Dine lagrede eiendommer og prisvarsler på Verdikart.",
  robots: { index: false },
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }

  const [properties, alerts] = await Promise.all([
    db
      .select()
      .from(savedProperties)
      .where(eq(savedProperties.userId, session.user.id))
      .orderBy(desc(savedProperties.savedAt))
      .limit(50),
    db
      .select()
      .from(priceAlerts)
      .where(eq(priceAlerts.userId, session.user.id))
      .orderBy(desc(priceAlerts.createdAt))
      .limit(50),
  ]);

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
        />
      </div>
      <SiteFooter />
    </div>
  );
}
