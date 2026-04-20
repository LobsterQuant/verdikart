"use client";

import { useState, useRef, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { Clock, X } from "lucide-react";
import { fadeUp, staggerParent } from "@/lib/motion";

const RECENT_KEY = "verdikart_recent_v2";
const MAX_RECENT = 5;

const MIN_QUERY_CHARS = 3;
const DEBOUNCE_MS = 150;
const GEONORGE_URL = "/api/adresser/sok";

interface RecentEntry {
  adressetekst: string;
  slug: string;
  params: string;
}

function loadRecent(): RecentEntry[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch { return []; }
}

function saveRecent(entry: RecentEntry) {
  try {
    const prev = loadRecent().filter(r => r.slug !== entry.slug);
    localStorage.setItem(RECENT_KEY, JSON.stringify([entry, ...prev].slice(0, MAX_RECENT)));
  } catch { /* ignore */ }
}

interface AddressResult {
  adressetekst: string;
  lat: number;
  lon: number;
  kommunenummer: string;
  kommunenavn: string;
  postnummer: string;
  poststed: string;
}

type SearchState = "idle" | "loading" | "results" | "no-results" | "error";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[æ]/g, "ae")
    .replace(/[ø]/g, "o")
    .replace(/[å]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[áàâä]/g, "a")
    .replace(/[óòôö]/g, "o")
    .replace(/[úùûü]/g, "u")
    .replace(/[íìîï]/g, "i")
    .replace(/ç/g, "c")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCaseKommune(s: string): string {
  return s
    .toLowerCase()
    .split(" ")
    .map(w => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

interface AddressSearchProps {
  initialValue?: string;
  /**
   * When true, suppress the initial auto-fire of the debounced search effect
   * triggered by a pre-filled `initialValue`. The search re-activates the
   * moment the user types anything. Used on /eiendom/[slug] so the widget
   * doesn't flash a "1 treff funnet" dropdown for the page the user is on.
   */
  skipAutoSearch?: boolean;
}

function normalizeAddressForMatch(s: string): string {
  return s.toLowerCase().split(",")[0].trim().replace(/\s+/g, " ");
}

export default function AddressSearch({ initialValue = "", skipAutoSearch = false }: AddressSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<AddressResult[]>([]);
  const [state, setState] = useState<SearchState>("idle");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [showRecent, setShowRecent] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const hasUserInteractedRef = useRef(false);
  const router = useRouter();

  const listboxId = useId();
  const optionId = (i: number) => `${listboxId}-opt-${i}`;

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  // Debounced live-as-you-type search against Kartverket/Geonorge.
  // Aborts any in-flight request when the query changes so only the latest
  // response lands in state (prevents stale results flicker).
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // On pages that pre-fill the input (e.g. /eiendom/[slug]), suppress the
    // initial auto-search. The effect re-runs on every keystroke, so flipping
    // hasUserInteractedRef on onChange is enough to re-enable search.
    if (skipAutoSearch && !hasUserInteractedRef.current) {
      return;
    }

    if (query.trim().length < MIN_QUERY_CHARS) {
      abortRef.current?.abort();
      setResults([]);
      setActiveIndex(-1);
      setState("idle");
      return;
    }

    setState("loading");
    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      runSearch(query.trim(), controller);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, skipAutoSearch]);

  // Clean up in-flight request on unmount.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function runSearch(q: string, controller: AbortController) {
    try {
      const url = `${GEONORGE_URL}?sok=${encodeURIComponent(q)}&treffPerSide=5&fuzzy=true&utkoordsys=4258`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`Geonorge returned ${res.status}`);
      const data = await res.json();
      if (controller.signal.aborted) return;

      const adresser: AddressResult[] = (data?.adresser ?? [])
        .map((a: {
          adressetekst?: string;
          kommunenummer?: string;
          kommunenavn?: string;
          postnummer?: string;
          poststed?: string;
          representasjonspunkt?: { lat?: number; lon?: number };
        }) => ({
          adressetekst: a.adressetekst ?? "",
          lat: a.representasjonspunkt?.lat ?? 0,
          lon: a.representasjonspunkt?.lon ?? 0,
          kommunenummer: a.kommunenummer ?? "",
          kommunenavn: a.kommunenavn ?? "",
          postnummer: a.postnummer ?? "",
          poststed: a.poststed ?? "",
        }))
        .filter((r: AddressResult) => r.adressetekst && r.lat !== 0 && r.lon !== 0)
        .slice(0, 5);

      // /eiendom/[slug] pages pass skipAutoSearch + the page address as
      // initialValue. If the only result matches the current page, skip the
      // state transition entirely so neither the dropdown nor the sr-only
      // "X treff funnet" announcer fires — the widget stays idle until the
      // user types something different.
      if (
        skipAutoSearch &&
        adresser.length > 0 &&
        initialValue &&
        normalizeAddressForMatch(adresser[0].adressetekst) === normalizeAddressForMatch(initialValue)
      ) {
        setResults([]);
        setActiveIndex(-1);
        setShowRecent(false);
        setState("idle");
        return;
      }

      setResults(adresser);
      setActiveIndex(-1);
      setShowRecent(false);
      setState(adresser.length > 0 ? "results" : "no-results");
    } catch (err) {
      if (controller.signal.aborted || (err instanceof DOMException && err.name === "AbortError")) return;
      setResults([]);
      setActiveIndex(-1);
      setState("error");
    }
  }

  const handleSelect = (result: AddressResult) => {
    const humanSlug = toSlug(result.adressetekst);
    const lat4 = Math.round(result.lat * 1e4);
    const lon4 = Math.round(result.lon * 1e4);
    const knr = result.kommunenummer || "0000";
    const encodedSlug = `${humanSlug}--${lat4}-${lon4}-${knr}`;

    const params = new URLSearchParams();
    params.set("adresse", result.adressetekst);
    if (result.postnummer) params.set("pnr", result.postnummer);
    if (result.poststed) params.set("poststed", result.poststed);

    const entry: RecentEntry = {
      adressetekst: result.adressetekst,
      slug: encodedSlug,
      params: params.toString(),
    };
    saveRecent(entry);
    setRecent(loadRecent());

    setQuery(result.adressetekst);
    setState("idle");
    setShowRecent(false);
    abortRef.current?.abort();
    router.push(`/eiendom/${encodedSlug}?${params.toString()}`);
  };

  function clearRecent() {
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
    setShowRecent(false);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (state !== "results" || results.length === 0) {
      if (e.key === "Escape") setShowRecent(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = activeIndex >= 0 ? activeIndex : 0;
      handleSelect(results[idx]);
    } else if (e.key === "Escape") {
      setState("idle");
      setActiveIndex(-1);
    } else if (e.key === "Tab") {
      setState("idle");
      setActiveIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setState(s => (s === "results" || s === "no-results" || s === "error" ? "idle" : s));
        setShowRecent(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // When the top suggestion is the page the user is already on, the dropdown
  // would just offer a link back to "here" — hide it entirely in that case.
  const topMatchesInitial =
    !!initialValue &&
    results.length > 0 &&
    normalizeAddressForMatch(results[0].adressetekst) === normalizeAddressForMatch(initialValue);

  const dropdownOpen =
    (state === "results" && !topMatchesInitial) ||
    state === "no-results" ||
    state === "error";
  const trimmed = query.trim();

  const srAnnouncement = (() => {
    if (state === "loading") return "Søker…";
    if (state === "results" && !topMatchesInitial) return `${results.length} treff funnet`;
    if (state === "no-results") return "Ingen treff";
    if (state === "error") return "Søket er utilgjengelig";
    return "";
  })();

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Gradient border wrapper — 1px padding reveals the gradient as a border */}
      <div
        className="rounded-2xl p-px transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, rgb(var(--accent-rgb) / 0.6) 0%, rgba(59,130,246,0.4) 50%, rgb(var(--accent-rgb) / 0.2) 100%)",
          boxShadow: "0 0 24px rgb(var(--accent-rgb) / 0.12), 0 2px 8px rgba(0,0,0,0.4)",
        }}
        ref={(el) => {
          const input = el?.querySelector("input");
          if (!input) return;
          input.addEventListener("focus", () => {
            if (el) {
              el.style.background = "linear-gradient(135deg, rgb(var(--accent-rgb) / 0.9) 0%, rgba(59,130,246,0.7) 50%, rgba(139,92,246,0.6) 100%)";
              el.style.boxShadow = "0 0 32px rgb(var(--accent-rgb) / 0.25), 0 0 64px rgb(var(--accent-rgb) / 0.1), 0 2px 8px rgba(0,0,0,0.4)";
            }
          });
          input.addEventListener("blur", () => {
            if (el) {
              el.style.background = "linear-gradient(135deg, rgb(var(--accent-rgb) / 0.6) 0%, rgba(59,130,246,0.4) 50%, rgb(var(--accent-rgb) / 0.2) 100%)";
              el.style.boxShadow = "0 0 24px rgb(var(--accent-rgb) / 0.12), 0 2px 8px rgba(0,0,0,0.4)";
            }
          });
        }}
      >
      <div className="relative rounded-[15px] overflow-hidden search-glow transition-shadow duration-200">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            hasUserInteractedRef.current = true;
            setQuery(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!trimmed && recent.length > 0) setShowRecent(true);
          }}
          placeholder="Søk på en adresse..."
          className="w-full rounded-[15px] border-0 bg-[#0e0e12] px-4 py-3 text-base text-foreground placeholder:text-text-tertiary outline-none transition-all duration-200 sm:px-6 sm:py-4 sm:text-lg"
          style={{
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 0 20px rgb(var(--accent-rgb) / 0.03)",
          }}
          role="combobox"
          aria-label="Søk på norsk adresse"
          aria-autocomplete="list"
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-activedescendant={state === "results" && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          autoComplete="street-address"
        />
        {state === "loading" && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2" aria-hidden="true">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-text-tertiary border-t-accent" />
          </div>
        )}
      </div>
      </div>

      {/* Screen reader announcement — live region picks up state transitions */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {srAnnouncement}
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {state === "results" && results.length > 0 && !topMatchesInitial && (
          <m.div
            ref={dropdownRef}
            id={listboxId}
            role="listbox"
            aria-label="Adresseforslag"
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-card-border bg-card-bg shadow-2xl"
            variants={staggerParent(30)}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            {results.map((result, index) => (
              <m.button
                key={`${result.adressetekst}-${result.postnummer}-${index}`}
                id={optionId(index)}
                variants={fadeUp}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full min-h-[44px] px-4 py-3 text-left text-sm transition-colors sm:px-6 ${
                  index === activeIndex
                    ? "bg-accent/10 text-foreground"
                    : "text-text-secondary hover:bg-white/5"
                }`}
              >
                <span className="block font-medium text-foreground">
                  {result.adressetekst}
                </span>
                <span className="mt-0.5 block text-xs text-text-tertiary">
                  {[
                    [result.postnummer, result.poststed].filter(Boolean).join(" "),
                    result.kommunenavn ? `${titleCaseKommune(result.kommunenavn)} kommune` : "",
                  ].filter(Boolean).join(" · ")}
                </span>
              </m.button>
            ))}
          </m.div>
        )}

        {state === "no-results" && (
          <m.div
            ref={dropdownRef}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-card-border bg-card-bg px-4 py-3 shadow-2xl sm:px-6"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            <p className="text-sm text-text-secondary">
              Ingen treff på <span className="text-foreground">&ldquo;{trimmed}&rdquo;</span>.
              Prøv uten postnummer eller skriv gatenavn først.
            </p>
          </m.div>
        )}

        {state === "error" && (
          <m.div
            ref={dropdownRef}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-card-border bg-card-bg px-4 py-3 shadow-2xl sm:px-6"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            <p className="text-sm text-text-secondary">
              Søket er utilgjengelig akkurat nå. Prøv igjen om et øyeblikk.
            </p>
          </m.div>
        )}
      </AnimatePresence>

      {/* Recent searches — shown when input is empty and focused */}
      {!dropdownOpen && state !== "loading" && showRecent && recent.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-card-border bg-card-bg shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2 border-b border-card-border">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-text-tertiary">
              <Clock className="h-3 w-3" strokeWidth={1.5} />
              Sist søkt
            </span>
            <button onClick={clearRecent} className="text-[10px] text-text-tertiary hover:text-foreground flex items-center gap-0.5">
              <X className="h-2.5 w-2.5" strokeWidth={2} />
              Tøm
            </button>
          </div>
          {recent.map((r) => (
            <button
              key={r.slug}
              onClick={() => {
                setShowRecent(false);
                router.push(`/eiendom/${r.slug}?${r.params}`);
              }}
              className="w-full px-6 py-3 text-left text-sm text-text-secondary transition-colors hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0 text-text-tertiary" strokeWidth={1.5} />
                <span className="font-medium text-foreground">{r.adressetekst}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
