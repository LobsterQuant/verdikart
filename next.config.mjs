import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        // Security headers applied site-wide. HSTS is set with a 2-year max-age
        // and `preload` so the domain is eligible for the browser HSTS preload
        // list; submitting to hstspreload.org remains a separate manual step.
        // COOP isolates the window from cross-origin popups — we don't open
        // any OAuth/auth popups, so `same-origin` is safe.
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Demo URL shortcut → real slug with coordinates
      {
        source: "/eiendom/bygdoy-alle-2",
        destination: "/eiendom/bygdoy-alle-2--599151-107152-0301?adresse=Bygd%C3%B8y+all%C3%A9+2%2C+Oslo&lat=59.91506&lon=10.71522&knr=0301",
        permanent: false,
      },
      {
        source: "/demo",
        destination: "/eiendom/bygdoy-alle-2--599151-107152-0301?adresse=Bygd%C3%B8y+all%C3%A9+2%2C+Oslo&lat=59.91506&lon=10.71522&knr=0301",
        permanent: false,
      },
      // Tool aliases
      { source: "/sammenligning",    destination: "/sammenlign",  permanent: false },
      { source: "/compare",          destination: "/sammenlign",  permanent: false },
      { source: "/calculator",       destination: "/kalkulator",  permanent: false },
      { source: "/kalkulator-bolig", destination: "/kalkulator",  permanent: false },
      { source: "/kart",             destination: "/bykart",      permanent: false },
      { source: "/map",              destination: "/bykart",      permanent: false },
      // Norwegian slug aliases → canonical English slugs
      { source: "/endringslogg",           destination: "/changelog",            permanent: true },
      { source: "/data-og-metodologi",     destination: "/data",                 permanent: true },
      { source: "/metodologi",             destination: "/data",                 permanent: true },
      { source: "/datakilder",             destination: "/data",                 permanent: true },
      { source: "/om",                     destination: "/om-oss",               permanent: true },
      { source: "/for/kjoper",             destination: "/for/forstegangskjoper", permanent: true },
      { source: "/kjoper",                 destination: "/for/forstegangskjoper", permanent: true },
      { source: "/selger",                 destination: "/for/selger",           permanent: true },
      { source: "/investor",               destination: "/for/boliginvestor",    permanent: true },
      { source: "/familie",                destination: "/for/barnefamilier",    permanent: true },
      { source: "/barnefamilie",           destination: "/for/barnefamilier",    permanent: true },
      // Common typos / legacy
      { source: "/privacy",               destination: "/personvern",           permanent: true },
      { source: "/terms",                 destination: "/vilkar",               permanent: true },
      { source: "/about",                 destination: "/om-oss",               permanent: true },
      { source: "/contact",              destination: "/kontakt",              permanent: true },
      { source: "/press",                destination: "/presse",               permanent: true },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Suppress source map upload logs in CI
  silent: true,
  // Upload source maps for better stack traces
  widenClientFileUpload: true,
  // Hide source maps from users
  hideSourceMaps: true,
  // Disable Sentry telemetry
  disableLogger: true,
});
