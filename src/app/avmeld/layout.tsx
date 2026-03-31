import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meld deg av varsler | Verdikart",
  description: "Meld deg av e-postvarsler og nyhetsbrev fra Verdikart.",
  alternates: { canonical: "https://verdikart.no/avmeld" },
  robots: { index: false, follow: false },
};

export default function AvmeldLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
