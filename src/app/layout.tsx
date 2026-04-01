import type { Metadata, Viewport } from "next";
import Script from "next/script";
import NavBar from "@/components/NavBar";
import CookieBanner from "@/components/CookieBanner";
import JsonLd from "@/components/JsonLd";
import PageTransition from "@/components/PageTransition";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://verdikart.no"),
  title: "Verdikart — Forstå boligen. Ikke bare se den.",
  description:
    "Gratis verktøy for norske boligkjøpere. Sjekk kollektivtransport, boligprisutvikling og støynivå for enhver adresse — data fra SSB, Kartverket og Entur.",
  keywords: "bolig, eiendom, kollektivtransport, prisutvikling, Norge",
  alternates: {
    canonical: "https://verdikart.no",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "nb_NO",
    siteName: "Verdikart",
    title: "Verdikart — Forstå boligen. Ikke bare se den.",
    description: "Gratis verktøy for norske boligkjøpere. Sjekk kollektivtransport, boligprisutvikling og støynivå for enhver adresse.",
    url: "https://verdikart.no",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Verdikart — Forstå boligen. Ikke bare se den." }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Verdikart",
    creator: "@Verdikart",
    title: "Verdikart — Forstå boligen. Ikke bare se den.",
    description: "Gratis verktøy for norske boligkjøpere. Sjekk kollektivtransport, boligprisutvikling og støynivå.",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb">
      <head>
        <meta charSet="utf-8" />
        <meta name="google-site-verification" content="4CfcfTbdMps13rua_a3oxyYzllQ--raYjuvHw0vGRdE" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://ws.geonorge.no" />
        <link rel="dns-prefetch" href="https://ws.geonorge.no" />
        <link rel="preconnect" href="https://api.entur.io" />
        <link rel="dns-prefetch" href="https://api.entur.io" />
        <link rel="preconnect" href="https://data.ssb.no" />
        <link rel="dns-prefetch" href="https://data.ssb.no" />
        <link
          rel="stylesheet"
          href="/leaflet.css"
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
        {/* Microsoft Clarity — loads ONLY after cookie consent (GDPR) */}
        <Script id="clarity-init" strategy="afterInteractive">{`
          (function(){
            var loaded = false;
            function loadClarity(){
              if (loaded) return;
              loaded = true;
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window,document,"clarity","script","w3tjokm73m");
            }
            try {
              var stored = localStorage.getItem('verdikart_cookie_consent_v2');
              if (stored) { var p = JSON.parse(stored); if (p && p.analytics) loadClarity(); }
            } catch(e){}
            window.addEventListener('verdikart:consent', function(e){
              if (e.detail && e.detail.analytics) loadClarity();
            });
          })();
        `}</Script>
      </head>
      <body className="font-sans bg-background text-foreground min-h-screen">
        <Providers>
          <JsonLd schema={{
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Verdikart",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "NOK" },
            "url": "https://verdikart.no",
            "description": "Gratis verktøy for norske boligkjøpere. Transport, prisutvikling og nabolagsdata for enhver adresse.",
            "inLanguage": "nb-NO",
          }} />
          <JsonLd schema={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Verdikart",
            "url": "https://verdikart.no",
            "description": "Norges smarteste verktøy for boligkjøpere. Kollektivtransport, prisutvikling og markedsdata — alt på ett sted.",
            "inLanguage": "nb-NO",
          }} />
          {/* Skip-to-content — visible on keyboard focus only */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none"
          >
            Hopp til innhold
          </a>
          <NavBar />
          <main id="main-content" className="pt-14">
            <PageTransition>{children}</PageTransition>
          </main>
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
