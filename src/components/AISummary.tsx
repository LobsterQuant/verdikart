"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

type Status = "loading" | "done" | "error";

interface Props {
  slug: string;
}

/**
 * Second tier of the address summary card. Auto-loads on mount — no button,
 * no opt-in. The API route is cached per address so repeat visitors get an
 * instant KV hit; only the first visitor to a given address pays the LLM
 * latency.
 *
 * Only the slug is sent — the server derives trusted lat/lon/kommunenummer
 * and reverse-geocodes the address from the slug suffix, so a crafted body
 * cannot poison the per-slug cache entry with attacker-chosen prose.
 */
export default function AISummary({ slug }: Props) {
  const [status, setStatus] = useState<Status>("loading");
  const [summary, setSummary] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current = new AbortController();
    const controller = abortRef.current;

    (async () => {
      try {
        const res = await fetch("/api/ai-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
          signal: controller.signal,
        });
        if (!res.ok) {
          setStatus("error");
          return;
        }
        const data = (await res.json()) as { summary?: string };
        if (!data.summary) {
          setStatus("error");
          return;
        }
        setSummary(data.summary);
        setStatus("done");
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") return;
        setStatus("error");
      }
    })();

    return () => controller.abort();
  }, [slug]);

  if (status === "error") {
    // Swallow the section silently when the backend is unreachable. The
    // deterministic bullets above already carry the load-bearing facts.
    return null;
  }

  return (
    <div className="border-t border-card-border bg-accent/[0.03] px-5 py-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
        <h4 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Fra Verdikart
        </h4>
      </div>

      {status === "loading" && (
        <div className="mt-3 space-y-2">
          <div className="skeleton h-3.5 w-full rounded" />
          <div className="skeleton h-3.5 w-[92%] rounded" />
          <div className="skeleton h-3.5 w-2/3 rounded" />
        </div>
      )}

      {status === "done" && (
        <>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {summary}
          </p>
          <p className="mt-3 text-[11px] text-text-tertiary">
            Basert på SSB, Kartverket og Entur-data. Ikke et profesjonelt verdivurderingsgrunnlag.
          </p>
        </>
      )}
    </div>
  );
}
