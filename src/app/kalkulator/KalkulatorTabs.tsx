"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Wallet, Home } from "lucide-react";
import AffordabilityCalculator from "@/components/AffordabilityCalculator";
import MonthlyCostCalculator from "@/components/MonthlyCostCalculator";

type Mode = "affordability" | "monthly";

export default function KalkulatorTabs() {
  const params = useSearchParams();
  // Deep-link: ?pris=X or ?knr=Y implies user came from a property page → monthly mode
  const deepLinksMonthly = params.get("pris") || params.get("knr");
  const [mode, setMode] = useState<Mode>(deepLinksMonthly ? "monthly" : "affordability");

  // Sync if deeplink changes
  useEffect(() => {
    if (params.get("pris") || params.get("knr")) setMode("monthly");
  }, [params]);

  return (
    <div>
      <div className="mb-6 flex w-full gap-1 rounded-lg border border-card-border bg-card-bg p-1">
        <button
          onClick={() => setMode("affordability")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === "affordability"
              ? "bg-accent text-accent-ink"
              : "text-text-secondary hover:text-foreground"
          }`}
        >
          <Wallet className="h-4 w-4" strokeWidth={1.5} />
          Kjøpekraft
        </button>
        <button
          onClick={() => setMode("monthly")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === "monthly"
              ? "bg-accent text-accent-ink"
              : "text-text-secondary hover:text-foreground"
          }`}
        >
          <Home className="h-4 w-4" strokeWidth={1.5} />
          Månedskostnad
        </button>
      </div>

      {mode === "affordability" ? <AffordabilityCalculator /> : <MonthlyCostCalculator />}
    </div>
  );
}
