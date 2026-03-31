import { NextRequest } from "next/server";

export const runtime = "edge";
export const maxDuration = 30;

// Fetch minimal context data to give the AI something real to work with
async function fetchContext(kommunenummer: string, lat: number, lon: number) {
  const context: string[] = [];

  // 1. Price trend from our own API
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${base}/api/price-trend?knr=${kommunenummer}&pnr=`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.yoyChange !== null) {
        context.push(`Prisutvikling (YoY): ${data.yoyChange > 0 ? "+" : ""}${data.yoyChange.toFixed(1)}% i ${data.sourceLabel}`);
      }
      if (data.values?.length) {
        const latest = data.values[data.values.length - 1];
        context.push(`Siste kvadratmeterpris: ${Math.round(latest).toLocaleString("nb-NO")} kr/m²`);
      }
    }
  } catch { /* non-critical */ }

  // 2. Transit stops from Entur
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${base}/api/transit/stops?lat=${lat}&lon=${lon}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const stops = await res.json();
      const arr = Array.isArray(stops) ? stops : stops.stops ?? [];
      if (arr.length > 0) {
        const nearest = arr.slice(0, 3).map((s: { name: string; distance?: number }) =>
          `${s.name}${s.distance ? ` (${s.distance}m)` : ""}`
        );
        context.push(`Nærmeste holdeplasser: ${nearest.join(", ")}`);
      }
    }
  } catch { /* non-critical */ }

  return context;
}

export async function POST(req: NextRequest) {
  const { address, kommunenummer, lat, lon } = await req.json();

  if (!address || !lat || !lon) {
    return new Response("Bad request", { status: 400 });
  }

  const contextLines = await fetchContext(kommunenummer ?? "", lat, lon);
  const contextBlock = contextLines.length
    ? `\n\nTilgjengelig data:\n${contextLines.map((l) => `- ${l}`).join("\n")}`
    : "";

  const prompt = `Du er Verdikart, en norsk eiendomsanalytiker. Skriv en kort (3–4 setninger), objektiv og nyttig oppsummering av adressen "${address}" for en boligkjøper eller -selger. Fokuser på beliggenhet, kollektivdekning og prisnivå. Bruk tallene fra dataen. Ikke gi personlig investerings- eller kjøpsanbefaling. Svar kun på norsk bokmål.${contextBlock}`;

  const apiKey = process.env.OPENROUTER_API_KEY;

  // Helper: send full text as a single SSE "sentence" stream (avoid tokenization spacing issues)
  function streamText(text: string): Response {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send the whole text as one data event so client never has to join tokens
        controller.enqueue(encoder.encode(`data: ${text}\n\n`));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  if (!apiKey) {
    return streamText(buildFallbackSummary(address, contextLines));
  }

  // Use non-streaming to avoid SSE token-splitting artefacts
  const llmRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://verdikart.no",
      "X-Title": "Verdikart",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b:free",
      stream: false,
      max_tokens: 220,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (llmRes.ok) {
    try {
      const data = await llmRes.json();
      const text = (data.choices?.[0]?.message?.content ?? "").trim();
      if (text) return streamText(text);
    } catch { /* fall through */ }
  }

  // Fallback: rule-based summary from context data
  return streamText(buildFallbackSummary(address, contextLines));
}

function buildFallbackSummary(address: string, context: string[]): string {
  const priceMatch = context.find((l) => l.includes("kvadratmeterpris"));
  const trendMatch = context.find((l) => l.includes("Prisutvikling"));
  const transitMatch = context.find((l) => l.includes("holdeplasser"));

  const parts: string[] = [];
  if (priceMatch) parts.push(`${priceMatch.replace("Siste ", "Gjennomsnittlig ")} i kommunen.`);
  if (trendMatch) parts.push(`${trendMatch}.`);
  if (transitMatch) parts.push(`${transitMatch}.`);
  if (parts.length === 0) parts.push(`${address} er en norsk adresse. Søk i feltet ovenfor for å se full eiendomsrapport med transport- og prisdata.`);
  return parts.join(" ");
}
