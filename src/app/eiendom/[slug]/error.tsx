"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
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
        Vi klarte ikke å laste eiendomsdata akkurat nå. Dette kan skyldes midlertidig
        overbelastning hos en av datakildene.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
      >
        Prøv igjen
      </button>
    </div>
  );
}
