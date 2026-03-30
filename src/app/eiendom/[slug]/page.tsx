import type { Metadata } from "next";
import NoiseCard from "@/components/NoiseCard";
import TransitCard from "@/components/TransitCard";
import PriceTrendCard from "@/components/PriceTrendCard";
import ComparableSalesCard from "@/components/ComparableSalesCard";
import PropertyMap from "@/components/PropertyMap";
import EmailCapture from "@/components/EmailCapture";
import Logo from "@/components/Logo";
import JsonLd from "@/components/JsonLd";
import AddressSearch from "@/components/AddressSearch";
import CardsCascade from "@/components/CardsCascade";

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
  let address = searchParams.adresse;
  if (!address) {
    const slugParsed = parseSlug(params.slug);
    if (slugParsed.lat && slugParsed.lon) {
      address = (await reverseGeocode(slugParsed.lat, slugParsed.lon)) ?? undefined;
    }
    if (!address) {
      address = decodeURIComponent(params.slug)
        .replace(/--\d+-\d+-\d{4}$/, "")
        .replace(/-+/g, " ")
        .trim();
    }
  }
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

/** Parse lat/lon/knr from slug encoded as: <human-slug>--<lat4>-<lon4>-<knr> */
function parseSlug(slug: string): { lat: number | null; lon: number | null; knr: string } {
  // New format: ends with --<lat>-<lon>-<knr>
  const match = slug.match(/--(-?\d+)-(-?\d+)-(\d{4})$/);
  if (match) {
    return {
      lat: parseInt(match[1], 10) / 1e4,
      lon: parseInt(match[2], 10) / 1e4,
      knr: match[3],
    };
  }
  return { lat: null, lon: null, knr: "" };
}

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const url = `https://ws.geonorge.no/adresser/v1/punktsok?lat=${lat}&lon=${lon}&radius=50&utkoordsys=4258&treffPerSide=1`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    const hit = data?.adresser?.[0];
    if (!hit) return null;
    // Build display string: "Bygdøy allé 2, Oslo"
    const parts = [hit.adressetekst, hit.poststed].filter(Boolean);
    return parts.join(", ");
  } catch {
    return null;
  }
}

export default async function EiendomPage({ params, searchParams }: PageProps) {
  const { lat, lon, knr, adresse } = searchParams;

  // Try query params first (legacy / direct navigation), then decode from slug
  const slugParsed = parseSlug(params.slug);
  const latNum = lat ? parseFloat(lat) : slugParsed.lat;
  const lonNum = lon ? parseFloat(lon) : slugParsed.lon;
  const kommunenummer = knr || slugParsed.knr || "";

  // Address display priority:
  //   1. ?adresse= query param (always set on normal navigation)
  //   2. reverse-geocode from slug lat/lon (shared URLs without query params)
  //   3. lossy slug decode (last resort — known to strip Norwegian chars)
  let displayAddress: string;
  if (adresse) {
    displayAddress = adresse;
  } else if (latNum && lonNum) {
    displayAddress =
      (await reverseGeocode(latNum, lonNum)) ??
      decodeURIComponent(params.slug)
        .replace(/--\d+-\d+-\d{4}$/, "")
        .replace(/-+/g, " ")
        .trim();
  } else {
    displayAddress = decodeURIComponent(params.slug)
      .replace(/--\d+-\d+-\d{4}$/, "")
      .replace(/-+/g, " ")
      .trim();
  }

  if (!latNum || !lonNum) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto w-full max-w-xl">
          <h1 className="mb-2 text-2xl font-bold">Søk på en adresse</h1>
          <p className="mb-8 text-text-secondary">
            Skriv inn adressen du vil sjekke — transport, priser og nabolagsdata hentes automatisk.
          </p>
          <AddressSearch initialValue={displayAddress !== "eiendom" ? displayAddress : ""} />
          <p className="mt-4 text-xs text-text-tertiary">
            Eksempel: <span className="font-mono">Karl Johans gate 1, Oslo</span>
          </p>
        </div>
      </div>
    );
  }

    const canonicalUrl = `https://verdikart.no/eiendom/${params.slug}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Hjem",
        "item": "https://verdikart.no"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": displayAddress,
        "item": canonicalUrl
      }
    ]
  };

  const realEstateSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": displayAddress,
    "url": canonicalUrl,
    "description": `Kollektivtransport, prisutvikling og markedsdata for ${displayAddress}. Få full eiendomsinnsikt på Verdikart.`,
    "inLanguage": "nb-NO",
    "provider": {
      "@type": "Organization",
      "name": "Verdikart",
      "url": "https://verdikart.no"
    },
    ...(latNum && lonNum ? {
      "locationCreatedIn": {
        "@type": "Place",
        "name": displayAddress,
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": latNum,
          "longitude": lonNum
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": displayAddress,
          "addressCountry": "NO",
          ...(kommunenummer ? { "addressRegion": kommunenummer } : {})
        }
      }
    } : {})
  };

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={realEstateSchema} />
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

      <CardsCascade className="grid grid-cols-1 gap-6 md:grid-cols-2 [&>*:last-child:nth-child(odd)]:md:col-span-2">
        {[
          <NoiseCard key="noise" lat={latNum} lon={lonNum} />,
          <TransitCard key="transit" lat={latNum} lon={lonNum} address={displayAddress} />,
          <PriceTrendCard key="price" kommunenummer={kommunenummer} postnummer={searchParams.pnr ?? ""} />,
          <ComparableSalesCard key="sales" kommunenummer={kommunenummer} />,
          <div key="map" className="md:col-span-2 no-print">
            <PropertyMap lat={latNum} lon={lonNum} address={displayAddress} />
          </div>,
        ]}
      </CardsCascade>

      {/* Email capture */}
      <div className="mt-8 no-print">
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
    </>
  );
}
