import type { Metadata } from "next";
import NoiseCard from "@/components/NoiseCard";
import TransitCard from "@/components/TransitCard";
import SchoolsCard from "@/components/SchoolsCard";
import CrimeCard from "@/components/CrimeCard";
import FinnLink from "@/components/FinnLink";
import FellesgjeldReminder from "@/components/FellesgjeldReminder";
import SaveAddressButton from "@/components/SaveAddressButton";
import PropertyEnergimerke from "@/components/PropertyEnergimerke";
import PriceTrendCard from "@/components/PriceTrendCard";
import ComparableSalesCard from "@/components/ComparableSalesCard";
import PropertyMap from "@/components/PropertyMap";
import EmailCapture from "@/components/EmailCapture";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";
import AddressSearch from "@/components/AddressSearch";
import CardsCascade from "@/components/CardsCascade";
import PropertyShareBar from "@/components/PropertyShareBar";
import NearbyProperties from "@/components/NearbyProperties";
import AISummary from "@/components/AISummary";
import ValuationCard from "@/components/ValuationCard";
import ClimateRiskCard from "@/components/ClimateRiskCard";
import AirQualityCard from "@/components/AirQualityCard";
import AmenitiesCard from "@/components/AmenitiesCard";
import BroadbandCard from "@/components/BroadbandCard";

