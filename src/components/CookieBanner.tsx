"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "verdikart_cookie_consent_v2";
const DECLINED_AT_KEY = "verdikart_cookie_declined_at";
const REDISPLAY_DAYS = 30;

export interface ConsentPrefs {
  analytics: boolean;   // Microsoft Clarity — session recordings
}

function loadPrefs(): ConsentPrefs | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentPrefs;
  } catch { return null; }
}

function savePrefs(prefs: ConsentPrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  localStorage.removeItem(DECLINED_AT_KEY);
  window.dispatchEvent(new CustomEvent("verdikart:consent", { detail: prefs }));
}

function declined() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: false }));
  localStorage.setItem(DECLINED_AT_KEY, Date.now().toString());
  window.dispatchEvent(new CustomEvent("verdikart:consent", { detail: { analytics: false } }));
}

// Called by layout to inject Clarity only after consent
export function useClarityConsent(): boolean {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const prefs = loadPrefs();
    setConsented(prefs?.analytics === true);

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ConsentPrefs>).detail;
      setConsented(detail?.analytics === true);
    };
    window.addEventListener("verdikart:consent", handler);
    return () => window.removeEventListener("verdikart:consent", handler);
  }, []);

  return consented;
}

function shouldShowBanner(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true; // first visit
    const prefs = JSON.parse(raw) as ConsentPrefs;
    // If explicitly set (any choice made), don't show — unless declined long ago
    if (prefs.analytics === false) {
      const declinedAt = parseInt(localStorage.getItem(DECLINED_AT_KEY) ?? "0", 10);
      if (!declinedAt) return false; // declined via "Avvis alle" — respect indefinitely
      const daysSince = (Date.now() - declinedAt) / (1000 * 60 * 60 * 24);
      return daysSince >= REDISPLAY_DAYS;
    }
    return false; // accepted
  } catch { return true; }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(true);

  useEffect(() => {
    setVisible(shouldShowBanner());
  }, []);

  function handleAcceptAll() {
    savePrefs({ analytics: true });
    setVisible(false);
  }

  function handleRejectAll() {
    declined();
    setVisible(false);
  }

  function handleSaveCustom() {
    savePrefs({ analytics: analyticsOn });
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Informasjonskapsler og personvern"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-xl border border-card-border bg-card-bg p-4 shadow-2xl shadow-black/60 sm:left-auto sm:right-6 sm:max-w-sm"
    >
      <p className="mb-1 text-sm font-semibold text-foreground">Informasjonskapsler</p>
      <p className="mb-3 text-xs leading-relaxed text-text-secondary">
        Vi bruker nødvendige tjenester uten cookies (Plausible Analytics — anonymisert) og valgfrie UX-målingsverktøy (Microsoft Clarity — sesjonsopptak) som krever ditt samtykke.{" "}
        <Link href="/personvern" className="text-accent hover:underline">Les mer</Link>.
      </p>

      {/* Granular controls (expanded) */}
      {expanded && (
        <div className="mb-3 space-y-2 rounded-lg border border-card-border bg-background p-3 text-xs">
          {/* Necessary — always on */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">Nødvendig</p>
              <p className="text-text-tertiary">Plausible Analytics — cookiefri, GDPR-unntatt</p>
            </div>
            <span className="mt-0.5 shrink-0 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-400">Alltid på</span>
          </div>
          {/* Analytics / UX measurement */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">UX-måling</p>
              <p className="text-text-tertiary">Microsoft Clarity — sesjonsopptak, krever samtykke</p>
            </div>
            <button
              onClick={() => setAnalyticsOn(v => !v)}
              aria-pressed={analyticsOn}
              className={`mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${analyticsOn ? "bg-accent" : "bg-card-border"}`}
            >
              <span className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${analyticsOn ? "translate-x-4.5" : "translate-x-0.5"}`} />
              <span className="sr-only">{analyticsOn ? "Skru av" : "Skru på"}</span>
            </button>
          </div>
          <button
            onClick={handleSaveCustom}
            className="mt-1 w-full rounded-lg border border-card-border bg-card-bg px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-foreground transition-colors"
          >
            Lagre valg
          </button>
        </div>
      )}

      {/* Primary actions */}
      <div className="flex gap-2">
        <button
          onClick={handleAcceptAll}
          className="flex-1 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-80"
        >
          Godta alle
        </button>
        <button
          onClick={handleRejectAll}
          className="flex-1 rounded-lg border border-card-border bg-background px-4 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-accent/30 hover:text-foreground"
        >
          Avvis alle
        </button>
      </div>
      <button
        onClick={() => setExpanded(v => !v)}
        className="mt-2 w-full text-center text-[11px] text-text-tertiary hover:text-accent transition-colors"
      >
        {expanded ? "Skjul detaljer ▲" : "Tilpass innstillinger ▼"}
      </button>
    </div>
  );
}
