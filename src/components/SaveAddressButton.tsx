"use client";

import { Heart } from "lucide-react";
import { useState, useCallback } from "react";
import * as Sentry from "@sentry/nextjs";
import { useSavedAddresses } from "@/hooks/useSavedAddresses";
import { useToast } from "./Toast";

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
  const { saveAddress, removeAddress, isSaved } = useSavedAddresses();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const saved = isSaved(slug);

  const toggle = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (saved) {
        await removeAddress(slug);
        toast.success("Fjernet fra lagrede");
      } else {
        await saveAddress({
          slug,
          adressetekst,
          lat,
          lon,
          kommunenummer,
          postnummer,
        });
        toast.success("Lagret");
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { scope: "saved-addresses.toggle", action: saved ? "remove" : "save" },
      });
      toast.error(
        saved ? "Kunne ikke fjerne — prøv igjen" : "Kunne ikke lagre — prøv igjen",
      );
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    saved,
    saveAddress,
    removeAddress,
    toast,
    slug,
    adressetekst,
    lat,
    lon,
    kommunenummer,
    postnummer,
  ]);

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
          saved
            ? "text-accent"
            : "text-text-secondary group-hover:text-foreground"
        }`}
      >
        {loading ? "…" : saved ? "Lagret" : "Lagre"}
      </span>
    </button>
  );
}
