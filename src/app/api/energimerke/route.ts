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

  // Load last 6 months for maximum coverage (~50k+ entries)
  const now = new Date();
  const csvUrls: string[] = [];

  for (let offset = 0; offset < 6; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");

    try {
      const res = await fetch(
        `https://api.data.enova.no/ems/offentlige-data/v2/Fil/${y}/${mo}?subscription-key=${apiKey}`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (res.ok) {
        const json = await res.json();
        if (json.bankFileUrl) csvUrls.push(json.bankFileUrl);
      }
    } catch {
      continue;
    }
  }

  if (csvUrls.length === 0) throw new Error("Could not get any CSV URLs from Enova");

  // Download all CSVs in parallel
  const csvTexts = await Promise.all(
    csvUrls.map(async (url) => {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
        return res.ok ? await res.text() : "";
      } catch {
        return "";
      }
    })
  );

  const map = new Map<string, EnergimerkeResult>();

  for (const text of csvTexts) {
    if (!text) continue;
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

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const cols = line.split(",");
      const pnr = cols[idx.postnummer]?.trim();
      const addr = cols[idx.gateAdresse]?.trim();

      if (!pnr || !addr) continue;

      const key = makeKey(pnr, addr);
      // Keep only the latest entry per address (later months overwrite older)
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
