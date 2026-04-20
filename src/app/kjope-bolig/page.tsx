import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Home, Search, Key, FileCheck, Handshake } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import AddressSearch from "@/components/AddressSearch";

export const metadata: Metadata = {
  title: "Kjøpe bolig 2026 – Alt du trenger å vite | Verdikart",
  description: "Guide til å kjøpe bolig i 2026. Prisestimater, boliglån, nabolagsdata og nøkkeltall for alle norske byer. Gratis analyse på Verdikart.",
  alternates: { canonical: "https://verdikart.no/kjope-bolig" },
  openGraph: {
    title: "Kjøpe bolig 2026 – Alt du trenger å vite | Verdikart",
    description: "Guide til å kjøpe bolig i 2026. Prisestimater, boliglån, nabolagsdata og nøkkeltall for alle norske byer. Gratis analyse på Verdikart.",
    url: "https://verdikart.no/kjope-bolig",
    siteName: "Verdikart",
    locale: "nb_NO",
    type: "website",
  },
};

function fmt(n: number) {
  return n.toLocaleString("nb-NO");
}

const steps = [
  { icon: Home, title: "Finn budsjettet", text: "Kartlegg hva du har råd til basert på inntekt, egenkapital og gjeld." },
  { icon: FileCheck, title: "Forhåndsgodkjenning", text: "Få finansieringsbevis fra banken — gir trygghet på visning." },
  { icon: Search, title: "Søk og vis", text: "Finn boliger som matcher dine kriterier og dra på visning." },
  { icon: Handshake, title: "Legg inn bud", text: "Gi bud og forhandel med selger. Akseptert bud er bindende." },
  { icon: Key, title: "Overtakelse", text: "Signer kontrakt, betal og få nøklene til din nye bolig." },
];

const cities = [
  { name: "Oslo", slug: "oslo", price: "94 200 kr/m²" },
  { name: "Bergen", slug: "bergen", price: "62 400 kr/m²" },
  { name: "Trondheim", slug: "trondheim", price: "55 800 kr/m²" },
  { name: "Stavanger", slug: "stavanger", price: "48 500 kr/m²" },
];

const faq = [
  {
    q: "Hva er egenkapitalkravet i 2026?",
    a: "Minst 15 % av kjøpesummen (10 % for førstegangskjøpere under 34 år i visse kommuner). Typisk 600 000–800 000 kr for en Oslo-leilighet.",
  },
  {
    q: "Hva er gjennomsnittsprisen per kvadratmeter i Norge?",
    a: "Nasjonalt gjennomsnitt er ca. 52 800 kr/m² (SSB 2024). Oslo ligger på 94 200 kr/m², Bergen 62 400 kr/m².",
  },
  {
    q: "Hvor lang tid tar boligkjøpsprosessen?",
    a: "Typisk 2–6 måneder fra beslutning til overtakelse. Forhåndsgodkjenning tar 1–3 dager, visning og bud 2–8 uker, overtakelse 4–6 uker etter aksept.",
  },
  {
    q: "Hva er dokumentavgiften?",
    a: "2,5 % av kjøpesummen for eiendom (ikke andels- eller aksjeleiligheter). For en bolig til 4 mill = 100 000 kr.",
  },
];

export default function FinnBoligPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hjem", item: "https://verdikart.no" },
      { "@type": "ListItem", position: 2, name: "Kjøpe bolig", item: "https://verdikart.no/kjope-bolig" },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={faqSchema} />

      <div className="min-h-screen bg-background text-foreground">

        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse at 50% -10%, rgb(var(--accent-rgb) / 0.18) 0%, rgba(59,130,246,0.06) 40%, transparent 70%)",
            }}
          />
          <nav className="mb-6 flex items-center justify-center gap-1.5 text-xs text-text-tertiary">
            <Link href="/" className="hover:text-foreground transition-colors">Hjem</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-text-secondary">Kjøpe bolig</span>
          </nav>

          <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            <span
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, var(--accent-hover) 45%, var(--accent-hover) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Kjøpe bolig i 2026
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-secondary sm:mt-5 sm:text-lg">
            Alt du trenger å vite om boligkjøp — fra budsjett til nøkkeloverlevering.
          </p>

          <div className="mx-auto mt-8 w-full max-w-xl sm:mt-10">
            <AddressSearch />
          </div>
          <p className="mt-3 text-xs text-text-tertiary">Søk på en adresse for å se prisestimat, nabolagsdata og transport</p>
        </section>

        {/* Stats strip */}
        <section className="border-y border-card-border bg-card-bg px-4 py-8 sm:px-6">
          <h2 className="mb-6 text-center text-lg font-semibold">Hva koster det å kjøpe bolig?</h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">{fmt(5200000)}</p>
              <p className="mt-1 text-xs text-text-tertiary">Oslos medianpris</p>
              <p className="mt-0.5 text-[10px] text-text-tertiary/60">SSB 2024</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">{fmt(4100000)}</p>
              <p className="mt-1 text-xs text-text-tertiary">Norgessnitt</p>
              <p className="mt-0.5 text-[10px] text-text-tertiary/60">SSB 2024</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-green-400">+4,3%</p>
              <p className="mt-1 text-xs text-text-tertiary">Prisendring 2024</p>
              <p className="mt-0.5 text-[10px] text-text-tertiary/60">Nasjonalt snitt</p>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">

          {/* Steps */}
          <section className="mb-12">
            <h2 className="mb-6 text-xl font-semibold">Steg-for-steg: Fra drøm til nøkkel</h2>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={step.title} className="flex gap-4 rounded-xl border border-card-border bg-card-bg p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <step.icon className="h-4 w-4 text-accent" strokeWidth={1.5} />
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-text-secondary">
              Usikker på hva du har råd til? <Link href="/kalkulator" className="text-accent hover:underline">Prøv boligkalkulatoren</Link>.
            </p>
          </section>

          {/* Popular cities */}
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold">Populære byer</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/by/${city.slug}`}
                  className="group rounded-xl border border-card-border bg-card-bg p-4 transition-colors hover:border-accent/40"
                >
                  <p className="font-semibold group-hover:text-accent transition-colors">{city.name}</p>
                  <p className="mt-1 text-xs text-text-tertiary">{city.price}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold">Vanlige spørsmål om boligkjøp</h2>
            <div className="space-y-3">
              {faq.map(({ q, a }) => (
                <div key={q} className="rounded-xl border border-card-border bg-card-bg p-5">
                  <h3 className="mb-2 font-semibold">{q}</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Internal links */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/kalkulator"
              className="rounded-lg border border-card-border bg-card-bg px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
            >
              Boligkalkulator
            </Link>
            <Link
              href="/by/oslo"
              className="rounded-lg border border-card-border bg-card-bg px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
            >
              Boligmarkedet i Oslo
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
