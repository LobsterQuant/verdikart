import type { Metadata } from "next";
import NoiseCard from "@/components/NoiseCard";
import TransitCard from "@/components/TransitCard";
import PriceTrendCard from "@/components/PriceTrendCard";
import ComparableSalesCard from "@/components/ComparableSalesCard";
import PropertyMap from "@/components/PropertyMap";
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
  const description = `Støy, kollektivtransport og prisutvikling for ${address}. Få full eiendomsinnsikt på Verdikart.`;
  const pageUrl = `https://verdikart.no/eiendom/${params.slug}${
    searchParams.lat ? `?lat=${searchParams.lat}&lon=${searchParams.lon}` : ""
  }`;

  return {
    title,
    description,
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
    <div className="mx-auto max-w-6xl px-4 py-10">
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
        <PriceTrendCard kommunenummer={kommunenummer} />
        <ComparableSalesCard kommunenummer={kommunenummer} />
        <div className="md:col-span-2">
          <PropertyMap lat={latNum} lon={lonNum} address={displayAddress} />
        </div>
      </div>
    </div>
  );
}
