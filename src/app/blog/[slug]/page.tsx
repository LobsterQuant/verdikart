import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Clock, ArrowLeft } from "lucide-react";
import { getPost, getAllSlugs } from "../posts";
import JsonLd from "@/components/JsonLd";
import ShareButtons from "@/components/ShareButtons";

export async function generateStaticParams() {
  return getAllSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPost(params.slug);
  if (!post) return {};
  const url = `https://verdikart.no/blog/${post.slug}`;
  return {
    title: `${post.title} | Verdikart`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: "Verdikart",
      locale: "nb_NO",
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      images: [
        {
          url: `https://verdikart.no/blog/${post.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [`https://verdikart.no/blog/${post.slug}/opengraph-image`],
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nb-NO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const url = `https://verdikart.no/blog/${post.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      "@type": "Person",
      name: "Michael H.",
      url: "https://verdikart.no/om-oss",
    },
    publisher: {
      "@type": "Organization",
      name: "Verdikart",
      url: "https://verdikart.no",
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hjem", item: "https://verdikart.no" },
      { "@type": "ListItem", position: 2, name: "Blogg", item: "https://verdikart.no/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <>
      <JsonLd schema={articleSchema} />
      <JsonLd schema={breadcrumb} />

      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20">

          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-1.5 text-xs text-text-tertiary">
            <Link href="/" className="hover:text-foreground transition-colors">Hjem</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blog" className="hover:text-foreground transition-colors">Blogg</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="truncate text-text-secondary max-w-[180px]">{post.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-10">
            {/* Hero image placeholder — gradient cover with category label */}
            <div
              className="mb-6 flex h-48 w-full items-end rounded-xl p-5 sm:h-56"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(59,130,246,0.15) 50%, rgba(8,8,16,0.9) 100%), #0f101a",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              <div>
                <span className="mb-2 inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                  {post.category ?? "Boligmarkedet"}
                </span>
                <p className="text-xs text-text-tertiary">
                  {formatDate(post.publishedAt)} · {post.readingMinutes} min lesetid
                </p>
              </div>
            </div>

            <h1 className="mb-4 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              {post.title}
            </h1>

            {/* Author row */}
            <div className="mb-4 flex items-center gap-3">
              <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0" aria-hidden>
                <defs>
                  <linearGradient id="blogAvatarGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
                <circle cx="18" cy="18" r="18" fill="url(#blogAvatarGrad)" opacity="0.18" />
                <circle cx="18" cy="18" r="17" fill="none" stroke="url(#blogAvatarGrad)" strokeWidth="1" opacity="0.5" />
                <text x="18" y="23" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="13" fontWeight="700" fill="url(#blogAvatarGrad)">MH</text>
              </svg>
              <div>
                <p className="text-sm font-medium">Michael H.</p>
                <p className="text-xs text-text-tertiary">Grunnlegger, Verdikart</p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-xs text-text-tertiary">
                <Clock className="h-3 w-3" strokeWidth={1.5} />
                {post.readingMinutes} min
              </div>
            </div>

            <p className="text-base leading-relaxed text-text-secondary">{post.description}</p>

            {/* Share buttons */}
            <ShareButtons url={url} title={post.title} />
          </header>

          {/* Article body */}
          <article className="space-y-8 text-sm leading-relaxed">
            {post.sections.map((section, i) => (
              <section key={i}>
                {section.heading && (
                  <h2 className="mb-3 text-lg font-semibold text-foreground">{section.heading}</h2>
                )}
                {section.body.split("\n").filter(Boolean).map((para, j) => (
                  <p key={j} className="mb-3 text-text-secondary">{para}</p>
                ))}
                {section.list && (
                  <ul className="mb-3 space-y-1.5 pl-1">
                    {section.list.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-text-secondary">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {section.body2 && (
                  <p className="mb-3 text-text-secondary">{section.body2}</p>
                )}
                {section.tip && (
                  <div className="mt-3 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-xs text-text-secondary">
                    <strong className="text-accent">Tips: </strong>{section.tip}
                  </div>
                )}
              </section>
            ))}
          </article>

          {/* CTA */}
          <div className="mt-12 rounded-xl border border-card-border bg-card-bg p-5 text-center">
            <p className="mb-3 font-semibold">Sjekk din adresse på Verdikart</p>
            <p className="mb-4 text-sm text-text-secondary">Gratis transport-, pris- og nabolagsrapport for enhver norsk adresse.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              Søk på adresse
            </Link>
          </div>

          {/* Back */}
          <div className="mt-8">
            <Link href="/blog" className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              Tilbake til blogg
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
