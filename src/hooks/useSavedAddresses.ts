"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import * as Sentry from "@sentry/nextjs";
import { useToast } from "@/components/Toast";

const SAVED_KEY = "verdikart_saved_v1";
const MAX_SAVED = 20;

export interface SavedAddress {
  slug: string;
  adressetekst: string;
  lat: number;
  lon: number;
  savedAt: string;
  kommunenummer?: string;
  postnummer?: string;
}

function localLoad(): SavedAddress[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function localPersist(entries: SavedAddress[]) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(entries));
  } catch {
    /* quota exceeded — silently ignore */
  }
}

function localClear() {
  try {
    localStorage.removeItem(SAVED_KEY);
  } catch {
    /* ignore */
  }
}

interface DbItem {
  slug: string;
  address: string;
  lat: number | string;
  lon: number | string;
  savedAt: string;
  kommunenummer: string | null;
  postnummer: string | null;
}

function fromDb(it: DbItem): SavedAddress {
  return {
    slug: it.slug,
    adressetekst: it.address,
    lat: Number(it.lat),
    lon: Number(it.lon),
    savedAt: it.savedAt,
    kommunenummer: it.kommunenummer ?? undefined,
    postnummer: it.postnummer ?? undefined,
  };
}

/**
 * Saved addresses hook — single source of truth.
 *
 * Logged in → database (`/api/saved-properties`). On first login we migrate
 * any localStorage entries up to the DB and clear local storage, so the two
 * stores never diverge.
 *
 * Logged out → localStorage only (capped at {@link MAX_SAVED} entries).
 */
export function useSavedAddresses() {
  const { data: session, status } = useSession();
  const loggedIn = !!session?.user;
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [ready, setReady] = useState(false);
  const migratedRef = useRef(false);

  useEffect(() => {
    if (status === "loading") return;
    let cancelled = false;

    async function load() {
      if (loggedIn) {
        // One-shot migration of local entries into DB. allSettled so one
        // failed POST does not cancel the rest; surface to Sentry per-entry
        // and toast once if a majority failed.
        if (!migratedRef.current) {
          migratedRef.current = true;
          const local = localLoad();
          if (local.length > 0) {
            const results = await Promise.allSettled(
              local.map(async (a) => {
                const res = await fetch("/api/saved-properties", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    slug: a.slug,
                    address: a.adressetekst,
                    lat: a.lat,
                    lon: a.lon,
                    kommunenummer: a.kommunenummer,
                    postnummer: a.postnummer,
                  }),
                });
                if (!res.ok) {
                  throw new Error(`migrate ${a.slug} → ${res.status}`);
                }
                return res;
              }),
            );
            const failures = results.filter((r) => r.status === "rejected");
            for (const f of failures) {
              Sentry.addBreadcrumb({
                category: "saved-addresses.migrate",
                level: "warning",
                message: (f as PromiseRejectedResult).reason?.message ?? "migrate failed",
              });
            }
            if (failures.length > 0) {
              Sentry.captureMessage("saved-addresses migrate partial failure", {
                level: failures.length === local.length ? "error" : "warning",
                tags: { failed: String(failures.length), total: String(local.length) },
              });
            }
            if (failures.length * 2 > local.length && !cancelled) {
              toastRef.current.error(
                "Kunne ikke flytte alle lagrede adresser til kontoen din. Prøv igjen senere.",
              );
            }
            localClear();
          }
        }

        try {
          const res = await fetch("/api/saved-properties");
          if (!res.ok) throw new Error("load failed");
          const data = await res.json();
          if (cancelled) return;
          setSaved((data.items ?? []).map(fromDb));
        } catch {
          if (!cancelled) setSaved([]);
        } finally {
          if (!cancelled) setReady(true);
        }
      } else {
        setSaved(localLoad());
        setReady(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [loggedIn, status]);

  const saveAddress = useCallback(
    async (address: Omit<SavedAddress, "savedAt">) => {
      const entry: SavedAddress = {
        ...address,
        savedAt: new Date().toISOString(),
      };
      setSaved((prev) => {
        const next = [entry, ...prev.filter((a) => a.slug !== entry.slug)].slice(
          0,
          MAX_SAVED,
        );
        if (!loggedIn) localPersist(next);
        return next;
      });

      if (loggedIn) {
        const res = await fetch("/api/saved-properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: address.slug,
            address: address.adressetekst,
            lat: address.lat,
            lon: address.lon,
            kommunenummer: address.kommunenummer,
            postnummer: address.postnummer,
          }),
        });
        if (!res.ok) throw new Error("save failed");
      }
    },
    [loggedIn],
  );

  const removeAddress = useCallback(
    async (slug: string) => {
      setSaved((prev) => {
        const next = prev.filter((a) => a.slug !== slug);
        if (!loggedIn) localPersist(next);
        return next;
      });

      if (loggedIn) {
        const res = await fetch("/api/saved-properties", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        if (!res.ok) throw new Error("delete failed");
      }
    },
    [loggedIn],
  );

  const isSaved = useCallback(
    (slug: string) => saved.some((a) => a.slug === slug),
    [saved],
  );

  return { saved, saveAddress, removeAddress, isSaved, ready };
}
