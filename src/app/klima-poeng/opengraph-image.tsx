import { ImageResponse } from "next/og";
import { KLIMA_POENG_LANDING_DATA } from "@/data/klima-poeng-landing-data";

export const runtime = "edge";
export const alt = "Klima-poeng: Er din bolig klimatrygg?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  // Lead with the safest kommune of the top-10 list (population-weighted on
  // ties) — feels more invitational than headlining a bottom-10 city.
  const top = KLIMA_POENG_LANDING_DATA.topSafe[0];
  const bottom = KLIMA_POENG_LANDING_DATA.bottomExposed[0];
  const topScore = String(top?.total ?? 0);
  const topLead = top ? `Tryggest: ${top.kommunenavn}` : "Live data fra NVE";
  const topSub = top
    ? `${top.fylkesnavn ?? "—"} · ${top.band}`
    : "";
  const bottomLine = bottom
    ? `Mest utsatt: ${bottom.kommunenavn} (${bottom.total})`
    : "";

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
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,0.12) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Stylised Norwegian-coastline silhouette: layered offset arcs */}
        <svg
          width="900"
          height="320"
          viewBox="0 0 900 320"
          style={{ position: "absolute", bottom: -40, left: -40, opacity: 0.18 }}
        >
          <path
            d="M0,260 C 100,220 180,250 260,200 C 340,150 400,180 480,140 C 560,100 640,130 720,90 C 800,50 870,70 900,30 L 900,320 L 0,320 Z"
            fill="#7FE3D4"
          />
          <path
            d="M0,290 C 120,240 200,270 290,230 C 380,190 450,210 540,170 C 620,140 700,160 780,130 C 850,105 900,115 900,100 L 900,320 L 0,320 Z"
            fill="#9AEBDF"
            opacity="0.55"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(127, 227, 212, 0.20) 0%, transparent 65%)",
          }}
        />

        {/* Top row: wordmark + pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7FE3D4, #9AEBDF)",
              }}
            />
            <span
              style={{
                color: "#FFFFFF",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.06em",
              }}
            >
              VERDIKART
            </span>
          </div>
          <div
            style={{
              background: "rgba(127, 227, 212, 0.15)",
              border: "1px solid rgba(127, 227, 212, 0.35)",
              borderRadius: 32,
              padding: "8px 20px",
              color: "#9AEBDF",
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            KOMPOSITTSCORE · 0 – 100
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: 1000,
            }}
          >
            Klima-poeng
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: "#9AEBDF",
              lineHeight: 1.3,
              maxWidth: 900,
            }}
          >
            Er din bolig klimatrygg?
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 28,
              marginTop: 8,
            }}
          >
            <div
              style={{
                fontSize: 200,
                fontWeight: 800,
                color: "#7FE3D4",
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
              }}
            >
              {topScore}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                paddingBottom: 16,
                color: "#94a3b8",
                fontSize: 22,
                lineHeight: 1.35,
              }}
            >
              <span style={{ color: "#FFFFFF", fontWeight: 600 }}>{topLead}</span>
              <span>{topSub}</span>
              {bottomLine && (
                <span style={{ marginTop: 4, fontSize: 18, color: "#cbd5e1" }}>
                  {bottomLine}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: source note */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#64748b",
            fontSize: 15,
          }}
        >
          <span>NVE · Kartverket · NCCS · DSA — verdikart.no/klima-poeng</span>
          <span>Top 10 · metodologi · sammenligning</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
