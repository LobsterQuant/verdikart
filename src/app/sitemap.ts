import type { MetadataRoute } from "next";
import { allCitySlugs } from "./by/[city]/cityData";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://verdikart.no";
  const now = new Date();

  const cityPages: MetadataRoute.Sitemap = allCitySlugs.map((slug) => ({
    url: `${base}/by/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...cityPages,
    {
      url: `${base}/om-oss`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/personvern`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${base}/vilkar`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
