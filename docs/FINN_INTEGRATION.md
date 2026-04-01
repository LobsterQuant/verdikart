# Finn.no Sold Prices Integration — Architecture & Code

## Overview

**Goal**: Add "Sold nearby" section to Verdikart property pages showing real Finn.no sales within 1km radius.

**Flow**:
1. User searches address on Verdikart
2. Verdikart API calls OpenClaw agent → Apify actor to scrape Finn.no
3. Results cached 48h per address
4. UI renders "Solgt i nærheten" card with last 5–10 sales

---

## Integration Layers

### 1. OpenClaw Agent (Backend Orchestration)

**File**: `~/.openclaw/workspace/scripts/finn-price-scraper.py`

```python
#!/usr/bin/env python3
"""
Finn.no property scraper via Apify Actor.
Called from Verdikart API when user searches an address.
"""

import os
import json
import sys
from typing import TypedDict
import time

# Stub imports (replace with real apify-client when available)
# from apify_client import ApifyClient

class SoldProperty(TypedDict):
    address: str
    price_nok: int
    price_per_sqm: int
    sold_date: str  # YYYY-MM-DD
    rooms: int | None
    sqm: int | None

class FinnScraperInput(TypedDict):
    address: str
    latitude: float
    longitude: float
    radius_km: float
    max_results: int

class FinnScraperConfig:
    """Apify Actor configuration for Finn.no"""
    ACTOR_ID = "apify~shirant/finn-no-property-scraper"  # TO BE CREATED
    TIMEOUT_SEC = 120
    MAX_RETRIES = 2

def scrape_finn_sold_prices(
    address: str,
    latitude: float,
    longitude: float,
    radius_km: float = 1.0,
    max_results: int = 10
) -> list[SoldProperty]:
    """
    Call Apify actor to scrape Finn.no for sold properties.
    
    Args:
        address: Human-readable address (e.g., "Bogstadveien 74, 0366 Oslo")
        latitude: WGS84 latitude
        longitude: WGS84 longitude
        radius_km: Search radius in km (default 1.0)
        max_results: Max number of results (default 10)
    
    Returns:
        List of sold properties within radius, sorted by sale date (newest first)
    """
    
    actor_input: FinnScraperInput = {
        "address": address,
        "latitude": latitude,
        "longitude": longitude,
        "radius_km": radius_km,
        "max_results": max_results,
    }
    
    # Placeholder: In production, use apify_client to call the actor
    # For now, mock a response for demonstration
    
    print(f"[FinnScraper] Searching Finn.no for sold properties near {address}")
    print(f"[FinnScraper] Radius: {radius_km}km, Max results: {max_results}")
    
    # TODO: Replace with real Apify call once actor is available
    # client = ApifyClient(os.environ.get("APIFY_API_KEY"))
    # run = client.actor(FinnScraperConfig.ACTOR_ID).call(
    #     run_input=actor_input,
    #     timeout_secs=FinnScraperConfig.TIMEOUT_SEC,
    # )
    # dataset = client.dataset(run["defaultDatasetId"])
    # items = dataset.list_items()["items"]
    
    # Mock response for testing
    items = [
        {
            "address": "Bogstadveien 74, 0366 OSLO",
            "price": 8200000,
            "sqm": 92,
            "price_per_sqm": 89130,
            "rooms": 3,
            "sold_date": "2026-03-15",
            "distance_km": 0.0,
        },
        {
            "address": "Sørkedalsveien 3B, 0369 OSLO",
            "price": 7800000,
            "sqm": 85,
            "price_per_sqm": 91765,
            "rooms": 3,
            "sold_date": "2026-03-10",
            "distance_km": 0.35,
        },
        {
            "address": "Marienlyst skole, Blindernveien 12, 0361 OSLO",
            "price": 7500000,
            "sqm": 78,
            "price_per_sqm": 96154,
            "rooms": 2,
            "sold_date": "2026-03-05",
            "distance_km": 0.78,
        },
    ]
    
    # Transform to schema
    results: list[SoldProperty] = []
    for item in items:
        results.append({
            "address": item["address"],
            "price_nok": item["price"],
            "price_per_sqm": item["price_per_sqm"],
            "sold_date": item["sold_date"],
            "rooms": item.get("rooms"),
            "sqm": item.get("sqm"),
        })
    
    # Sort by sold_date descending (newest first)
    results.sort(key=lambda x: x["sold_date"], reverse=True)
    
    return results[:max_results]


if __name__ == "__main__":
    # Example usage
    results = scrape_finn_sold_prices(
        address="Bogstadveien 74, 0366 Oslo",
        latitude=59.9239,
        longitude=10.7050,
        radius_km=1.0,
        max_results=5,
    )
    
    for r in results:
        print(
            f"{r['address']} — {r['price_nok']:,} NOK ({r['price_per_sqm']:,}/sqm) — "
            f"Solgt {r['sold_date']}"
        )
    
    # Output for Verdikart API
    print(json.dumps(results, indent=2, default=str))
```

