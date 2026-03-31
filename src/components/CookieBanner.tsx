"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "verdikart_cookie_consent";
const DECLINED_AT_KEY = "verdikart_cookie_declined_at";
const REDISPLAY_DAYS = 30;

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

function shouldShowBanner(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY) as Consent;
  if (stored === "accepted") return false;
  if (stored === "declined") {
    // Re-show after REDISPLAY_DAYS days so users can change their mind
    const declinedAt = parseInt(localStorage.getItem(DECLINED_AT_KEY) ?? "0", 10);
    const daysSince = (Date.now() - declinedAt) / (1000 * 60 * 60 * 24);
    return daysSince >= REDISPLAY_DAYS;
  }
  return true; // null = first visit
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(shouldShowBanner());
  }, []);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    localStorage.removeItem(DECLINED_AT_KEY);
    setVisible(false);
    window.dispatchEvent(new Event("verdikart:consent"));
  }

  function handleDecline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    localStorage.setItem(DECLINED_AT_KEY, Date.now().toString());
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Informasjonskapsler"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-xl border border-card-border bg-card-bg p-4 shadow-2xl shadow-black/60 sm:left-auto sm:right-6 sm:max-w-sm"
    >
      <p className="mb-1 text-sm font-semibold text-foreground">Bruksanalyse</p>
      <p className="mb-4 text-xs leading-relaxed text-text-secondary">
        Vi bruker anonymiserte analyseverktøy for å forbedre nettsiden. Ingen personopplysninger deles med tredjeparter.{" "}
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
          Ikke nå
        </button>
      </div>
    </div>
  );
}
