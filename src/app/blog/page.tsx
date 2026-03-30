import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Clock, BookOpen } from "lucide-react";
import { posts } from "./posts";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Blogg — Boligkjøp og eiendomsdata i Norge | Verdikart",
  description:
    "Artikler om boligkjøp i Norge: sjekklister, prisutvikling, kollektivtransport og hvordan du leser eiendomsdata. Gratis og uavhengig.",
  alternates: { canonical: "https://verdikart.no/blog" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nb-NO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndex() {
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Verdikart Blogg",
    url: "https://verdikart.no/blog",
    description: "Artikler om boligkjøp, eiendomsdata og boligmarkedet i Norge.",
    publisher: {
      "@type": "Organization",
      name: "Verdikart",
      url: "https://verdikart.no",
    },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `https://verdikart.no/blog/${p.slug}`,
      datePublished: p.publishedAt,
      description: p.description,
    })),
  };

  const sorted = [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <>
      <JsonLd schema={blogSchema} />
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">

          <div className="mb-10">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <BookOpen className="h-5 w-5 text-accent" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blogg</h1>
            <p className="mt-3 text-text-secondary">
              Artikler om boligkjøp, eiendomsdata og boligmarkedet i Norge — uavhengig, gratis.
            </p>
          </div>

          <div className="space-y-4">
            {sorted.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-xl border border-card-border bg-card-bg p-5 transition-colors hover:border-accent/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold leading-snug group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary line-clamp-2">
                  {post.description}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-text-tertiary">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                    {post.readingMinutes} min
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
