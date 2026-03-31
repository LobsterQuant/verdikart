import type { Metadata } from "next";
import { Mail, Clock } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Kontakt oss | Verdikart",
  description: "Ta kontakt med Verdikart — spørsmål om tjenesten, feilmeldinger, datatilgang eller samarbeid. Vi svarer innen 1–2 virkedager.",
  alternates: { canonical: "https://verdikart.no/kontakt" },
  openGraph: {
    title: "Kontakt oss — Verdikart",
    description: "Ta kontakt med Verdikart — spørsmål, feilmeldinger, datatilgang eller samarbeid.",
    url: "https://verdikart.no/kontakt",
    siteName: "Verdikart",
    locale: "nb_NO",
    type: "website",
  },
};

export default function KontaktPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">

        <div className="mb-10">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Mail className="h-5 w-5 text-accent" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Kontakt oss</h1>
          <p className="mt-3 text-text-secondary">
            Spørsmål, tilbakemeldinger eller noe som ikke fungerer? Bruk skjemaet under — vi svarer innen 1–2 virkedager.
          </p>
        </div>

        {/* Contact form */}
        <ContactForm />

        {/* Direct email — secondary option */}
        <div className="mt-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Eller send direkte e-post</p>
          <a
            href="mailto:kontakt@verdikart.no"
            className="flex items-center gap-3 rounded-xl border border-card-border bg-card-bg px-4 py-3 text-sm text-text-secondary transition-colors hover:border-accent/30 hover:text-foreground"
          >
            <Mail className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
            kontakt@verdikart.no — generelle spørsmål
          </a>
          <a
            href="mailto:personvern@verdikart.no"
            className="flex items-center gap-3 rounded-xl border border-card-border bg-card-bg px-4 py-3 text-sm text-text-secondary transition-colors hover:border-accent/30 hover:text-foreground"
          >
            <Mail className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
            personvern@verdikart.no — GDPR og innsyn
          </a>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-card-border bg-card-bg p-4 text-sm text-text-secondary">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} />
          <span>Svartid: <strong className="text-foreground">1–2 virkedager</strong>. For tekniske feil, beskriv adressen du søkte på og hva som skjedde.</span>
        </div>

        <div className="mt-6 rounded-xl border border-card-border bg-card-bg p-5">
          <h2 className="mb-2 font-semibold">Vanlige spørsmål</h2>
          <p className="text-sm text-text-secondary">
            Mange spørsmål er allerede besvart i vår{" "}
            <a href="/faq" className="text-accent hover:underline">FAQ-side</a>.
          </p>
        </div>

      </div>
    </div>
  );
}
