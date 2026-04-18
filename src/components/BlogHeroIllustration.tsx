// Category-specific SVG hero illustrations for blog posts
// Pure SVG — no images, no external deps, works offline, dark-native

interface Props {
  category: string;
  title: string;
}

// Checklist illustration — for "Boligkjøp" category
function ChecklistSvg() {
  return (
    <svg viewBox="0 0 480 220" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="blg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="blg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      {/* Background */}
      <rect width="480" height="220" fill="url(#blg1)" rx="12" />
      {/* Dot grid */}
      {Array.from({ length: 12 }, (_, row) =>
        Array.from({ length: 20 }, (_, col) => (
          <circle key={`${row}-${col}`} cx={col * 26 + 13} cy={row * 20 + 10} r="1" fill="#818cf8" opacity="0.12" />
        ))
      )}
      {/* Clipboard shape */}
      <rect x="140" y="28" width="200" height="164" rx="8" fill="#111118" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
      {/* Clipboard top */}
      <rect x="180" y="20" width="120" height="20" rx="6" fill="#111118" stroke="rgba(99,102,241,0.25)" strokeWidth="1" />
      <rect x="215" y="24" width="50" height="8" rx="4" fill="#26272F" />
      {/* Check rows */}
      {[0,1,2,3,4].map((i) => (
        <g key={i} transform={`translate(160, ${60 + i * 26})`}>
          {/* Check box */}
          <rect width="16" height="16" rx="4" fill={i < 3 ? "rgba(99,102,241,0.3)" : "#26272F"} stroke="rgba(99,102,241,0.4)" strokeWidth="1" />
          {i < 3 && (
            <polyline points="3,8 7,12 13,5" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {/* Line */}
          <rect x="24" y="6" width={i < 3 ? 100 : 80} height="4" rx="2" fill={i < 3 ? "rgba(129,140,248,0.4)" : "rgba(100,116,139,0.25)"} />
        </g>
      ))}
      {/* Accent circle */}
      <circle cx="380" cy="60" r="36" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
      <text x="380" y="65" textAnchor="middle" fill="#818cf8" fontSize="24">✓</text>
      {/* Floating badge */}
      <rect x="300" y="148" width="88" height="28" rx="14" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
      <text x="344" y="166" textAnchor="middle" fill="#818cf8" fontSize="11" fontWeight="600">12 punkter</text>
    </svg>
  );
}

// Transit/map illustration — for "Analyse" / "Kollektiv" category
function TransitSvg() {
  return (
    <svg viewBox="0 0 480 220" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="tlg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.07" />
        </linearGradient>
      </defs>
      <rect width="480" height="220" fill="url(#tlg1)" rx="12" />
      {/* Grid lines like a map */}
      {[60,110,160].map(y => <line key={y} x1="40" y1={y} x2="440" y2={y} stroke="#26272F" strokeWidth="1" />)}
      {[100,180,260,340].map(x => <line key={x} x1={x} y1="30" x2={x} y2="190" stroke="#26272F" strokeWidth="1" />)}
      {/* Transit line — T-bane */}
      <path d="M 60 110 C 130 110 150 80 260 80 S 380 110 420 110" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
      {/* Station dots */}
      {[
        { cx: 60, cy: 110, label: "A" },
        { cx: 160, cy: 100 },
        { cx: 260, cy: 80, label: "B" },
        { cx: 360, cy: 96 },
        { cx: 420, cy: 110, label: "C" },
      ].map(({ cx, cy, label }, i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="7" fill="#111118" stroke="#3b82f6" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="3" fill="#3b82f6" />
          {label && (
            <rect x={cx - 14} y={cy - 28} width="28" height="16" rx="4" fill="#111118" stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
          )}
          {label && (
            <text x={cx} y={cy - 16} textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="700">{label}</text>
          )}
        </g>
      ))}
      {/* Bus line */}
      <path d="M 80 155 L 180 155 L 240 140 L 380 140 L 420 155" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="8 4" strokeLinecap="round" />
      {[80,180,300,420].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy={i === 1 ? 155 : i === 2 ? 140 : 155} r="5" fill="#111118" stroke="#8b5cf6" strokeWidth="1.5" />
          <circle cx={cx} cy={i === 1 ? 155 : i === 2 ? 140 : 155} r="2" fill="#8b5cf6" />
        </g>
      ))}
      {/* Legend */}
      <rect x="300" y="170" width="130" height="36" rx="8" fill="#111118" stroke="rgba(59,130,246,0.25)" strokeWidth="1" />
      <line x1="312" y1="182" x2="332" y2="182" stroke="#3b82f6" strokeWidth="3" />
      <text x="337" y="185" fill="#94a3b8" fontSize="9">T-bane</text>
      <line x1="312" y1="196" x2="332" y2="196" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4 2" />
      <text x="337" y="199" fill="#94a3b8" fontSize="9">Buss</text>
    </svg>
  );
}

