import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TransitCard from "@/components/TransitCard";
import SchoolsCard from "@/components/SchoolsCard";
import CrimeCard from "@/components/CrimeCard";
import FinnLink from "@/components/FinnLink";
import FellesgjeldReminder from "@/components/FellesgjeldReminder";
import RapportKort from "@/components/RapportKort";
import SaveAddressButton from "@/components/SaveAddressButton";
import PropertyEnergimerke from "@/components/PropertyEnergimerke";
import PriceTrendCard from "@/components/PriceTrendCard";
import ComparableSalesCard from "@/components/ComparableSalesCard";
import PropertyMap from "@/components/PropertyMap";
import EmailCapture from "@/components/EmailCapture";
import JsonLd from "@/components/JsonLd";
import AddressSearch from "@/components/AddressSearch";
import CardsCascade from "@/components/CardsCascade";
import PropertyShareBar from "@/components/PropertyShareBar";
import NearbyProperties from "@/components/NearbyProperties";
import AISummary from "@/components/AISummary";
import ValuationCard from "@/components/ValuationCard";
import ManedskostnadKort from "@/components/cards/ManedskostnadKort";
import ManedskostnadHero from "@/components/ManedskostnadHero";
import PendlingsPoengCard from "@/components/PendlingsPoengCard";
import { getPendlingsPoengCached } from "@/lib/scoring/pendlings-poeng-cached";
import AmenitiesCard from "@/components/AmenitiesCard";
import SidebarDataCluster from "@/components/SidebarDataCluster";

import NeighborhoodReviewsCard from "@/components/NeighborhoodReviewsCard";
import PdfExportButton from "@/components/PdfExportButton";
import CardErrorBoundary from "@/components/CardErrorBoundary";
import DemographicsCard from "@/components/DemographicsCard";
import EnvironmentalRiskCard from "@/components/EnvironmentalRiskCard";
import EiendomsskattCard from "@/components/EiendomsskattCard";
import ClimateRiskCard from "@/components/ClimateRiskCard";
import NoiseCard from "@/components/NoiseCard";
import AirQualityCard from "@/components/AirQualityCard";
import BroadbandCard from "@/components/BroadbandCard";
import { eiendomsskattData } from "@/data/eiendomsskatt";
import { PropertyReportMobile, type ReportSection } from "@/components/eiendom/PropertyReportMobile";
import { getPropertyReportSummary } from "@/lib/propertyReportSummary";
import {
  VerdiestimatIcon,
  ManedskostnadIcon,
  PrisutviklingIcon,
  KollektivIcon,
  SkolerIcon,
  KlimarisikoIcon,
  StoyIcon,
  LuftkvalitetIcon,
  BredbandIcon,
  EnergiIcon,
  EiendomsskattIcon,
  KriminalitetIcon,
  DemografiIcon,
} from "@/components/icons";

