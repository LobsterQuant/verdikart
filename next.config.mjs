/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
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

export default nextConfig;
