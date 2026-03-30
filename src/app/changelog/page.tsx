import type { Metadata } from "next";
import { GitCommit, Zap, Bug, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Endringslogg | Verdikart",
  description: "Se hva som er nytt i Verdikart. Vi oppdaterer jevnlig med nye funksjoner, forbedringer og feilrettinger.",
  alternates: { canonical: "https://verdikart.no/changelog" },
};

type ChangeType = "feature" | "fix" | "improvement";

interface ChangeEntry {
  version: string;
  date: string;
  label: string;
  items: Array<{ type: ChangeType; text: string }>;
}

const changelog: ChangeEntry[] = [
  {
    version: "0.5",
    date: "30. mars 2026",
    label: "Design & SEO",
    items: [
      { type: "feature", text: "By-landingssider for Oslo, Bergen og Trondheim med lokal SEO-innhold og FAQ" },
      { type: "feature", text: "JSON-LD strukturert data: FAQPage, LocalBusiness, BreadcrumbList og RealEstateListing" },
      { type: "improvement", text: "Ny fargepallette med indigo/slate-toner — dypere og mer profesjonelt utseende" },
      { type: "improvement", text: "Gradient headline og noise-tekstur på hero-seksjonen" },
      { type: "improvement", text: "Søkefelt med gradient border og glow-effekt" },
      { type: "improvement", text: "Feature cards med 3D-tilt og spotlight hover-effekter" },
      { type: "feature", text: "Animasjoner: staggered fade-up på hero, count-up tall i demoen, sparkline draw-animasjon" },
      { type: "feature", text: "Microsoft Clarity integrert for varmekart og sesjonopptak" },
      { type: "fix", text: "Kartvisning byttet til CartoDB DarkMatter tiles — ikke lenger svart" },
      { type: "fix", text: "Kontrastforhold for tertær tekst økt til 4.6:1 (WCAG AA)" },
    ],
  },
  {
    version: "0.4",
    date: "29. mars 2026",
    label: "Sikkerhet & ytelse",
    items: [
      { type: "feature", text: "Sikkerhetshoder: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy" },
      { type: "improvement", text: "Lighthouse: 96 ytelse / 100 tilgjengelighet / 100 beste praksis / 100 SEO" },
      { type: "feature", text: "Plausible Analytics — personvernvennlig, ingen cookies" },
      { type: "improvement", text: "GDPR-compliant e-postinnsamling med eksplisitt samtykke og avmeldingslenke" },
    ],
  },
  {
    version: "0.3",
    date: "28. mars 2026",
    label: "Delbare URL-er & ikoner",
    items: [
      { type: "feature", text: "Koordinater kodet direkte i URL-slug — resultatsider er selvstendige og delbare" },
      { type: "improvement", text: "Alle emoji byttet ut med Lucide SVG-ikoner" },
      { type: "improvement", text: "Produktforhåndsvisning på forsiden med reelle eksempeldata" },
      { type: "fix", text: "Ubrukt MapPin-import fjernet" },
    ],
  },
  {
    version: "0.2",
    date: "27. mars 2026",
    label: "Kollektivdata & søk",
    items: [
      { type: "feature", text: "Nærmeste holdeplasser med linje­numre, transportmode og avganger per time" },
      { type: "improvement", text: "Holdeplasser uten avganger filtreres ut automatisk" },
      { type: "improvement", text: "Linjesortering: metro → jernbane → trikk → buss → båt" },
      { type: "feature", text: "Formspree e-postabonnement koblet til truenordiccapital@gmail.com" },
    ],
  },
  {
    version: "0.1",
    date: "25. mars 2026",
    label: "Lansering",
    items: [
      { type: "feature", text: "Adressesøk med autofullføring mot Kartverket" },
      { type: "feature", text: "Kollektivkort med Entur live-data" },
      { type: "feature", text: "Prisutviklingskort med SSB-data" },
      { type: "feature", text: "Sammenlignbare salg — gjennomsnittlig kr/m² per kommune" },
      { type: "feature", text: "Kartvisning med holdeplasser og eiendomsmarkør" },
    ],
  },
];

const typeConfig: Record<ChangeType, { icon: React.ElementType; color: string; label: string }> = {
  feature: { icon: Star, color: "text-accent", label: "Ny funksjon" },
  improvement: { icon: Zap, color: "text-yellow-400", label: "Forbedring" },
  fix: { icon: Bug, color: "text-green-400", label: "Feilretting" },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <GitCommit className="h-5 w-5 text-accent" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Endringslogg</h1>
          <p className="mt-3 text-text-secondary">Verdikart er i aktiv utvikling. Her er en oversikt over hva som er nytt.</p>
        </div>

        <div className="space-y-10">
          {changelog.map((entry) => (
            <div key={entry.version}>
              {/* Version header */}
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent">
                  v{entry.version}
                </span>
                <span className="font-semibold">{entry.label}</span>
                <span className="ml-auto text-xs text-text-tertiary">{entry.date}</span>
              </div>

              {/* Items */}
              <div className="space-y-2 rounded-xl border border-card-border bg-card-bg p-4">
                {entry.items.map(({ type, text }) => {
                  const { icon: Icon, color } = typeConfig[type];
                  return (
                    <div key={text} className="flex items-start gap-2.5 py-1">
                      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} strokeWidth={1.5} />
                      <span className="text-sm text-text-secondary">{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-xs text-text-tertiary">
          Har du forslag til forbedringer?{" "}
          <a href="/kontakt" className="text-accent hover:underline">Send oss en melding.</a>
        </div>
      </div>
    </div>
  );
}
