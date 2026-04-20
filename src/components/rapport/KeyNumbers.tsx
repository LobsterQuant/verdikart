import { TVANGSSALG_2026_DATA } from "@/data/rapport/tvangssalg-2026";

export default function KeyNumbers() {
  const { keyNumbers } = TVANGSSALG_2026_DATA;

  return (
    <section aria-labelledby="nokkeltall" className="mb-16">
      <h2 id="nokkeltall" className="sr-only">
        Nøkkeltall
      </h2>
      <div className="grid gap-3 xs:grid-cols-2 lg:grid-cols-4">
        {keyNumbers.map((n, i) => {
          const isHighlight = i === 0;
          return (
            <div
              key={n.label}
              className={`rounded-xl border p-5 ${
                isHighlight
                  ? "border-accent/40 bg-accent/5"
                  : "border-card-border bg-card-bg"
              }`}
            >
              <div
                className={`font-display text-3xl font-bold sm:text-4xl ${
                  isHighlight ? "text-accent" : "text-foreground"
                }`}
              >
                {n.value}
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">
                {n.label}
              </div>
              <div className="mt-1 text-xs leading-relaxed text-text-tertiary">
                {n.sub}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
