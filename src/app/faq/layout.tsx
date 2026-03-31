import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vanlige spørsmål | Verdikart",
  description: "Svar på vanlige spørsmål om Verdikart — datakilder, personvern, nøyaktighet og hvordan verktøyet fungerer.",
  alternates: { canonical: "https://verdikart.no/faq" },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
