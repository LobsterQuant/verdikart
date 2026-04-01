"use client";

import { useState } from "react";
import { Heart, Bell, Trash2, ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";

interface SavedProperty {
  id: string;
  slug: string;
  address: string;
  lat: number;
  lon: number;
  kommunenummer: string | null;
  postnummer: string | null;
  notes: string | null;
  savedAt: string;
}

interface PriceAlert {
  id: string;
  kommunenummer: string;
  postnummer: string | null;
  thresholdPct: number | null;
  active: boolean;
  createdAt: string;
}

export default function DashboardClient({
  initialProperties,
  initialAlerts,
}: {
  initialProperties: SavedProperty[];
  initialAlerts: PriceAlert[];
}) {
  const [properties, setProperties] = useState(initialProperties);
  const [alerts] = useState(initialAlerts);
  const [tab, setTab] = useState<"properties" | "alerts">("properties");

  async function removeProperty(slug: string) {
    try {
      await fetch("/api/saved-properties", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      setProperties((prev) => prev.filter((p) => p.slug !== slug));
    } catch {
      // Silent fail
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-card-border bg-card-bg p-1">
        <button
          onClick={() => setTab("properties")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "properties"
              ? "bg-accent text-white"
              : "text-text-secondary hover:text-foreground"
          }`}
        >
          <Heart className="h-4 w-4" />
          Eiendommer ({properties.length})
        </button>
        <button
          onClick={() => setTab("alerts")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "alerts"
              ? "bg-accent text-white"
              : "text-text-secondary hover:text-foreground"
          }`}
        >
          <Bell className="h-4 w-4" />
          Prisvarsler ({alerts.length})
        </button>
      </div>

      {/* Properties tab */}
      {tab === "properties" && (
        <div>
          {properties.length === 0 ? (
            <div className="rounded-xl border border-card-border bg-card-bg p-8 text-center">
              <MapPin className="mx-auto mb-3 h-10 w-10 text-text-tertiary" />
              <h3 className="mb-1 text-lg font-semibold">Ingen lagrede eiendommer</h3>
              <p className="mb-4 text-sm text-text-secondary">
                Søk etter en adresse og klikk &quot;Lagre&quot; for å legge den til her.
              </p>
              <Link
                href="/"
                className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Søk etter adresse
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => (
                <div
                  key={p.id}
                  className="group relative rounded-xl border border-card-border bg-card-bg p-4 transition-colors hover:border-accent/30"
                >
                  <Link
                    href={`/eiendom/${p.slug}?adresse=${encodeURIComponent(p.address)}`}
                    className="block"
                  >
                    <h3 className="mb-1 truncate text-sm font-semibold group-hover:text-accent">
                      {p.address}
                    </h3>
                    <p className="text-xs text-text-tertiary">
                      {p.postnummer && `${p.postnummer} · `}
                      Lagret {new Date(p.savedAt).toLocaleDateString("nb-NO", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    {p.notes && (
                      <p className="mt-2 line-clamp-2 text-xs text-text-secondary">
                        {p.notes}
                      </p>
                    )}
                  </Link>

                  <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link
                      href={`/eiendom/${p.slug}?adresse=${encodeURIComponent(p.address)}`}
                      className="rounded-md p-1.5 text-text-tertiary hover:bg-background hover:text-foreground"
                      title="Åpne rapport"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeProperty(p.slug);
                      }}
                      className="rounded-md p-1.5 text-text-tertiary hover:bg-red-500/10 hover:text-red-400"
                      title="Fjern"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Alerts tab */}
      {tab === "alerts" && (
        <div>
          {alerts.length === 0 ? (
            <div className="rounded-xl border border-card-border bg-card-bg p-8 text-center">
              <Bell className="mx-auto mb-3 h-10 w-10 text-text-tertiary" />
              <h3 className="mb-1 text-lg font-semibold">Ingen prisvarsler</h3>
              <p className="text-sm text-text-secondary">
                Opprett et prisvarsel fra en eiendomsrapport for å få beskjed når prisene endrer seg.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-card-border bg-card-bg p-4"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Kommune {a.kommunenummer}
                      {a.postnummer && ` · ${a.postnummer}`}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      Varsle ved {a.thresholdPct ?? 5}% endring
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      a.active
                        ? "bg-green-500/20 text-green-500"
                        : "bg-text-tertiary/20 text-text-tertiary"
                    }`}
                  >
                    {a.active ? "Aktiv" : "Pauset"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
