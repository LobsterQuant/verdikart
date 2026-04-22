"use client";

import dynamic from "next/dynamic";

/** Single demo address rendered on the homepage hero map. */
export interface HeroMapAddress {
  address: string;
  lat: number;
  lon: number;
}

// Karl Johans gate 1, Oslo — pinned so the map stays consistent with
// ProductMockup's Oslo-only data fetch and with the first example chip slug
// in HeroEntry. Lat/lon match `karl-johans-gate-1--599114-107494-0301`.
export const HERO_MAP_ADDRESS: HeroMapAddress = {
  address: "Karl Johans gate 1, Oslo",
  lat: 59.9114,
  lon: 10.7494,
};

const HeroMapInner = dynamic(() => import("./HeroMapInner"), {
  ssr: false,
  loading: () => (
    <div
      className="relative overflow-hidden rounded-lg border border-border"
      style={{
        height: 180,
        background:
          "radial-gradient(ellipse at 50% 50%, #161922 0%, #0E1016 100%)",
      }}
      aria-hidden
    />
  ),
});

interface HeroMapProps {
  /** Pixel height for the map canvas. Matches the original MapCrop dimensions. */
  height?: number;
}

export default function HeroMap({ height = 180 }: HeroMapProps) {
  return <HeroMapInner address={HERO_MAP_ADDRESS} height={height} />;
}
