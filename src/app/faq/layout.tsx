import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vanlige spørsmål | Verdikart",
  description: "Svar på vanlige spørsmål om Verdikart. Datakilder, personvern, nøyaktighet og hvordan verktøyet fungerer.",
  alternates: { canonical: "https://verdikart.no/faq" },
  openGraph: {
    title: "Vanlige spørsmål | Verdikart",
    description: "Svar på vanlige spørsmål om Verdikart. Datakilder, personvern, nøyaktighet og hvordan verktøyet fungerer.",
    url: "https://verdikart.no/faq",
    siteName: "Verdikart",
    locale: "nb_NO",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Vanlige spørsmål | Verdikart",
    description: "Svar på vanlige spørsmål om Verdikart. Datakilder, personvern og nøyaktighet.",
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
