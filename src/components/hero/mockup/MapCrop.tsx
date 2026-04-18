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
  // Deterministic offsets from coords — same lat/lon → same street layout.
  const seed = (coords.lat * 1000 + coords.lon * 1000) % 360;
  const streetAngle = seed - 180; // -180..+180
  const crossAngle = streetAngle + 70;

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
        {/* Base subtle grid */}
        <defs>
          <pattern
            id="map-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="rgb(255 255 255 / 0.04)"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="map-pin-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(127 227 212 / 0.55)" />
            <stop offset="60%" stopColor="rgb(127 227 212 / 0.12)" />
            <stop offset="100%" stopColor="rgb(127 227 212 / 0)" />
          </radialGradient>
        </defs>
        <rect width="400" height="200" fill="url(#map-grid)" />

        {/* Primary "streets" — two crossing strokes at coord-derived angles */}
        <g transform="translate(200, 100)">
          <line
            x1="-260"
            y1="0"
            x2="260"
            y2="0"
            stroke="rgb(255 255 255 / 0.10)"
            strokeWidth="14"
            transform={`rotate(${streetAngle})`}
          />
          <line
            x1="-260"
            y1="0"
            x2="260"
            y2="0"
            stroke="rgb(255 255 255 / 0.07)"
            strokeWidth="9"
            transform={`rotate(${crossAngle})`}
          />
          {/* Thin accent street */}
          <line
            x1="-260"
            y1="0"
            x2="260"
            y2="0"
            stroke="rgb(127 227 212 / 0.22)"
            strokeWidth="1.5"
            transform={`rotate(${streetAngle + 20})`}
          />
        </g>

        {/* Scattered block indicators — deterministic "buildings" */}
        {Array.from({ length: 14 }).map((_, i) => {
          const x = ((i * 73 + seed * 2) % 380) + 10;
          const y = ((i * 41 + seed) % 180) + 10;
          const size = 6 + ((i * 11) % 7);
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={size}
              height={size}
              fill="rgb(255 255 255 / 0.04)"
              rx="1"
            />
          );
        })}

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
