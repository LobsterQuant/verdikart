"use client";

import dynamic from "next/dynamic";

/** One entry in the rotating address carousel rendered on the homepage hero. */
export interface HeroMapAddress {
  address: string;
  lat: number;
  lon: number;
}

/** Demo addresses matching the example chips rendered below the hero search. */
export const HERO_MAP_ADDRESSES: readonly HeroMapAddress[] = [
  { address: "Karl Johans gate 1, Oslo",  lat: 59.9114, lon: 10.7494 },
  { address: "Bryggen 1, Bergen",          lat: 60.3971, lon:  5.3215 },
  { address: "Torget 2, Trondheim",        lat: 63.4306, lon: 10.3952 },
];

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
  return <HeroMapInner addresses={HERO_MAP_ADDRESSES} height={height} />;
}
