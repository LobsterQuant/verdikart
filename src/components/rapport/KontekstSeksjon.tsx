export default function KontekstSeksjon() {
  return (
    <section aria-labelledby="kontekst" className="mb-16">
      <h2
        id="kontekst"
        className="text-xl font-semibold text-foreground sm:text-2xl"
      >
        Hvorfor øker hytte-tvangssalgene?
      </h2>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <article className="rounded-xl border border-card-border bg-card-bg p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
            Rentepress
          </h3>
          <p className="text-sm leading-relaxed text-text-secondary">
            Norges Bank har holdt styringsrenten på 4 prosent siden september
            2025. Boliglånsrenten ligger over 5 prosent. For husholdninger med
            både hytte og bolig er hyttegjelden førstelinjen å nedprioritere
            når økonomien strammer til.
          </p>
        </article>

        <article className="rounded-xl border border-card-border bg-card-bg p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
            Sekundærboligen taper først
          </h3>
          <p className="text-sm leading-relaxed text-text-secondary">
            I motsetning til primærboligen — der det finnes betydelige
            sikkerhetsventiler for å unngå tvangssalg — har hytte-eiere færre
            juridiske beskyttelser. Banker kan og gjør ofte tvangssalg
            raskere på sekundær eiendom.
          </p>
        </article>

        <article className="rounded-xl border border-card-border bg-card-bg p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
            Hva tallene ikke fanger opp
          </h3>
          <p className="text-sm leading-relaxed text-text-secondary">
            De 98 gjennomførte tvangssalgene i 2025 er toppen av isfjellet.
            For hvert gjennomført tvangssalg finnes det mange frivillige salg
            hvor eieren selger før tingretten stadfester. Det faktiske antall
            nødsalg av hytter er høyere.
          </p>
        </article>
      </div>
    </section>
  );
}
