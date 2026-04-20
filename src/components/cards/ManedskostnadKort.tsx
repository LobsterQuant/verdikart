"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { Wallet, Pencil } from "lucide-react";
import { TopographicHover } from "@/components/motion/TopographicHover";
import { Slider } from "@/components/ui/Slider";
import { eiendomsskattData } from "@/data/eiendomsskatt";
import {
  calculateMonthlyCost,
  type MonthlyCostResult,
} from "@/lib/finance/mortgage";
import {
  FELLESKOSTNADER_ESTIMATE,
  INDICATIVE_RATE,
} from "@/lib/finance/constants";
import { formatPct } from "@/lib/format";
import { isResidentialCategory } from "@/lib/enova/category";

interface ManedskostnadKortProps {
  kommunenummer: string;
  postnummer: string;
  adresse: string;
}

interface PriceTrendResponse {
  values: number[];
  sourceLabel?: string;
  source?: string;
}

interface EnergimerkeResponse {
  bruksareal: number | null;
  bygningskategori?: string | null;
}

const PRICE_MIN = 500_000;
const PRICE_MAX = 20_000_000;
const PRICE_STEP = 100_000;
const EQUITY_MIN = 0.15;
const EQUITY_MAX = 0.40;
const EQUITY_STEP = 0.01;
const YEARS_MIN = 15;
const YEARS_MAX = 30;
const FELLES_MIN = 0;
const FELLES_MAX = 15_000;
const FELLES_STEP = 100;
const BRA_MIN = 1;
const BRA_MAX = 500;

function fmtKr(value: number): string {
  return `${Math.round(value).toLocaleString("nb-NO")} kr`;
}

function fmtPurchasePrice(value: number): string {
  if (value >= 1_000_000) {
    const mnok = value / 1_000_000;
    return `${mnok.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MNOK`;
  }
  return fmtKr(value);
}

function snapPrice(value: number): number {
  return Math.max(
    PRICE_MIN,
    Math.min(PRICE_MAX, Math.round(value / PRICE_STEP) * PRICE_STEP),
  );
}

