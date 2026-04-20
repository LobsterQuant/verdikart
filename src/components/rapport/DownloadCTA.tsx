import { Download } from "lucide-react";

export default function DownloadCTA() {
  return (
    <section className="mb-12">
      <a
        href="/rapport/hytte-tvangssalg-2026/pdf"
        download="verdikart-hytte-tvangssalg-2026.pdf"
        className="group flex items-center justify-between gap-4 rounded-xl border border-card-border bg-card-bg px-5 py-4 transition-colors hover:border-accent/40"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
            <Download
              className="h-5 w-5 text-accent"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              Last ned hele rapporten (PDF)
            </div>
            <div className="text-xs text-text-tertiary">
              Alle grafer, tabeller og metodologi — klar for deling
            </div>
          </div>
        </div>
        <span className="text-xs font-medium text-accent transition-transform group-hover:translate-x-0.5">
          Last ned →
        </span>
      </a>
    </section>
  );
}
