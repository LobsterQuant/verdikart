import type { MetadataRoute } from "next";
import { allCitySlugs } from "./by/[city]/cityData";
import { posts } from "./blogg/posts";
import { getAllBydelSlugs } from "./by/oslo/[bydel]/bydelData";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://verdikart.no";
  const now = new Date();

  const blogPosts: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blogg/${p.slug}`,
    lastModified: new Date(p.updatedAt ?? p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

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
    {
      url: `${base}/blogg`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...blogPosts,
    ...cityPages,
    {
      url: `${base}/om-oss`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/changelog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${base}/kontakt`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${base}/for/forstegangskjoper`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${base}/for/boliginvestor`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${base}/for/barnefamilier`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${base}/presse`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${base}/rapport/hytte-tvangssalg-2026`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/for/selger`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${base}/data`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/sammenlign`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${base}/sammenlign-adresser`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${base}/by`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    },
    {
      url: `${base}/nabolag`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    },
    {
      url: `${base}/kalkulator`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${base}/bykart`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    },
    {
      url: `${base}/kjope-bolig`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    // Neighbourhood pages
    ...[
      "frogner", "grunerlokka", "majorstuen", "nordnes",
      "bakklandet", "lade", "moholt", "fana", "sandviken",
      "st-hanshaugen", "sagene", "gronland", "toyen",
      "sofienberg", "bislett", "skillebekk", "aker-brygge",
      "bjolsen", "kiellands-plass",
    ].map((area) => ({
      url: `${base}/nabolag/${area}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    // Oslo bydel pages
    ...getAllBydelSlugs().map((s) => ({
      url: `${base}/by/oslo/${s.bydel}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    {
      url: `${base}/login`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/dashboard`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.3,
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
