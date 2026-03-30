"use client";

import { useEffect, useState } from "react";

// Simulates a user typing an address and getting results
const ADDRESS = "Bogstadveien 45, Oslo";
const DEMO_STEPS = [
  { delay: 600,  phase: "typing",   chars: 3 },
  { delay: 200,  phase: "typing",   chars: 6 },
  { delay: 150,  phase: "typing",   chars: 10 },
  { delay: 100,  phase: "typing",   chars: 15 },
  { delay: 80,   phase: "typing",   chars: 22 },
  { delay: 200,  phase: "dropdown" },
  { delay: 600,  phase: "selected" },
  { delay: 400,  phase: "loading" },
  { delay: 1200, phase: "results" },
  { delay: 4000, phase: "reset" },
];

type Phase = "idle" | "typing" | "dropdown" | "selected" | "loading" | "results" | "reset";

export default function ProductDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [chars, setChars] = useState(0);
  const [card, setCard] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let stepIdx = 0;

    function runStep() {
      const step = DEMO_STEPS[stepIdx];
      if (!step) {
        // Loop
        stepIdx = 0;
        setPhase("idle");
        setChars(0);
        setCard(0);
        timeout = setTimeout(runStep, 800);
        return;
      }
      if (step.phase === "typing") setChars(step.chars ?? 0);
      setPhase(step.phase as Phase);
      stepIdx++;
      timeout = setTimeout(runStep, step.delay);
    }

    timeout = setTimeout(runStep, 1200);
    return () => clearTimeout(timeout);
  }, []);

  // Card cycling for results phase
  useEffect(() => {
    if (phase !== "results") return;
    const t = setInterval(() => setCard(c => (c + 1) % 3), 1400);
    return () => clearInterval(t);
  }, [phase]);

  const typedText = ADDRESS.slice(0, chars);
  const showCursor = phase === "typing" || phase === "idle";

  const resultCards = [
    { icon: "🚇", label: "Kollektiv", value: "Bogstadveien 300m", badge: "Utmerket", color: "#22C55E" },
    { icon: "📊", label: "Boligpris", value: "94 200 kr/m²", badge: "+5.1% siste år", color: "#6366F1" },
    { icon: "🔊", label: "Støynivå", value: "52 dB vei", badge: "Moderat", color: "#EAB308" },
  ];

  return (
    <div
      className="relative mx-auto w-full max-w-md select-none rounded-2xl border border-card-border bg-card-bg shadow-2xl overflow-hidden"
      aria-hidden
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-card-border bg-background px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 rounded-md bg-card-bg/60 px-3 py-1 text-center text-xs text-text-tertiary">
          verdikart.no
        </div>
      </div>

      {/* Search area */}
      <div className="p-4">
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 transition-all duration-300 ${phase === "selected" || phase === "loading" || phase === "results" ? "border-accent/60 bg-accent/5" : "border-card-border bg-background"}`}>
          <svg className="h-4 w-4 shrink-0 text-text-tertiary" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <span className="flex-1 text-sm text-foreground">
            {phase === "selected" || phase === "loading" || phase === "results"
              ? ADDRESS
              : typedText}
            {showCursor && (
              <span className="inline-block h-3.5 w-px animate-pulse bg-accent align-middle ml-0.5" />
            )}
          </span>
          {(phase === "selected" || phase === "loading" || phase === "results") && (
            <svg className="h-3.5 w-3.5 text-accent shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Dropdown */}
        {phase === "dropdown" && (
          <div className="mt-1 rounded-xl border border-card-border bg-card-bg shadow-xl overflow-hidden">
            {[ADDRESS, "Bogstadveien 47, Oslo"].map((a, i) => (
              <div key={a} className={`px-4 py-2.5 text-sm ${i === 0 ? "bg-accent/10 text-foreground font-medium" : "text-text-secondary"}`}>
                {a}
                {i === 0 && <span className="ml-2 text-[10px] text-accent">↵</span>}
              </div>
            ))}
          </div>
        )}

        {/* Loading state */}
        {phase === "loading" && (
          <div className="mt-3 flex items-center justify-center gap-2 py-4 text-xs text-text-tertiary">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-text-tertiary border-t-accent" />
            Henter transport, pris og støydata…
          </div>
        )}

        {/* Results */}
        {phase === "results" && (
          <div className="mt-3 space-y-2">
            {resultCards.map((c, i) => (
              <div
                key={c.label}
                className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-all duration-500 ${card === i ? "border-accent/30 bg-accent/5 scale-[1.02]" : "border-card-border bg-background"}`}
              >
                <div className="flex items-center gap-2">
                  <span>{c.icon}</span>
                  <span className="text-text-secondary">{c.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-xs tabular-nums">{c.value}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: `${c.color}20`, color: c.color }}
                  >
                    {c.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
