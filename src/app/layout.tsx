import type { Metadata, Viewport } from "next";
import Script from "next/script";
import NavBar from "@/components/NavBar";
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
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
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
        <NavBar />
        <main className="pt-14">
          <PageTransition>{children}</PageTransition>
        </main>
      </body>
    </html>
  );
}
