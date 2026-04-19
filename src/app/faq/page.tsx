"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import JsonLd from "@/components/JsonLd";

const faqs = [
  {
    q: "Hva er Verdikart?",
    a: "Verdikart er et gratis verktøy for boligkjøpere i Norge. Du søker på en adresse og får umiddelbart informasjon om nærmeste kollektivtransport og avganger, prisutvikling i kommunen, og sammenlignbare salgspriser i nabolaget. Alt på ett sted, hentet i sanntid fra offentlige kilder.",
  },
  {
    q: "Er dataen oppdatert?",
    a: "Ja. All data hentes live direkte fra kilden når du søker på en adresse. Kollektivdata hentes fra Entur (sanntid), boligprisdata fra Statistisk sentralbyrå (SSB), og adressedata fra Kartverket. Vi lagrer ikke adressene du søker på. Det er ingen database som kan bli utdatert. E-poster du oppgir for prisvarsel lagres hos Formspree.",
  },
  {
    q: "Hvem er Verdikart for?",
    a: "Primært for deg som skal kjøpe bolig og ønsker bedre beslutningsgrunnlag. Verdikart er spesielt nyttig hvis du vil vurdere kollektivtilbudet på en adresse, forstå om prisen er innenfor markedet, eller se hvordan prisene i et område har utviklet seg over tid.",
  },
  {
    q: "Koster det noe å bruke Verdikart?",
    a: "Nei. Verdikart er helt gratis å bruke, og du trenger ikke registrere deg eller opprette en konto. Bare søk på en adresse.",
  },
  {
    q: "Hvilke datakilder bruker dere?",
    a: "Vi bruker fire offentlige, åpne datakilder: Entur for kollektivdata (sanntidsavganger og holdeplasser), SSB (Statistisk sentralbyrå) for boligprisstatistikk, Kartverket for adresse- og eiendomsdata, og OpenStreetMap for skoler, barnehager og nærservice. Alle kildene er offisielle registre eller åpne dataplattformer.",
  },
  {
    q: "Fungerer Verdikart for hele Norge?",
    a: "Ja, for alle adresser med registrert boligdata. Kollektivdata dekker hele landet via Entur. Prisdata er tilgjengelig på kommunenivå for alle norske kommuner via SSB. Noen mindre kommuner kan ha begrenset datagrunnlag.",
  },
  {
    q: "Lagrer dere persondata?",
    a: "Vi lagrer ikke adresser du søker på eller noen annen aktivitetsdata. Vi bruker Plausible Analytics for anonym statistikk (ingen cookies, ingen fingerprinting) og anonyme brukeropplevelsesanalyse. Se vår personvernerklæring for detaljer.",
  },
  {
    q: "Kan jeg dele en adresserapport med andre?",
    a: "Ja. Hver adresseside har en unik URL som inneholder koordinater og kommunenummer direkte i adressen. Du kan dele linken og mottaker vil se nøyaktig samme rapport uten å måtte søke på nytt.",
  },
  {
    q: "Hva betyr de ulike kollektivkategoriene?",
    a: "Verdikart viser holdeplasser innen gangavstand (typisk 600–1000 meter) sortert etter transporttype: metro/T-bane, jernbane, trikk, buss og båt. For hver holdeplass vises linjenumre og estimert avganger per time basert på sanntidsdata fra Entur.",
  },
  {
    q: "Hvem har laget Verdikart?",
    a: "Verdikart er utviklet i Oslo med mål om å gjøre boligmarkedet mer transparent for vanlige boligkjøpere. Vi er ikke tilknyttet noen eiendomsmegler, bank eller andre kommersielle aktører.",
  },
];

function AccordionItem({ q, a, open, onToggle, id }: { q: string; a: string; open: boolean; onToggle: () => void; id: string }) {
  const panelId = `faq-panel-${id}`;
  const triggerId = `faq-trigger-${id}`;
  return (
    <div className="rounded-xl border border-card-border bg-card-bg overflow-hidden">
      <h2>
        <button
          id={triggerId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
          aria-expanded={open}
          aria-controls={panelId}
        >
          <span className="text-sm font-semibold leading-snug">{q}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-text-tertiary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        </button>
      </h2>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!open}
        className="border-t border-card-border px-5 pb-5 pt-4"
      >
        <p className="text-sm leading-relaxed text-text-secondary">{a}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <JsonLd schema={faqSchema} />
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mb-10">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <HelpCircle className="h-5 w-5 text-accent" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Vanlige spørsmål</h1>
            <p className="mt-3 text-text-secondary">Alt du lurer på om Verdikart. Klikk for å åpne.</p>
          </div>

          <div className="space-y-2">
            {faqs.map(({ q, a }, i) => (
              <AccordionItem
                key={q}
                q={q}
                a={a}
                id={String(i)}
                open={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              />
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-card-border bg-card-bg p-5 text-sm text-text-secondary">
            Fant du ikke svaret du lette etter?{" "}
            <a href="/kontakt" className="text-accent hover:underline">Ta kontakt</a>. Vi svarer raskt.
          </div>
        </div>
      </div>
    </>
  );
}
