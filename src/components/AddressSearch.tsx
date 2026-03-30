"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

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
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AddressSearch({ initialValue = "" }: { initialValue?: string }) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<AddressResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
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
    const slug = toSlug(result.adressetekst);
    const params = new URLSearchParams();
    params.set("adresse", result.adressetekst);
    params.set("lat", String(result.lat));
    params.set("lon", String(result.lon));
    if (result.kommunenummer) params.set("knr", result.kommunenummer);
    if (result.postnummer) params.set("pnr", result.postnummer);
    if (result.poststed) params.set("poststed", result.poststed);

    setQuery(result.adressetekst);
    setIsOpen(false);
    router.push(`/eiendom/${slug}?${params.toString()}`);
  };

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
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Søk på en adresse..."
          className="w-full rounded-2xl border border-card-border bg-card-bg px-6 py-4 text-lg text-foreground placeholder:text-text-tertiary outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-text-tertiary border-t-accent" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-card-border bg-card-bg shadow-2xl"
        >
          {results.map((result, index) => (
            <button
              key={`${result.adressetekst}-${index}`}
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
    </div>
  );
}
