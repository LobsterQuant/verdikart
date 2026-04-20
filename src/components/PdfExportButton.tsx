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
      document.title = `${address}: Verdikart Eiendomsrapport`;
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
      className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-ink transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30 disabled:opacity-60"
      title="Last ned full eiendomsrapport som PDF"
    >
      <FileDown className="h-4 w-4" strokeWidth={2} />
      {loading ? "Forbereder…" : "Last ned PDF"}
    </button>
  );
}
