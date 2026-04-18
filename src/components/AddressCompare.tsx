"use client";

import { useState, useCallback } from "react";
import { X, ArrowLeftRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { nb } from "@/lib/format";

interface AddressResult {
  adressetekst: string;
  lat: number;
  lon: number;
  kommunenummer?: string;
  postnummer?: string;
  poststed?: string;
}

interface SlotData {
  address: AddressResult | null;
  transit: TransitData | null;
  price: PriceData | null;
  noise: string | null;
  loading: boolean;
}

interface TransitData {
  score: string;
  stops: Array<{ name: string; distance: number; modes: string[] }>;
  nearest?: string;
}

interface PriceData {
  sqmPrice: number | null;
  yoyChange: number | null;
  sourceLabel: string;
}

function buildSlug(r: AddressResult) {
  const human = r.adressetekst
    .toLowerCase()
    .replace(/æ/g, "ae").replace(/ø/g, "o").replace(/å/g, "a").replace(/é/g, "e")
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  const lat4 = Math.round(r.lat * 1e4);
  const lon4 = Math.round(r.lon * 1e4);
  return `${human}--${lat4}-${lon4}-${r.kommunenummer ?? "0000"}`;
}

function SearchSlot({
  label, slot, onSelect, onClear,
}: {
  label: string;
  slot: SlotData;
  onSelect: (r: AddressResult) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AddressResult[]>([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);

  const search = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    setFetching(true);
    try {
      const res = await fetch(`/api/address/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data: AddressResult[] = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      }
    } finally { setFetching(false); }
  }, []);

  if (slot.address) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{slot.address.adressetekst}</p>
            {slot.address.poststed && (
              <p className="text-xs text-text-tertiary">{slot.address.postnummer} {slot.address.poststed}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <Link
              href={`/eiendom/${buildSlug(slot.address)}?adresse=${encodeURIComponent(slot.address.adressetekst)}&lat=${slot.address.lat}&lon=${slot.address.lon}&knr=${slot.address.kommunenummer}`}
              target="_blank"
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
              Rapport
            </Link>
            <button onClick={onClear} aria-label="Fjern" className="text-text-tertiary hover:text-foreground">
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {slot.loading && (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        )}

        {!slot.loading && (
          <div className="space-y-3">
            {/* Transit */}
            <div className="rounded-xl border border-card-border bg-card-bg p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Kollektiv</p>
              {slot.transit ? (
                <>
                  <p className="text-lg font-bold">{slot.transit.score}</p>
                  {slot.transit.nearest && <p className="text-xs text-text-secondary">{slot.transit.nearest}</p>}
                  {slot.transit.stops.slice(0, 3).map(s => (
                    <div key={s.name} className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="text-text-secondary">{s.name}</span>
                      <span className="text-text-tertiary">{s.distance}m</span>
                    </div>
                  ))}
                </>
              ) : <p className="text-sm text-text-tertiary">Ingen data</p>}
            </div>

            {/* Price */}
            <div className="rounded-xl border border-card-border bg-card-bg p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Boligpris</p>
              {slot.price?.sqmPrice ? (
                <>
                  <p className="text-lg font-bold tabular-nums">{slot.price.sqmPrice.toLocaleString("nb-NO")} kr/m²</p>
                  <p className="text-xs text-text-secondary">{slot.price.sourceLabel}</p>
                  {slot.price.yoyChange !== null && (
                    <p className={`text-xs font-semibold ${slot.price.yoyChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {slot.price.yoyChange >= 0 ? "+" : ""}{nb(slot.price.yoyChange)} % siste 12 mnd
                    </p>
                  )}
                </>
              ) : <p className="text-sm text-text-tertiary">Ingen data</p>}
            </div>

            {/* Noise */}
            <div className="rounded-xl border border-card-border bg-card-bg p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Støynivå</p>
              <p className="text-sm text-text-secondary">{slot.noise ?? "Ikke tilgjengelig"}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-2">
      <p className="text-xs font-semibold text-text-tertiary">{label}</p>
      <div className="relative">
        <input
          type="text"
          value={query}
          placeholder="Skriv inn adresse…"
          onChange={(e) => search(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="w-full rounded-xl border border-card-border bg-card-bg px-4 py-3 text-sm placeholder:text-text-tertiary focus:border-accent/50 focus:outline-none"
        />
        {fetching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-text-tertiary border-t-accent" />
          </div>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-[76px] z-30 overflow-hidden rounded-xl border border-card-border bg-card-bg shadow-xl">
          {results.map((r) => (
            <button
              key={r.adressetekst}
              onMouseDown={() => { onSelect(r); setQuery(""); setOpen(false); setResults([]); }}
              className="flex w-full items-start gap-2 px-4 py-3 text-left text-sm hover:bg-background"
            >
              <span className="font-medium">{r.adressetekst}</span>
              {r.poststed && <span className="ml-auto shrink-0 text-xs text-text-tertiary">{r.poststed}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY_SLOT: SlotData = { address: null, transit: null, price: null, noise: null, loading: false };

export default function AddressCompare() {
  const [slotA, setSlotA] = useState<SlotData>(EMPTY_SLOT);
  const [slotB, setSlotB] = useState<SlotData>(EMPTY_SLOT);

  async function loadSlotData(r: AddressResult): Promise<Partial<SlotData>> {
    const [transitRes, priceRes, noiseRes] = await Promise.allSettled([
      fetch(`/api/transit/stops?lat=${r.lat}&lon=${r.lon}`),
      fetch(`/api/price-trend?knr=${r.kommunenummer}&pnr=${r.postnummer ?? ""}`),
      fetch(`/api/noise?lat=${r.lat}&lon=${r.lon}`),
    ]);

    let transit: TransitData | null = null;
    if (transitRes.status === "fulfilled" && transitRes.value.ok) {
      const raw = await transitRes.value.json();
      // Transit API returns array of stops directly, each with {name, distance, lines[]}
      const stops = (Array.isArray(raw) ? raw : raw.stops ?? []).slice(0, 5).map((s: { name: string; distance: number; lines?: { mode: string }[]; modes?: string[] }) => ({
        name: s.name,
        distance: s.distance,
        modes: s.modes ?? (s.lines ?? []).map((l: { mode: string }) => l.mode).filter((m: string, i: number, a: string[]) => a.indexOf(m) === i),
      }));
      const nearest = stops[0];
      const dist = nearest?.distance ?? 9999;
      const score = dist <= 300 ? "Utmerket 🟢" : dist <= 600 ? "Godt 🟡" : dist <= 1000 ? "Middels 🟠" : "Begrenset 🔴";
      transit = { score, stops, nearest: nearest ? `${nearest.name} (${nearest.distance}m)` : undefined };
    }

    let price: PriceData | null = null;
    if (priceRes.status === "fulfilled" && priceRes.value.ok) {
      const raw = await priceRes.value.json();
      const latest = raw.values?.at(-1) ?? null;
      price = { sqmPrice: latest, yoyChange: raw.yoyChange ?? null, sourceLabel: raw.sourceLabel ?? "" };
    }

    let noise: string | null = null;
    if (noiseRes.status === "fulfilled" && noiseRes.value.ok) {
      const raw = await noiseRes.value.json();
      // Noise API returns {veinoise, flynoise, jernbanenoise} as dB values or null
      const vei = raw.veinoise ?? raw.road ?? null;
      const fly = raw.flynoise ?? raw.air ?? null;
      const tog = raw.jernbanenoise ?? raw.rail ?? null;
      if (vei !== null || fly !== null || tog !== null) {
        const parts = [];
        if (vei !== null) parts.push(`Vei: ${vei} dB`);
        if (fly !== null) parts.push(`Fly: ${fly} dB`);
        if (tog !== null) parts.push(`Tog: ${tog} dB`);
        noise = parts.join(" · ");
      } else {
        noise = "Ingen støydata";
      }
    }

    return { transit, price, noise, loading: false };
  }

  async function selectA(r: AddressResult) {
    setSlotA({ ...EMPTY_SLOT, address: r, loading: true });
    const data = await loadSlotData(r);
    setSlotA(prev => ({ ...prev, ...data }));
  }

  async function selectB(r: AddressResult) {
    setSlotB({ ...EMPTY_SLOT, address: r, loading: true });
    const data = await loadSlotData(r);
    setSlotB(prev => ({ ...prev, ...data }));
  }

  // Winner highlights per metric
  const priceWinner =
    slotA.price?.sqmPrice && slotB.price?.sqmPrice
      ? slotA.price.sqmPrice < slotB.price.sqmPrice ? "A" : slotB.price.sqmPrice < slotA.price.sqmPrice ? "B" : null
      : null;

  return (
    <div className="space-y-6">
      {/* Search row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SearchSlot label="Adresse A" slot={slotA} onSelect={selectA} onClear={() => setSlotA(EMPTY_SLOT)} />
        <SearchSlot label="Adresse B" slot={slotB} onSelect={selectB} onClear={() => setSlotB(EMPTY_SLOT)} />
      </div>
      {(!slotA.address || !slotB.address) && (slotA.address || slotB.address) && (
        <p className="text-center text-xs text-text-tertiary animate-pulse">
          {!slotA.address ? "Søk på Adresse A for å starte sammenligningen" : "Søk på Adresse B for å fullføre sammenligningen"}
        </p>
      )}

      {/* Winner banner */}
      {priceWinner && slotA.address && slotB.address && (
        <div className="flex items-center gap-3 rounded-xl border border-green-500/25 bg-green-500/8 px-5 py-3 text-sm">
          <span className="text-green-400 text-base">💰</span>
          <p className="text-text-secondary">
            <strong className="text-foreground">
              {priceWinner === "A" ? slotA.address.adressetekst : slotB.address.adressetekst}
            </strong>{" "}
            har lavere kvadratmeterpris (
            {priceWinner === "A"
              ? `${slotA.price!.sqmPrice!.toLocaleString("nb-NO")} vs ${slotB.price!.sqmPrice!.toLocaleString("nb-NO")} kr/m²`
              : `${slotB.price!.sqmPrice!.toLocaleString("nb-NO")} vs ${slotA.price!.sqmPrice!.toLocaleString("nb-NO")} kr/m²`}
            )
          </p>
          <ArrowLeftRight className="h-4 w-4 shrink-0 text-text-tertiary ml-auto" strokeWidth={1.5} />
        </div>
      )}

      {/* Empty state — sample preview */}
      {!slotA.address && !slotB.address && (
        <div className="space-y-4">
          <p className="text-center text-xs text-text-tertiary uppercase tracking-widest font-semibold">Eksempel på sammenligning</p>
          <p className="text-center text-[11px] text-text-tertiary/70">Illustrativt — søk på ekte adresser for å se faktiske data</p>
          {/* Sample comparison cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 opacity-60 pointer-events-none select-none">
            {[
              {
                label: "Adresse A",
                name: "Parkveien 12, Oslo (eks.)",
                transit: "Utmerket 🟢",
                nearest: "Nationaltheatret (200m)",
                price: "112 000 kr/m²",
                noise: "Moderat støy 🟡",
              },
              {
                label: "Adresse B",
                name: "Fossveien 20, Oslo (eks.)",
                transit: "Godt 🟡",
                nearest: "Grünerløkka (380m)",
                price: "78 500 kr/m²",
                noise: "Lav støy 🟢",
              },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-card-border bg-card-bg p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-text-tertiary uppercase tracking-widest">{s.label}</p>
                  <p className="mt-0.5 font-medium text-foreground text-sm">{s.name}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">🚇 Kollektiv</span>
                    <span className="font-medium">{s.transit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">📍 Nærmeste stopp</span>
                    <span className="text-text-secondary text-xs">{s.nearest}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">💰 Boligpris</span>
                    <span className="font-medium">{s.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">🔊 Støynivå</span>
                    <span className="font-medium">{s.noise}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 px-5 py-3 text-sm opacity-60">
            <span className="text-green-400">💰</span>
            <p className="text-text-secondary"><strong className="text-foreground">Fossveien 20 (eks.)</strong> har lavere kvadratmeterpris (78 500 vs 112 000 kr/m²)</p>
          </div>
          <p className="text-center text-xs text-text-tertiary">Søk på to adresser ovenfor for å se ekte data</p>
        </div>
      )}
    </div>
  );
}
