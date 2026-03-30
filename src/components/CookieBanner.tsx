"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "verdikart_cookie_consent";

type Consent = "accepted" | "declined" | null;

// Called by layout to inject Clarity only after consent
export function useClarityConsent(): boolean {
  const [consented, setConsented] = useState(false);
  useEffect(() => {
    setConsented(localStorage.getItem(STORAGE_KEY) === "accepted");
    const handler = () => setConsented(localStorage.getItem(STORAGE_KEY) === "accepted");
    window.addEventListener("verdikart:consent", handler);
    return () => window.removeEventListener("verdikart:consent", handler);
  }, []);
  return consented;
}

export default function CookieBanner() {
  const [consent, setConsent] = useState<Consent | "loading">("loading");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Consent;
    setConsent(stored); // null = not decided yet
  }, []);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
    window.dispatchEvent(new Event("verdikart:consent"));
  }

  function handleDecline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setConsent("declined");
  }

  // Hidden until we know the stored value (avoids flash)
  if (consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Informasjonskapsler"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-xl border border-card-border bg-card-bg p-4 shadow-2xl shadow-black/60 sm:left-auto sm:right-6 sm:max-w-sm"
    >
      <p className="mb-1 text-sm font-semibold text-foreground">Vi bruker informasjonskapsler</p>
      <p className="mb-4 text-xs leading-relaxed text-text-secondary">
        Vi bruker Microsoft Clarity for å forstå hvordan nettsiden brukes (varmekart, sesjonsopptak). Dette krever ditt samtykke etter GDPR.{" "}
        <Link href="/personvern" className="text-accent hover:underline">Les mer</Link>.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          className="flex-1 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-80"
        >
          Godta
        </button>
        <button
          onClick={handleDecline}
          className="flex-1 rounded-lg border border-card-border bg-background px-4 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-accent/30 hover:text-foreground"
        >
          Avslå
        </button>
      </div>
    </div>
  );
}
