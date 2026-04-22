import { ImageResponse } from "next/og";
import { PENDLINGS_POENG_LANDING_DATA } from "@/data/pendlings-poeng-landing-data";

export const runtime = "edge";
export const alt = "Pendlings-poeng: Norges beste pendlings-kommuner";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  // Feature the top work-center kommune (Oslo under the population-weighted
  // tiebreaker). Falls back to the pendler-list leader if the work-center
  // list is empty (test-seed state only).
  const top =
    PENDLINGS_POENG_LANDING_DATA.workCenterKommuner[0] ??
    PENDLINGS_POENG_LANDING_DATA.topPendlerKommuner[0];
  const topScore = String(top?.total ?? 0);
  const topLead = top ? `Beste kommune: ${top.kommunenavn}` : "Live data fra Entur";
  const topSub = top
    ? `${top.centerNote} · ${top.doorToDoorMinutes} min til ${top.centerName}`
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
        <svg
          width="620"
          height="620"
          viewBox="0 0 620 620"
          style={{ position: "absolute", top: -160, right: -160, opacity: 0.22 }}
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
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -80,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(127, 227, 212, 0.18) 0%, transparent 65%)",
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

        {/* Main content: headline + big figure */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: 900,
            }}
          >
            Pendlings-poeng
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 28,
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
          <span>Live data fra Entur · verdikart.no/pendlings-poeng</span>
          <span>Top 10 · metodologi · sammenligning</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
