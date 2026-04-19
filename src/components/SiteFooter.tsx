import Logo from "@/components/Logo";
import EmailCapture from "@/components/EmailCapture";

export default function SiteFooter() {
  return (
    <footer className="border-t border-card-border px-4 pt-12 pb-8 sm:px-6 sm:pt-14 no-print">
      <div className="mx-auto max-w-5xl">

        {/* Top: brand block + inline email */}
        <div className="mb-10 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <a href="/" className="mb-3 flex items-center gap-2">
              <Logo className="h-7 w-7 shrink-0" />
              <span className="text-base font-bold tracking-tight text-foreground">Verdikart</span>
            </a>
            <p className="text-sm leading-relaxed text-text-secondary">
              Data fra Kartverket, Entur og SSB. Ingen provisjon, ingen agenda.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a href="https://x.com/Verdikart" target="_blank" rel="noopener noreferrer" aria-label="X"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-card-bg text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/michael-h-7723993bb/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-card-bg text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Inline email */}
          <div className="w-full max-w-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Hold deg oppdatert</p>
            <p className="mb-3 text-sm text-text-secondary">Nye funksjoner og markedsanalyser direkte i innboksen.</p>
            <EmailCapture compact />
          </div>
        </div>

        {/* Nav columns */}
        <div className="mb-8 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
          <div className="space-y-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Byer</p>
            {[["Oslo","/by/oslo"],["Bergen","/by/bergen"],["Trondheim","/by/trondheim"],["Stavanger","/by/stavanger"],["Bærum","/by/baerum"],["Kristiansand","/by/kristiansand"]].map(([l,h]) => (
              <a key={h} href={h} className="block text-text-secondary transition-colors hover:text-foreground">{l}</a>
            ))}
            <p className="mb-1 mt-4 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Nabolag</p>
            {[["Frogner","/nabolag/frogner"],["Grünerløkka","/nabolag/grunerlokka"],["Majorstuen","/nabolag/majorstuen"],["Nordnes","/nabolag/nordnes"]].map(([l,h]) => (
              <a key={h} href={h} className="block text-text-secondary transition-colors hover:text-foreground">{l}</a>
            ))}
          </div>
          <div className="space-y-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Flere byer</p>
            {[["Fredrikstad","/by/fredrikstad"],["Drammen","/by/drammen"],["Tromsø","/by/tromso"],["Sandnes","/by/sandnes"],["Bodø","/by/bodoe"],["Skien","/by/skien"],["Sarpsborg","/by/sarpsborg"],["Arendal","/by/arendal"],["Hamar","/by/hamar"]].map(([l,h]) => (
              <a key={h} href={h} className="block text-text-secondary transition-colors hover:text-foreground">{l}</a>
            ))}
          </div>
          <div className="space-y-2 mt-6 sm:mt-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">For deg</p>
            {[["Førstegangskjøper","/for/forstegangskjoper"],["Boliginvestor","/for/boliginvestor"],["Barnefamilier","/for/barnefamilier"],["Selger","/for/selger"],["Sammenlign adresser","/sammenlign"],["Boligkalkulator","/kalkulator"],["Bykart","/bykart"],["Data & metodologi","/data"],["Blogg","/blogg"],["FAQ","/faq"]].map(([l,h]) => (
              <a key={h} href={h} className="block text-text-secondary transition-colors hover:text-foreground">{l}</a>
            ))}
          </div>
          <div className="space-y-2 mt-6 sm:mt-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Selskapet</p>
            {[["Om oss","/om-oss"],["Kontakt","/kontakt"],["Presse","/presse"],["Endringslogg","/changelog"],["Personvern","/personvern"],["Vilkår","/vilkar"]].map(([l,h]) => (
              <a key={h} href={h} className="block text-text-secondary transition-colors hover:text-foreground">{l}</a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-2 border-t border-card-border pt-6 text-xs text-text-tertiary sm:flex-row">
          <span suppressHydrationWarning>&copy; {new Date().getFullYear()} Verdikart. Data fra SSB, Kartverket og Entur.</span>
          <span>Laget i Oslo 🇳🇴</span>
        </div>

      </div>
    </footer>
  );
}
