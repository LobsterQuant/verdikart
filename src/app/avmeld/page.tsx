"use client";
import { useState } from "react";
import { CheckCircle, Mail, AlertCircle } from "lucide-react";

export default function Avmeld() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch(`https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "xjgpwkyz"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, _subject: "Avmelding — Verdikart", message: `Bruker ${email} ønsker å avslutte alle e-poster fra Verdikart.` }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-card-border bg-card-bg p-8 text-center">
          {status === "done" ? (
            <>
              <CheckCircle className="mx-auto mb-4 h-10 w-10 text-green-400" strokeWidth={1.5} />
              <h1 className="text-xl font-bold mb-2">Du er avmeldt</h1>
              <p className="text-text-secondary text-sm">
                Vi har registrert avmeldingen din og vil ikke sende deg flere e-poster fra Verdikart.
              </p>
              <a href="/" className="mt-6 inline-block text-sm text-accent hover:underline">Tilbake til forsiden →</a>
            </>
          ) : (
            <>
              <Mail className="mx-auto mb-4 h-10 w-10 text-text-tertiary" strokeWidth={1.5} />
              <h1 className="mb-2 text-xl font-bold">Avslutt varsler</h1>
              <p className="mb-6 text-sm text-text-secondary">
                Skriv inn e-postadressen du vil melde av fra alle Verdikart-varsler.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3" aria-label="Avmeldingsskjema">
                <label htmlFor="avmeld-email" className="sr-only">E-postadresse</label>
                <input
                  id="avmeld-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="din@epost.no"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm placeholder:text-text-tertiary focus:border-accent/50 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                >
                  {status === "loading" ? "Behandler…" : "Meld av nå"}
                </button>
              </form>
              {status === "error" && (
                <div className="mt-4 flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                  Noe gikk galt. Send en e-post til <a href="mailto:kontakt@verdikart.no" className="underline">kontakt@verdikart.no</a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
