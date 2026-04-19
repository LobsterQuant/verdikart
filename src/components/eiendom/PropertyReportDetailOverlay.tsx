"use client";

import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

/**
 * Full-screen modal that slides up from the bottom when a sheet row is tapped.
 * Hosts the corresponding card's full content. Closes back to the sheet; no
 * routing, no URL change. Backdrop fades in at 0.25s, sheet slides at 0.4s.
 */
export function PropertyReportDetailOverlay({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  // Lock body scroll + close on Escape while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/60"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-0 z-[70] flex flex-col bg-background"
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          visibility: open ? "visible" : "hidden",
        }}
      >
        <div
          className="sticky top-0 z-10 flex items-center gap-2 border-b border-card-border bg-background/95 px-3 backdrop-blur-md"
          style={{
            paddingTop: "max(0.5rem, env(safe-area-inset-top))",
            paddingBottom: "0.5rem",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Tilbake"
            className="-ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <h2 className="truncate text-base font-semibold">{title}</h2>
        </div>
        <div
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
