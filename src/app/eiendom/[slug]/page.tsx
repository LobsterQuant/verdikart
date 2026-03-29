import NoiseCard from "@/components/NoiseCard";
import TransitCard from "@/components/TransitCard";
import PriceTrendCard from "@/components/PriceTrendCard";
import ComparableSalesCard from "@/components/ComparableSalesCard";
import PropertyMap from "@/components/PropertyMap";

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
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {displayAddress}
        </h1>
        <p className="mt-2 text-text-secondary">
          Eiendomsoversikt og områdesdata
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <NoiseCard lat={latNum} lon={lonNum} />
        <TransitCard lat={latNum} lon={lonNum} />
        <PriceTrendCard kommunenummer={kommunenummer} />
        <ComparableSalesCard kommunenummer={kommunenummer} />
        <div className="md:col-span-2">
          <PropertyMap lat={latNum} lon={lonNum} address={displayAddress} />
        </div>
      </div>
    </div>
  );
}