import NeighborhoodReviewsCard from "@/components/NeighborhoodReviewsCard";
import PdfExportButton from "@/components/PdfExportButton";
import CardErrorBoundary from "@/components/CardErrorBoundary";
import DemographicsCard from "@/components/DemographicsCard";
import EnvironmentalRiskCard from "@/components/EnvironmentalRiskCard";
import EiendomsskattCard from "@/components/EiendomsskattCard";

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

  const shareUrl = `https://verdikart.no/eiendom/${params.slug}?adresse=${encodeURIComponent(displayAddress)}`;

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={realEstateSchema} />
      <div className="flex min-h-screen flex-col bg-background text-foreground">

        {/* ── HERO: Map full-width at top ─────────────────────────────────── */}
        {latNum && lonNum && (
          <div className="no-print h-56 w-full overflow-hidden sm:h-72 lg:h-80">
            <PropertyMap lat={latNum} lon={lonNum} address={displayAddress} />
          </div>
        )}

        {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">

          {/* ── HEADER ────────────────────────────────────────────────────── */}
          <header className="mb-8">
            <nav className="mb-3 flex items-center gap-1.5 text-xs text-text-tertiary" aria-label="Brødsmule">
              <a href="/" className="hover:text-foreground transition-colors">Hjem</a>
              <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="m9 18 6-6-6-6"/></svg>
              <span className="max-w-[260px] truncate text-text-secondary">{displayAddress}</span>
            </nav>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                  {displayAddress}
                </h1>
                <p className="mt-1 text-sm text-text-secondary">Eiendomsoversikt og områdesdata</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <PropertyShareBar address={displayAddress} url={shareUrl} />
                <PdfExportButton address={displayAddress} />
              </div>
            </div>

            {/* Re-search */}
            <div className="mt-5">
              <AddressSearch initialValue={displayAddress} />
            </div>
          </header>

          {/* ── VALUATION (full width, headline number — buyer's #1 question first) ──── */}
          <div className="mb-8">
            <CardErrorBoundary fallbackTitle="Verdiestimat feilet">
              <ValuationCard
                kommunenummer={kommunenummer}
                postnummer={searchParams.pnr ?? ""}
                adresse={displayAddress}
              />
            </CardErrorBoundary>
          </div>

          {/* ── EDITORIAL GRID: 2/3 main + 1/3 sidebar ───────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">

            {/* ── LEFT / MAIN ─────────────────────────────────────────────────
                Order follows buyer mental model:
                1. Market context (comparables, trend) — is the asking price fair?
                2. Daily life (transit, schools, amenities) — can I live here?
                3. AI synthesis — ties it all together
                4. Neighbor voices — social proof at the end
            */}
            <CardsCascade className="space-y-6">
              {[
                <CardErrorBoundary key="sales" fallbackTitle="Markedsdata feilet"><ComparableSalesCard kommunenummer={kommunenummer} /></CardErrorBoundary>,
                <CardErrorBoundary key="price" fallbackTitle="Prisutvikling feilet"><PriceTrendCard kommunenummer={kommunenummer} postnummer={searchParams.pnr ?? ""} /></CardErrorBoundary>,
                <CardErrorBoundary key="transit" fallbackTitle="Kollektivtransport feilet"><TransitCard lat={latNum} lon={lonNum} address={displayAddress} /></CardErrorBoundary>,
                ...(latNum && lonNum ? [<CardErrorBoundary key="schools" fallbackTitle="Skoler feilet"><SchoolsCard lat={latNum} lon={lonNum} kommunenummer={kommunenummer} /></CardErrorBoundary>] : []),
                ...(latNum && lonNum ? [<CardErrorBoundary key="amenities" fallbackTitle="Fasiliteter feilet"><AmenitiesCard lat={latNum} lon={lonNum} /></CardErrorBoundary>] : []),
                ...(latNum && lonNum ? [<CardErrorBoundary key="ai" fallbackTitle="AI-oppsummering feilet"><AISummary address={displayAddress} kommunenummer={kommunenummer} lat={latNum} lon={lonNum} /></CardErrorBoundary>] : []),
                <CardErrorBoundary key="reviews" fallbackTitle="Nabolagsvurderinger feilet"><NeighborhoodReviewsCard kommunenummer={kommunenummer} postnummer={searchParams.pnr} /></CardErrorBoundary>,
              ]}
            </CardsCascade>

            {/* ── RIGHT / SIDEBAR ─────────────────────────────────────────────
                Grouped: risk cluster first (what could hurt you?),
                then neighborhood facts, then property facts, then actions.
            */}
            <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
              {/* Actions + save first (above-fold on mobile, since sidebar stacks below main on mobile) */}
              <div className="no-print">
                <SaveAddressButton
                  slug={params.slug}
                  adressetekst={displayAddress}
                  lat={latNum}
                  lon={lonNum}
                  kommunenummer={kommunenummer}
                  postnummer={searchParams.pnr}
                />
              </div>

              {/* Risk cluster — what could hurt you? */}
              <CardErrorBoundary fallbackTitle="Klimarisiko feilet"><ClimateRiskCard lat={latNum} lon={lonNum} /></CardErrorBoundary>
              <CardErrorBoundary fallbackTitle="Støynivå feilet"><NoiseCard lat={latNum} lon={lonNum} /></CardErrorBoundary>
              <CardErrorBoundary fallbackTitle="Luftkvalitet feilet"><AirQualityCard lat={latNum} lon={lonNum} /></CardErrorBoundary>
              <CardErrorBoundary fallbackTitle="Bredbånd feilet"><BroadbandCard lat={latNum} lon={lonNum} /></CardErrorBoundary>
              <CardErrorBoundary fallbackTitle="Kriminalitet feilet"><CrimeCard kommunenummer={kommunenummer} /></CardErrorBoundary>
              <CardErrorBoundary fallbackTitle="Miljørisiko feilet"><EnvironmentalRiskCard kommunenummer={kommunenummer} /></CardErrorBoundary>

              {/* Neighborhood facts */}
              <CardErrorBoundary fallbackTitle="Befolkningsprofil feilet"><DemographicsCard kommunenummer={kommunenummer} /></CardErrorBoundary>
              <CardErrorBoundary fallbackTitle="Eiendomsskatt feilet"><EiendomsskattCard kommunenummer={kommunenummer} /></CardErrorBoundary>

              {/* Property-specific facts */}
              <CardErrorBoundary fallbackTitle="Energiattest feilet"><PropertyEnergimerke
                postnummer={searchParams.pnr ?? ""}
                adresse={displayAddress}
              /></CardErrorBoundary>

              {/* Listing reference + reminders */}
              <FinnLink
                postnummer={searchParams.pnr}
                address={displayAddress}
                kommunenavn={searchParams.poststed}
              />
              <FellesgjeldReminder />

              {/* Trust strip (sidebar) */}
              <div className="rounded-xl border border-card-border bg-card-bg p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Datakilder</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "SSB", href: "https://www.ssb.no", title: "Boligpriser" },
                    { label: "Kartverket", href: "https://kartverket.no", title: "Adresse & eiendom" },
                    { label: "Entur", href: "https://entur.no", title: "Kollektivtransport" },
                    { label: "NVE", href: "https://nve.no", title: "Klima- og flomrisiko" },
                    { label: "NILU", href: "https://luftkvalitet.info", title: "Luftkvalitet" },
                    { label: "OpenStreetMap", href: "https://openstreetmap.org", title: "Skoler & fasiliteter" },
                  ].map(({ label, href, title }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={title}
                      className="inline-flex items-center gap-1 rounded-full border border-card-border bg-background px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground"
                    >
                      {label}
                      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                        <path d="M2.5 9.5 L9.5 2.5M5.5 2.5h4v4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  ))}
                </div>
                <p className="mt-3 text-[10px] text-text-tertiary">
                  Rapport generert {new Date().toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" })} · Data oppdateres løpende fra offentlige API-er
                </p>
              </div>

              {/* Email capture */}
              <div className="no-print">
                <EmailCapture address={displayAddress} />
              </div>
            </aside>
          </div>

          {/* ── NEARBY (full width below fold) ─────────────────────────────── */}
          {latNum && lonNum && (
            <div className="mt-8">
              <NearbyProperties
                lat={latNum}
                lon={lonNum}
                kommunenummer={kommunenummer}
                currentAddress={displayAddress}
              />
            </div>
          )}
        </div>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <SiteFooter />
      </div>
    </>
  );
}
