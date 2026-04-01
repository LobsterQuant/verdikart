"use client";

import { Heart, X } from "lucide-react";
import { useSavedAddresses } from "@/hooks/useSavedAddresses";

export default function SavedAddressesList() {
  const { saved, removeAddress } = useSavedAddresses();

  if (saved.length === 0) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-5 text-center">
        <Heart className="mx-auto mb-2 h-6 w-6 text-text-tertiary" strokeWidth={1.5} />
        <p className="text-sm text-text-secondary">
          Ingen lagrede adresser ennå.
        </p>
        <p className="mt-1 text-xs text-text-tertiary">
          Bruk <span className="inline-flex align-text-bottom"><Heart className="mx-0.5 inline h-3 w-3 text-text-tertiary" strokeWidth={1.5} /></span>-knappen på en eiendomsrapport for å lagre.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-card-border bg-card-bg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-card-border">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-tertiary">
          <Heart className="h-3 w-3" strokeWidth={1.5} />
          Lagrede adresser
        </span>
        <span className="text-[10px] text-text-tertiary">{saved.length} / 20</span>
      </div>
      <ul>
        {saved.map((addr) => (
          <li
            key={addr.slug}
            className="flex items-center gap-3 border-b border-card-border last:border-b-0 px-4 py-3 transition-colors hover:bg-white/[0.03]"
          >
            <a
              href={`/eiendom/${addr.slug}?adresse=${encodeURIComponent(addr.adressetekst)}`}
              className="flex-1 min-w-0"
            >
              <span className="block truncate text-sm font-medium text-foreground hover:text-accent transition-colors">
                {addr.adressetekst}
              </span>
              <span className="block text-[10px] text-text-tertiary mt-0.5">
                Lagret {new Date(addr.savedAt).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </a>
            <button
              onClick={() => removeAddress(addr.slug)}
              aria-label={`Fjern ${addr.adressetekst} fra lagrede`}
              className="shrink-0 rounded-md p-1 text-text-tertiary transition-colors hover:bg-white/10 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
