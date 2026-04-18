"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

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
    <html lang="nb">
      <body>
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "1.5rem", textAlign: "center" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.75rem" }}>Noe gikk galt</h2>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              En uventet feil oppstod. Prøv å laste siden på nytt.
            </p>
            <button
              onClick={reset}
              style={{ padding: "0.625rem 1.25rem", borderRadius: "0.5rem", backgroundColor: "var(--accent)", color: "white", border: "none", cursor: "pointer", fontSize: "0.875rem" }}
            >
              Prøv igjen
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
