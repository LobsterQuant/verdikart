import type { Metadata } from "next";
import Link from "next/link";
import AddressSearch from "@/components/AddressSearch";
import { Home } from "lucide-react";

export const metadata: Metadata = {
  title: { absolute: "Side ikke funnet: Verdikart" },
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center sm:px-6">
      {/* Big 404 */}
      <p className="mb-2 text-[80px] font-bold leading-none tabular-nums text-card-border sm:text-[120px]">
        404
      </p>

      <h1 className="mb-2 text-xl font-bold">Siden finnes ikke</h1>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-text-secondary">
        Lenken kan være utdatert eller adressen er stavet feil. Søk heller direkte på en norsk adresse nedenfor.
      </p>

      {/* Search */}
      <div className="w-full max-w-md">
        <AddressSearch />
      </div>

      {/* Quick links */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-lg border border-card-border bg-card-bg px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent/30 hover:text-foreground"
        >
          <Home className="h-3.5 w-3.5" strokeWidth={1.5} />
          Hjem
        </Link>
        <Link
          href="/blogg"
          className="flex items-center gap-1.5 rounded-lg border border-card-border bg-card-bg px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent/30 hover:text-foreground"
        >
          Blogg
        </Link>
        <Link
          href="/faq"
          className="flex items-center gap-1.5 rounded-lg border border-card-border bg-card-bg px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent/30 hover:text-foreground"
        >
          FAQ
        </Link>
      </div>
    </div>
  );
}
