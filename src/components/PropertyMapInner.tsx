"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { TransitStop } from "@/components/PropertyMap";

// Forces map to re-centre when lat/lon are available (guards against stale initial render)
function MapCentrer({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
      map.setView([lat, lon], 16, { animate: false });
    }
  }, [map, lat, lon]);
  return null;
}

// Fix default marker icon for Leaflet in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const stopIcon = L.divIcon({
  html: '<div style="width:10px;height:10px;background:#0066FF;border:2px solid #fff;border-radius:50%;"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
  className: "",
});

interface PropertyMapInnerProps {
  lat: number;
  lon: number;
  address: string;
  stops: TransitStop[];
}

export default function PropertyMapInner({
  lat,
  lon,
  address,
  stops,
}: PropertyMapInnerProps) {
  // Guard against undefined lat/lon during hydration
  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    return (
      <div className="flex h-[400px] items-center justify-center bg-card-bg md:h-[500px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-tertiary border-t-accent" />
      </div>
    );
  }

  return (
    <MapContainer
      center={[lat, lon]}
      zoom={16}
      className="h-[400px] w-full md:h-[500px]"
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <MapCentrer lat={lat} lon={lon} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
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
  );
}
