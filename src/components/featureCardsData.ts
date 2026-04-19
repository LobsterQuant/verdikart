import { Bus, TrendingUp, Home, Droplets, Wind, CircleDollarSign } from "lucide-react";
import type React from "react";

/**
 * Source of truth for the homepage feature-card grid. Shared between the
 * static fallback (server-renderable) and the animated version (lazy-loaded
 * client module) so there is a single data definition.
 */
export type FeatureCardData = {
  Icon: React.ElementType;
  title: string;
  description: string;
  isNew?: boolean;
};

export const featureCards: FeatureCardData[] = [
  {
    Icon: CircleDollarSign,
    title: "Verdiestimat",
    description:
      "Prisanslag basert på SSB-data og energiattest. Med ±15% konfidensintervall.",
    isNew: true,
  },
  {
    Icon: Bus,
    title: "Kollektivtransport",
    description:
      "Finn nærmeste holdeplasser, avganger og reisetid til sentrum. Live data fra Entur, ikke meglerens anslag.",
  },
  {
    Icon: TrendingUp,
    title: "Prisutvikling",
    description:
      "Kommunens boligpriser over tid. Sammenlign med resten av landet.",
  },
  {
    Icon: Droplets,
    title: "Klimarisiko",
    description:
      "Flomfare, kvikkleire og stormflo, direkte fra NVE.",
    isNew: true,
  },
  {
    Icon: Wind,
    title: "Luftkvalitet",
    description:
      "PM2.5, PM10 og NO₂ fra NILU. Se om luften er god der du vil bo.",
    isNew: true,
  },
  {
    Icon: Home,
    title: "Kommunalt prissnitt",
    description:
      "Se gjennomsnittlig kvadratmeterpris for din kommune. Forstå hva lignende boliger faktisk omsettes for.",
  },
];
