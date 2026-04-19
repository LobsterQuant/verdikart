import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import NavBar from "@/components/NavBar";
import CookieBanner from "@/components/CookieBanner";
import Providers from "@/components/Providers";
import MotionProvider from "@/components/MotionProvider";
import "./globals.css";

// ── Design-system fonts (audit package 1/9) ──────────────────────────────
// Loaded via next/font so Next.js self-hosts + preloads them (no render-block
// from Google Fonts CDN). Display and mono are INSTALLED but not applied to
// any element yet — package 4 (hero) will start consuming them via the
// .display-1 / .stat-hero utility classes.
const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
  // Explicit preload (also the next/font default) — the hero H1 uses .display-1
  // which resolves to var(--font-display), making this font LCP-critical.
  preload: true,
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

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
  // Meta tags can't resolve CSS vars — keep in sync with --accent in globals.css.
  themeColor: "#7FE3D4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="google-site-verification" content="4CfcfTbdMps13rua_a3oxyYzllQ--raYjuvHw0vGRdE" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
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
          {/* Homepage-scoped JSON-LD (WebSite+SearchAction, SoftwareApplication) lives in src/app/page.tsx per Google's guidance. */}
          {/* Skip-to-content — visible on keyboard focus only */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-ink focus:outline-none"
          >
            Hopp til innhold
          </a>
          <MotionProvider>
            <NavBar />
            <main
              id="main-content"
              style={{ paddingTop: "calc(3.5rem + env(safe-area-inset-top))" }}
            >
              {children}
            </main>
            <CookieBanner />
          </MotionProvider>
        </Providers>
      </body>
    </html>
  );
}
