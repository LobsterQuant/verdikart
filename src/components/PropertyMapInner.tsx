// NOTE: This file must ONLY be imported via dynamic(() => import(...), { ssr: false })
// Never import it directly — Leaflet requires window/document at module evaluation time.
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { TransitStop } from "@/components/PropertyMap";

// Re-centre + fix narrow-width bug: fires invalidateSize after mount
function MapReady({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    const t1 = setTimeout(() => {
      map.invalidateSize({ animate: false });
      map.setView([lat, lon], 16, { animate: false });
    }, 80);
    const t2 = setTimeout(() => {
      map.invalidateSize({ animate: false });
    }, 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [map, lat, lon]);
  return null;
}

interface PropertyMapInnerProps {
  lat: number;
  lon: number;
  address: string;
  stops: TransitStop[];
}

export default function PropertyMapInner({ lat, lon, address, stops }: PropertyMapInnerProps) {
  const [tilesLoaded, setTilesLoaded] = useState(false);
  // Hard fallback: dismiss skeleton after 3s even if tile events don't fire
  useEffect(() => {
    const t = setTimeout(() => setTilesLoaded(true), 3000);
    return () => clearTimeout(t);
  }, []);
  // Icons created lazily inside render (client-only, after dynamic import)
  const iconsRef = useRef<{ defaultIcon: L.Icon; stopIcon: L.DivIcon } | null>(null);

  if (!iconsRef.current) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");
    iconsRef.current = {
      defaultIcon: L.icon({
        iconUrl: "/leaflet-marker-icon.png",
        iconRetinaUrl: "/leaflet-marker-icon-2x.png",
        shadowUrl: "/leaflet-marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
      stopIcon: L.divIcon({
        html: '<div style="width:10px;height:10px;background:var(--accent);border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 3px rgb(var(--accent-rgb) / 0.25)"></div>',
        iconSize: [10, 10],
        iconAnchor: [5, 5],
        className: "",
      }),
    };
  }

  const { defaultIcon, stopIcon } = iconsRef.current;

  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    return (
      <div className="flex h-[400px] items-center justify-center bg-card-bg md:h-[500px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-tertiary border-t-accent" />
      </div>
    );
  }

  return (
    <div className="relative h-[400px] w-full md:h-[500px]">
      {/* Skeleton shown until first tile batch loads */}
      {!tilesLoaded && (
        <div
          className="pointer-events-none absolute inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500"
          style={{ background: "#080810" }}
        >
          <svg
            className="absolute inset-0 h-full w-full opacity-[0.06]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--accent-hover)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />
          </svg>
          <div className="relative flex h-10 w-10 items-center justify-center">
            <div className="absolute h-10 w-10 animate-ping rounded-full bg-accent opacity-20" />
            <div className="h-4 w-4 rounded-full bg-accent" />
          </div>
        </div>
      )}

      <MapContainer
        center={[lat, lon]}
        zoom={16}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={true}
        preferCanvas={false}
      >
        <MapReady lat={lat} lon={lon} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
          eventHandlers={{
            load: () => setTilesLoaded(true),
            tileload: () => setTilesLoaded(true),
            tileerror: () => setTilesLoaded(true),
          }}
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
          pane="shadowPane"
        />

        <Marker position={[lat, lon]} icon={defaultIcon}>
          <Popup>
            <span style={{ color: "#111", fontWeight: 500 }}>{address}</span>
          </Popup>
        </Marker>

        {stops.map((stop, i) => (
          <Marker key={i} position={[stop.lat, stop.lon]} icon={stopIcon}>
            <Popup>
              <span style={{ color: "#111", fontSize: "13px" }}>
                {stop.name}
                {stop.distance !== undefined && (
                  <span style={{ color: "#666", display: "block", fontSize: "11px" }}>
                    {stop.distance} m unna
                  </span>
                )}
              </span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
