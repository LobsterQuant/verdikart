"use client";

import { useCallback, useState } from "react";
import CardErrorBoundary from "@/components/CardErrorBoundary";
import ClimateRiskCard from "@/components/ClimateRiskCard";
import NoiseCard from "@/components/NoiseCard";
import AirQualityCard from "@/components/AirQualityCard";
import BroadbandCard from "@/components/BroadbandCard";
import MerDataKommerCard from "@/components/MerDataKommerCard";

type Key = "climate" | "noise" | "air" | "broadband";

export default function SidebarDataCluster({ lat, lon }: { lat: number; lon: number }) {
  const [statuses, setStatuses] = useState<Record<Key, boolean | null>>({
    climate: null,
    noise: null,
    air: null,
    broadband: null,
  });

  const report = useCallback(
    (key: Key) => (hasData: boolean) =>
      setStatuses((s) => (s[key] === hasData ? s : { ...s, [key]: hasData })),
    []
  );

  const allLoaded = Object.values(statuses).every((v) => v !== null);
  const allEmpty = allLoaded && Object.values(statuses).every((v) => v === false);

  if (allEmpty) {
    return <MerDataKommerCard />;
  }

  return (
    <>
      <CardErrorBoundary fallbackTitle="Klimarisiko feilet">
        <ClimateRiskCard lat={lat} lon={lon} onDataStatus={report("climate")} hideWhenEmpty />
      </CardErrorBoundary>
      <CardErrorBoundary fallbackTitle="Støynivå feilet">
        <NoiseCard lat={lat} lon={lon} onDataStatus={report("noise")} hideWhenEmpty />
      </CardErrorBoundary>
      <CardErrorBoundary fallbackTitle="Luftkvalitet feilet">
        <AirQualityCard lat={lat} lon={lon} onDataStatus={report("air")} hideWhenEmpty />
      </CardErrorBoundary>
      <CardErrorBoundary fallbackTitle="Bredbånd feilet">
        <BroadbandCard lat={lat} lon={lon} onDataStatus={report("broadband")} hideWhenEmpty />
      </CardErrorBoundary>
    </>
  );
}
