import { NextRequest, NextResponse } from "next/server";

export interface EnergimerkeResult {
  energikarakter: string | null;
  kwhM2: number | null;
  byggear: number | null;
  bygningskategori: string | null;
  attestUri: string | null;
  bruksareal: number | null;
  materialvalg: string | null;
}

const EMPTY: EnergimerkeResult = {
  energikarakter: null,
  kwhM2: null,
  byggear: null,
  bygningskategori: null,
  attestUri: null,
  bruksareal: null,
  materialvalg: null,
};

// In-memory cache for CSV data (survives across requests in same instance)
let csvCache: Map<string, EnergimerkeResult> | null = null;
let csvCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60 * 4; // 4 hours

function makeKey(postnummer: string, gateAdresse: string): string {
  return `${postnummer}:${gateAdresse.toLowerCase().replace(/\s+/g, " ").trim()}`;
}

async function loadCsvData(): Promise<Map<string, EnergimerkeResult>> {
  const apiKey = process.env.ENOVA_API_KEY;
  if (!apiKey) throw new Error("ENOVA_API_KEY not configured");

  // Get latest available month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // current month
  // Try current month first, fall back to previous
  let csvUrl: string | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const m = month - attempt;
    const y = m <= 0 ? year - 1 : year;
    const mo = m <= 0 ? 12 + m : m;
    const padded = String(mo).padStart(2, "0");

    try {
      const res = await fetch(
        `https://api.data.enova.no/ems/offentlige-data/v2/Fil/${y}/${padded}?subscription-key=${apiKey}`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (res.ok) {
        const json = await res.json();
        csvUrl = json.bankFileUrl;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!csvUrl) throw new Error("Could not get CSV URL from Enova");

  // Download CSV
  const csvRes = await fetch(csvUrl, { signal: AbortSignal.timeout(30000) });
  if (!csvRes.ok) throw new Error("Failed to download CSV");

  const text = await csvRes.text();
  const lines = text.split("\n");

  // Parse header
  const header = lines[0].replace(/^\uFEFF/, "").split(",");
  const idx = {
    postnummer: header.indexOf("Postnummer"),
    gateAdresse: header.indexOf("GateAdresse"),
    energikarakter: header.indexOf("Energikarakter"),
    kwhM2: header.indexOf("BeregnetLevertEnergiTotaltkWhm2"),
    byggear: header.indexOf("Byggear"),
    bygningskategori: header.indexOf("Bygningskategori"),
    attestUri: header.indexOf("AttestUri"),
    bra: header.indexOf("OppgittBra"),
    materialvalg: header.indexOf("Materialvalg"),
  };

  const map = new Map<string, EnergimerkeResult>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Simple CSV split (fields don't contain commas based on observed data)
    const cols = line.split(",");
    const pnr = cols[idx.postnummer]?.trim();
    const addr = cols[idx.gateAdresse]?.trim();

    if (!pnr || !addr) continue;

    const key = makeKey(pnr, addr);
    // Keep only the latest entry per address (later lines overwrite)
    map.set(key, {
      energikarakter: cols[idx.energikarakter]?.trim() || null,
      kwhM2: parseFloat(cols[idx.kwhM2]) || null,
      byggear: parseInt(cols[idx.byggear]) || null,
      bygningskategori: cols[idx.bygningskategori]?.trim() || null,
      attestUri: cols[idx.attestUri]?.trim() || null,
      bruksareal: parseInt(cols[idx.bra]) || null,
      materialvalg: cols[idx.materialvalg]?.trim() || null,
    });
  }

  return map;
}

async function getCache(): Promise<Map<string, EnergimerkeResult>> {
  if (csvCache && Date.now() - csvCacheTime < CACHE_TTL) {
    return csvCache;
  }
  csvCache = await loadCsvData();
  csvCacheTime = Date.now();
  return csvCache;
}

export async function GET(request: NextRequest) {
  const postnummer = request.nextUrl.searchParams.get("postnummer") ?? "";
  const adresse = request.nextUrl.searchParams.get("adresse") ?? "";

  if (!postnummer || !adresse) {
    return NextResponse.json(EMPTY);
  }

  try {
    const cache = await getCache();
    const key = makeKey(postnummer, adresse);

    // Try exact match
    let result = cache.get(key);

    // If no exact match, try fuzzy: strip house number suffixes (e.g. "2A" → "2")
    if (!result) {
      const fuzzyAddr = adresse.replace(/\s*[A-Za-z]$/, "").trim();
      const fuzzyKey = makeKey(postnummer, fuzzyAddr);
      result = cache.get(fuzzyKey);
    }

    // If still no match, try matching just street name (find closest)
    if (!result) {
      const streetName = adresse.replace(/\s+\d+.*$/, "").toLowerCase().trim();
      const prefix = `${postnummer}:`;
      cache.forEach((v, k) => {
        if (!result && k.startsWith(prefix) && k.includes(streetName)) {
          result = v;
        }
      });
    }

    return NextResponse.json(result ?? EMPTY);
  } catch (err) {
    console.error("[energimerke] Enova lookup failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(EMPTY);
  }
}
