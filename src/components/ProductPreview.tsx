import { Bus, TrendingUp, BarChart2, Clock } from "lucide-react";

// Static mockup of a real result page — Bygdøy allé 2, Oslo (Frogner)
// Data: SSB 2024 kommune Oslo adjusted for Frogner bydel index 1.55×
export default function ProductPreview() {
  const chartPoints = [82, 87, 91, 95, 100, 108, 118, 128]; // relative index
  const maxVal = Math.max(...chartPoints);
  const minVal = Math.min(...chartPoints);
  const range = maxVal - minVal;

  const svgH = 48;
  const svgW = 200;
  const pts = chartPoints.map((v, i) => {
    const x = (i / (chartPoints.length - 1)) * svgW;
    const y = svgH - ((v - minVal) / range) * (svgH - 6) - 3;
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  const areaPath = `M0,${svgH} L${pts[0]} ${pts.slice(1).map((p) => `L${p}`).join(" ")} L${svgW},${svgH} Z`;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Browser chrome */}
      <div className="rounded-xl border border-card-border bg-card-bg overflow-hidden shadow-2xl shadow-black/40">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-card-border bg-background px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <div className="h-3 w-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="mx-auto flex-1 max-w-xs rounded-md bg-card-bg border border-card-border px-3 py-1 text-center text-xs text-text-tertiary">
            verdikart.no/eiendom/Bygdøy-allé-2
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Address header */}
          <div className="mb-4">
            <h2 className="text-base font-bold sm:text-lg">Bygdøy allé 2, Oslo</h2>
            <p className="text-xs text-text-tertiary">Eiendomsoversikt og områdesdata</p>
          </div>

          {/* Mini cards grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Transit card */}
            <div className="rounded-lg border border-card-border bg-background p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Bus className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
                <span className="text-xs font-medium text-text-secondary">Kollektivtransport</span>
              </div>
              <div className="flex items-baseline gap-1">
                <Clock className="h-3.5 w-3.5 text-text-tertiary mb-0.5" strokeWidth={1.5} />
                <span className="text-2xl font-bold tabular-nums">8</span>
                <span className="text-xs text-text-secondary">min til sentrum</span>
              </div>
              <span className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>
                Utmerket
              </span>
            </div>

            {/* Price trend card */}
            <div className="rounded-lg border border-card-border bg-background p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
                <span className="text-xs font-medium text-text-secondary">Prisutvikling</span>
              </div>
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-green-500" strokeWidth={2} />
                <span className="text-xl font-bold text-green-500">+5.2%</span>
              </div>
              <span className="text-xs text-text-tertiary">siste 12 mnd · Frogner</span>
              {/* Mini sparkline */}
              <div className="mt-2 overflow-hidden rounded">
                <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-8" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="previewGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0066FF" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#previewGrad)" />
                  <polyline points={polyline} fill="none" stroke="#0066FF" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Comparable sales — full width */}
            <div className="col-span-2 rounded-lg border border-card-border bg-background p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart2 className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
                <span className="text-xs font-medium text-text-secondary">Sammenlignbare salg</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tabular-nums">151 900</span>
                <span className="text-sm text-text-secondary">kr/m²</span>
              </div>
              <p className="mt-0.5 text-xs text-text-tertiary">Gjennomsnitt i Frogner bydel · 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="mt-3 text-center text-xs text-text-tertiary">
        Eksempel: Bygdøy allé 2, Oslo — data hentet i sanntid
      </p>
    </div>
  );
}
