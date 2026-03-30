import type { Metadata } from "next";
import { Mail, MessageSquare, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontakt oss | Verdikart",
  description: "Ta kontakt med Verdikart. Vi svarer på spørsmål om tjenesten, datatilgang, feilmeldinger og samarbeid.",
  alternates: { canonical: "https://verdikart.no/kontakt" },
};

export default function KontaktPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <MessageSquare className="h-5 w-5 text-accent" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Kontakt oss</h1>
          <p className="mt-3 text-text-secondary">
            Spørsmål, tilbakemeldinger eller noe som ikke fungerer? Vi hører gjerne fra deg.
          </p>
        </div>

        {/* Contact options */}
        <div className="space-y-4 mb-10">
          <a
            href="mailto:kontakt@verdikart.no"
            className="flex items-start gap-4 rounded-xl border border-card-border bg-card-bg p-5 transition-colors hover:border-accent/30 group"
          >
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
              <Mail className="h-4.5 w-4.5 text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold">E-post</p>
              <p className="mt-0.5 text-sm text-accent">kontakt@verdikart.no</p>
              <p className="mt-1 text-xs text-text-tertiary">For generelle spørsmål, feilmeldinger og tilbakemeldinger</p>
            </div>
          </a>

          <a
            href="mailto:personvern@verdikart.no"
            className="flex items-start gap-4 rounded-xl border border-card-border bg-card-bg p-5 transition-colors hover:border-accent/30 group"
          >
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
              <Mail className="h-4.5 w-4.5 text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold">Personvern og GDPR</p>
              <p className="mt-0.5 text-sm text-accent">personvern@verdikart.no</p>
              <p className="mt-1 text-xs text-text-tertiary">Innsyn i data, sletting, avmelding fra e-postvarsler</p>
            </div>
          </a>
        </div>

        {/* Response time */}
        <div className="flex items-start gap-3 rounded-xl border border-card-border bg-card-bg p-4 text-sm text-text-secondary mb-10">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} />
          <span>Vi forsøker å svare innen <strong className="text-foreground">1–2 virkedager</strong>. For tekniske feil, prøv gjerne å beskrive hvilken adresse du søkte på og hva som skjedde.</span>
        </div>

        {/* FAQ link */}
        <div className="rounded-xl border border-card-border bg-card-bg p-5">
          <h2 className="mb-2 font-semibold">Har du et vanlig spørsmål?</h2>
          <p className="text-sm text-text-secondary">
            Mange spørsmål er allerede besvart i vår{" "}
            <a href="/faq" className="text-accent hover:underline">FAQ-side</a>.
            Sjekk der først — du finner svar om datakilder, oppdateringsfrekvens, personvern og mer.
          </p>
        </div>
      </div>
    </div>
  );
}
