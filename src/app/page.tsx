import AddressSearch from "@/components/AddressSearch";

const valueProps = [
  {
    icon: "🔇",
    title: "Støynivå",
    description:
      "Se detaljert støykart for vei-, tog- og flytrafikk. Forstå hvordan støy påvirker hverdagen før du kjøper.",
  },
  {
    icon: "🚌",
    title: "Kollektivtransport",
    description:
      "Finn nærmeste holdeplasser, avganger og reisetid til sentrum. Alt du trenger for å vurdere beliggenheten.",
  },
  {
    icon: "📈",
    title: "Prisutvikling",
    description:
      "Følg boligprisene i området over tid. Se trender og sammenlign med resten av kommunen.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-24 text-center">
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Forstå boligen.
          <br />
          <span className="text-text-secondary">Ikke bare se den.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
          Verdikart gir deg innsikten du trenger før du kjøper bolig. Støy,
          transport, prisutvikling — alt på ett sted.
        </p>

        <div className="mt-10 w-full max-w-xl">
          <AddressSearch />
        </div>
      </main>

      {/* Value Props */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          {valueProps.map((prop) => (
            <div
              key={prop.title}
              className="rounded-xl border border-card-border bg-card-bg p-6 transition-colors hover:border-accent/30"
            >
              <div className="mb-4 text-3xl">{prop.icon}</div>
              <h3 className="mb-2 text-lg font-semibold">{prop.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {prop.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm text-text-tertiary">
            &copy; 2026 Verdikart
          </span>
          <nav className="flex gap-6">
            <a
              href="/om"
              className="text-sm text-text-secondary transition-colors hover:text-foreground"
            >
              Om oss
            </a>
            <a
              href="/personvern"
              className="text-sm text-text-secondary transition-colors hover:text-foreground"
            >
              Personvern
            </a>
            <a
              href="/vilkar"
              className="text-sm text-text-secondary transition-colors hover:text-foreground"
            >
              Vilkår
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
