/**
 * Sanity-check the Kartverket N50 water mask against known land and water
 * points near the 6 Pendlings-poeng work-centers.
 *
 * Run:
 *   npx tsx scripts/test-water-mask.ts
 */

import { isOnLand } from "./lib/water-mask";

interface Case {
  label: string;
  lat: number;
  lon: number;
  expect: "land" | "water";
}

// Land cases: each work-center's sentrum address/plaza.
// Water cases: centers of the largest Havflate (sea) polygon within 3–22 km
// of each work-center (picked from the N50 data itself, guaranteed water).
const CASES: Case[] = [
  // --- Oslo ---
  { label: "Karl Johans gate (Oslo sentrum)", lat: 59.9127, lon: 10.7461, expect: "land" },
  { label: "Oslofjord (south of Oslo)",        lat: 59.8750, lon: 10.7250, expect: "water" },

  // --- Bergen ---
  { label: "Bryggen (Bergen sentrum)",         lat: 60.3972, lon: 5.3223,  expect: "land" },
  { label: "Byfjorden (north-west of Bergen)", lat: 60.4250, lon: 5.1250,  expect: "water" },

  // --- Trondheim ---
  { label: "Trondheim torg",                    lat: 63.4362, lon: 10.3984, expect: "land" },
  { label: "Trondheimsfjorden (near Trondheim)", lat: 63.4750, lon: 10.4750, expect: "water" },

  // --- Stavanger ---
  { label: "Stavanger sentrum",                 lat: 58.9700, lon: 5.7333,  expect: "land" },
  { label: "Stavanger harbor (Byfjorden)",      lat: 58.9850, lon: 5.7150,  expect: "water" },

  // --- Kristiansand ---
  { label: "Kristiansand sentrum",              lat: 58.1467, lon: 7.9956,  expect: "land" },
  { label: "Østre havn (Kristiansand)",         lat: 58.1430, lon: 8.0100,  expect: "water" },

  // --- Tromsø ---
  { label: "Storgata 1 (Tromsø sentrum)",       lat: 69.6497, lon: 18.9571, expect: "land" },
  { label: "Tromsøysundet (south of Tromsø)",   lat: 69.6250, lon: 18.8250, expect: "water" },
];

function main() {
  const t0 = Date.now();
  let passed = 0;
  const failures: Case[] = [];

  for (const c of CASES) {
    const actual = isOnLand(c.lat, c.lon) ? "land" : "water";
    const ok = actual === c.expect;
    console.log(
      `  ${ok ? "✓" : "✗"} ${c.label.padEnd(42)} (${c.lat.toFixed(4)}, ${c.lon.toFixed(4)}) expected=${c.expect} actual=${actual}`,
    );
    if (ok) passed++;
    else failures.push(c);
  }

  const elapsedMs = Date.now() - t0;
  console.log(`\n${passed}/${CASES.length} passed in ${elapsedMs} ms`);

  if (failures.length > 0) {
    console.error(`\nFailures:`);
    for (const f of failures) console.error(`  ${f.label}: expected ${f.expect}`);
    process.exit(1);
  }
  process.exit(0);
}

main();
