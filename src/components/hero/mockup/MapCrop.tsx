import { AdresseIcon } from "@/components/icons";

interface MapCropProps {
  coords: { lat: number; lon: number };
  address: string;
  /** Height in pixels — desktop default 200, mobile caller passes 140. */
  height?: number;
}

/**
 * Stylized SVG map crop for the hero mockup.
 *
 * Pure SVG (no tiles, no Leaflet) so it adds nothing to the bundle and paints
 * server-side with zero layout shift. Uses the lat/lon only to derive a
 * deterministic pseudo-random street pattern — cosmetic, not cartographic.
 * The pin + address label do the "this is a real place" signalling.
 */
export function MapCrop({ coords, address, height = 200 }: MapCropProps) {
  const seed = (coords.lat * 1000 + coords.lon * 1000) % 360;
  // Seeded 0..1 — so same coords always produce the same layout.
  const rand = (n: number) => {
    const x = Math.sin(seed * 0.93 + n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  // Primary street lines — slightly irregular spacing so it reads as a real
  // city rather than graph paper. Positions extend beyond the viewBox so
  // the overflow clip creates an "infinite city" edge.
  const primaryY = Array.from(
    { length: 6 },
    (_, i) => -8 + i * 42 + (rand(i + 1) - 0.5) * 18,
  );
  const primaryX = Array.from(
    { length: 5 },
    (_, i) => -10 + i * 100 + (rand(i + 10) - 0.5) * 28,
  );

  // Secondary streets — midpoints between primaries with small jitter.
  const secondaryY = Array.from({ length: 4 }, (_, i) => {
    const a = primaryY[i];
    const b = primaryY[i + 1];
    return (a + b) / 2 + (rand(i + 20) - 0.5) * 6;
  });
  const secondaryX = Array.from({ length: 3 }, (_, i) => {
    const a = primaryX[i];
    const b = primaryX[i + 1];
    return (a + b) / 2 + (rand(i + 30) - 0.5) * 10;
  });

  // Background "city blocks" — scattered rounded rects at very low opacity.
  const blocks = Array.from({ length: 42 }, (_, i) => ({
    x: rand(i + 100) * 420 - 10,
    y: rand(i + 200) * 220 - 10,
    w: 14 + rand(i + 300) * 28,
    h: 8 + rand(i + 400) * 18,
    o: 0.025 + rand(i + 500) * 0.025,
  }));

  // One accent feature — either water at a corner or a park square.
  const accentIsWater = rand(0) > 0.5;
  const accentCorner = Math.floor(rand(1) * 4); // 0=tl 1=tr 2=bl 3=br
  const waterPoints = [
    "-10,-10 58,-10 72,18 44,34 14,28 -10,16",
    "342,-10 410,-10 410,28 372,40 346,24",
    "-10,162 32,156 52,182 30,210 -10,210",
    "350,170 410,164 410,210 372,210 344,190",
  ][accentCorner];
  const parkX = accentCorner === 0 || accentCorner === 2 ? 42 : 282;
  const parkY = accentCorner === 0 || accentCorner === 1 ? 28 : 128;

  // "You are here" highlighted street — same teal glow as before.
  const highlightAngle = seed - 170;

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-border"
      style={{
        height,
        background:
          "radial-gradient(ellipse at 50% 50%, #161922 0%, #0E1016 100%)",
      }}
      aria-label={`Kart sentrert på ${address}`}
      role="img"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <radialGradient id="map-pin-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(127 227 212 / 0.55)" />
            <stop offset="60%" stopColor="rgb(127 227 212 / 0.12)" />
            <stop offset="100%" stopColor="rgb(127 227 212 / 0)" />
          </radialGradient>
        </defs>

        {/* Background city blocks */}
        <g>
          {blocks.map((b, i) => (
            <rect
              key={i}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx="1.5"
              fill={`rgb(255 255 255 / ${b.o.toFixed(3)})`}
            />
          ))}
        </g>

        {/* One map accent — water inlet or park */}
        {accentIsWater ? (
          <polygon points={waterPoints} fill="rgb(80 130 180 / 0.22)" />
        ) : (
          <rect
            x={parkX}
            y={parkY}
            width="58"
            height="40"
            rx="4"
            fill="rgb(130 180 150 / 0.15)"
          />
        )}

        {/* Primary street grid — darker than surface, extends past viewBox */}
        <g stroke="rgb(10 12 16 / 0.82)" strokeLinecap="square">
          {primaryY.map((y, i) => (
            <line
              key={`ph-${i}`}
              x1="-20"
              y1={y}
              x2="420"
              y2={y}
              strokeWidth="5"
            />
          ))}
          {primaryX.map((x, i) => (
            <line
              key={`pv-${i}`}
              x1={x}
              y1="-20"
              x2={x}
              y2="220"
              strokeWidth="5"
            />
          ))}
        </g>

        {/* Secondary thinner streets */}
        <g stroke="rgb(10 12 16 / 0.7)" strokeLinecap="square">
          {secondaryY.map((y, i) => (
            <line
              key={`sh-${i}`}
              x1="-20"
              y1={y}
              x2="420"
              y2={y}
              strokeWidth="2"
            />
          ))}
          {secondaryX.map((x, i) => (
            <line
              key={`sv-${i}`}
              x1={x}
              y1="-20"
              x2={x}
              y2="220"
              strokeWidth="2"
            />
          ))}
        </g>

        {/* Highlighted "main" street — the teal accent stroke */}
        <g transform="translate(200, 100)">
          <line
            x1="-280"
            y1="0"
            x2="280"
            y2="0"
            stroke="rgb(127 227 212 / 0.28)"
            strokeWidth="2"
            transform={`rotate(${highlightAngle})`}
          />
        </g>

        {/* Pin glow at centre */}
        <circle cx="200" cy="100" r="44" fill="url(#map-pin-glow)" />
      </svg>

      {/* Pin overlay (React-rendered icon, precisely centered) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex h-8 w-8 items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-accent/30" />
          <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/40">
            <AdresseIcon size={10} className="text-accent-ink" />
          </span>
        </div>
      </div>

      {/* Address label */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center">
        <span
          className="rounded-md px-2.5 py-1 text-[11px] font-medium text-text"
          style={{
            background: "rgb(14 16 22 / 0.82)",
            backdropFilter: "blur(8px)",
            border: "0.5px solid rgb(255 255 255 / 0.08)",
          }}
        >
          {address}
        </span>
      </div>
    </div>
  );
}
