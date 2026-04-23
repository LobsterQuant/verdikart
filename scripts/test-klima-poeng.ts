/**
 * Manual smoke-test for Klima-poeng scoring against live upstreams.
 *
 * Runs `calculateKlimaPoeng` for three benchmark addresses and prints the
 * full breakdown. Hits real NVE and Kartverket WMS endpoints.
 *
 * Usage:  npx tsx scripts/test-klima-poeng.ts
 */
import { calculateKlimaPoeng } from "../src/lib/scoring/klima-poeng";

interface TestAddress {
  label: string;
  lat: number;
  lon: number;
  kommunenummer: string;
  expectation: string;
}

const ADDRESSES: TestAddress[] = [
  {
    label: "Karl Johans gate 1, Oslo",
    lat: 59.9127,
    lon: 10.7461,
    kommunenummer: "0301",
    expectation: "Høy totalscore — inland, no stormflo; radon drag (Oslo=Høy)",
  },
  {
    label: "Bryggen, Bergen",
    lat: 60.3972,
    lon: 5.3244,
    kommunenummer: "4601",
    expectation: "Middels/lav — inside 200yr & 1000yr stormflo 2100; høy flomrisiko",
  },
  {
    label: "Svolvær havn, Vågan (lavtliggende kyst i Nord-Norge)",
    lat: 68.2340,
    lon: 14.5693,
    kommunenummer: "1865",
    expectation: "OK-band — inne i 20-år-nå stormflo-sone; Nordland klimaprofil",
  },
];

async function main() {
  for (const addr of ADDRESSES) {
    console.log("=".repeat(70));
    console.log(addr.label);
    console.log(`  (${addr.lat}, ${addr.lon}) knr=${addr.kommunenummer}`);
    console.log(`  Forventet: ${addr.expectation}`);
    console.log("-".repeat(70));

    const t0 = Date.now();
    const result = await calculateKlimaPoeng(addr.lat, addr.lon, {
      kommunenummer: addr.kommunenummer,
    });
    const ms = Date.now() - t0;

    console.log(`  TOTAL:           ${result.total} / 100`);
    console.log(`  Komponenter:`);
    console.log(`    Flom:          ${result.components.floodRisk.padEnd(8)} → ${result.components.floodScore}`);
    console.log(`    Kvikkleire:    ${String(result.components.quickClay ? "FARE" : "utenfor").padEnd(8)} → ${result.components.quickClayScore}`);
    const ss = result.components.stormSurge;
    const ssLabel = ss.in20YearCurrent ? "20-år nå"
      : ss.in200Year2100 ? "200-år 2100"
      : ss.in1000Year2100 ? "1000-år 2100"
      : "utenfor";
    console.log(`    Stormflo 2100: ${ssLabel.padEnd(13)} → ${result.components.stormSurgeScore}`);
    const radon = result.components.radon;
    if (radon.assessed) {
      console.log(`    Radon:         ${radon.level.padEnd(8)} → ${radon.score}`);
    } else {
      console.log(`    Radon:         Ikke vurdert (vekt redistribuert)`);
    }
    const kp = result.components.klimaprofil;
    console.log(`    Klimaprofil:   ${(kp?.fylkesnavn ?? "ingen").padEnd(20)} → ${result.components.klimaprofilScore}`);
    const weightsUsed = radon.assessed ? "5-komp (25/25/20/15/15)" : "4-komp redistribuert (30/30/22.5/—/17.5)";
    console.log(`  Vekter:          ${weightsUsed}`);
    console.log(`  Meta:            fylke=${result.meta.fylkesprofil ?? "—"}, ${ms}ms`);
    if (result.meta.warnings.length) {
      console.log(`  Advarsler:       ${result.meta.warnings.join(" | ")}`);
    }
    console.log(`  Datakilder:      ${JSON.stringify(result.dataSource)}`);
    console.log("");
  }
}

main().catch((err) => {
  console.error("Smoke test failed:", err);
  process.exit(1);
});
