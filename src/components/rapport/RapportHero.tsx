import { TVANGSSALG_2026_DATA } from "@/data/rapport/tvangssalg-2026";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nb-NO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function RapportHero() {
  const d = TVANGSSALG_2026_DATA;

  return (
    <header className="mb-12">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Verdikart-rapport · VK-2026-01
      </div>

      <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
        Hytte-tvangssalgene nær doblet på to år
      </h1>

      <p className="mt-5 text-base leading-relaxed text-text-secondary sm:text-lg">
        Nye tall fra SSB viser at antall tinglyste tvangssalg av
        fritidseiendommer har steget fra <strong className="text-foreground">{d.headlineFigure.from} i {d.headlineFigure.yearFrom}</strong>{" "}
        til <strong className="text-foreground">{d.headlineFigure.to} i {d.headlineFigure.yearTo}</strong> — en økning på{" "}
        <strong className="text-accent">{d.headlineFigure.changePct} prosent</strong>.
      </p>

      <div className="mt-8 rounded-2xl border border-accent/30 bg-accent/5 p-6 sm:p-8">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-5xl font-bold text-accent sm:text-6xl md:text-7xl">
            +{d.headlineFigure.changePct}%
          </span>
          <span className="text-sm text-text-secondary sm:text-base">
            Økning i hytte-tvangssalg
            <br />
            {d.headlineFigure.yearFrom} → {d.headlineFigure.yearTo}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-text-tertiary">
        <span>Publisert {formatDate(d.publicationDate)}</span>
        <span className="h-1 w-1 rounded-full bg-card-border" aria-hidden />
        <span>Datakilde: SSB tabell 08948, 11500</span>
        <span className="h-1 w-1 rounded-full bg-card-border" aria-hidden />
        <span>Oppdateres kvartalsvis</span>
      </div>
    </header>
  );
}
