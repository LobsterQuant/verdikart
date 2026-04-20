import { Landmark } from "lucide-react";
import { TopographicHover } from "@/components/motion/TopographicHover";
import { eiendomsskattData } from "@/data/eiendomsskatt";

function fmt(n: number) {
  return n.toLocaleString("nb-NO");
}

export default function EiendomsskattCard({ kommunenummer }: { kommunenummer: string }) {
  const data = eiendomsskattData[kommunenummer];
  if (!data) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-text-secondary">Eiendomsskatt</h3>
        </div>
        <p className="mt-2 text-xs text-text-secondary">
          Vi har ikke eiendomsskattdata for denne kommunen ennå. Vi utvider dekningen løpende.
        </p>
      </div>
    );
  }

  const exampleValues = [3_000_000, 5_000_000, 8_000_000];
  const reductionFactor = data.reductionFactor ?? 1;
  const bunnfradrag = data.bunnfradrag ?? 0;
  const promille = data.promille ?? 0;
  function annualTax(marketValue: number): number {
    const taxable = Math.max(0, marketValue * reductionFactor - bunnfradrag);
    return Math.round((taxable * promille) / 1000);
  }

  return (
    <TopographicHover className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Landmark className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold">Eiendomsskatt i {data.name}</h3>
      </div>

      {!data.hasTax ? (
        <>
          <span className="inline-block rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
            Ingen eiendomsskatt
          </span>
          {data.note && (
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{data.note}</p>
          )}
        </>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-3">
            <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
              {data.promille} ‰
            </span>
            <span className="text-sm text-text-tertiary">
              {bunnfradrag > 0
                ? `av skattegrunnlag (${Math.round(reductionFactor * 100)} % av markedsverdi, minus ${fmt(bunnfradrag)} kr bunnfradrag)`
                : "promille av beregnet markedsverdi"}
            </span>
          </div>
          {data.note && (
            <p className="mb-4 text-sm leading-relaxed text-text-secondary">{data.note}</p>
          )}

          <div className="overflow-hidden rounded-lg border border-card-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border bg-background/50">
                  <th className="px-3 py-2 text-left font-medium text-text-tertiary">Boligverdi</th>
                  <th className="px-3 py-2 text-right font-medium text-text-tertiary">Årlig eiendomsskatt</th>
                </tr>
              </thead>
              <tbody>
                {exampleValues.map((value) => (
                  <tr key={value} className="border-b border-card-border last:border-0">
                    <td className="px-3 py-2 text-text-secondary">{fmt(value)} kr</td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums">
                      {fmt(annualTax(value))} kr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-medium text-text-secondary hover:text-foreground transition-colors">
          Hva er eiendomsskatt?
        </summary>
        <p className="mt-2 leading-relaxed text-text-tertiary">
          Eiendomsskatt er en kommunal skatt på fast eiendom. Skatten beregnes som en promillesats
          av eiendommens beregnede markedsverdi. Satsen bestemmes av kommunestyret og kan være
          mellom 1 og 7 promille.
        </p>
      </details>
    </TopographicHover>
  );
}
