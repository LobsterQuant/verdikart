"use client";

import { useState } from "react";
import { CheckCircle, Bell } from "lucide-react";

export default function EmailCapture({ address, compact = false }: { address?: string; compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, address }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    if (compact) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span>Du er påmeldt!</span>
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-accent/30 bg-card-bg px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-500" strokeWidth={1.5} />
          <div>
            <p className="font-medium text-foreground">Du er påmeldt</p>
            <p className="text-sm text-text-secondary">
              Vi varsler deg hvis prisene i dette området endrer seg.
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              For å melde deg av:{" "}
              <a
                href="mailto:kontakt@verdikart.no?subject=Avslutt%20prisvarsler&body=Jeg%20ønsker%20å%20avslutte%20prisvarslene%20mine%20fra%20Verdikart."
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                kontakt@verdikart.no
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="din@epost.no"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-card-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-text-tertiary outline-none transition-colors focus:border-accent"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-base btn-primary shrink-0 px-4 py-2 text-sm"
        >
          {status === "loading" ? "…" : "Abonnér"}
        </button>
      </form>
    );
  }

  return (
    <div className="rounded-xl border border-card-border bg-card-bg px-4 py-5 sm:px-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="h-4 w-4 text-accent" strokeWidth={1.5} />
          <h3 className="font-semibold text-foreground">Meld deg på prisoppdateringer</h3>
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          Meld deg på nyhetsbrev om boligprisutvikling{address ? ` i dette området` : ""}. Gratis, ett klikk for å melde deg av.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
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
          className="btn-base btn-primary px-5 py-2.5 text-sm"
        >
          {status === "loading" ? "Sender…" : "Varsle meg"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">Noe gikk galt. Prøv igjen.</p>
      )}
      {/* GDPR consent + unsubscribe — required at point of collection (GDPR Art. 7 + 13) */}
      <p className="mt-3 text-xs text-text-tertiary leading-relaxed">
        {address
          ? "Vi lagrer e-postadressen din for å sende prisvarsler for denne adressen."
          : "Vi lagrer e-postadressen din for å sende markedsoppdateringer."}{" "}
        Aldri delt med tredjeparter.{" "}
        <a
          href="/avmeld"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Meld deg av med ett klikk
        </a>
        .{" "}
        <a href="/personvern" className="underline underline-offset-2 hover:text-foreground transition-colors">
          Se personvernerklæringen
        </a>
        .
      </p>
    </div>
  );
}
