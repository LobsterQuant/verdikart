interface PriceTrendSparkProps {
  values: number[];
  years: string[];
}

/**
 * Mini SVG sparkline for the hero mockup. Pure SVG, 0 bundle impact, renders
 * server-side. Static — Package 5 can layer an entrance animation on top.
 */
export function PriceTrendSpark({ values, years }: PriceTrendSparkProps) {
  const hasData = values.length >= 2;
  const firstYear = years[0];
  const lastYear = years[years.length - 1];

  return (
    <div className="flex flex-col">
      <p className="caption text-text-muted">Prisutvikling</p>
      <div className="relative mt-2 h-[72px] w-full">
        {hasData ? (
          <Sparkline values={values} />
        ) : (
          <div className="flex h-full items-center text-xs text-text-subtle">
            Ingen data
          </div>
        )}
      </div>
      {hasData && (
        <p className="caption mt-1 flex justify-between text-text-subtle">
          <span>{firstYear}</span>
          <span>{lastYear}</span>
        </p>
      )}
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const W = 160;
  const H = 72;
  const PAD_Y = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - PAD_Y - ((v - min) / range) * (H - PAD_Y * 2);
    return { x, y };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
  const fillD = `${pathD} L${W} ${H} L0 ${H} Z`;
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(127 227 212 / 0.22)" />
          <stop offset="100%" stopColor="rgb(127 227 212 / 0)" />
        </linearGradient>
      </defs>
      <path d={fillD} fill="url(#spark-fill)" />
      <path
        d={pathD}
        fill="none"
        stroke="rgb(var(--accent-rgb))"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last.x} cy={last.y} r="3" fill="rgb(var(--accent-rgb))" />
      <circle
        cx={last.x}
        cy={last.y}
        r="6"
        fill="rgb(127 227 212 / 0.18)"
      />
    </svg>
  );
}