---

### 2. Verdikart API Endpoint

**File**: `src/app/api/finn-sold.ts` (Next.js API route)

```typescript
import { NextRequest, NextResponse } from 'next/server';

interface FinnSoldRequest {
  address: string;
  latitude: number;
  longitude: number;
  radiusKm?: number;
  maxResults?: number;
}

interface SoldProperty {
  address: string;
  price_nok: number;
  price_per_sqm: number;
  sold_date: string;
  rooms?: number;
  sqm?: number;
}

interface CacheEntry {
  results: SoldProperty[];
  fetchedAt: number; // Unix timestamp
}

// Simple in-memory cache (48h TTL)
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

export async function POST(req: NextRequest) {
  try {
    const body: FinnSoldRequest = await req.json();
    const { address, latitude, longitude, radiusKm = 1.0, maxResults = 10 } = body;

    // Generate cache key
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)},${radiusKm}`;

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return NextResponse.json({
        results: cached.results,
        cached: true,
        fetchedAt: new Date(cached.fetchedAt).toISOString(),
      });
    }

    // Call OpenClaw agent (via gateway or HTTP)
    const agentResponse = await fetch('http://localhost:19234/api/agent/invoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENCLAW_GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        agent: 'main',
        message: `Scrape Finn.no for sold properties near: ${address} (${latitude}, ${longitude}) within ${radiusKm}km. Max ${maxResults} results.`,
        tools: ['apify'],
      }),
    });

    if (!agentResponse.ok) {
      throw new Error(`Agent call failed: ${agentResponse.statusText}`);
    }

    const agentData = await agentResponse.json();
    
    // Parse results from agent response (simplified)
    const results: SoldProperty[] = agentData.results || [];

    // Cache results
    cache.set(cacheKey, {
      results,
      fetchedAt: Date.now(),
    });

    return NextResponse.json({
      results,
      cached: false,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[FinnSold API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Finn.no data', details: String(error) },
      { status: 500 }
    );
  }
}
```

---

### 3. React Component (Property Page UI)

**File**: `src/components/FinnSoldNearby.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, CalendarDays, Home } from 'lucide-react';

interface SoldProperty {
  address: string;
  price_nok: number;
  price_per_sqm: number;
  sold_date: string;
  rooms?: number;
  sqm?: number;
}

interface FinnSoldNearbyProps {
  address: string;
  latitude: number;
  longitude: number;
  municipalAveragePricePerSqm?: number;
}

