import { useState, useEffect, useCallback } from "react";

const SAVED_KEY = "verdikart_saved_v1";
const MAX_SAVED = 20;

export interface SavedAddress {
  slug: string;
  adressetekst: string;
  lat: number;
  lon: number;
  savedAt: string;
}

function load(): SavedAddress[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function persist(entries: SavedAddress[]) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(entries));
  } catch {
    /* quota exceeded — silently ignore */
  }
}

export function useSavedAddresses() {
  const [saved, setSaved] = useState<SavedAddress[]>([]);

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    setSaved(load());
  }, []);

  const saveAddress = useCallback(
    (address: Omit<SavedAddress, "savedAt">) => {
      setSaved((prev) => {
        const without = prev.filter((a) => a.slug !== address.slug);
        const next: SavedAddress[] = [
          { ...address, savedAt: new Date().toISOString() },
          ...without,
        ].slice(0, MAX_SAVED);
        persist(next);
        return next;
      });
    },
    [],
  );

  const removeAddress = useCallback((slug: string) => {
    setSaved((prev) => {
      const next = prev.filter((a) => a.slug !== slug);
      persist(next);
      return next;
    });
  }, []);

  const isSaved = useCallback(
    (slug: string) => saved.some((a) => a.slug === slug),
    [saved],
  );

  const getSavedAddresses = useCallback(() => saved, [saved]);

  return { saved, saveAddress, removeAddress, isSaved, getSavedAddresses };
}
