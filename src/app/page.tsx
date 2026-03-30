import AddressSearch from "@/components/AddressSearch";
import { Bus, TrendingUp, Home } from "lucide-react";

const valueProps = [
  {
    Icon: Bus,
    title: "Kollektivtransport",
    description:
      "Finn nærmeste holdeplasser, avganger og reisetid til sentrum. Alt du trenger for å vurdere beliggenheten.",
  },
  {
    Icon: TrendingUp,
    title: "Prisutvikling",
    description:
      "Følg boligprisene i kommunen over tid. Se trender og sammenlign med resten av landet.",
  },
  {
    Icon: Home,
    title: "Sammenlignbare salg",
    description:
      "Se gjennomsnittlig kvadratmeterpris for din kommune. Forstå hva lignende boliger faktisk omsettes for.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-24">
        <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Forstå boligen.
          <br />
          <span className="text-text-secondary">Ikke bare se den.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary sm:mt-6 sm:text-lg">
          Verdikart gir deg innsikten du trenger før du kjøper bolig.
          Transport, prisutvikling og markedsdata — alt på ett sted.
        </p>

        <div className="mt-8 w-full max-w-xl sm:mt-10">
          <AddressSearch />
        </div>
      </main>

      {/* Value Props */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {valueProps.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-card-border bg-card-bg p-6 transition-colors hover:border-accent/30"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm text-text-tertiary">
            &copy; 2026 Verdikart
          </span>
          <nav className="flex gap-6">
            <a href="/om-oss" className="text-sm text-text-secondary transition-colors hover:text-foreground">Om oss</a>
            <a href="/personvern" className="text-sm text-text-secondary transition-colors hover:text-foreground">Personvern</a>
            <a href="/vilkar" className="text-sm text-text-secondary transition-colors hover:text-foreground">Vilkår</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
