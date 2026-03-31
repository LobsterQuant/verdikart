"use client";

import { useState, useEffect } from "react";
import { Share2, Link2, Check, Printer } from "lucide-react";

export default function PropertyShareBar({ address, url }: { address: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Sjekk ut ${address} på Verdikart`)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="mb-6 flex flex-row flex-wrap items-center gap-2 no-print">
      <span className="text-xs font-medium text-text-tertiary shrink-0">Del:</span>

      {/* X */}
      <a
        href={twitterHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Del på X"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-card-border bg-card-bg text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* Copy link */}
      <button
        onClick={copyLink}
        aria-label="Kopier lenke"
        className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-card-border bg-card-bg px-3 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground"
      >
        {copied ? (
          <><Check className="h-3.5 w-3.5 text-green-400" strokeWidth={2} /><span className="text-green-400">Kopiert!</span></>
        ) : (
          <><Link2 className="h-3.5 w-3.5" strokeWidth={1.5} /><span className="hidden sm:inline">Kopier lenke</span><span className="sm:hidden">Lenke</span></>
        )}
      </button>

      {/* Print — hide on mobile (print is desktop workflow) */}
      <button
        onClick={() => window.print()}
        aria-label="Skriv ut rapport"
        className="hidden sm:flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-card-border bg-card-bg px-3 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground"
      >
        <Printer className="h-3.5 w-3.5" strokeWidth={1.5} />
        Skriv ut
      </button>

      {/* Native share (mobile only) */}
      {canShare && (
        <button
          onClick={() => navigator.share({ title: address, text: `Sjekk eiendomsdata for ${address}`, url })}
          aria-label="Del via telefon"
          className="flex sm:hidden h-8 shrink-0 items-center gap-1.5 rounded-lg border border-card-border bg-card-bg px-3 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground"
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          Del
        </button>
      )}
    </div>
  );
}
