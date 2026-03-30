import type { Metadata } from "next";
import NoiseCard from "@/components/NoiseCard";
import TransitCard from "@/components/TransitCard";
import PriceTrendCard from "@/components/PriceTrendCard";
import ComparableSalesCard from "@/components/ComparableSalesCard";
import PropertyMap from "@/components/PropertyMap";
import EmailCapture from "@/components/EmailCapture";
import Logo from "@/components/Logo";
import AddressSearch from "@/components/AddressSearch";

interface PageProps {
  params: { slug: string };
  searchParams: {
    lat?: string;
    lon?: string;
    knr?: string;
    adresse?: string;
    pnr?: string;
    poststed?: string;
  };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const address = searchParams.adresse || decodeURIComponent(params.slug);
  const title = `${address} — Verdikart`;
  const description = `Kollektivtransport, prisutvikling og markedsdata for ${address}. Få full eiendomsinnsikt på Verdikart.`;
  // Canonical strips query params — the slug alone is the stable URL
  const canonicalUrl = `https://verdikart.no/eiendom/${params.slug}`;
  const pageUrl = `https://verdikart.no/eiendom/${params.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "Verdikart",
      locale: "nb_NO",
      type: "website",
      images: [
        {
          url: `https://verdikart.no/eiendom/${params.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `Eiendomsdata for ${address} — Verdikart`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`https://verdikart.no/eiendom/${params.slug}/opengraph-image`],
    },
  };
}

export default function EiendomPage({ params, searchParams }: PageProps) {
  const { lat, lon, knr, adresse } = searchParams;

  if (!lat || !lon) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold">Ingen adresse valgt</h1>
        <p className="mt-3 text-text-secondary">
          Vennligst søk etter en adresse fra{" "}
          <a href="/" className="text-accent hover:underline">
            forsiden
          </a>{" "}
          for å se eiendomsdata.
        </p>
      </div>
    );
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  const kommunenummer = knr || "";
  const displayAddress = adresse || decodeURIComponent(params.slug);

  return (
    <div className="flex min-h-screen flex-col">
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
      <header className="mb-8">
        <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          {displayAddress}
        </h1>
        <p className="mt-2 mb-6 text-text-secondary">
          Eiendomsoversikt og områdesdata
        </p>
        <AddressSearch initialValue={displayAddress} />
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 [&>*:last-child:nth-child(odd)]:md:col-span-2">
        <NoiseCard lat={latNum} lon={lonNum} />
        <TransitCard lat={latNum} lon={lonNum} address={displayAddress} />
        <PriceTrendCard kommunenummer={kommunenummer} postnummer={searchParams.pnr ?? ""} />
        <ComparableSalesCard kommunenummer={kommunenummer} />
        <div className="md:col-span-2">
          <PropertyMap lat={latNum} lon={lonNum} address={displayAddress} />
        </div>
      </div>

      {/* Email capture */}
      <div className="mt-8">
        <EmailCapture address={displayAddress} />
      </div>

      {/* Data source trust strip */}
      <div className="mt-8 flex flex-wrap items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-3">
        <span className="text-xs text-text-tertiary mr-1">Basert på data fra</span>
        {[
          { label: "SSB", href: "https://www.ssb.no", title: "Statistisk sentralbyrå — boligpriser" },
          { label: "Kartverket", href: "https://kartverket.no", title: "Kartverket — adresse og eiendomsdata" },
          { label: "Entur", href: "https://entur.no", title: "Entur — kollektivtransport" },
        ].map(({ label, href, title }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={title}
            className="inline-flex items-center rounded-full border border-card-border bg-background px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground"
          >
            {label}
          </a>
        ))}
        <span className="ml-auto text-xs text-text-tertiary hidden sm:block">
          Oppdatert løpende
        </span>
      </div>
    </div>

    <footer className="mt-12 border-t border-card-border px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <span className="text-sm text-text-tertiary">
          <a href="/" className="flex items-center gap-2">
            <Logo className="h-5 w-5 shrink-0 opacity-60" />
            <span>&copy; {new Date().getFullYear()} Verdikart &mdash; Data fra SSB, Kartverket og Entur</span>
          </a>
        </span>
        <nav className="flex gap-6">
          <a href="/" className="text-sm text-text-secondary transition-colors hover:text-foreground">Hjem</a>
          <a href="/om-oss" className="text-sm text-text-secondary transition-colors hover:text-foreground">Om oss</a>
          <a href="/personvern" className="text-sm text-text-secondary transition-colors hover:text-foreground">Personvern</a>
          <a href="/vilkar" className="text-sm text-text-secondary transition-colors hover:text-foreground">Vilkår</a>
        </nav>
      </div>
    </footer>
    </div>
  );
}
