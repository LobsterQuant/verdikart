"use client";

import { useEffect, useState } from "react";

interface ComparableSalesData {
  averagePricePerSqm: number;
  period: string;
  count?: number;
}

export default function ComparableSalesCard({
  kommunenummer,
}: {
  kommunenummer: string;
}) {
  const [data, setData] = useState<ComparableSalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!kommunenummer) {
      setLoading(false);
      setError(true);
      return;
    }

    async function fetchSales() {
      try {
        const res = await fetch(
          `/api/comparable-sales?kommunenummer=${kommunenummer}`
        );
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        setData(json);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchSales();
  }, [kommunenummer]);

  if (loading) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-6">
        <div className="skeleton mb-4 h-5 w-40" />
        <div className="skeleton mb-2 h-10 w-48" />
        <div className="skeleton h-4 w-32" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-6">
        <h3 className="mb-2 text-lg font-semibold">Sammenlignbare salg</h3>
        <p className="text-sm text-text-secondary">Data ikke tilgjengelig</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-6">
      <h3 className="mb-4 text-lg font-semibold">Sammenlignbare salg</h3>

      <p className="break-words text-3xl font-bold tabular-nums leading-tight">
        <span className="text-text-secondary text-xl font-medium">Snitt </span>
        <span className="text-accent">
          {(data.averagePricePerSqm ?? 0).toLocaleString("nb-NO")}
        </span>{" "}
        <span className="text-lg font-medium text-text-secondary">kr/m²</span>
      </p>

      <p className="mt-2 text-sm text-text-secondary">{data.period}</p>

      {data.count !== undefined && (
        <p className="mt-1 text-xs text-text-tertiary">
          Basert på {data.count} salg i området
        </p>
      )}
    </div>
  );
}
