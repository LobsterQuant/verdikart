"use client";

import { Heart } from "lucide-react";
import { useSavedAddresses } from "@/hooks/useSavedAddresses";

interface SaveAddressButtonProps {
  slug: string;
  adressetekst: string;
  lat: number;
  lon: number;
}

export default function SaveAddressButton({
  slug,
  adressetekst,
  lat,
  lon,
}: SaveAddressButtonProps) {
  const { isSaved, saveAddress, removeAddress } = useSavedAddresses();
  const saved = isSaved(slug);

  function toggle() {
    if (saved) {
      removeAddress(slug);
    } else {
      saveAddress({ slug, adressetekst, lat, lon });
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={saved ? "Fjern fra lagrede adresser" : "Lagre adresse"}
      className="group flex items-center gap-2 rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm transition-colors hover:border-accent/40"
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
        {saved ? "Lagret" : "Lagre"}
      </span>
    </button>
  );
}
