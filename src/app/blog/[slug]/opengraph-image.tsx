import { ImageResponse } from "next/og";
import { getPost } from "../posts";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);

  const title = post?.title ?? "Verdikart Blogg";
  const category = post?.category ?? "Boligmarkedet";
  const readingMinutes = post?.readingMinutes ?? 5;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#080810",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,0.12) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Indigo glow top-left */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -80,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 65%)",
          }}
        />
        {/* Blue glow bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -60,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 65%)",
          }}
        />

        {/* Top row: wordmark + category */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Logo dot */}
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
              }}
            />
            <span style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 700, letterSpacing: "0.06em" }}>
              VERDIKART
            </span>
          </div>
          {/* Category pill */}
          <div
            style={{
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.35)",
              borderRadius: 32,
              padding: "8px 20px",
              color: "#818cf8",
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            {category.toUpperCase()}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 60 ? 42 : 52,
            fontWeight: 800,
            color: "#FFFFFF",
            lineHeight: 1.2,
            maxWidth: 980,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>

        {/* Bottom row: author + reading time */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Avatar */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(129,140,248,0.15))",
                border: "1px solid rgba(99,102,241,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#818cf8",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              MH
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ color: "#FFFFFF", fontSize: 16, fontWeight: 600 }}>Michael H.</span>
              <span style={{ color: "#64748b", fontSize: 13 }}>Grunnlegger, Verdikart</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#64748b", fontSize: 15 }}>⏱</span>
            <span style={{ color: "#94a3b8", fontSize: 15 }}>{readingMinutes} min lesetid</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
