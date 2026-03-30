export default function OmOss() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background text-foreground px-6 py-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Om Verdikart</h1>
        <p className="text-lg text-text-secondary leading-relaxed mb-12">
          Norges smarteste verktøy for boligkjøpere. Vi samler data fra offentlige
          kilder slik at du kan ta informerte beslutninger før du kjøper bolig.
        </p>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Hva er Verdikart?</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Verdikart er et eiendomsintelligens-verktøy bygget for norske
            boligkjøpere. Vi gir deg innsikt i støynivå, kollektivtransport,
            prisutvikling og mer — samlet på ett sted, slik at du kan forstå
            boligen og området før du tar en av livets største beslutninger.
          </p>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Hvorfor Verdikart?</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Boligkjøp er en stor investering, og mange kjøpere mangler tilgang til
            viktig informasjon om området de vurderer. Verdikart ble laget for å
            gjøre denne informasjonen tilgjengelig, oversiktlig og lett å forstå
            — slik at du kan ta bedre beslutninger.
          </p>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Datakilder</h2>
          <p className="text-sm leading-relaxed text-text-secondary mb-4">
            Verdikart bruker kun åpne og offentlig tilgjengelige data fra
            troverdige norske kilder:
          </p>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">-</span>
              <span><strong className="text-foreground">Kartverket</strong> — Adressedata og eiendomsinformasjon</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">-</span>
              <span><strong className="text-foreground">Entur</strong> — Kollektivtransport og holdeplasser</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">-</span>
              <span><strong className="text-foreground">SSB</strong> — Statistikk og prisutvikling</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">-</span>
              <span><strong className="text-foreground">Geonorge</strong> — Støykart og geografiske data</span>
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-card-border bg-card-bg p-6">
          <h2 className="text-xl font-semibold mb-3">I utvikling</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Vi jobber kontinuerlig med å forbedre Verdikart og legge til nye
            funksjoner. Har du tilbakemeldinger eller forslag? Vi hører gjerne
            fra deg på{" "}
            <a
              href="mailto:kontakt@verdikart.no"
              className="text-accent hover:underline"
            >
              kontakt@verdikart.no
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
