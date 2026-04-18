import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Clock, BookOpen } from "lucide-react";
import { posts } from "./posts";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Blogg — Boligkjøp og eiendomsdata i Norge | Verdikart",
  description:
    "Artikler om boligkjøp i Norge: sjekklister, prisutvikling, kollektivtransport og hvordan du leser eiendomsdata. Gratis og uavhengig.",
  alternates: { canonical: "https://verdikart.no/blogg" },
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
    url: "https://verdikart.no/blogg",
    description: "Artikler om boligkjøp, eiendomsdata og boligmarkedet i Norge.",
    publisher: {
      "@type": "Organization",
      name: "Verdikart",
      url: "https://verdikart.no",
    },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `https://verdikart.no/blogg/${p.slug}`,
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

          {/* Category color map */}
          {(() => {
            const DEFAULT_CAT = { bg: "bg-card-border/30", text: "text-text-tertiary" };
            const CAT_COLOR: Record<string, { bg: string; text: string }> = {
              "Boligkjøp":      { bg: "bg-violet-500/10",  text: "text-violet-400" },
              "Analyse":        { bg: "bg-blue-500/10",    text: "text-blue-400" },
              "Markedsdata":    { bg: "bg-emerald-500/10", text: "text-emerald-400" },
              "Økonomi":        { bg: "bg-amber-500/10",   text: "text-amber-400" },
              "Kjøperguide":    { bg: "bg-rose-500/10",    text: "text-rose-400" },
              "Markedsanalyse": { bg: "bg-cyan-500/10",    text: "text-cyan-400" },
              "Prisanalyse":    { bg: "bg-orange-500/10",  text: "text-orange-400" },
              "Teknisk":        { bg: "bg-slate-500/10",   text: "text-slate-400" },
              "Investering":    { bg: "bg-teal-500/10",    text: "text-teal-400" },
              "Økonomiguide":   { bg: "bg-yellow-500/10",  text: "text-yellow-400" },
              "Livsendringer":  { bg: "bg-pink-500/10",    text: "text-pink-400" },
              "Strategi":       { bg: "bg-accent/10",      text: "text-accent" },
            };

            const [featured, ...rest] = sorted;

            return (
              <div className="space-y-4">
                {/* Featured post */}
                <Link
                  href={`/blogg/${featured.slug}`}
                  className="group block rounded-xl border border-accent/20 bg-accent/5 p-5 transition-all hover:border-accent/40 card-hover"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${(CAT_COLOR[featured.category as string] ?? DEFAULT_CAT).bg} ${(CAT_COLOR[featured.category as string] ?? DEFAULT_CAT).text}`}>
                      {featured.category}
                    </span>
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">Nyeste</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold leading-snug group-hover:text-accent transition-colors">
                      {featured.title}
                    </h2>
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary line-clamp-2">{featured.description}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-text-tertiary">
                    <span>{formatDate(featured.publishedAt)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" strokeWidth={1.5} />{featured.readingMinutes} min</span>
                  </div>
                </Link>

                {/* Rest of posts */}
                {rest.map((post) => {
                  const cat = CAT_COLOR[post.category as string] ?? DEFAULT_CAT;
                  return (
                    <Link
                      key={post.slug}
                      href={`/blogg/${post.slug}`}
                      className="group flex items-start gap-4 rounded-xl border border-card-border bg-card-bg p-5 transition-all hover:border-accent/30 card-hover"
                    >
                      {/* Category colour stripe */}
                      <div className={`mt-1 h-full w-1 shrink-0 rounded-full self-stretch min-h-[48px] ${cat.bg.replace("/10", "/40")}`} />
                      <div className="flex-1 min-w-0">
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cat.bg} ${cat.text}`}>{post.category}</span>
                        </div>
                        <h2 className="font-semibold leading-snug group-hover:text-accent transition-colors">{post.title}</h2>
                        <p className="mt-1 text-sm leading-relaxed text-text-secondary line-clamp-1">{post.description}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-text-tertiary">
                          <span>{formatDate(post.publishedAt)}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" strokeWidth={1.5} />{post.readingMinutes} min</span>
                        </div>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
                    </Link>
                  );
                })}
              </div>
            );
          })()}

        </div>
      </div>
    </>
  );
}
