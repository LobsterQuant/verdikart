import { TVANGSSALG_2026_DATA } from "@/data/rapport/tvangssalg-2026";

function formatPct(pct: number) {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1).replace(".", ",")}%`;
}

export default function KategoriTable() {
  const rows = TVANGSSALG_2026_DATA.byCategory;

  return (
    <section aria-labelledby="kategori" className="mb-16">
      <div className="mb-5">
        <h2
          id="kategori"
          className="text-xl font-semibold text-foreground sm:text-2xl"
        >
          Tvangssalg per eiendomstype
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Gjennomførte tvangssalg, hele kalenderåret. Fritidseiendom er fremhevet.
        </p>
      </div>

      <div className="-mx-4 overflow-x-auto sm:mx-0">
        <table className="w-full min-w-[560px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-left">
              <th className="sticky left-0 border-b border-card-border bg-background px-4 py-3 font-semibold text-text-secondary">
                Eiendomstype
              </th>
              <th className="border-b border-card-border px-3 py-3 text-right font-semibold text-text-secondary">
                2023
              </th>
              <th className="border-b border-card-border px-3 py-3 text-right font-semibold text-text-secondary">
                2024
              </th>
              <th className="border-b border-card-border px-3 py-3 text-right font-semibold text-text-secondary">
                2025
              </th>
              <th className="border-b border-card-border px-3 py-3 text-right font-semibold text-text-secondary">
                2023 → 2025
              </th>
              <th className="border-b border-card-border px-3 py-3 text-right font-semibold text-text-secondary">
                YoY
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const highlight = row.highlight === true;
              return (
                <tr
                  key={row.type}
                  className={highlight ? "bg-accent/5" : undefined}
                >
                  <td
                    className={`sticky left-0 border-b border-card-border/50 px-4 py-3 ${
                      highlight
                        ? "bg-accent/5 font-semibold text-accent"
                        : "bg-background text-foreground"
                    }`}
                  >
                    {highlight && (
                      <span
                        aria-hidden
                        className="mr-2 inline-block h-2 w-2 rounded-full bg-accent"
                      />
                    )}
                    {row.type}
                  </td>
                  <td className="border-b border-card-border/50 px-3 py-3 text-right tabular-nums text-text-secondary">
                    {row.y2023}
                  </td>
                  <td className="border-b border-card-border/50 px-3 py-3 text-right tabular-nums text-text-secondary">
                    {row.y2024}
                  </td>
                  <td
                    className={`border-b border-card-border/50 px-3 py-3 text-right tabular-nums font-semibold ${
                      highlight ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {row.y2025}
                  </td>
                  <td
                    className={`border-b border-card-border/50 px-3 py-3 text-right tabular-nums ${
                      highlight ? "font-semibold text-accent" : "text-text-secondary"
                    }`}
                  >
                    {formatPct(row.changeFrom2023Pct)}
                  </td>
                  <td className="border-b border-card-border/50 px-3 py-3 text-right tabular-nums text-text-secondary">
                    {formatPct(row.yoyPct)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-text-tertiary">
        Kilde: SSB 08948 for alle kategorier unntatt borettslag (SSB 11500). De
        to siste kvartalene som er publisert er foreløpige tall.
      </p>
    </section>
  );
}
