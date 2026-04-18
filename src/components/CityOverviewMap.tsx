"use client";

import dynamic from "next/dynamic";

const CityOverviewMapInner = dynamic(
  () => import("@/components/CityOverviewMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div
          className="flex items-center justify-center rounded-xl border border-card-border bg-card-bg"
          style={{ minHeight: 480 }}
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-tertiary border-t-accent" />
        </div>
        <div className="rounded-xl border border-card-border bg-card-bg p-5">
          <div className="skeleton mb-3 h-5 w-24" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-8 w-full" />
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

export default function CityOverviewMap() {
  return <CityOverviewMapInner />;
}
