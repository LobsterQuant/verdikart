// NOTE: This file must ONLY be imported via dynamic(() => import(...), { ssr: false })
// Never import it directly — Leaflet requires window/document at module evaluation time.
// Leaflet's stylesheet is code-split with this chunk so it never hits the homepage.
"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import type { HeroMapAddress } from "./HeroMap";

const ROTATE_INTERVAL_MS = 4000;
const FLY_DURATION_S = 1.5;
const MAP_ZOOM = 15;

// Smoothly pans between rotating addresses. Skips animation on the first mount
// since the MapContainer is already centred on addresses[0].
function FlyToTarget({ target }: { target: HeroMapAddress }) {
  const map = useMap();
  const firstMount = useRef(true);
  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }
    map.flyTo([target.lat, target.lon], MAP_ZOOM, { duration: FLY_DURATION_S });
  }, [map, target.lat, target.lon]);
  return null;
}

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
  addresses: readonly HeroMapAddress[];
  height: number;
}

export default function HeroMapInner({ addresses, height }: HeroMapInnerProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduceMotion || paused) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % addresses.length),
      ROTATE_INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, [reduceMotion, paused, addresses.length]);

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

  const current = addresses[index];

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-border"
      style={{ height, background: "#0E1016" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="img"
      aria-label="Verdikart-kartforhåndsvisning med eksempeladresser"
    >
      <MapContainer
        center={[addresses[0].lat, addresses[0].lon]}
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
        <FlyToTarget target={current} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        <Marker position={[current.lat, current.lon]} icon={iconRef.current} />
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

      {/* Caption — crossfades 300ms on address change. */}
      <div className="pointer-events-none absolute bottom-2 left-2 right-2 z-[400] flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={current.address}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-md px-2.5 py-1 text-[11px] font-medium text-text"
            style={{
              background: "rgb(14 16 22 / 0.82)",
              backdropFilter: "blur(8px)",
              border: "0.5px solid rgb(255 255 255 / 0.08)",
            }}
          >
            {current.address}
          </m.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
