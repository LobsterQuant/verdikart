import { TVANGSSALG_2026_DATA } from "@/data/rapport/tvangssalg-2026";

export default function KvartalsDetalj() {
  const rows = TVANGSSALG_2026_DATA.quarterlyDetail;
  const maxTotal = Math.max(...rows.map((r) => r.total));

  return (
    <section aria-labelledby="kvartalsvis" className="mb-16">
      <div className="mb-5">
        <h2
          id="kvartalsvis"
          className="text-xl font-semibold text-foreground sm:text-2xl"
        >
          Siste seks kvartaler
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Antall gjennomførte tvangssalg per kvartal. Sterke kvartaler er
          fremhevet.
        </p>
      </div>

      <ul className="divide-y divide-card-border/50 rounded-xl border border-card-border bg-card-bg">
        {rows.map((row) => {
          const widthPct = Math.round((row.total / maxTotal) * 100);
          return (
            <li
              key={row.quarter}
              className={`flex items-center gap-4 px-4 py-3.5 sm:px-5 ${
                row.strong ? "bg-accent/5" : ""
              }`}
            >
              <div className="w-20 shrink-0 text-sm font-semibold text-foreground">
                {row.label}
              </div>
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-card-border/40">
                  <div
                    className={`h-full rounded-full ${
                      row.strong ? "bg-accent" : "bg-text-tertiary/60"
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
              <div className="flex shrink-0 items-baseline gap-3 text-right tabular-nums">
                <div>
                  <div
                    className={`text-sm font-semibold ${
                      row.strong ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {row.total}
                  </div>
                  <div className="text-[10px] text-text-tertiary">totalt</div>
                </div>
                <div className="w-10">
                  <div className="text-sm font-semibold text-foreground">
                    {row.fritidAlt}
                  </div>
                  <div className="text-[10px] text-text-tertiary">hytte</div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