// Price chart illustration — for "Markedsdata" / "Priser" category
function PriceSvg() {
  const points = [42, 48, 45, 52, 58, 55, 63, 71, 68, 78, 82, 88];
  const max = 100; const min = 30; const W = 320; const H = 110;
  const pts = points.map((v, i) => {
    const x = (i / (points.length - 1)) * W + 80;
    const y = H - ((v - min) / (max - min)) * H + 50;
    return `${x},${y}`;
  }).join(" ");
  const area = `M80,${H + 50} L${pts.split(" ").join(" L")} L${320 + 80},${H + 50} Z`;
  return (
    <svg viewBox="0 0 480 220" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="plg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.07" />
        </linearGradient>
        <linearGradient id="plg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="480" height="220" fill="url(#plg1)" rx="12" />
      {/* Y grid lines */}
      {[60,100,140].map(y => <line key={y} x1="60" y1={y} x2="420" y2={y} stroke="#26272F" strokeWidth="1" />)}
      {/* Area fill */}
      <path d={area} fill="url(#plg2)" />
      {/* Line */}
      <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* Last point highlight */}
      <circle cx={320 + 80} cy={H - ((88 - min) / (max - min)) * H + 50} r="5" fill="#6366f1" />
      <circle cx={320 + 80} cy={H - ((88 - min) / (max - min)) * H + 50} r="10" fill="rgba(99,102,241,0.2)" />
      {/* Labels */}
      {["2022","2023","2024","2025"].map((y, i) => (
        <text key={y} x={80 + i * (320/3)} y="185" textAnchor="middle" fill="#64748b" fontSize="9">{y}</text>
      ))}
      {/* Stat badge */}
      <rect x="295" y="28" width="100" height="38" rx="8" fill="#111118" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
      <text x="345" y="45" textAnchor="middle" fill="#22c55e" fontSize="14" fontWeight="700">+5.2%</text>
      <text x="345" y="59" textAnchor="middle" fill="#64748b" fontSize="9">siste 12 mnd</text>
      {/* Y axis labels */}
      <text x="55" y="63" textAnchor="end" fill="#64748b" fontSize="9">Høy</text>
      <text x="55" y="143" textAnchor="end" fill="#64748b" fontSize="9">Lav</text>
    </svg>
  );
}

// Generic fallback — abstract SSB/data-viz motif (bar chart silhouette + connecting line)
function GenericSvg() {
  const bars = [
    { x: 60, h: 58 },
    { x: 100, h: 82 },
    { x: 140, h: 46 },
    { x: 180, h: 96 },
    { x: 220, h: 74 },
    { x: 260, h: 110 },
    { x: 300, h: 88 },
    { x: 340, h: 128 },
    { x: 380, h: 104 },
  ];
  const baseY = 170;
  // Connecting line endpoints sit at each bar's top-center
  const linePts = bars
    .map((b) => `${b.x + 14},${baseY - b.h - 8}`)
    .join(" ");
  return (
    <svg viewBox="0 0 480 220" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="glg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="glg-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect width="480" height="220" fill="url(#glg)" rx="12" />
      {/* Dot grid backdrop */}
      {Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: 14 }, (_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={col * 34 + 17}
            cy={row * 28 + 14}
            r="1"
            fill="#818cf8"
            opacity="0.08"
          />
        ))
      )}
      {/* Horizontal axis rule */}
      <line x1="40" y1={baseY + 4} x2="440" y2={baseY + 4} stroke="#26272F" strokeWidth="1" />
      {/* Faint gridlines */}
      {[60, 100, 140].map((y) => (
        <line key={y} x1="40" y1={y} x2="440" y2={y} stroke="#26272F" strokeWidth="1" opacity="0.5" />
      ))}
      {/* Bars */}
      {bars.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={baseY - b.h}
          width="28"
          height={b.h}
          rx="3"
          fill="url(#glg-bar)"
        />
      ))}
      {/* Connecting trend line */}
      <polyline
        points={linePts}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Line endpoint dots */}
      {bars.map((b, i) => (
        <circle key={i} cx={b.x + 14} cy={baseY - b.h - 8} r="2.5" fill="#818cf8" />
      ))}
    </svg>
  );
}

export default function BlogHeroIllustration({ category, title }: Props) {
  const cat = category?.toLowerCase() ?? "";
  const t = title?.toLowerCase() ?? "";

  let Illustration;
  if (cat.includes("kjøp") || cat.includes("kjos") || t.includes("sjekkliste") || t.includes("kjøpe")) {
    Illustration = <ChecklistSvg />;
  } else if (cat.includes("analyse") || t.includes("kollektiv") || t.includes("transport") || t.includes("t-bane")) {
    Illustration = <TransitSvg />;
  } else if (cat.includes("marked") || cat.includes("pris") || t.includes("pris") || t.includes("bydel")) {
    Illustration = <PriceSvg />;
  } else {
    Illustration = <GenericSvg />;
  }

  return (
    <div className="mb-6 h-48 w-full overflow-hidden rounded-xl sm:h-56" style={{ border: "1px solid rgba(99,102,241,0.2)" }}>
      {Illustration}
    </div>
  );
}
