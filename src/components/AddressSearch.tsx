"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Clock, X } from "lucide-react";

const RECENT_KEY = "verdikart_recent_v2";
const MAX_RECENT = 5;

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
  kommunenummer?: string;
  postnummer?: string;
  poststed?: string;
}

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

export default function AddressSearch({ initialValue = "" }: { initialValue?: string }) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<AddressResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => {
    setRecent(loadRecent());
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/address/search?q=${encodeURIComponent(q)}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setIsOpen(data.length > 0);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchResults(value);
    }, 300);
  };

  const handleSelect = (result: AddressResult) => {
    const humanSlug = toSlug(result.adressetekst);
    const lat6 = Math.round(result.lat * 1e4);
    const lon6 = Math.round(result.lon * 1e4);
    const knr = result.kommunenummer ?? "0000";
    const encodedSlug = `${humanSlug}--${lat6}-${lon6}-${knr}`;

    const params = new URLSearchParams();
    params.set("adresse", result.adressetekst);
    if (result.postnummer) params.set("pnr", result.postnummer);
    if (result.poststed) params.set("poststed", result.poststed);

    // Save to recent
    const entry: RecentEntry = { adressetekst: result.adressetekst, slug: encodedSlug, params: params.toString() };
    saveRecent(entry);
    setRecent(loadRecent());

    setQuery(result.adressetekst);
    setIsOpen(false);
    setShowRecent(false);
    router.push(`/eiendom/${encodedSlug}?${params.toString()}`);
  };

  function clearRecent() {
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
    setShowRecent(false);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
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
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Gradient border wrapper — 1px padding reveals the gradient as a border */}
      <div
        className="rounded-2xl p-px transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.6) 0%, rgba(59,130,246,0.4) 50%, rgba(99,102,241,0.2) 100%)",
          boxShadow: "0 0 24px rgba(99,102,241,0.12), 0 2px 8px rgba(0,0,0,0.4)",
        }}
        ref={(el) => {
          // Brighten gradient border on focus
          const input = el?.querySelector("input");
          if (!input) return;
          input.addEventListener("focus", () => {
            if (el) {
              el.style.background = "linear-gradient(135deg, rgba(99,102,241,0.9) 0%, rgba(59,130,246,0.7) 50%, rgba(139,92,246,0.6) 100%)";
              el.style.boxShadow = "0 0 32px rgba(99,102,241,0.25), 0 0 64px rgba(99,102,241,0.1), 0 2px 8px rgba(0,0,0,0.4)";
            }
          });
          input.addEventListener("blur", () => {
            if (el) {
              el.style.background = "linear-gradient(135deg, rgba(99,102,241,0.6) 0%, rgba(59,130,246,0.4) 50%, rgba(99,102,241,0.2) 100%)";
              el.style.boxShadow = "0 0 24px rgba(99,102,241,0.12), 0 2px 8px rgba(0,0,0,0.4)";
            }
          });
        }}
      >
      <div className="relative rounded-[15px] overflow-hidden search-glow transition-shadow duration-200">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
            else if (!query && recent.length > 0) setShowRecent(true);
          }}
          placeholder="Søk på en adresse..."
          className="w-full rounded-[15px] border-0 bg-[#0e0e12] px-4 py-3 text-base text-foreground placeholder:text-text-tertiary outline-none transition-all duration-200 sm:px-6 sm:py-4 sm:text-lg"
          style={{
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 0 20px rgba(99,102,241,0.03)",
          }}
          role="combobox"
          aria-label="Søk på norsk adresse"
          aria-autocomplete="list"
          aria-expanded={isOpen && results.length > 0}
          aria-haspopup="listbox"
          aria-controls="address-listbox"
          autoComplete="street-address"
        />
        {isLoading && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-text-tertiary border-t-accent" />
          </div>
        )}
      </div>{/* end inner rounded div */}
      </div>{/* end gradient border wrapper */}

      {/* Screen reader announcement for search results */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isOpen && results.length > 0 && `${results.length} adresseforslag funnet`}
        {isLoading && "Søker..."}
      </div>

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          id="address-listbox"
          role="listbox"
          aria-label="Adresseforslag"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-card-border bg-card-bg shadow-2xl"
        >
          {results.map((result, index) => (
            <button
              key={`${result.adressetekst}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`w-full px-6 py-3 text-left text-sm transition-colors ${
                index === activeIndex
                  ? "bg-accent/10 text-foreground"
                  : "text-text-secondary hover:bg-white/5"
              }`}
            >
              <span className="block font-medium text-foreground">
                {result.adressetekst}
              </span>
              {result.poststed && (
                <span className="block text-xs text-text-tertiary mt-0.5">
                  {result.postnummer} {result.poststed}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Recent searches */}
      {!isOpen && showRecent && recent.length > 0 && (
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
