/**
 * Major Norwegian city centers — lat/lon of main station or city center.
 * Previously embedded in transit/route.ts.
 */

import { haversineKm } from "./geo";

export interface CityCenter {
  name: string;
  lat: number;
  lon: number;
}

export const CITY_CENTERS: CityCenter[] = [
  { name: "Oslo sentrum",         lat: 59.9109, lon: 10.7502 },
  { name: "Bergen sentrum",       lat: 60.3893, lon:  5.3320 },
  { name: "Trondheim sentrum",    lat: 63.4362, lon: 10.3984 },
  { name: "Stavanger sentrum",    lat: 58.9694, lon:  5.7332 },
  { name: "Kristiansand sentrum", lat: 58.1467, lon:  7.9956 },
  { name: "Drammen sentrum",      lat: 59.7440, lon: 10.2045 },
  { name: "Tromsø sentrum",       lat: 69.6489, lon: 18.9551 },
  { name: "Fredrikstad sentrum",  lat: 59.2113, lon: 10.9374 },
  { name: "Sandnes sentrum",      lat: 58.8516, lon:  5.7355 },
  { name: "Bodø sentrum",         lat: 67.2804, lon: 14.3750 },
  { name: "Ålesund sentrum",      lat: 62.4722, lon:  6.1549 },
  { name: "Haugesund sentrum",    lat: 59.4133, lon:  5.2680 },
  { name: "Skien sentrum",        lat: 59.2090, lon:  9.6059 },
  { name: "Tønsberg sentrum",     lat: 59.2675, lon: 10.4080 },
  { name: "Moss sentrum",         lat: 59.4344, lon: 10.6576 },
  { name: "Sarpsborg sentrum",    lat: 59.2840, lon: 11.1104 },
  { name: "Lillehammer sentrum",  lat: 61.1153, lon: 10.4662 },
  { name: "Hamar sentrum",        lat: 60.7945, lon: 11.0675 },
  { name: "Gjøvik sentrum",       lat: 60.7965, lon: 10.6916 },
  { name: "Kongsberg sentrum",    lat: 59.6633, lon:  9.6476 },
];

/** Find the closest city center to a given coordinate. */
export function nearestCity(lat: number, lon: number): CityCenter {
  let best = CITY_CENTERS[0];
  let bestDist = Infinity;
  for (const city of CITY_CENTERS) {
    const d = haversineKm(lat, lon, city.lat, city.lon);
    if (d < bestDist) {
      bestDist = d;
      best = city;
    }
  }
  return best;
}
