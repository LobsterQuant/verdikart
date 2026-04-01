"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";

interface PdfExportButtonProps {
  address: string;
}

export default function PdfExportButton({ address }: PdfExportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    if (loading) return;
    setLoading(true);

    try {
      // Use the browser's print-to-PDF with our print styles
      // The CSS in globals.css already handles print layout (white bg, hide nav/footer/maps)
      const title = document.title;
      document.title = `${address} — Verdikart Eiendomsrapport`;
      window.print();
      document.title = title;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm transition-colors hover:border-accent/40 disabled:opacity-50"
      title="Last ned som PDF"
    >
      <FileDown className="h-4 w-4 text-text-tertiary" />
      <span className="text-xs font-medium text-text-secondary">
        {loading ? "Forbereder…" : "Last ned PDF"}
      </span>
    </button>
  );
}
