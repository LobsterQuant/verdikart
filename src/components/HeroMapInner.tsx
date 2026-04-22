// NOTE: This file must ONLY be imported via dynamic(() => import(...), { ssr: false })
// Never import it directly — Leaflet requires window/document at module evaluation time.
// Leaflet's stylesheet is code-split with this chunk so it never hits the homepage.
"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import type { HeroMapAddress } from "./HeroMap";

const MAP_ZOOM = 15;

// Fix narrow-width bug: fires invalidateSize after mount (matches CityOverviewMapInner).
function MapReady() {
  const map = useMap();
  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize({ animate: false }), 80);
    const t2 = setTimeout(() => map.invalidateSize({ animate: false }), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);
  return null;
}

interface HeroMapInnerProps {
  address: HeroMapAddress;
  height: number;
}

export default function HeroMapInner({ address, height }: HeroMapInnerProps) {
  // Pulsing teal divIcon — built once, after the dynamic-import chunk has
  // loaded Leaflet's runtime. CSS for the rings lives in globals.css.
  const iconRef = useRef<L.DivIcon | null>(null);
  if (!iconRef.current) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");
    iconRef.current = L.divIcon({
      html:
        '<span class="hero-map-pulse-ring"></span>' +
        '<span class="hero-map-pulse-ring hero-map-pulse-ring-delay"></span>' +
        '<span class="hero-map-pulse-core"></span>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: "hero-map-pulse-marker",
    });
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-border"
      style={{ height, background: "#0E1016" }}
      role="img"
      aria-label="Verdikart-kartforhåndsvisning med eksempeladresse"
    >
      <MapContainer
        center={[address.lat, address.lon]}
        zoom={MAP_ZOOM}
        className="absolute inset-0 h-full w-full"
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
        boxZoom={false}
        style={{ background: "#0E1016" }}
      >
        <MapReady />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        <Marker position={[address.lat, address.lon]} icon={iconRef.current} />
      </MapContainer>

      {/* CARTO attribution — tiny, bottom-right, per Leaflet licence. */}
      <div className="pointer-events-auto absolute bottom-1 right-1 z-[400] rounded bg-black/50 px-1 text-[9px] leading-tight text-white/70">
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white"
        >
          OSM
        </a>
        {" · "}
        <a
          href="https://carto.com/attributions"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white"
        >
          CARTO
        </a>
      </div>

      {/* Static caption. */}
      <div className="pointer-events-none absolute bottom-2 left-2 right-2 z-[400] flex items-center justify-center">
        <span
          className="rounded-md px-2.5 py-1 text-[11px] font-medium text-text"
          style={{
            background: "rgb(14 16 22 / 0.82)",
            backdropFilter: "blur(8px)",
            border: "0.5px solid rgb(255 255 255 / 0.08)",
          }}
        >
          {address.address}
        </span>
      </div>
    </div>
  );
}
