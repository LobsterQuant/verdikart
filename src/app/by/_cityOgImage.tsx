import { ImageResponse } from "next/og";
import { getCityData } from "./[city]/cityData";

/**
 * Shared renderer used by both the dynamic /by/[city]/opengraph-image route
 * and the /by/oslo/opengraph-image shadow. Oslo has a `[bydel]` child folder
 * which would otherwise catch the "opengraph-image" segment as a bydel slug.
 *
 * Keep this file edge-safe — no Node-only imports. Next treats files prefixed
 * with `_` as private (not routed), so this won't be reachable from the URL.
 */

export const cityOgSize = { width: 1200, height: 630 };
export const cityOgContentType = "image/png";
export const cityOgAlt = "Verdikart: boligmarked per by";

export function renderCityOgImage(slug: string): ImageResponse {
  const city = getCityData(slug);

  const name = city?.name ?? "Boligmarkedet";
  const yoy = city?.avgSqmPriceYoY ?? null;
  const avgPrice = city?.avgSqmPrice ?? null;
  const population = city?.population ?? null;
  const yoySign = yoy == null ? "" : yoy >= 0 ? "+" : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A0B0D",
          padding: 80,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg
          width="680"
          height="680"
          viewBox="0 0 680 680"
          style={{ position: "absolute", top: -180, right: -160, opacity: 0.22 }}
        >
          {[60, 130, 200, 270, 340].map((r, i) => (
            <circle
              key={i}
              cx="340"
              cy="340"
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
            bottom: -160,
            left: -160,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(127, 227, 212, 0.16) 0%, transparent 70%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#7FE3D4",
            }}
          />
          <span
            style={{
              color: "#FFFFFF",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.08em",
              fontFamily: "sans-serif",
            }}
          >
            VERDIKART
          </span>
          <span
            style={{
              color: "#64748b",
              fontSize: 16,
              marginLeft: 16,
              fontFamily: "sans-serif",
              letterSpacing: "0.06em",
            }}
          >
            BOLIGMARKED
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div
            style={{
              fontSize: 128,
              color: "#F4F4F6",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              fontFamily: "serif",
            }}
          >
            {name}
          </div>

          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {avgPrice != null && (
              <div
                style={{
                  background: "rgba(127, 227, 212, 0.14)",
                  border: "1px solid rgba(127, 227, 212, 0.32)",
                  color: "#9AEBDF",
                  padding: "12px 26px",
                  borderRadius: 999,
                  fontSize: 26,
                  fontFamily: "sans-serif",
                  fontWeight: 600,
                }}
              >
                {`${avgPrice.toLocaleString("nb-NO")} kr/m²`}
              </div>
            )}
            {yoy != null && (
              <div
                style={{
                  color: yoy >= 0 ? "#7FE3D4" : "#F87171",
                  fontSize: 22,
                  fontFamily: "sans-serif",
                  fontWeight: 600,
                }}
              >
                {`${yoySign}${yoy.toLocaleString("nb-NO")}% siste år`}
              </div>
            )}
            {population && (
              <div
                style={{
                  color: "#8B8E98",
                  fontSize: 22,
                  fontFamily: "sans-serif",
                }}
              >
                {`· ${population} innbyggere`}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...cityOgSize },
  );
}
