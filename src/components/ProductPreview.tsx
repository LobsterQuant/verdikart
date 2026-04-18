"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Bus, TrendingUp, BarChart2, Clock } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import type { RefObject } from "react";

// ── helpers ────────────────────────────────────────────────────────────────

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function useCountUp(target: number, decimals = 0, duration = 1400, active = false) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    setValue(0);
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min((now - start) / duration, 1);
      setValue(easeOutExpo(elapsed) * target);
      if (elapsed < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [active, target, duration]);

  return decimals > 0
    ? value.toFixed(decimals).replace(".", ",")
    : Math.round(value).toLocaleString("nb-NO");
}

// ── chart data ──────────────────────────────────────────────────────────────

const chartPoints = [82, 87, 91, 95, 100, 108, 118, 128];
const maxVal = Math.max(...chartPoints);
const minVal = Math.min(...chartPoints);
const range = maxVal - minVal;
const SVG_H = 48;
const SVG_W = 200;

const pts = chartPoints.map((v, i) => {
  const x = (i / (chartPoints.length - 1)) * SVG_W;
  const y = SVG_H - ((v - minVal) / range) * (SVG_H - 6) - 3;
  return `${x},${y}`;
});
const polyline = pts.join(" ");
const areaPath = `M0,${SVG_H} L${pts[0]} ${pts.slice(1).map((p) => `L${p}`).join(" ")} L${SVG_W},${SVG_H} Z`;

// ── tab definitions ────────────────────────────────────────────────────────

const TABS = ["Transport", "Prisutvikling", "Markedsdata"] as const;
type Tab = (typeof TABS)[number];
const CYCLE_MS = 3200;

// ── main component ─────────────────────────────────────────────────────────