// Accepts arbitrary Norwegian address slugs — never prerendered. Must stay
// dynamic so generateMetadata() can call notFound() BEFORE any RSC payload
// streams, which is what forces Next.js to emit a real 404 status.
export const dynamic = "force-dynamic";

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
  // Invalid slug → 404 before any page rendering starts. Without this, Next.js
  // streams the layout (index/follow, canonical=/) while waiting for page.tsx
  // to call notFound(), which Google crawls as a soft-404.
  const slugParsed = parseSlug(params.slug);
  const hasCoords = !!(searchParams.lat && searchParams.lon) || !!(slugParsed.lat && slugParsed.lon);
  if (!hasCoords) {
    notFound();
  }

  let address = searchParams.adresse;
  if (!address) {
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
  const title = `${address}: Verdikart`;
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
          alt: `Eiendomsdata for ${address}: Verdikart`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: `https://verdikart.no/eiendom/${params.slug}/opengraph-image`,
          alt: `Eiendomsdata for ${address}: Verdikart`,
        },
      ],
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
    notFound();
  }

    const canonicalUrl = `https://verdikart.no/eiendom/${params.slug}`;

  const kommuneName = eiendomsskattData[kommunenummer]?.name;
  const kommuneSlug = kommuneName
    ? kommuneName.toLowerCase().replace(/ø/g, "o").replace(/å/g, "a").replace(/æ/g, "ae").replace(/\s+/g, "-")
    : "";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Hjem",
        "item": "https://verdikart.no",
      },
      ...(kommuneName
        ? [{
            "@type": "ListItem" as const,
            "position": 2,
            "name": kommuneName,
            "item": `https://verdikart.no/by/${kommuneSlug}`,
          }]
        : []),
      {
        "@type": "ListItem",
        "position": kommuneName ? 3 : 2,
        "name": displayAddress,
        "item": canonicalUrl,
      },
    ],
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

  // Mobile sheet previews — one parallel server fetch instead of 12 client waterfalls.
  const postnummer = searchParams.pnr ?? "";
  const [reportResult, pendlingsPoengResult] = await Promise.all([
    getPropertyReportSummary({
      lat: latNum,
      lon: lonNum,
      kommunenummer,
      postnummer,
      adresse: displayAddress,
    }),
    getPendlingsPoengCached(latNum, lonNum, kommunenummer || null).catch(() => null),
  ]);
  const mobileSummary = reportResult.sections;
  const classification = reportResult.classification;
  const isCommercial = classification === "commercial";
  const isMixedUse = classification === "mixed-use";
  const headlinePrice = isCommercial ? null : mobileSummary.verdiestimat.split("·")[0].trim();
  const headlineCaption = isCommercial ? "Næringsbygg" : "Estimert verdi";
  const backHref = kommuneName ? `/by/${kommuneSlug}` : "/";
  // Icons are pre-rendered here (server) as ReactNode since function refs can't
  // cross the RSC boundary into PropertyReportMobile's client tree.
  const iconCls = "h-4 w-4";
  const mobileSections: ReadonlyArray<ReportSection> = [
    ...(isCommercial ? [] : [
      { key: "verdiestimat" as const,   label: "Verdiestimat",         icon: <VerdiestimatIcon className={iconCls} />,   detail: <ValuationCard kommunenummer={kommunenummer} postnummer={postnummer} adresse={displayAddress} /> },
      { key: "manedskostnad" as const,  label: "Månedskostnad",        icon: <ManedskostnadIcon className={iconCls} />,  detail: <ManedskostnadKort kommunenummer={kommunenummer} postnummer={postnummer} adresse={displayAddress} /> },
    ]),
    { key: "prisstatistikk", label: "Prisstatistikk",       icon: <PrisutviklingIcon className={iconCls} />,  detail: <PriceTrendCard kommunenummer={kommunenummer} postnummer={postnummer} /> },
    { key: "kollektiv",      label: "Kollektivtransport",   icon: <KollektivIcon className={iconCls} />,      detail: <TransitCard lat={latNum} lon={lonNum} address={displayAddress} /> },
    { key: "skoler",         label: "Skoler og barnehager", icon: <SkolerIcon className={iconCls} />,         detail: <SchoolsCard lat={latNum} lon={lonNum} kommunenummer={kommunenummer} /> },
    { key: "klimarisiko",    label: "Klimarisiko",          icon: <KlimarisikoIcon className={iconCls} />,    detail: <ClimateRiskCard lat={latNum} lon={lonNum} /> },
    { key: "stoy",           label: "Støy",                 icon: <StoyIcon className={iconCls} />,           detail: <NoiseCard lat={latNum} lon={lonNum} /> },
    { key: "luftkvalitet",   label: "Luftkvalitet",         icon: <LuftkvalitetIcon className={iconCls} />,   detail: <AirQualityCard lat={latNum} lon={lonNum} /> },
    { key: "bredband",       label: "Bredbånd",             icon: <BredbandIcon className={iconCls} />,       detail: <BroadbandCard lat={latNum} lon={lonNum} /> },
    { key: "energi",         label: "Energimerke",          icon: <EnergiIcon className={iconCls} />,         detail: <PropertyEnergimerke postnummer={postnummer} adresse={displayAddress} /> },
    { key: "eiendomsskatt",  label: "Eiendomsskatt",        icon: <EiendomsskattIcon className={iconCls} />,  detail: <EiendomsskattCard kommunenummer={kommunenummer} /> },
    { key: "kriminalitet",   label: "Kriminalitet",         icon: <KriminalitetIcon className={iconCls} />,   detail: <CrimeCard kommunenummer={kommunenummer} postnummer={postnummer} kommuneName={kommuneName} lat={latNum} lon={lonNum} /> },
    { key: "demografi",      label: "Demografi",            icon: <DemografiIcon className={iconCls} />,      detail: <DemographicsCard kommunenummer={kommunenummer} /> },
  ];

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={realEstateSchema} />

      {/* ── MOBILE: bottom-sheet report (Package 7) ─────────────────────── */}
      <div className="md:hidden">
        <PropertyReportMobile
          address={displayAddress}
          headlinePrice={headlinePrice}
          headlineCaption={headlineCaption}
          summary={mobileSummary}
          sections={mobileSections}
          backHref={backHref}
          banner={isMixedUse ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              <p className="font-medium">Kombinert bygg (næring og bolig)</p>
              <p className="mt-0.5 text-amber-200/90">
                Bygget er registrert som næring, men inneholder trolig boligenheter. Noen tall gjelder bare bolig-delen.
              </p>
            </div>
          ) : undefined}
          mapElement={
            <PropertyMap
              lat={latNum}
              lon={lonNum}
              address={displayAddress}
              height="45vh"
              rounded={false}
            />
          }
        />
      </div>

      {/* ── DESKTOP: original two-column layout ─────────────────────────── */}
      <div className="hidden min-h-screen flex-col bg-background text-foreground md:flex">

        {/* ── HERO: Map constrained to content width ──────────────────────── */}
        {latNum && lonNum && (
          <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
            <div className="no-print h-56 overflow-hidden rounded-xl border border-card-border sm:h-72 lg:h-80">
              <PropertyMap lat={latNum} lon={lonNum} address={displayAddress} />
            </div>
          </div>
        )}

        {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">

          {/* ── HEADER ────────────────────────────────────────────────────── */}
          <header className="mb-8">
            <nav className="mb-3 flex items-center gap-1.5 text-xs text-text-secondary" aria-label="Brødsmule">
              <a href="/" className="hover:text-foreground transition-colors">Hjem</a>
              <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="m9 18 6-6-6-6"/></svg>
              {(() => {
                const kommuneName = eiendomsskattData[kommunenummer]?.name;
                if (!kommuneName) return null;
                const slug = kommuneName.toLowerCase().replace(/ø/g, "o").replace(/å/g, "a").replace(/æ/g, "ae").replace(/\s+/g, "-");
                return (
                  <>
                    <a href={`/by/${slug}`} className="hover:text-foreground transition-colors">{kommuneName}</a>
                    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="m9 18 6-6-6-6"/></svg>
                  </>
                );
              })()}
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
              <AddressSearch initialValue={displayAddress} skipAutoSearch />
            </div>
          </header>

          {isMixedUse && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              <p className="font-medium">Kombinert bygg (næring og bolig)</p>
              <p className="mt-1 text-amber-200/90">
                Bygget er registrert som næring, men inneholder trolig boligenheter. Noen tall gjelder bare bolig-delen.
              </p>
            </div>
          )}

          {!isCommercial && (
            <>
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

              {/* ── MÅNEDSKOSTNAD (full width — buyer's #2 question: can I afford it?) ──── */}
              <div className="mb-4">
                <CardErrorBoundary fallbackTitle="Månedskostnad-eksempel feilet">
                  <ManedskostnadHero
                    kommunenummer={kommunenummer}
                    postnummer={searchParams.pnr ?? ""}
                    adresse={displayAddress}
                  />
                </CardErrorBoundary>
              </div>

              {/* ── PENDLINGS-POENG (parallel hero — composite commute score) ────── */}
              <div className="mb-4">
                <CardErrorBoundary fallbackTitle="Pendlings-poeng feilet">
                  <PendlingsPoengCard result={pendlingsPoengResult} />
                </CardErrorBoundary>
              </div>

              <div className="mb-8">
                <CardErrorBoundary fallbackTitle="Månedskostnad feilet">
                  <ManedskostnadKort
                    kommunenummer={kommunenummer}
                    postnummer={searchParams.pnr ?? ""}
                    adresse={displayAddress}
                  />
                </CardErrorBoundary>
              </div>
            </>
          )}

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

              {/* Risk + coverage cluster — consolidated "Mer data kommer" when all four empty */}
              <SidebarDataCluster lat={latNum} lon={lonNum} />
              <CardErrorBoundary fallbackTitle="Kriminalitet feilet"><CrimeCard kommunenummer={kommunenummer} postnummer={searchParams.pnr ?? ""} kommuneName={kommuneName} lat={latNum} lon={lonNum} /></CardErrorBoundary>
              <CardErrorBoundary fallbackTitle="Miljørisiko feilet"><EnvironmentalRiskCard kommunenummer={kommunenummer} /></CardErrorBoundary>

              {/* Neighborhood facts */}
              <CardErrorBoundary fallbackTitle="Befolkningsprofil feilet"><DemographicsCard kommunenummer={kommunenummer} /></CardErrorBoundary>
              <CardErrorBoundary fallbackTitle="Eiendomsskatt feilet"><EiendomsskattCard kommunenummer={kommunenummer} /></CardErrorBoundary>

              {/* Property-specific facts */}
              <CardErrorBoundary fallbackTitle="Energiattest feilet"><PropertyEnergimerke
                postnummer={searchParams.pnr ?? ""}
                adresse={displayAddress}
              /></CardErrorBoundary>

              {/* Markedsrapport — highlights når eiendommen er fritidsbolig */}
              <RapportKort
                postnummer={searchParams.pnr ?? ""}
                adresse={displayAddress}
              />

              {/* Listing reference + reminders */}
              <FinnLink
                postnummer={searchParams.pnr}
                address={displayAddress}
                kommunenavn={searchParams.poststed}
              />
              <FellesgjeldReminder />

              {/* Trust strip (sidebar) */}
              <div className="rounded-xl border border-card-border bg-card-bg p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">Datakilder</p>
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
      </div>
    </>
  );
}
