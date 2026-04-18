import { getHeroPropertyData } from "@/lib/property";
import { MapCrop } from "./mockup/MapCrop";
import { ValueEstimate } from "./mockup/ValueEstimate";
import { PriceTrendSpark } from "./mockup/PriceTrendSpark";
import { TransitPill } from "./mockup/TransitPill";

// Karl Johans gate 1, Oslo — the same demo address chipped in the hero search.
// Lat/lon sourced from the existing example slug in app/page.tsx.
const DEMO_PROPERTY = {
  address: "Karl Johans gate 1, Oslo",
  lat: 59.9114,
  lon: 10.7494,
  kommunenummer: "0301",
  kommuneName: "Oslo",
};

/**
 * Product mockup shown directly under the hero CTA block.
 *
 * Server component. Fetches one composed payload from SSB + Entur via
 * `getHeroPropertyData` (ISR — revalidate set at the page level). Renders a
 * 2-col grid on ≥sm (map spans both cols on top, value + sparkline side-by-
 * side below, transit pill centered at the bottom). Stacks single-column on
 * mobile. All sub-components are pure SVG/text so first-paint is instant.
 */
export async function ProductMockup() {
  const data = await getHeroPropertyData(DEMO_PROPERTY);

  return (
    <div
      className="relative mx-auto w-full max-w-[640px] rounded-2xl border border-border bg-bg-elevated p-4 text-left sm:p-6"
      style={{
        boxShadow:
          "0 30px 60px -20px rgba(0, 0, 0, 0.5), 0 0 0 0.5px rgb(255 255 255 / 0.04)",
      }}
    >
      {/* Top: map spans full width */}
      <MapCrop
        coords={data.coordinates}
        address={data.address}
        height={180}
      />

      {/* Middle: value + sparkline side-by-side on ≥sm, stacked below */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <ValueEstimate
          sqmPrice={data.sqmPrice}
          yoyChange={data.yoyChange}
          kommuneName={DEMO_PROPERTY.kommuneName}
        />
        <PriceTrendSpark values={data.priceSeries} years={data.priceYears} />
      </div>

      {/* Bottom: transit pill centered, rendered only if we have data */}
      {data.transit && (
        <div className="mt-4 flex justify-center border-t border-border pt-4">
          <TransitPill
            stopName={data.transit.stopName}
            modeLabel={data.transit.modeLabel}
            distanceM={data.transit.distanceM}
          />
        </div>
      )}
    </div>
  );
}