export default function ProductPreview() {
  const { ref, inView } = useInView(0.5);
  const [activeTab, setActiveTab] = useState<Tab>("Transport");
  const [userPaused, setUserPaused] = useState(false);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const minutes = useCountUp(8, 0, 900, inView);
  const pct = useCountUp(5.2, 1, 1200, inView);
  const sqm = useCountUp(151900, 0, 1500, inView);

  const DEMO_HREF =
    "/eiendom/bygdoy-alle-2--599151-107152-0301" +
    "?adresse=Bygd%C3%B8y+all%C3%A9+2%2C+Oslo&lat=59.91506&lon=10.71522&knr=0301";

  const sparkRef = useRef<SVGPolylineElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (sparkRef.current) {
      setPathLength(sparkRef.current.getTotalLength?.() ?? 300);
    }
  }, []);

  useEffect(() => {
    if (!inView || !sparkRef.current || pathLength === 0) return;
    const el = sparkRef.current;
    el.style.strokeDasharray = `${pathLength}`;
    el.style.strokeDashoffset = `${pathLength}`;
    el.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1) 0.4s";
    requestAnimationFrame(() => { el.style.strokeDashoffset = "0"; });
  }, [inView, pathLength]);

  // Auto-cycle tabs
  const startCycle = useCallback(() => {
    if (cycleRef.current) clearInterval(cycleRef.current);
    cycleRef.current = setInterval(() => {
      setActiveTab((t) => {
        const idx = TABS.indexOf(t);
        return TABS[(idx + 1) % TABS.length];
      });
    }, CYCLE_MS);
  }, []);

  useEffect(() => {
    if (inView && !userPaused) startCycle();
    else if (cycleRef.current) clearInterval(cycleRef.current);
    return () => { if (cycleRef.current) clearInterval(cycleRef.current); };
  }, [inView, userPaused, startCycle]);

  function handleTabClick(tab: Tab) {
    setActiveTab(tab);
    setUserPaused(true); // pause auto-cycle on manual interaction
  }

  return (
    <div ref={ref as RefObject<HTMLDivElement>} className="w-full max-w-2xl mx-auto">

      {/* Branded preview card — no fake browser chrome */}
      <div className="rounded-2xl border border-card-border bg-card-bg overflow-hidden shadow-2xl shadow-black/50">

        {/* Page header */}
        <div className="flex items-start justify-between gap-3 border-b border-card-border px-4 pb-3 pt-4 sm:px-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">Eiendomsrapport</p>
            <h2 className="mt-0.5 text-base font-bold sm:text-lg">Bygdøy allé 2, Oslo</h2>
          </div>
          <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent">
            Eksempel
          </span>
        </div>

        {/* Tab row */}
        <div className="flex border-b border-card-border px-4 sm:px-5">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={[
                "relative pb-2.5 pt-2.5 text-xs font-medium transition-colors mr-5 last:mr-0 whitespace-nowrap",
                activeTab === tab
                  ? "text-foreground"
                  : "text-text-tertiary hover:text-text-secondary",
              ].join(" ")}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-accent" />
              )}
            </button>
          ))}
        </div>

        {/* Card content — switches per tab */}
        <div className="p-4 sm:p-5">
          {activeTab === "Transport" && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Main stat */}
                <div className="rounded-lg border border-card-border bg-background p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Bus className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-text-secondary">Kollektivtransport</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-text-tertiary mb-0.5 shrink-0" strokeWidth={1.5} />
                    <span className="text-3xl font-bold tabular-nums">{minutes}</span>
                    <span className="text-sm text-text-secondary">min til sentrum</span>
                  </div>
                  <span className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>
                    Utmerket
                  </span>
                </div>
                {/* Stop list */}
                <div className="rounded-lg border border-card-border bg-background p-4">
                  <p className="mb-3 text-xs font-medium text-text-secondary">Holdeplasser innen 5 min</p>
                  <ul className="space-y-2">
                    {[
                      { name: "Frogner plass", line: "20", mins: "2 min" },
                      { name: "Drammensveien", line: "30", mins: "4 min" },
                      { name: "Nationaltheatret", line: "T-bane", mins: "5 min" },
                    ].map(({ name, line, mins }) => (
                      <li key={name} className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-xs text-foreground">{name}</span>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">{line}</span>
                          <span className="text-[10px] text-text-tertiary">{mins}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Prisutvikling" && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-card-border bg-background p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <TrendingUp className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-text-secondary">Prisutvikling</span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-500 shrink-0" strokeWidth={2} />
                    <span className="text-3xl font-bold text-green-500">+{pct}%</span>
                  </div>
                  <p className="text-xs text-text-tertiary">siste 12 mnd · Frogner</p>
                  {/* Animated sparkline */}
                  <div className="mt-3 rounded overflow-hidden">
                    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-10" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="ppGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={areaPath} fill="url(#ppGrad)" />
                      <polyline ref={sparkRef} points={polyline} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="rounded-lg border border-card-border bg-background p-4">
                  <p className="mb-3 text-xs font-medium text-text-secondary">Historikk</p>
                  <ul className="space-y-2">
                    {[
                      { year: "2022", pct: "+3.1%" },
                      { year: "2023", pct: "+4.8%" },
                      { year: "2024", pct: "+5.2%", active: true },
                    ].map(({ year, pct: p, active }) => (
                      <li key={year} className="flex items-center justify-between">
                        <span className="text-xs text-text-secondary">{year}</span>
                        <span className={["text-xs font-semibold", active ? "text-green-400" : "text-text-tertiary"].join(" ")}>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 h-px bg-card-border" />
                  <p className="mt-2 text-[10px] text-text-tertiary">Eksempel · SSB boligprisstatistikk</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Markedsdata" && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-card-border bg-background p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <BarChart2 className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-text-secondary">Markedsdata</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tabular-nums">{sqm}</span>
                    <span className="text-sm text-text-secondary">kr/m²</span>
                  </div>
                  <p className="mt-1 text-xs text-text-tertiary">Estimert snitt, Frogner (eksempel)</p>
                  <span className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "#818cf8" }}>
                    Høyt segment
                  </span>
                </div>
                <div className="rounded-lg border border-card-border bg-background p-4">
                  <p className="mb-3 text-xs font-medium text-text-secondary">Sammenlign</p>
                  <ul className="space-y-2">
                    {[
                      { area: "Frogner", price: "151 900", active: true },
                      { area: "Grünerløkka", price: "112 400" },
                      { area: "Oslo snitt", price: "98 200" },
                    ].map(({ area, price, active }) => (
                      <li key={area} className="flex items-center justify-between">
                        <span className={["text-xs", active ? "font-semibold text-foreground" : "text-text-secondary"].join(" ")}>{area}</span>
                        <span className={["text-xs font-mono", active ? "text-accent" : "text-text-tertiary"].join(" ")}>{price} kr/m²</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress dots + label */}
        <div className="flex items-center justify-between border-t border-card-border px-4 py-2.5 sm:px-5">
          <div className="flex gap-1.5">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                aria-label={tab}
                className={[
                  "h-1.5 rounded-full transition-all duration-300",
                  activeTab === tab ? "w-5 bg-accent" : "w-1.5 bg-card-border hover:bg-text-tertiary",
                ].join(" ")}
              />
            ))}
          </div>
          <p className="text-[10px] text-text-tertiary">
            {userPaused ? "Klikk for å bytte" : "Bytter automatisk"}
          </p>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-text-tertiary">
        Eksempel:{" "}
        <Link href={DEMO_HREF} className="text-accent hover:underline">
          Bygdøy allé 2, Oslo
        </Link>{" "}
        — data fra SSB, Kartverket og Entur
      </p>
    </div>
  );
}
