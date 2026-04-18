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

  const iconBtn =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-card-border bg-card-bg text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground";

  return (
    <div className="flex items-center gap-1.5 no-print">
      {/* X */}
      <a
        href={twitterHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Del på X"
        title="Del på X"
        className={iconBtn}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* Copy link */}
      <button
        onClick={copyLink}
        aria-label={copied ? "Lenke kopiert" : "Kopier lenke"}
        title={copied ? "Kopiert!" : "Kopier lenke"}
        className={iconBtn}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-400" strokeWidth={2} />
        ) : (
          <Link2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        )}
      </button>

      {/* Print — desktop only */}
      <button
        onClick={() => window.print()}
        aria-label="Skriv ut rapport"
        title="Skriv ut"
        className={`hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-card-border bg-card-bg text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground`}
      >
        <Printer className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>

      {/* Native share (mobile only) */}
      {canShare && (
        <button
          onClick={() => navigator.share({ title: address, text: `Sjekk eiendomsdata for ${address}`, url })}
          aria-label="Del via telefon"
          title="Del"
          className={`flex sm:hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-card-border bg-card-bg text-text-secondary transition-colors hover:border-accent/40 hover:text-foreground`}
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
