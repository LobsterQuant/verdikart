"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { PropertyReportSummary, ReportSectionKey } from "@/lib/propertyReportSummary";
import { PropertyReportDetailOverlay } from "./PropertyReportDetailOverlay";

/**
 * Mobile-only property report. Fixed 45vh Leaflet map up top, bottom sheet
 * below with 12 section rows. Sheet starts at 55vh; tapping the drag handle
 * expands to 92vh (500ms cubic-bezier). Tapping a row opens DetailOverlay
 * with that card's full content — no routing, closes back to the sheet.
 *
 * Section previews arrive pre-composed from getPropertyReportSummary so the
 * sheet is immediately useful without any client-side fetch waterfall.
 */

export interface ReportSection {
  key: ReportSectionKey;
  label: string;
  /** Pre-rendered icon node — must be pre-rendered server-side since function refs can't cross the RSC boundary into this client component. */
  icon: ReactNode;
  detail: ReactNode;
}

interface Props {
  address: string;
  /** Display-serif headline — typically a valuation estimate. Falls back to caption-only when null. */
  headlinePrice: string | null;
  /** Small mint subtitle under the price block. */
  headlineCaption: string;
  summary: PropertyReportSummary;
  sections: ReadonlyArray<ReportSection>;
  /** Rendered <PropertyMap …/> — passed in so the server component owns the data wiring. */
  mapElement: ReactNode;
  /** Kommune slug used for the back-link target (e.g. "/by/oslo"). Falls back to "/". */
  backHref: string;
}

export function PropertyReportMobile({
  address,
  headlinePrice,
  headlineCaption,
  summary,
  sections,
  mapElement,
  backHref,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [openKey, setOpenKey] = useState<ReportSectionKey | null>(null);

  const activeSection = sections.find((s) => s.key === openKey) ?? null;

  return (
    <div className="fixed inset-0 z-[55] flex flex-col overflow-hidden bg-background">
      {/* Sticky header */}
      <header
        className="relative z-30 border-b border-card-border bg-background/90 backdrop-blur-md"
        style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
      >
        <div className="flex h-12 items-center gap-2 px-3">
          <Link
            href={backHref}
            aria-label="Tilbake"
            className="-ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
          </Link>
          <p className="truncate text-sm font-semibold">{address}</p>
        </div>
      </header>

      {/* Map — 45vh full-bleed */}
      <div className="relative w-full" style={{ height: "45vh" }}>
        {mapElement}
      </div>

      {/* Spacer lets users scroll the area between map and sheet — intentionally blank */}
      <div className="flex-1 bg-background" />

      {/* Bottom sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-2xl border-t border-card-border bg-card-bg shadow-[0_-10px_32px_rgba(0,0,0,0.35)]"
        style={{
          height: expanded ? "92vh" : "55vh",
          transition: "height 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Drag handle */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Minimer oversikt" : "Utvid oversikt"}
          aria-expanded={expanded}
          className="flex w-full justify-center py-2"
        >
          <span className="block h-1 w-9 rounded-full bg-text-tertiary/40" />
        </button>

        {/* Price headline */}
        <div className="px-5 pb-3">
          {headlinePrice && (
            <p
              className="leading-none"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "26px",
                fontWeight: 400,
                letterSpacing: "-0.015em",
              }}
            >
              {headlinePrice}
            </p>
          )}
          <p className="mt-1 text-xs font-medium text-accent">{headlineCaption}</p>
        </div>

        {/* Section list */}
        <ul
          className="flex-1 space-y-1 overflow-y-auto px-2 pt-1"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {sections.map(({ key, label, icon }) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => setOpenKey(key)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-background"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  {icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="truncate text-xs text-text-secondary">{summary[key]}</p>
                </div>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-text-tertiary"
                  strokeWidth={1.75}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Detail overlay */}
      <PropertyReportDetailOverlay
        open={openKey != null}
        onClose={() => setOpenKey(null)}
        title={activeSection?.label ?? ""}
      >
        {activeSection?.detail}
      </PropertyReportDetailOverlay>
    </div>
  );
}
