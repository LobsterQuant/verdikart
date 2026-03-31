import { NextRequest } from "next/server";

export const runtime = "edge";
export const maxDuration = 30;

interface ContextData {
  sqmPrice?: number;
  yoyChange?: number;
  priceLabel?: string;
  transitMinutes?: number | null;
  transitDestination?: string;
}

function buildPrompt(address: string, ctx: ContextData): string {
  const lines: string[] = [];

  if (ctx.sqmPrice) {
    lines.push(`- Kvadratmeterpris: ${ctx.sqmPrice.toLocaleString("nb-NO")} kr/m² (${ctx.priceLabel ?? "kommunedata"})`);
  }
  if (ctx.yoyChange != null) {
    lines.push(`- Prisutvikling siste år: ${ctx.yoyChange > 0 ? "+" : ""}${ctx.yoyChange.toFixed(1)}%`);
  }
  if (ctx.transitMinutes != null && ctx.transitMinutes > 0 && ctx.transitDestination) {
    lines.push(`- Kollektivtransport til ${ctx.transitDestination}: ${ctx.transitMinutes} min`);
  } else if (ctx.transitMinutes === null || ctx.transitMinutes === 0) {
    lines.push(`- Kollektivtransport: adresse er i sentrum`);
  }

  const dataBlock = lines.length > 0
    ? `\n\nTilgjengelig data for denne adressen:\n${lines.join("\n")}`
    : "";

  return `Eiendomsanalytiker. Skriv 3 korte setninger på norsk bokmål om "${address}" for en boligkjøper: prisnivå, prisutvikling, og kollektivdekning. Bruk tallene. Ingen anbefalinger.${dataBlock}`;
}

function streamText(text: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${text}\n\n`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}

function buildFallbackSummary(address: string, ctx: ContextData): string {
  const parts: string[] = [];
  if (ctx.sqmPrice) {
    parts.push(`Gjennomsnittlig kvadratmeterpris i kommunen er ${ctx.sqmPrice.toLocaleString("nb-NO")} kr/m²${ctx.priceLabel ? ` (${ctx.priceLabel})` : ""}.`);
  }
  if (ctx.yoyChange != null) {
    parts.push(`Prisene har endret seg ${ctx.yoyChange > 0 ? "+" : ""}${ctx.yoyChange.toFixed(1)}% siste år.`);
  }
  if (ctx.transitMinutes != null && ctx.transitMinutes > 0 && ctx.transitDestination) {
    parts.push(`Kollektivtransport til ${ctx.transitDestination} tar ${ctx.transitMinutes} minutter.`);
  } else if (ctx.transitMinutes === null || ctx.transitMinutes === 0) {
    parts.push("Adressen ligger i sentrum av byen.");
  }
  if (parts.length === 0) {
    return `${address} er en norsk adresse. Se rapporten nedenfor for transport- og prisdata.`;
  }
  return parts.join(" ");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { address, contextData = {} } = body as { address: string; contextData?: ContextData };

  if (!address) return new Response("Bad request", { status: 400 });

  const ctx: ContextData = contextData;
  const prompt = buildPrompt(address, ctx);
  const apiKey = process.env.OPENROUTER_API_KEY;

  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey && !apiKey) {
    return streamText(buildFallbackSummary(address, ctx));
  }

  // Primary: OpenAI gpt-4o-mini (cheap, fast, reliable)
  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 160,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = (data.choices?.[0]?.message?.content ?? "").trim();
        if (text) return streamText(text);
      }
    } catch { /* fall through */ }
  }

  // Fallback: OpenRouter haiku
  if (apiKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://verdikart.no",
          "X-Title": "Verdikart",
        },
        body: JSON.stringify({
          model: "anthropic/claude-haiku-4-5",
          stream: false,
          max_tokens: 160,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = (data.choices?.[0]?.message?.content ?? "").trim();
        if (text) return streamText(text);
      }
    } catch { /* fall through */ }
  }

  return streamText(buildFallbackSummary(address, ctx));
}
