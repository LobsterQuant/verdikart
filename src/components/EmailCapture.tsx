"use client";

import { useState } from "react";

export default function EmailCapture({ address }: { address?: string }) {
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
    return (
      <div className="rounded-xl border border-accent/30 bg-card-bg px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-xl">✓</span>
          <div>
            <p className="font-medium text-foreground">Du er påmeldt</p>
            <p className="text-sm text-text-secondary">
              Vi varsler deg hvis prisene i dette området endrer seg.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-card-border bg-card-bg px-4 py-5 sm:px-6">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Få varsler om prisendringer</h3>
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
      <p className="mt-3 text-xs text-text-tertiary">
        Ingen spam. Kun relevante prisoppdateringer. Avslutt når som helst.
      </p>
    </div>
  );
}
