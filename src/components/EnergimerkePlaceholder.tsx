import { Zap } from "lucide-react";

/**
 * Placeholder energimerke card for property reports.
 * Shows the energy label (A-G) when data is available,
 * or a "coming soon" message while we prepare integration with Enova.
 *
 * This captures the SEO space + value prop for property comparison.
 */
export default function EnergimerkePlaceholder() {
  // TODO: Integrate with Enova API when available
  // For now: show placeholder with honest messaging

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-base font-semibold">Energimerke</h3>
      </div>

      <p className="mb-4 text-sm text-text-secondary leading-relaxed">
        Energimerket viser hvor energieffektiv boligen er på en skala fra A (best) til G (dårligst). Bygninger bygget før 2007 er sjelden merket — vi jobber på å integrere Enova sitt register.
      </p>

      <div className="rounded-lg bg-background p-4 text-center">
        <p className="text-xs text-text-tertiary uppercase tracking-widest mb-2">Kommer snart</p>
        <p className="text-2xl font-bold text-text-secondary">—</p>
        <p className="mt-2 text-xs text-text-tertiary">
          Enova-data blir tilgjengelig når Kartverket matrikkel-integrasjon lanseres.
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2">
        <p className="text-xs text-text-secondary">
          <span className="font-medium text-text-foreground">Hva det betyr:</span> Energiklasse A bruker
          <br />
          halvparten av strøm som klasse G over samme periode.
        </p>
      </div>

      <a
        href="/blogg/energimerke-norge-forklart"
        className="mt-3 inline-block text-xs font-medium text-accent underline underline-offset-2 hover:text-accent/80 transition-colors"
      >
        Les mer om energimerker →
      </a>

      <p className="mt-3 text-xs text-text-tertiary">
        Kilde: Enova — Energimerke for bygg i Norge.
      </p>
    </div>
  );
}
