"use client";

import { useEffect, useState, useRef } from "react";
import { Sparkles, ChevronDown } from "lucide-react";

type Status = "idle" | "loading" | "streaming" | "done" | "error";

interface Props {
  address: string;
  kommunenummer: string;
  lat: number;
  lon: number;
}

export default function AISummary({ address, kommunenummer, lat, lon }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [summary, setSummary] = useState("");
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function generate() {
    if (status === "loading" || status === "streaming") return;
    setStatus("loading");
    setSummary("");
    setOpen(true);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, kommunenummer, lat, lon }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) { setStatus("error"); return; }
      if (!res.body) { setStatus("error"); return; }

      setStatus("streaming");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // SSE: data: <text>\n\n
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            const token = line.slice(6);
            if (token === "[DONE]") continue;
            full += token;
            setSummary(full);
          }
        }
      }
      setStatus("done");
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      setStatus("error");
    }
  }

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  return (
    <div className="mt-8 rounded-xl border border-accent/25 bg-card-bg no-print">
      {/* Header — always visible */}
      <button
        onClick={status === "idle" ? generate : () => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15">
          <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-sm font-semibold whitespace-nowrap">AI-oppsummering</p>
            {status === "idle" && (
              <span className="shrink-0 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent whitespace-nowrap">
                Gratis
              </span>
            )}
          </div>
          <p className="text-xs text-text-tertiary">
            {status === "idle" && "Få en 3-setnings analyse av adressens styrker og svakheter basert på transport og prisdata"}
            {status === "loading" && "Henter pris- og transportdata…"}
            {status === "streaming" && "Analyserer…"}
            {status === "done" && "Ferdig — klikk for å skjule"}
            {status === "error" && "Noe gikk galt — prøv igjen"}
          </p>
        </div>
        {status !== "idle" && (
          <ChevronDown
            className={["h-4 w-4 text-text-tertiary transition-transform", open ? "rotate-180" : ""].join(" ")}
            strokeWidth={1.5}
          />
        )}
        {status === "idle" && (
          <span className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap">
            Analyser →
          </span>
        )}
      </button>

      {/* Content */}
      {(status === "loading" || status === "streaming" || status === "done" || status === "error") && open && (
        <div className="border-t border-card-border px-5 pb-5 pt-4">
          {status === "loading" && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`skeleton h-3.5 rounded ${i === 3 ? "w-2/3" : "w-full"}`} />
              ))}
            </div>
          )}
          {(status === "streaming" || status === "done") && (
            <div className="space-y-2">
              <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
                {summary}
                {status === "streaming" && (
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-accent align-middle" />
                )}
              </p>
              {status === "done" && (
                <p className="mt-3 text-[11px] text-text-tertiary">
                  Generert av AI basert på SSB, Kartverket og Entur-data. Ikke et profesjonelt verdivurderingsgrunnlag.
                </p>
              )}
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-3">
              <p className="text-sm text-text-secondary">Kunne ikke generere oppsummering akkurat nå.</p>
              <button onClick={generate} className="text-sm font-medium text-accent hover:underline">
                Prøv igjen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
