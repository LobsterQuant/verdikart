import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Verdikart — Forstå boligen. Ikke bare se den.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
        {/* Subtle grid accent */}
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
        <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
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
        <div
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.1,
            marginBottom: "24px",
            maxWidth: "800px",
          }}
        >
          Forstå boligen.
          <br />
          Ikke bare se den.
        </div>
        <div style={{ display: "flex", gap: "32px" }}>
          {["🔇 Støy", "🚌 Transport", "📈 Priser"].map((item) => (
            <div
              key={item}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "10px 20px",
                color: "#AAAAAA",
                fontSize: "18px",
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
