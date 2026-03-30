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
          required
          placeholder="din@epost.no"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-card-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-text-tertiary outline-none transition-colors focus:border-accent"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
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
          <h3 className="font-semibold text-foreground">Få varsler om prisendringer</h3>
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          Vi sender deg en e-post hvis boligprisene{address ? ` i dette området` : ""} endrer seg betydelig.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          placeholder="din@epost.no"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-text-tertiary outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-80 disabled:opacity-50 whitespace-nowrap"
        >
          {status === "loading" ? "Sender…" : "Varsle meg"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">Noe gikk galt. Prøv igjen.</p>
      )}
      {/* GDPR consent + unsubscribe — required at point of collection (GDPR Art. 7 + 13) */}
      <p className="mt-3 text-xs text-text-tertiary leading-relaxed">
        Ved å melde deg på godtar du at vi lagrer e-postadressen din for å sende
        prisvarsel for den valgte adressen. Vi deler ikke data med tredjeparter.
        Du kan{" "}
        <a
          href="mailto:kontakt@verdikart.no?subject=Avslutt%20prisvarsler&body=Jeg%20ønsker%20å%20avslutte%20prisvarslene%20mine%20fra%20Verdikart."
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          melde deg av når som helst
        </a>{" "}
        ved å sende oss en e-post, eller ved å klikke avmeldingslenken i varselet.
        Se vår{" "}
        <a href="/personvern" className="underline underline-offset-2 hover:text-foreground transition-colors">
          personvernerklæring
        </a>
        .
      </p>
    </div>
  );
}
