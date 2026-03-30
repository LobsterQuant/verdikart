"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="mt-5 flex items-center gap-2">
      <span className="mr-1 text-xs text-text-tertiary">Del:</span>

      {/* X / Twitter */}
      <a
        href={twitterHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Del på X"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-card-bg text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* LinkedIn */}
      <a
        href={linkedinHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Del på LinkedIn"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-card-bg text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>

      {/* Copy link */}
      <button
        onClick={copyLink}
        aria-label="Kopier lenke"
        className="flex h-8 items-center gap-1.5 rounded-lg border border-card-border bg-card-bg px-3 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground"
      >
        {copied ? (
          <><Check className="h-3.5 w-3.5 text-green-400" strokeWidth={2} /> <span className="text-green-400">Kopiert!</span></>
        ) : (
          <><Link2 className="h-3.5 w-3.5" strokeWidth={1.5} /> Kopier</>
        )}
      </button>
    </div>
  );
}
