import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verdikart — Forstå boligen. Ikke bare se den.",
  description:
    "Norges smarteste verktøy for boligkjøpere. Støynivå, kollektivtransport, prisutvikling og mer — alt på ett sted.",
  keywords: "bolig, eiendom, støy, kollektivtransport, prisutvikling, Norge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <head>
        <meta charSet="utf-8" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
        {/* Privacy-friendly analytics by Plausible */}
        <Script
          async
          src="https://plausible.io/js/pa-7S0dfjd45CAilP540GpB8.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">{`
          window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)};
          window.plausible.init=window.plausible.init||function(i){window.plausible.o=i||{}};
          window.plausible.init();
        `}</Script>
      </head>
      <body className="font-sans bg-background text-foreground min-h-screen">
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-accent font-bold text-lg tracking-tight">
                Verdikart
              </span>
            </a>
            <div className="flex items-center gap-6 text-sm text-text-secondary">
              <a
                href="/om-oss"
                className="hover:text-foreground transition-colors"
              >
                Om oss
              </a>
            </div>
          </div>
        </nav>
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
