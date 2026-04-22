import { ImageResponse } from "next/og";
import { cities, getCityData } from "@/app/by/[city]/cityData";

export const runtime = "edge";
export const alt = "Verdikart eiendomsrapport";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Per-property OG card. Renders from slug alone (no runtime fetch) so edge
 * generation stays fast and never fails. Slug format: <name>--<lat>-<lon>-<knr>.
 * Design: dark background, mint topographic signature (matches hover signature
 * in Package 6), address in large serif, kommune label as a subtle subtitle.
 */

function parseSlug(slug: string): { address: string; knr: string | null } {
  const match = slug.match(/^(.+?)--(-?\d+)-(-?\d+)-(\d{4})$/);
  const namePart = match ? match[1] : slug;
  const knr = match ? match[4] : null;
  const address = decodeURIComponent(namePart)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return { address, knr };
}

// Derived from cityData — single source of truth. Kommuner not covered by
// cityData simply render without a city subtitle.
const KNR_TO_CITY: Record<string, { slug: string; name: string }> =
  Object.fromEntries(
    Object.values(cities).map((c) => [
      c.kommunenummer,
      { slug: c.slug, name: c.name },
    ]),
  );

export default function OgImage({ params }: { params: { slug: string } }) {
  const { address, knr } = parseSlug(params.slug);
  const cityRef = knr ? KNR_TO_CITY[knr] : null;
  const city = cityRef ? getCityData(cityRef.slug) : null;
  const cityLabel = city?.name ?? cityRef?.name ?? "";
  const pricePill = city
    ? `${city.avgSqmPrice.toLocaleString("nb-NO")} kr/m² · ${cityLabel}`
    : cityLabel;

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
          fontFamily: "serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Topographic signature — concentric mint rings, top right */}
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

        {/* Wordmark */}
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
            EIENDOMSRAPPORT
          </span>
        </div>

        {/* Address + city */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {pricePill && (
            <div
              style={{
                alignSelf: "flex-start",
                background: "rgba(127, 227, 212, 0.14)",
                border: "1px solid rgba(127, 227, 212, 0.32)",
                color: "#9AEBDF",
                padding: "10px 24px",
                borderRadius: 999,
                fontSize: 22,
                fontFamily: "sans-serif",
                fontWeight: 600,
              }}
            >
              {pricePill}
            </div>
          )}
          <div
            style={{
              fontSize: address.length > 36 ? 64 : 80,
              color: "#F4F4F6",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: "88%",
              fontFamily: "serif",
            }}
          >
            {address}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
