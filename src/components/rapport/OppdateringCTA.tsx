"use client";

import { useState } from "react";
import { CheckCircle, Mail } from "lucide-react";

const SUBSCRIBE_SOURCE = "rapport-hytte-tvangssalg-2026";

export default function OppdateringCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, address: `source:${SUBSCRIBE_SOURCE}` }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      aria-labelledby="oppdatering"
      className="mb-12 rounded-2xl border border-accent/30 bg-accent/5 p-6 sm:p-8"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15">
          <Mail className="h-5 w-5 text-accent" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <h2
            id="oppdatering"
            className="text-xl font-semibold text-foreground sm:text-2xl"
          >
            Per-adresse tvangssalg-historikk kommer snart
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Verdikart bygger neste fase: tinglyste tvangssalg per adresse,
            basert på Kartverkets grunnbok. Abonnér på oppdateringer for å få
            tidlig tilgang når det åpnes.
          </p>

          {status === "success" ? (
            <div className="mt-5 flex items-center gap-2 text-sm text-foreground">
              <CheckCircle
                className="h-4 w-4 shrink-0 text-accent"
                strokeWidth={1.5}
              />
              <span>
                Takk! Vi varsler deg når per-adresse-funksjonen er klar.
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-5 flex flex-col gap-2 sm:flex-row"
            >
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="din@epost.no"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-text-tertiary outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-base btn-primary shrink-0 px-5 py-2.5 text-sm disabled:opacity-60"
              >
                {status === "loading" ? "Sender…" : "Varsle meg"}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="mt-2 text-xs text-red-400">
              Noe gikk galt. Prøv igjen om litt.
            </p>
          )}

          {status !== "success" && (
            <p className="mt-3 text-xs leading-relaxed text-text-tertiary">
              Kilde-tag: <code className="text-text-secondary">{SUBSCRIBE_SOURCE}</code>.{" "}
              Meld av når som helst. Aldri delt med tredjeparter.{" "}
              <a
                href="/personvern"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Personvernerklæring
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
