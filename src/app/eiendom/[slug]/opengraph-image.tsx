import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: { slug: string };
}

export default function OgImage({ params }: Props) {
  const address = decodeURIComponent(params.slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(0,229,189,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,189,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Teal glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,229,189,0.12) 0%, transparent 70%)",
          }}
        />
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "48px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#00E5BD",
              marginRight: "12px",
            }}
          />
          <span style={{ color: "#00E5BD", fontSize: "18px", fontWeight: 600, letterSpacing: "0.08em" }}>
            VERDIKART
          </span>
        </div>
        {/* Label */}
        <div style={{ color: "#666666", fontSize: "20px", marginBottom: "16px", letterSpacing: "0.05em" }}>
          EIENDOMSANALYSE
        </div>
        {/* Address */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.15,
            marginBottom: "40px",
            maxWidth: "900px",
          }}
        >
          {address}
        </div>
        {/* Feature chips */}
        <div style={{ display: "flex", gap: "16px" }}>
          {["🔇 Støynivå", "🚌 Kollektivtransport", "📈 Prisutvikling"].map((item) => (
            <div
              key={item}
              style={{
                background: "rgba(0,229,189,0.08)",
                border: "1px solid rgba(0,229,189,0.2)",
                borderRadius: "8px",
                padding: "10px 20px",
                color: "#00E5BD",
                fontSize: "16px",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
