import { ExternalLink, Search } from "lucide-react";

interface FinnLinkProps {
  /** Norwegian postal number (4 digits) — used to scope Finn search */
  postnummer?: string;
  /** Full address string e.g. "Bygdøy allé 2, Oslo" — used for display */
  address?: string;
  /** Kommunenavn e.g. "Oslo" */
  kommunenavn?: string;
}

/**
 * Renders a card linking to pre-filtered Finn.no real estate listings
 * for the same area as the current address report.
 * Zero scraping — pure deep-link with Finn.no query params.
 */
export default function FinnLink({ postnummer, address, kommunenavn }: FinnLinkProps) {
  // Build Finn.no search URL. Finn supports location_id via postal code lookup,
  // but the simplest reliable deep-link is their keyword search by postal code.
  // Format: https://www.finn.no/realestate/homes/search.html?location=0.20003&property_type=...
  // Easiest reliable approach: search by postal code (Finn indexes on postnummer)
  const finnUrl = postnummer
    ? `https://www.finn.no/realestate/homes/search.html?postal_code=${postnummer}&sort=PUBLISHED_DESC`
    : kommunenavn
    ? `https://www.finn.no/realestate/homes/search.html?q=${encodeURIComponent(kommunenavn)}&sort=PUBLISHED_DESC`
    : "https://www.finn.no/realestate/homes/";

  const locationLabel = postnummer
    ? `postnummer ${postnummer}`
    : kommunenavn ?? "dette området";

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Search className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-base font-semibold">Boliger til salgs i området</h3>
      </div>

      <p className="mb-4 text-sm text-text-secondary leading-relaxed">
        Se aktive boligannonser i {locationLabel} direkte på Finn.no — oppdatert i sanntid.
      </p>

      <a
        href={finnUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20 hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span>Se boliger på Finn.no</span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      </a>

      {address && (
        <p className="mt-3 text-xs text-text-tertiary">
          Søket filtreres på område rundt{" "}
          <span className="font-medium text-text-secondary">{address}</span>.
          Verdikart er ikke tilknyttet Finn.no.
        </p>
      )}
    </div>
  );
}
