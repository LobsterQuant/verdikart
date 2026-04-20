import Link from "next/link";
import { ChevronRight } from "lucide-react";
import RapportHero from "@/components/rapport/RapportHero";
import KeyNumbers from "@/components/rapport/KeyNumbers";
import TrendChart from "@/components/rapport/TrendChart";
import KontekstSeksjon from "@/components/rapport/KontekstSeksjon";
import KategoriTable from "@/components/rapport/KategoriTable";
import KvartalsDetalj from "@/components/rapport/KvartalsDetalj";
import MetodeSeksjon from "@/components/rapport/MetodeSeksjon";
import OppdateringCTA from "@/components/rapport/OppdateringCTA";
import DownloadCTA from "@/components/rapport/DownloadCTA";

export default function HytteTvangssalg2026() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <nav
          aria-label="Brødsmuler"
          className="mb-8 flex items-center gap-1.5 text-xs text-text-tertiary"
        >
          <Link href="/" className="hover:text-foreground transition-colors">
            Hjem
          </Link>
          <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
          <Link href="/rapporter" className="hover:text-foreground transition-colors">
            Markedsrapporter
          </Link>
          <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
          <span className="text-text-secondary">Hytte-tvangssalg 2026</span>
        </nav>

        <RapportHero />

        <KeyNumbers />

        <section aria-labelledby="trend" className="mb-16">
          <div className="mb-5">
            <h2
              id="trend"
              className="text-xl font-semibold text-foreground sm:text-2xl"
            >
              Tvangssalg siden 2020: rullerende årssum
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Fritidseiendom (mint-linje, høyre akse) mot alle eiendommer
              samlet (grå, venstre akse). Rullerende 4-kvartalers sum glatter
              ut sesongvariasjon.
            </p>
          </div>
          <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-5">
            <TrendChart />
          </div>
        </section>

        <KontekstSeksjon />

        <KategoriTable />

        <KvartalsDetalj />

        <MetodeSeksjon />

        <OppdateringCTA />

        <DownloadCTA />

        <section className="mb-12">
          <Link
            href="/rapporter"
            className="group flex items-center justify-between gap-4 rounded-xl border border-card-border bg-card-bg px-5 py-4 transition-colors hover:border-accent/40"
          >
            <div>
              <div className="text-sm font-semibold text-foreground">
                Les flere markedsrapporter
              </div>
              <div className="text-xs text-text-tertiary">
                Oversikt over alle Verdikart-rapporter og hva som kommer neste kvartal
              </div>
            </div>
            <span className="text-xs font-medium text-accent transition-transform group-hover:translate-x-0.5">
              Se oversikten →
            </span>
          </Link>
        </section>

        <footer className="mt-8 border-t border-card-border pt-6 text-xs text-text-tertiary">
          <p>
            Verdikart er en uavhengig data-tjeneste for norsk eiendom. For
            presseforespørsler om denne rapporten, kontakt{" "}
            <a
              href="mailto:presse@verdikart.no"
              className="underline underline-offset-2 hover:text-foreground"
            >
              presse@verdikart.no
            </a>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}
