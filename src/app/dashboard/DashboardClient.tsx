"use client";

import { useState } from "react";
import {
  Heart,
  Bell,
  Trash2,
  ExternalLink,
  MapPin,
  StickyNote,
  Check,
  X,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useToast } from "@/components/Toast";
import { formatPct } from "@/lib/format";

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
  lastNotifiedAt: string | null;
  active: boolean | null;
  createdAt: string;
}

type Tab = "properties" | "alerts";

function signInWithDashboardCallback() {
  signIn("google", { callbackUrl: "/dashboard" });
}

export default function DashboardClient({
  initialProperties,
  initialAlerts,
  isDemo = false,
}: {
  initialProperties: SavedProperty[];
  initialAlerts: PriceAlert[];
  isDemo?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("properties");
  const [properties, setProperties] = useState(initialProperties);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const toast = useToast();

  async function removeProperty(slug: string) {
    if (isDemo) return signInWithDashboardCallback();
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
      toast.error("Kunne ikke fjerne: prøv igjen");
    }
  }

  function startEditNote(p: SavedProperty) {
    if (isDemo) return signInWithDashboardCallback();
    setEditingNote(p.slug);
    setNoteText(p.notes ?? "");
  }

  async function saveNote(slug: string) {
    if (isDemo) return signInWithDashboardCallback();
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
      toast.error("Kunne ikke lagre notat: prøv igjen");
    } finally {
      setEditingNote(null);
    }
  }

  async function removeAlert(id: string) {
    if (isDemo) return signInWithDashboardCallback();
    try {
      const res = await fetch("/api/alerts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("delete failed");
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      toast.success("Varsel slettet");
    } catch {
      toast.error("Kunne ikke slette: prøv igjen");
    }
  }

  return (
    <div>
      {isDemo && <DemoBanner />}

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-lg border border-card-border bg-card-bg p-1 w-fit">
        <button
          onClick={() => setTab("properties")}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "properties"
              ? "bg-accent text-accent-ink"
              : "text-text-secondary hover:text-foreground"
          }`}
        >
          <Heart className="h-3.5 w-3.5" />
          Lagrede ({properties.length})
        </button>
        <button
          onClick={() => setTab("alerts")}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "alerts"
              ? "bg-accent text-accent-ink"
              : "text-text-secondary hover:text-foreground"
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          Prisvarsler ({alerts.length})
        </button>
      </div>

      {tab === "properties" ? (
        <PropertiesTab
          properties={properties}
          editingNote={editingNote}
          noteText={noteText}
          setNoteText={setNoteText}
          setEditingNote={setEditingNote}
          startEditNote={startEditNote}
          saveNote={saveNote}
          removeProperty={removeProperty}
          isDemo={isDemo}
        />
      ) : (
        <AlertsTab alerts={alerts} onDelete={removeAlert} isDemo={isDemo} />
      )}
    </div>
  );
}

function DemoBanner() {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-accent/40 bg-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Dette er en demo
          </p>
          <p className="mt-0.5 text-sm text-text-secondary">
            Logg inn for å lagre dine egne adresser og få prisvarsler når markedet endrer seg.
          </p>
        </div>
      </div>
      <button
        onClick={signInWithDashboardCallback}
        className="btn-base btn-primary shrink-0 px-4 py-2 text-sm"
      >
        Logg inn med Google
      </button>
    </div>
  );
}

function DemoPill() {
  return (
    <span className="absolute right-3 top-3 z-10 rounded-full border border-card-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-tertiary">
      Demo
    </span>
  );
}

function PropertiesTab({
  properties,
  editingNote,
  noteText,
  setNoteText,
  setEditingNote,
  startEditNote,
  saveNote,
  removeProperty,
  isDemo,
}: {
  properties: SavedProperty[];
  editingNote: string | null;
  noteText: string;
  setNoteText: (s: string) => void;
  setEditingNote: (s: string | null) => void;
  startEditNote: (p: SavedProperty) => void;
  saveNote: (slug: string) => Promise<void>;
  removeProperty: (slug: string) => Promise<void>;
  isDemo: boolean;
}) {
  if (properties.length === 0) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-8 text-center">
        <MapPin className="mx-auto mb-3 h-10 w-10 text-text-tertiary" />
        <h3 className="mb-1 text-lg font-semibold">Ingen lagrede eiendommer</h3>
        <p className="mb-4 text-sm text-text-secondary">
          Søk etter en adresse og klikk &quot;Lagre&quot; for å legge den til her.
        </p>
        <Link href="/" className="btn-base btn-primary px-4 py-2 text-sm">
          Søk etter adresse
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((p) => {
        const cardBody = (
          <>
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
          </>
        );

        return (
          <div
            key={p.id}
            className="group relative rounded-xl border border-card-border bg-card-bg p-4 transition-colors hover:border-accent/30"
          >
            {isDemo && <DemoPill />}

            {isDemo ? (
              <button
                onClick={signInWithDashboardCallback}
                className="block w-full text-left"
              >
                {cardBody}
              </button>
            ) : (
              <Link
                href={`/eiendom/${p.slug}?adresse=${encodeURIComponent(p.address)}`}
                className="block"
              >
                {cardBody}
              </Link>
            )}

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
                    className="flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-ink"
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

            {!isDemo && (
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
            )}
          </div>
        );
      })}
    </div>
  );
}

function AlertsTab({
  alerts,
  onDelete,
  isDemo,
}: {
  alerts: PriceAlert[];
  onDelete: (id: string) => Promise<void>;
  isDemo: boolean;
}) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-8 text-center">
        <Bell className="mx-auto mb-3 h-10 w-10 text-text-tertiary" />
        <h3 className="mb-1 text-lg font-semibold">Ingen aktive prisvarsler</h3>
        <p className="mb-4 text-sm text-text-secondary">
          Aktiver varsler på en eiendomsside: vi sender e-post når prisene endrer seg.
        </p>
        <Link href="/" className="btn-base btn-primary px-4 py-2 text-sm">
          Finn en adresse
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 rounded-lg border border-card-border bg-card-bg/60 p-4 text-xs text-text-secondary">
        <p className="font-medium text-foreground">Hvordan prisvarsler fungerer</p>
        <p className="mt-1">
          Vi sjekker SSB&apos;s boligprisindeks for hver kommune hvert kvartal. Hvis gjennomsnittet
          beveger seg mer enn terskelen din (opp eller ned), sender vi deg en e-post. Ingen spam.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {alerts.map((a) => (
          <div
            key={a.id}
            className="group relative rounded-xl border border-card-border bg-card-bg p-4"
          >
            {isDemo && <DemoPill />}
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={1.5} />
                  <h3 className="truncate pr-16 text-sm font-semibold">
                    Kommune {a.kommunenummer}
                    {a.postnummer && ` · ${a.postnummer}`}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-text-tertiary">
                  Opprettet{" "}
                  {new Date(a.createdAt).toLocaleDateString("nb-NO", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              {!isDemo && (
                <button
                  onClick={() => onDelete(a.id)}
                  className="rounded-md p-1.5 text-text-tertiary opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                  aria-label="Slett varsel"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="mt-3 flex items-center gap-3 rounded-lg bg-background px-3 py-2">
              <TrendingUp className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-text-tertiary">Terskel</p>
                <p className="text-sm font-semibold">
                  ±{formatPct(a.thresholdPct ?? 5)} endring
                </p>
              </div>
              {a.lastNotifiedAt ? (
                <div className="text-right">
                  <p className="text-xs text-text-tertiary">Sist varslet</p>
                  <p className="text-sm font-medium">
                    {new Date(a.lastNotifiedAt).toLocaleDateString("nb-NO", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              ) : (
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                  Venter
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