export default function FinnSoldNearby({
  address,
  latitude,
  longitude,
  municipalAveragePricePerSqm,
}: FinnSoldNearbyProps) {
  const [properties, setProperties] = useState<SoldProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    const fetchSoldNearby = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/finn-sold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            latitude,
            longitude,
            radiusKm: 1.0,
            maxResults: 5,
          }),
        });

        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();
        setProperties(data.results || []);
        setCached(data.cached || false);
      } catch (err) {
        setError(String(err));
        console.error('[FinnSoldNearby] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSoldNearby();
  }, [address, latitude, longitude]);

  if (loading) {
    return (
      <div className="rounded-xl border border-card-border bg-card-bg p-6 animate-pulse">
        <div className="h-6 bg-card-border rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-card-border rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !properties.length) {
    return null; // Fail silently if data unavailable
  }

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Home className="h-5 w-5 text-accent" strokeWidth={1.5} />
          Solgt i nærheten
        </h3>
        <p className="text-xs text-text-tertiary mt-1">
          {cached ? '🔄 Cached 48h ago' : '⚡ Updated now'} • Finn.no públikk data
        </p>
      </div>

      <div className="space-y-3">
        {properties.map((prop, idx) => {
          const priceChange = municipalAveragePricePerSqm
            ? ((prop.price_per_sqm - municipalAveragePricePerSqm) / municipalAveragePricePerSqm) * 100
            : null;

          return (
            <div
              key={idx}
              className="flex items-start justify-between gap-4 rounded-lg bg-background/50 p-3 border border-card-border/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">
                  {prop.address.split(',')[0]}
                </p>
                <div className="flex gap-3 mt-1 text-xs text-text-secondary">
                  {prop.rooms && (
                    <span>
                      <strong>{prop.rooms}</strong> rom
                    </span>
                  )}
                  {prop.sqm && (
                    <span>
                      <strong>{prop.sqm}</strong> m²
                    </span>
                  )}
                  <span className="flex items-center gap-0.5">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(prop.sold_date).toLocaleDateString('no-NO', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-foreground">
                  {(prop.price_nok / 1_000_000).toFixed(2)}M NOK
                </p>
                <p className={`text-xs font-medium ${priceChange && priceChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {prop.price_per_sqm.toLocaleString('no-NO')}/m²
                  {priceChange !== null && (
                    <span className="ml-1">
                      {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-text-tertiary mt-4 border-t border-card-border/50 pt-3">
        📍 Viser salg innen 1km radius fra søkt adresse. Data fra Finn.no — typisk lag 2–4 uker etter
        settlement.
      </p>
    </div>
  );
}
```

---

### 4. Usage in Property Page

**File**: `src/app/eiendom/[address]/page.tsx`

```typescript
import FinnSoldNearby from '@/components/FinnSoldNearby';
import PriceTrendCard from '@/components/PriceTrendCard';

interface PropertyPageProps {
  params: { address: string };
  searchParams: { lat?: string; lng?: string };
}

export default async function PropertyPage({
  params,
  searchParams,
}: PropertyPageProps) {
  const lat = parseFloat(searchParams.lat || '0');
  const lng = parseFloat(searchParams.lng || '0');

  return (
    <div className="grid gap-6">
      {/* SSB municipal average price */}
      <PriceTrendCard
        kommunenummer="0301"
        postnummer="0366"
      />

      {/* NEW: Finn.no sold nearby */}
      {lat && lng && (
        <FinnSoldNearby
          address={params.address}
          latitude={lat}
          longitude={lng}
          municipalAveragePricePerSqm={85000} // From SSB API
        />
      )}
    </div>
  );
}
```

---

## Finn.no Actor Specification

**To be built or sourced from Apify Store:**

### Input Schema
```json
{
  "address": "string (human-readable for logging)",
  "latitude": "number (WGS84)",
  "longitude": "number (WGS84)",
  "radius_km": "number (default 1.0)",
  "max_results": "number (default 10)",
  "sold_only": "boolean (default true)",
  "date_from": "string (YYYY-MM-DD, optional: filter to last N days)"
}
```

### Output Schema
```json
[
  {
    "address": "string",
    "price": "number (NOK)",
    "sqm": "number",
    "price_per_sqm": "number",
    "rooms": "number | null",
    "sold_date": "string (YYYY-MM-DD)",
    "listing_url": "string (Finn.no URL)",
    "distance_km": "number (from search center)",
    "finn_id": "string (unique identifier)"
  }
]
```

### Key Implementation Notes
- **Finn.no structure**: Properties listed under `/finn/bolig/` with `soldDate` and `price` in page data
- **Anti-bot**: Use datacenter proxies (`--proxy-urls`) to avoid rate limiting
- **Parsing**: Extract JSON-LD schema + meta tags (avoid heavy DOM parsing if possible)
- **Caching**: Finn.no data is stable after settlement (2–4 week lag), so 48h cache is safe

---

## Cost Estimation

| Component | Cost per 1,000 lookups |
|-----------|----------------------|
| Apify Actor run | $5–15 (depends on complexity) |
| Datacenter proxy (if needed) | $0.60–1.50 |
| OpenClaw gateway | Free (local) |
| API endpoint | Free (Vercel) |
| **Total per lookup** | **$0.006–0.015** |

**Monthly at 1,000 searches/month**: $6–15 + $19 Apify Starter plan = **$25–34/month**

---

## Deployment Checklist

- [ ] Create/source Finn.no Apify actor (build or buy)
- [ ] Set `APIFY_API_KEY` env var on Vercel + local
- [ ] Test `finn-price-scraper.py` with mock data locally
- [ ] Deploy Verdikart API route (`/api/finn-sold`)
- [ ] Deploy `FinnSoldNearby` component + integrate into property page
- [ ] Set cache TTL strategy (48h safe, can adjust based on traffic)
- [ ] Monitor Apify credit usage + set spend cap
- [ ] Add "Powered by Finn.no" attribution on UI
- [ ] Test end-to-end: Address search → API call → UI render
- [ ] Document ToS compliance with Finn.no

---

## Next Steps

1. **Verify Finn.no ToS**: Check if scraped data usage is allowed (public listing = likely OK)
2. **Build Apify actor**: Use Playwright to scrape Finn.no property pages
3. **Get Apify API key**: Sign up at https://apify.com, add billing
4. **Deploy integration**: Copy code above, test with mock data, then go live

Good luck! 🚀
