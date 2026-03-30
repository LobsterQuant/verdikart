import type { Metadata, Viewport } from "next";
import Script from "next/script";
import Logo from "@/components/Logo";
import JsonLd from "@/components/JsonLd";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://verdikart.no"),
  title: "Verdikart — Forstå boligen. Ikke bare se den.",
  description:
    "Norges smarteste verktøy for boligkjøpere. Kollektivtransport, prisutvikling og markedsdata — alt på ett sted.",
  keywords: "bolig, eiendom, kollektivtransport, prisutvikling, Norge",
  alternates: {
    canonical: "https://verdikart.no",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
        {/* Microsoft Clarity — heatmaps + session recordings */}
        <Script id="clarity-init" strategy="afterInteractive">{`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window,document,"clarity","script","w3tjokm73m");
        `}</Script>
      </head>
      <body className="font-sans bg-background text-foreground min-h-screen">
        <JsonLd schema={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Verdikart",
          "url": "https://verdikart.no",
          "description": "Norges smarteste verktøy for boligkjøpere. Kollektivtransport, prisutvikling og markedsdata — alt på ett sted.",
          "inLanguage": "nb-NO",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://verdikart.no/?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        }} />
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 min-w-0">
              <Logo className="h-8 w-8 shrink-0" />
              <span className="hidden font-bold text-lg tracking-tight text-foreground sm:block">
                Verdikart
              </span>
            </a>
            <nav className="flex items-center gap-3 text-sm text-text-secondary sm:gap-5">
              <a href="/by/oslo" className="hover:text-foreground transition-colors whitespace-nowrap hidden sm:block">Oslo</a>
              <a href="/by/bergen" className="hover:text-foreground transition-colors whitespace-nowrap hidden sm:block">Bergen</a>
              <a href="/by/trondheim" className="hover:text-foreground transition-colors whitespace-nowrap hidden sm:block">Trondheim</a>
              <a href="/blog" className="hover:text-foreground transition-colors whitespace-nowrap">Blogg</a>
              <a href="/om-oss" className="hover:text-foreground transition-colors whitespace-nowrap">Om oss</a>
            </nav>
          </div>
        </nav>
        <main className="pt-14">
          <PageTransition>{children}</PageTransition>
        </main>
      </body>
    </html>
  );
}
