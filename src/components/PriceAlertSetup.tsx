"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, BellRing, Check } from "lucide-react";
import { useToast } from "./Toast";

interface PriceAlertSetupProps {
  kommunenummer: string;
  postnummer?: string;
}

export default function PriceAlertSetup({ kommunenummer, postnummer }: PriceAlertSetupProps) {
  const { data: session } = useSession();
  const toast = useToast();
  const [created, setCreated] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!session?.user || !kommunenummer) return null;

  async function createAlert() {
    if (loading || created) return;
    setLoading(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kommunenummer, postnummer, thresholdPct: 5 }),
      });
      if (res.ok) {
        setCreated(true);
        toast.success("Prisvarsel aktivert");
      } else {
        toast.error("Kunne ikke opprette varsel — prøv igjen");
      }
    } catch {
      toast.error("Kunne ikke opprette varsel — prøv igjen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={createAlert}
      disabled={loading || created}
      className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
        created
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-card-border bg-card-bg text-text-secondary hover:border-accent/40 hover:text-foreground"
      } disabled:opacity-60`}
    >
      {created ? (
        <>
          <Check className="h-4 w-4" />
          <span className="text-xs font-medium">Prisvarsel aktivert</span>
        </>
      ) : (
        <>
          {loading ? (
            <BellRing className="h-4 w-4 animate-pulse" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          <span className="text-xs font-medium">
            {loading ? "Oppretter…" : "Varsle meg ved prisendring"}
          </span>
        </>
      )}
    </button>
  );
}
