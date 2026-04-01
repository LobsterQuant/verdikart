"use client";

import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSavedAddresses } from "@/hooks/useSavedAddresses";
import { useState, useEffect, useCallback } from "react";

interface SaveAddressButtonProps {
  slug: string;
  adressetekst: string;
  lat: number;
  lon: number;
  kommunenummer?: string;
  postnummer?: string;
}

export default function SaveAddressButton({
  slug,
  adressetekst,
  lat,
  lon,
  kommunenummer,
  postnummer,
}: SaveAddressButtonProps) {
  const { data: session } = useSession();
  const localStore = useSavedAddresses();
  const [dbSaved, setDbSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check DB state on mount when logged in
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/saved-properties")
      .then((r) => r.json())
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const found = data.items?.some((item: any) => item.slug === slug);
        if (found) setDbSaved(true);
      })
      .catch(() => {});
  }, [session, slug]);

  const saved = session?.user ? dbSaved : localStore.isSaved(slug);

  const toggle = useCallback(async () => {
    if (loading) return;

    if (session?.user) {
      setLoading(true);
      try {
        if (dbSaved) {
          await fetch("/api/saved-properties", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
          });
          setDbSaved(false);
        } else {
          await fetch("/api/saved-properties", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              slug,
              address: adressetekst,
              lat,
              lon,
              kommunenummer,
              postnummer,
            }),
          });
          setDbSaved(true);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    } else {
      if (localStore.isSaved(slug)) {
        localStore.removeAddress(slug);
      } else {
        localStore.saveAddress({ slug, adressetekst, lat, lon });
      }
    }
  }, [session, dbSaved, slug, adressetekst, lat, lon, kommunenummer, postnummer, loading, localStore]);

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Fjern fra lagrede adresser" : "Lagre adresse"}
      className="group flex items-center gap-2 rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm transition-colors hover:border-accent/40 disabled:opacity-50"
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          saved
            ? "fill-accent text-accent"
            : "text-text-tertiary group-hover:text-accent"
        }`}
        strokeWidth={1.5}
      />
      <span
        className={`text-xs font-medium transition-colors ${
          saved ? "text-accent" : "text-text-secondary group-hover:text-foreground"
        }`}
      >
        {loading ? "…" : saved ? "Lagret" : "Lagre"}
      </span>
    </button>
  );
}
