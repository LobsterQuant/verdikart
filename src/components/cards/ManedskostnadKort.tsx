"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet } from "lucide-react";
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
  const [loading, setLoading] = useState(true);

  const [purchasePrice, setPurchasePrice] = useState<number>(4_000_000);
  const [equityPercent, setEquityPercent] = useState<number>(EQUITY_MIN);
  const [loanYears, setLoanYears] = useState<number>(25);
  const [felleskostnader, setFelleskostnader] = useState<number>(
    FELLESKOSTNADER_ESTIMATE.default,
  );
  const [priceInitialized, setPriceInitialized] = useState(false);
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
        }
      } catch {
        // Card degrades gracefully — sliders still usable.
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [kommunenummer, postnummer, adresse]);

  useEffect(() => {
    if (priceInitialized) return;
    if (sqmPrice && bruksareal) {
      const estimated = Math.round(sqmPrice * bruksareal);
      const snapped = Math.max(
        PRICE_MIN,
        Math.min(PRICE_MAX, Math.round(estimated / PRICE_STEP) * PRICE_STEP),
      );
      setPurchasePrice(snapped);
      setPriceInitialized(true);
    }
  }, [sqmPrice, bruksareal, priceInitialized]);

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
    () => monthlyEiendomsskatt(kommunenummer, purchasePrice),
    [kommunenummer, purchasePrice],
  );

  const result: MonthlyCostResult = useMemo(
    () =>
      calculateMonthlyCost({
        purchasePrice,
        equityPercent,
        loanYears,
        felleskostnader,
        eiendomsskatt: eiendomsskatt.monthly,
      }),
    [purchasePrice, equityPercent, loanYears, felleskostnader, eiendomsskatt.monthly],
  );

  const ratePercent = formatPct(result.rate * 100, 2);
  const stressRatePercent = formatPct(result.stressRate * 100, 1);
  const equityKr = Math.round(purchasePrice * equityPercent);
  const hasPriceBasis = sqmPrice != null && bruksareal != null;

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
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Slider
              label="Kjøpspris"
              value={purchasePrice}
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              onChange={setPurchasePrice}
              displayValue={fmtPurchasePrice(purchasePrice)}
              helper={
                hasPriceBasis
                  ? `Estimat basert på ${sqmPrice!.toLocaleString("nb-NO")} kr/m² × ${bruksareal} m²`
                  : "Oppgi ønsket kjøpspris manuelt"
              }
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
                  ? `Typisk for ${boligtype} — juster etter faktiske kostnader`
                  : "Juster etter faktiske kostnader"
              }
            />
          </div>

          <div className="my-6 h-px bg-card-border" />

          <div className="rounded-xl border border-accent/30 p-4 sm:p-5" style={{
            background: "linear-gradient(135deg, rgb(var(--accent-rgb) / 0.08) 0%, rgb(var(--accent-rgb) / 0.02) 100%)",
          }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
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

          <p className="mt-4 text-xs leading-relaxed text-text-tertiary">
            Indikativ rente per {new Date(INDICATIVE_RATE.lastUpdated).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" })}. Din faktiske rente avhenger av bank og belåningsgrad. Tall inkluderer ikke forsikring eller strøm. Stresstest per boliglånsforskriften § 5.
          </p>
        </>
      )}
    </TopographicHover>
  );
}
