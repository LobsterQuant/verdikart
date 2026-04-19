import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Verdikart — Eiendomsinnsikt fra offentlige kilder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0A0B0D",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          fontFamily: "serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Topographic signature — concentric mint rings, top right (matches per-route OG) */}
        <svg
          width="620"
          height="620"
          viewBox="0 0 620 620"
          style={{ position: "absolute", top: -120, right: -140, opacity: 0.22 }}
        >
          {[60, 120, 180, 240, 300, 360].map((r, i) => (
            <circle
              key={i}
              cx="310"
              cy="310"
              r={r}
              fill="none"
              stroke="#7FE3D4"
              strokeWidth="1.5"
            />
          ))}
        </svg>

        {/* Soft mint wash top-left for depth */}
        <div
          style={{
            position: "absolute",
            top: -140,
            left: -140,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(127, 227, 212, 0.14) 0%, transparent 70%)",
          }}
        />

        <div
          style={{
            fontSize: 168,
            color: "#FFFFFF",
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            fontFamily: "serif",
          }}
        >
          Verdikart
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 36,
            color: "#7FE3D4",
            lineHeight: 1.2,
            fontFamily: "sans-serif",
            fontWeight: 500,
          }}
        >
          Eiendomsinnsikt fra offentlige kilder
        </div>
      </div>
    ),
    { ...size }
  );
}
