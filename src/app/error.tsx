"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h2 className="text-xl font-bold mb-3">Noe gikk galt</h2>
      <p className="text-text-secondary text-sm mb-6 max-w-sm">
        En uventet feil oppstod. Prøv å laste siden på nytt, eller gå tilbake
        til forsiden.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-80"
        >
          Prøv igjen
        </button>
        <Link
          href="/"
          className="rounded-lg border border-card-border bg-card-bg px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-foreground"
        >
          Til forsiden
        </Link>
      </div>
    </div>
  );
}
