import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Clock, ArrowLeft } from "lucide-react";
import { getPost, getAllSlugs, posts } from "../posts";
import JsonLd from "@/components/JsonLd";
import BlogHeroIllustration from "@/components/BlogHeroIllustration";
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
  const url = `https://verdikart.no/blogg/${post.slug}`;
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
          url: `https://verdikart.no/blogg/${post.slug}/opengraph-image`,
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
      images: [
        {
          url: `https://verdikart.no/blogg/${post.slug}/opengraph-image`,
          alt: `Verdikart blogg: ${post.title}`,
        },
      ],
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

  const url = `https://verdikart.no/blogg/${post.slug}`;

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
      name: "Michael Hansen",
      url: "https://www.linkedin.com/in/michael-h-7723993bb/",
    },
    publisher: {
      "@type": "Organization",
      name: "Verdikart",
      url: "https://verdikart.no",
      logo: {
        "@type": "ImageObject",
        url: "https://verdikart.no/icon-512.png",
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hjem", item: "https://verdikart.no" },
      { "@type": "ListItem", position: 2, name: "Blogg", item: "https://verdikart.no/blogg" },
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
            <Link href="/blogg" className="hover:text-foreground transition-colors">Blogg</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="truncate text-text-secondary max-w-[180px]">{post.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-10">
            {/* Hero illustration — SVG per category */}
            <div className="relative mb-6">
              <BlogHeroIllustration category={post.category ?? "Boligmarkedet"} title={post.title} />
              {/* Overlaid metadata */}
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between rounded-b-xl px-5 pb-4 pt-12"
                style={{ background: "linear-gradient(to top, rgba(8,8,16,0.85) 0%, transparent 100%)" }}>
                <div>
                  <span className="mb-1 inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent backdrop-blur-sm">
                    {post.category ?? "Boligmarkedet"}
                  </span>
                  <p className="text-xs text-text-tertiary">
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> · {post.readingMinutes} min lesetid
                  </p>
                </div>
              </div>
            </div>

            <h1 className="mb-4 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              {post.title}
            </h1>

            {/* Author row */}
            <div className="mb-4 flex items-center gap-3">
              <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0" aria-label="Michael Hansen">
                <defs>
                  <linearGradient id="blogAvatarBg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#312e81" />
                    <stop offset="100%" stopColor="#1e1b4b" />
                  </linearGradient>
                  <linearGradient id="blogAvatarRing" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" />
                    <stop offset="100%" stopColor="var(--accent-hover)" />
                  </linearGradient>
                  <clipPath id="blogAvatarClip"><circle cx="18" cy="18" r="17" /></clipPath>
                </defs>
                <circle cx="18" cy="18" r="18" fill="url(#blogAvatarBg)" />
                {/* Torso */}
                <ellipse cx="18" cy="32" rx="10" ry="6" fill="#1e1b4b" clipPath="url(#blogAvatarClip)" />
                {/* Neck */}
                <rect x="15.5" y="23" width="5" height="6" rx="1.5" fill="#c4a882" clipPath="url(#blogAvatarClip)" />
                {/* Head */}
                <ellipse cx="18" cy="19" rx="7" ry="7.5" fill="#c4a882" />
                {/* Hair */}
                <path d="M11 17.5 Q11 10.5 18 10.5 Q25 10.5 25 17.5 Q24 13 18 13 Q12 13 11 17.5 Z" fill="#3d2b1f" />
                {/* Eyes */}
                <ellipse cx="15.5" cy="19.5" rx="1.2" ry="1.3" fill="#2d1b0e" />
                <ellipse cx="20.5" cy="19.5" rx="1.2" ry="1.3" fill="#2d1b0e" />
                <circle cx="16" cy="19" r="0.4" fill="white" opacity="0.7" />
                <circle cx="21" cy="19" r="0.4" fill="white" opacity="0.7" />
                {/* Smile */}
                <path d="M15.5 23 Q18 25 20.5 23" fill="none" stroke="#a07850" strokeWidth="0.7" strokeLinecap="round" />
                {/* Ring */}
                <circle cx="18" cy="18" r="17" fill="none" stroke="url(#blogAvatarRing)" strokeWidth="1" />
              </svg>
              <div>
                <a
                  href="/om-oss"
                  rel="author"
                  className="text-sm font-medium hover:text-accent transition-colors"
                  itemProp="author"
                  itemScope
                  itemType="https://schema.org/Person"
                >
                  <span itemProp="name">Michael Hansen</span>
                </a>
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
          <article className="space-y-0 text-sm leading-relaxed">
            {post.sections.map((section, i) => (
              <section key={i} className="mb-8">
                {section.heading && (
                  <div className="mb-3 flex items-center gap-3">
                    {/* Section number badge */}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                      {i + 1}
                    </span>
                    <h2 className="text-lg font-semibold text-foreground">{section.heading}</h2>
                  </div>
                )}
                {section.body.split("\n").filter(Boolean).map((para, j) => (
                  <p key={j} className="mb-3 text-text-secondary">{para}</p>
                ))}
                {section.list && (
                  <ul className="mb-3 rounded-xl border border-card-border bg-card-bg p-4 space-y-2">
                    {section.list.map((item, li) => (
                      <li key={item} className="flex items-start gap-3 text-text-secondary">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
                          {li + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.body2 && (
                  <p className="mb-3 text-text-secondary">{section.body2}</p>
                )}
                {section.tip && (
                  <div className="mt-3 flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-xs">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <p className="text-text-secondary"><strong className="text-accent font-semibold">Tips: </strong>{section.tip}</p>
                  </div>
                )}
                {/* Divider between sections (not after last) */}
                {i < post.sections.length - 1 && (
                  <div className="mt-8 flex items-center gap-3">
                    <div className="h-px flex-1 bg-card-border" />
                    <div className="h-1 w-1 rounded-full bg-accent/40" />
                    <div className="h-px flex-1 bg-card-border" />
                  </div>
                )}
              </section>
            ))}
          </article>

          {/* Les også */}
          {post.relatedSlugs && post.relatedSlugs.length > 0 && (() => {
            const related = post.relatedSlugs!
              .map(s => posts.find(p => p.slug === s))
              .filter(Boolean) as typeof posts;
            return related.length > 0 ? (
              <div className="mt-12 border-t border-card-border pt-10">
                <h2 className="mb-5 text-base font-semibold text-text-secondary uppercase tracking-widest">Les også</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {related.map(r => (
                    <Link
                      key={r.slug}
                      href={`/blogg/${r.slug}`}
                      className="group rounded-xl border border-card-border bg-card-bg p-4 transition-colors hover:border-accent/40"
                    >
                      {r.category && (
                        <span className="mb-2 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent uppercase tracking-wide">
                          {r.category}
                        </span>
                      )}
                      <p className="text-sm font-medium leading-snug group-hover:text-accent transition-colors line-clamp-3">
                        {r.title}
                      </p>
                      <p className="mt-2 text-[11px] text-text-tertiary">{r.readingMinutes} min</p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* CTA */}
          <div className="mt-12 rounded-xl border border-card-border bg-card-bg p-5 text-center">
            <p className="mb-3 font-semibold">Sjekk din adresse på Verdikart</p>
            <p className="mb-4 text-sm text-text-secondary">Gratis transport-, pris- og nabolagsrapport for enhver norsk adresse.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
            >
              Søk på adresse
            </Link>
          </div>

          {/* Back */}
          <div className="mt-8">
            <Link href="/blogg" className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              Tilbake til blogg
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
