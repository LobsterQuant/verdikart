"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

type Status = "idle" | "sending" | "success" | "error";

const SUBJECTS = [
  "Generelt spørsmål",
  "Teknisk feil / noe virker ikke",
  "Feil i data",
  "Samarbeid / partnerskap",
  "Personvern / GDPR",
  "Annet",
];

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("https://formspree.io/f/xjgpwkyz", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          _subject: `[Verdikart kontakt] ${form.subject}`,
        }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-8 text-center">
        <CheckCircle className="h-10 w-10 text-green-400" strokeWidth={1.5} />
        <p className="font-semibold text-lg">Takk for meldingen!</p>
        <p className="text-sm text-text-secondary">Vi svarer deg innen 1–2 virkedager på <strong>{form.email}</strong>.</p>
        <button
          onClick={() => { setStatus("idle"); setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" }); }}
          className="mt-2 text-sm text-accent hover:underline"
        >
          Send en ny melding
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-text-secondary">
            Navn
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ola Nordmann"
            className="w-full rounded-xl border border-card-border bg-card-bg px-4 py-3 text-sm text-foreground placeholder:text-text-tertiary outline-none transition-colors focus:border-accent/50"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-secondary">
            E-post <span className="text-accent">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="ola@example.com"
            className="w-full rounded-xl border border-card-border bg-card-bg px-4 py-3 text-sm text-foreground placeholder:text-text-tertiary outline-none transition-colors focus:border-accent/50"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-text-secondary">
          Emne
        </label>
        <select
          id="subject"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          className="w-full rounded-xl border border-card-border bg-card-bg px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent/50"
        >
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-text-secondary">
          Melding <span className="text-accent">*</span>
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Skriv meldingen din her..."
          className="w-full resize-none rounded-xl border border-card-border bg-card-bg px-4 py-3 text-sm text-foreground placeholder:text-text-tertiary outline-none transition-colors focus:border-accent/50"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-400">Noe gikk galt. Prøv igjen, eller send e-post direkte til kontakt@verdikart.no.</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {status === "sending" ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <Send className="h-4 w-4" strokeWidth={1.5} />
        )}
        {status === "sending" ? "Sender..." : "Send melding"}
      </button>

      <p className="text-center text-xs text-text-tertiary">
        Ved å sende godtar du vår{" "}
        <a href="/personvern" className="text-accent hover:underline">personvernerklæring</a>.
        Vi deler ikke din informasjon med tredjeparter.
      </p>
    </form>
  );
}
