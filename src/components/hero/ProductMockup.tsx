import { getHeroPropertyData } from "@/lib/property";
import { TopographicHover } from "@/components/motion/TopographicHover";
import HeroMap from "@/components/HeroMap";
import { ValueEstimate } from "./mockup/ValueEstimate";
import { PriceTrendSpark } from "./mockup/PriceTrendSpark";
import { TransitPill } from "./mockup/TransitPill";
import ProductMockupAnimated from "./ProductMockupAnimated";

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

  // Sub-blocks are rendered server-side and passed as children to the client
  // wrapper, which orchestrates the scroll-triggered reveal (Package 5).
  return (
    <ProductMockupAnimated>
      {/* Top: live rotating map — Karl Johans → Bryggen → Torget, flyTo every 4s. */}
      <TopographicHover className="rounded-lg">
        <HeroMap height={180} />
      </TopographicHover>

      {/* Middle: value + sparkline side-by-side on ≥sm, stacked below */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <TopographicHover className="rounded-lg p-2 -m-2">
          <ValueEstimate
            sqmPrice={data.sqmPrice}
            yoyChange={data.yoyChange}
            kommuneName={DEMO_PROPERTY.kommuneName}
          />
        </TopographicHover>
        <TopographicHover className="rounded-lg p-2 -m-2">
          <PriceTrendSpark values={data.priceSeries} years={data.priceYears} />
        </TopographicHover>
      </div>

      {/* Bottom: transit pill centered, rendered only if we have data.
          TransitPill itself is skipped per Package 6's "no pill under 44px"
          rule, but the row container is too — it's a layout divider, not a
          card. */}
      {data.transit ? (
        <div className="mt-4 flex justify-center border-t border-border pt-4">
          <TransitPill
            stopName={data.transit.stopName}
            modeLabel={data.transit.modeLabel}
            distanceM={data.transit.distanceM}
          />
        </div>
      ) : null}
    </ProductMockupAnimated>
  );
}
