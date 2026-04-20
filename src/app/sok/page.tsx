import type { Metadata } from "next";
import AddressSearch from "@/components/AddressSearch";

/**
 * /sok exists so the WebSite+SearchAction JSON-LD on the homepage points to a
 * real endpoint. It's a thin shell around AddressSearch, which already handles
 * Kartverket autocomplete and routes the user to /eiendom/<slug> on selection.
 *
 * The ?q= query param is passed straight to AddressSearch as initialValue;
 * the component kicks off its own debounced fetch on mount.
 */
export const metadata: Metadata = {
  title: "Søk etter adresse: Verdikart",
  description:
    "Søk opp en norsk adresse for å få full boliganalyse: verdi, transport, prisutvikling, klimarisiko og mer.",
  alternates: { canonical: "https://verdikart.no/sok" },
  robots: { index: false, follow: true },
};

interface Props {
  searchParams: { q?: string };
}

export default function SokPage({ searchParams }: Props) {
  const initial = (searchParams.q ?? "").trim();

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-24 pt-16 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
        Søk etter adresse
      </h1>
      <p className="mb-8 text-sm text-text-secondary">
        Skriv inn en norsk adresse for å se verdiestimat, transport, prisutvikling og mer.
      </p>
      <AddressSearch initialValue={initial} />
    </div>
  );
}