function parseNbInt(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(/[^\d]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function monthlyEiendomsskatt(
  kommunenummer: string,
  marketValue: number,
): { monthly: number; kommuneName: string | null; hasTax: boolean } {
  const data = eiendomsskattData[kommunenummer];
  if (!data) return { monthly: 0, kommuneName: null, hasTax: false };
  if (!data.hasTax || !data.promille) {
    return { monthly: 0, kommuneName: data.name, hasTax: false };
  }
  const reduction = data.reductionFactor ?? 1;
  const bunn = data.bunnfradrag ?? 0;
  const taxable = Math.max(0, marketValue * reduction - bunn);
  const annual = (taxable * data.promille) / 1000;
  return {
    monthly: Math.round(annual / 12),
    kommuneName: data.name,
    hasTax: true,
  };
}

function boligtypeFromKategori(kategori: string | null | undefined): string {
  if (!kategori) return "default";
  const k = kategori.toLowerCase();
  if (k.includes("blokk")) return "leilighet";
  if (k.includes("rekkehus")) return "rekkehus";
  if (k.includes("tomannsbolig")) return "tomannsbolig";
  if (k.includes("enebolig")) return "enebolig";
  if (k.includes("småhus")) return "enebolig";
  return "default";
}

export default function ManedskostnadKort({
  kommunenummer,
  postnummer,
  adresse,
}: ManedskostnadKortProps) {
  const [sqmPrice, setSqmPrice] = useState<number | null>(null);
  const [bruksareal, setBruksareal] = useState<number | null>(null);
  const [boligtype, setBoligtype] = useState<string>("default");
  const [bygningskategori, setBygningskategori] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [purchasePrice, setPurchasePrice] = useState<number | null>(null);
  const [priceInitialized, setPriceInitialized] = useState(false);
  const [manualBra, setManualBra] = useState<number | null>(null);
  const [manualPrice, setManualPrice] = useState<number | null>(null);
  const [cameFromManualInput, setCameFromManualInput] = useState(false);

  const [braInput, setBraInput] = useState("");
  const [braError, setBraError] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [priceError, setPriceError] = useState<string | null>(null);

  const [equityPercent, setEquityPercent] = useState<number>(EQUITY_MIN);
  const [loanYears, setLoanYears] = useState<number>(25);
  const [felleskostnader, setFelleskostnader] = useState<number>(
    FELLESKOSTNADER_ESTIMATE.default,
  );
  const [fellesInitialized, setFellesInitialized] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [priceRes, energiRes] = await Promise.all([
          fetch(`/api/price-trend?kommunenummer=${kommunenummer}&postnummer=${postnummer}`),
          fetch(`/api/energimerke?postnummer=${postnummer}&adresse=${encodeURIComponent(adresse)}`),
        ]);

        if (priceRes.ok) {
          const priceData: PriceTrendResponse = await priceRes.json();
          if (priceData.values?.length) {
            setSqmPrice(priceData.values[priceData.values.length - 1]);
          }
        }

        if (energiRes.ok) {
          const energiData: EnergimerkeResponse = await energiRes.json();
          if (energiData.bruksareal && energiData.bruksareal > 0 && energiData.bruksareal <= 500) {
            setBruksareal(energiData.bruksareal);
          }
          setBoligtype(boligtypeFromKategori(energiData.bygningskategori));
          setBygningskategori(energiData.bygningskategori ?? null);
        }
      } catch {
        // Card degrades gracefully — user falls through to manual input.
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [kommunenummer, postnummer, adresse]);

  useEffect(() => {
    if (loading) return;
    if (priceInitialized) return;

    // Scenario 1: Enova has BRA + SSB has sqmPrice.
    if (sqmPrice && bruksareal) {
      setPurchasePrice(snapPrice(sqmPrice * bruksareal));
      setPriceInitialized(true);
      return;
    }

    // Scenario 2: user supplied BRA manually.
    if (sqmPrice && manualBra) {
      setPurchasePrice(snapPrice(sqmPrice * manualBra));
      setPriceInitialized(true);
      setCameFromManualInput(true);
      return;
    }

    // Scenario 3 & 4: user supplied purchase price directly.
    if (manualPrice) {
      setPurchasePrice(snapPrice(manualPrice));
      setPriceInitialized(true);
      setCameFromManualInput(true);
      return;
    }
  }, [loading, sqmPrice, bruksareal, manualBra, manualPrice, priceInitialized]);

  useEffect(() => {
    if (fellesInitialized) return;
    if (boligtype !== "default") {
      setFelleskostnader(
        FELLESKOSTNADER_ESTIMATE[boligtype] ?? FELLESKOSTNADER_ESTIMATE.default,
      );
      setFellesInitialized(true);
    }
  }, [boligtype, fellesInitialized]);

  const eiendomsskatt = useMemo(
    () => monthlyEiendomsskatt(kommunenummer, purchasePrice ?? 0),
    [kommunenummer, purchasePrice],
  );

  const result = useMemo<MonthlyCostResult | null>(() => {
    if (purchasePrice === null) return null;
    return calculateMonthlyCost({
      purchasePrice,
      equityPercent,
      loanYears,
      felleskostnader,
      eiendomsskatt: eiendomsskatt.monthly,
    });
  }, [purchasePrice, equityPercent, loanYears, felleskostnader, eiendomsskatt.monthly]);

  function handleBraSubmit() {
    const n = parseNbInt(braInput);
    if (n === null || n < BRA_MIN || n > BRA_MAX) {
      setBraError(`Oppgi BRA mellom ${BRA_MIN} og ${BRA_MAX} m²`);
      return;
    }
    setBraError(null);
    setManualBra(n);
  }

  function handlePriceSubmit() {
    const n = parseNbInt(priceInput);
    if (n === null || n < PRICE_MIN || n > PRICE_MAX) {
      setPriceError(
        `Oppgi kjøpspris mellom ${PRICE_MIN.toLocaleString("nb-NO")} og ${PRICE_MAX.toLocaleString("nb-NO")} kr`,
      );
      return;
    }
    setPriceError(null);
    setManualPrice(n);
  }

  function handleEdit() {
    setPurchasePrice(null);
    setPriceInitialized(false);
    setManualBra(null);
    setManualPrice(null);
    setCameFromManualInput(false);
    setBraInput("");
    setPriceInput("");
    setBraError(null);
    setPriceError(null);
  }

  function onPriceInputChange(raw: string) {
    // Strip everything except digits, then re-format with Norwegian thousand
    // separator so the user can paste "5 000 000" or type "5000000" freely.
    const digits = raw.replace(/[^\d]/g, "");
    setPriceInput(digits ? Number(digits).toLocaleString("nb-NO") : "");
    if (priceError) setPriceError(null);
  }

  function onBraInputChange(raw: string) {
    setBraInput(raw.replace(/[^\d]/g, ""));
    if (braError) setBraError(null);
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLInputElement>, submit: () => void) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  // Guard: hide the whole card for næringsbygg (Kontorbygg, Skole, Sykehus, etc.).
  // Unknown kategori (no Enova data) falls through to residential and stays visible.
  if (!loading && bygningskategori && !isResidentialCategory(bygningskategori)) {
    return null;
  }

  const needsBraInput = !loading && !bruksareal && !!sqmPrice;
  const needsPriceInput = !loading && !sqmPrice;
  const isInputMode = purchasePrice === null && (needsBraInput || needsPriceInput);
  const ratePercent = result ? formatPct(result.rate * 100, 2) : "";
  const stressRatePercent = result ? formatPct(result.stressRate * 100, 1) : "";
  const equityKr = purchasePrice != null ? Math.round(purchasePrice * equityPercent) : 0;

  const purchaseHelper: string = (() => {
    if (bruksareal && sqmPrice) {
      return `Estimat basert på ${sqmPrice.toLocaleString("nb-NO")} kr/m² × ${bruksareal} m²`;
    }
    if (cameFromManualInput && manualBra && sqmPrice) {
      return `Basert på ${sqmPrice.toLocaleString("nb-NO")} kr/m² × ${manualBra} m² (manuelt oppgitt)`;
    }
    if (cameFromManualInput && manualPrice) {
      return "Kjøpspris oppgitt manuelt";
    }
    return "Juster med sliderne under";
  })();

  return (
    <TopographicHover className="relative rounded-2xl border border-card-border bg-card-bg p-4 sm:p-6">
      <header className="mb-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Wallet className="h-5 w-5 text-accent" strokeWidth={1.75} />
          Månedskostnad
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Estimert månedskostnad for denne adressen
        </p>
      </header>

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-12 w-full" />
        </div>
      ) : isInputMode ? (
        <div className="rounded-xl border border-card-border bg-background/40 p-4 sm:p-5">
          {needsBraInput ? (
            <>
              <label
                htmlFor="manedskostnad-bra"
                className="block text-sm font-medium text-foreground"
              >
                BRA (m²)
              </label>
              <p className="mt-1 text-xs text-text-secondary">
                Boligens areal er ikke tilgjengelig. Fyll inn for å få estimat.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="relative flex-1 sm:max-w-xs">
                  <input
                    id="manedskostnad-bra"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="f.eks. 75"
                    value={braInput}
                    onChange={(e) => onBraInputChange(e.target.value)}
                    onBlur={handleBraSubmit}
                    onKeyDown={(e) => onInputKeyDown(e, handleBraSubmit)}
                    aria-invalid={braError ? true : undefined}
                    aria-describedby={braError ? "manedskostnad-bra-error" : undefined}
                    className="w-full rounded-lg border border-card-border bg-background px-3 py-2 pr-10 text-sm focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-tertiary">
                    m²
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleBraSubmit}
                  className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Beregn
                </button>
              </div>
              {braError && (
                <p id="manedskostnad-bra-error" className="mt-2 text-xs text-red-400">
                  {braError}
                </p>
              )}
              {sqmPrice && (
                <p className="mt-3 text-xs text-text-secondary">
                  Snitt m²-pris i området: {sqmPrice.toLocaleString("nb-NO")} kr/m²
                </p>
              )}
            </>
          ) : (
            <>
              <label
                htmlFor="manedskostnad-pris"
                className="block text-sm font-medium text-foreground"
              >
                Kjøpspris
              </label>
              <p className="mt-1 text-xs text-text-secondary">
                {bruksareal
                  ? "Prissnitt for området er ikke tilgjengelig. Fyll inn kjøpspris direkte."
                  : "Fyll inn kjøpspris for å få estimat."}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="relative flex-1 sm:max-w-xs">
                  <input
                    id="manedskostnad-pris"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="f.eks. 5 000 000"
                    value={priceInput}
                    onChange={(e) => onPriceInputChange(e.target.value)}
                    onBlur={handlePriceSubmit}
                    onKeyDown={(e) => onInputKeyDown(e, handlePriceSubmit)}
                    aria-invalid={priceError ? true : undefined}
                    aria-describedby={priceError ? "manedskostnad-pris-error" : undefined}
                    className="w-full rounded-lg border border-card-border bg-background px-3 py-2 pr-10 text-sm tabular-nums focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-tertiary">
                    kr
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handlePriceSubmit}
                  className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Beregn
                </button>
              </div>
              {priceError && (
                <p id="manedskostnad-pris-error" className="mt-2 text-xs text-red-400">
                  {priceError}
                </p>
              )}
            </>
          )}
        </div>
      ) : result && purchasePrice != null ? (
        <>
          {cameFromManualInput && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-card-border bg-background/40 px-3 py-2 text-xs text-text-secondary">
              <span>{purchaseHelper}</span>
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Pencil className="h-3 w-3" strokeWidth={2} />
                Endre
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Slider
              label="Kjøpspris"
              value={purchasePrice}
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              onChange={setPurchasePrice}
              displayValue={fmtPurchasePrice(purchasePrice)}
              helper={purchaseHelper}
            />
            <Slider
              label="Egenkapital"
              value={Math.round(equityPercent * 100)}
              min={Math.round(EQUITY_MIN * 100)}
              max={Math.round(EQUITY_MAX * 100)}
              step={Math.round(EQUITY_STEP * 100)}
              onChange={(v) => setEquityPercent(v / 100)}
              displayValue={`${Math.round(equityPercent * 100)} % · ${fmtKr(equityKr)}`}
              helper="Minimum 15 % per boliglånsforskriften"
            />
            <Slider
              label="Nedbetalingstid"
              value={loanYears}
              min={YEARS_MIN}
              max={YEARS_MAX}
              step={1}
              onChange={setLoanYears}
              displayValue={`${loanYears} år`}
              helper="Annuitetslån"
            />
            <Slider
              label="Felleskostnader"
              value={felleskostnader}
              min={FELLES_MIN}
              max={FELLES_MAX}
              step={FELLES_STEP}
              onChange={setFelleskostnader}
              displayValue={`${fmtKr(felleskostnader)}/md`}
              helper={
                boligtype !== "default"
                  ? `Typisk for ${boligtype}: juster etter faktiske kostnader`
                  : "Juster etter faktiske kostnader"
              }
            />
          </div>

          <div className="my-6 h-px bg-card-border" />

          <div className="rounded-xl border border-accent/30 p-4 sm:p-5" style={{
            background: "linear-gradient(135deg, rgb(var(--accent-rgb) / 0.08) 0%, rgb(var(--accent-rgb) / 0.02) 100%)",
          }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Total månedskostnad
            </p>
            <div className="mt-1 text-4xl font-bold tracking-tight tabular-nums sm:text-5xl" style={{
              background: "linear-gradient(135deg, var(--accent-hover) 0%, var(--accent) 50%, var(--warm) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {fmtKr(result.totalMonthly)}
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-text-secondary">
                  Boliglån ({ratePercent})
                </dt>
                <dd className="font-semibold tabular-nums">{fmtKr(result.mortgageMonthly)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-text-secondary">Felleskostnader</dt>
                <dd className="font-semibold tabular-nums">{fmtKr(result.felleskostnader)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-text-secondary">
                  Eiendomsskatt
                  {eiendomsskatt.kommuneName && (
                    <span className="text-text-tertiary"> ({eiendomsskatt.kommuneName})</span>
                  )}
                </dt>
                <dd className="font-semibold tabular-nums">{fmtKr(result.eiendomsskatt)}</dd>
              </div>
            </dl>

            <p className="mt-4 border-t border-accent/20 pt-3 text-sm text-text-secondary">
              Bør kunne tåle:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {fmtKr(result.totalStressed)}
              </span>{" "}
              (stresstest {stressRatePercent})
            </p>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-text-secondary">
            Indikativ rente per {new Date(INDICATIVE_RATE.lastUpdated).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" })}. Din faktiske rente avhenger av bank og belåningsgrad. Tall inkluderer ikke forsikring eller strøm. Stresstest per boliglånsforskriften § 5.
          </p>
        </>
      ) : null}
    </TopographicHover>
  );
}
