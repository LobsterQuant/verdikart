"use client";

import { useState } from "react";
import { Heart, Bell, Trash2, ExternalLink, MapPin, StickyNote, Check, X } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/Toast";

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

export default function DashboardClient({
  initialProperties,
}: {
  initialProperties: SavedProperty[];
}) {
  const [properties, setProperties] = useState(initialProperties);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const toast = useToast();

  async function removeProperty(slug: string) {
    try {
      const res = await fetch("/api/saved-properties", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) throw new Error("delete failed");
      setProperties((prev) => prev.filter((p) => p.slug !== slug));
      toast.success("Fjernet");
    } catch {
      toast.error("Kunne ikke fjerne — prøv igjen");
    }
  }

  function startEditNote(p: SavedProperty) {
    setEditingNote(p.slug);
    setNoteText(p.notes ?? "");
  }

  async function saveNote(slug: string) {
    try {
      const res = await fetch("/api/saved-properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, notes: noteText }),
      });
      if (!res.ok) throw new Error("patch failed");
      setProperties((prev) =>
        prev.map((p) => (p.slug === slug ? { ...p, notes: noteText || null } : p))
      );
      toast.success("Notat lagret");
    } catch {
      toast.error("Kunne ikke lagre notat — prøv igjen");
    } finally {
      setEditingNote(null);
    }
  }

  return (
    <div>
      {/* Saved properties */}
      <div className="mb-4 flex items-center gap-2">
        <Heart className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold">Lagrede eiendommer ({properties.length})</h2>
      </div>

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
                <h3 className="mb-1 truncate pr-16 text-sm font-semibold group-hover:text-accent">
                  {p.address}
                </h3>
                <p className="text-xs text-text-tertiary">
                  {p.postnummer && `${p.postnummer} · `}
                  Lagret{" "}
                  {new Date(p.savedAt).toLocaleDateString("nb-NO", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </Link>

              {/* Notes section */}
              {editingNote === p.slug ? (
                <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Skriv et notat om denne eiendommen…"
                    maxLength={1000}
                    rows={3}
                    className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-xs placeholder:text-text-tertiary focus:border-accent focus:outline-none"
                    autoFocus
                  />
                  <div className="mt-1.5 flex gap-1.5">
                    <button
                      onClick={() => saveNote(p.slug)}
                      className="flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white"
                    >
                      <Check className="h-3 w-3" /> Lagre
                    </button>
                    <button
                      onClick={() => setEditingNote(null)}
                      className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-text-secondary hover:text-foreground"
                    >
                      <X className="h-3 w-3" /> Avbryt
                    </button>
                  </div>
                </div>
              ) : p.notes ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    startEditNote(p);
                  }}
                  className="mt-2 w-full rounded-lg bg-background p-2 text-left text-xs text-text-secondary hover:text-foreground"
                >
                  {p.notes}
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    startEditNote(p);
                  }}
                  className="mt-2 flex items-center gap-1 text-xs text-text-tertiary hover:text-accent"
                >
                  <StickyNote className="h-3 w-3" />
                  Legg til notat
                </button>
              )}

              {/* Action buttons */}
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

      {/* Price alerts coming soon teaser */}
      <div className="mt-8 rounded-xl border border-dashed border-card-border bg-card-bg/50 p-6 text-center">
        <Bell className="mx-auto mb-3 h-8 w-8 text-text-tertiary" />
        <h3 className="mb-1 text-sm font-semibold">Prisvarsler kommer snart</h3>
        <p className="text-xs text-text-secondary">
          Vi jobber med å sende deg varsler når prisene endrer seg i ditt område. Følg med!
        </p>
      </div>
    </div>
  );
}
