import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Clock, ArrowLeft } from "lucide-react";
import { getPost, getAllSlugs } from "../posts";
import JsonLd from "@/components/JsonLd";

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
            <h1 className="mb-4 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-text-tertiary">
              <span>{formatDate(post.publishedAt)}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" strokeWidth={1.5} />
                {post.readingMinutes} min lesetid
              </span>
            </div>
            <p className="mt-4 text-base leading-relaxed text-text-secondary">{post.description}</p>
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
