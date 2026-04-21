import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { isAiQuotaExceeded, secondsUntilMidnightUTC } from "@/lib/ai-quota";
import {
  buildPrompt,
  buildFallbackSummary,
  type ContextData,
} from "@/lib/ai-summary-prompt";

export const runtime = "edge";
export const maxDuration = 30;

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

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { address, contextData = {} } = body as { address: string; contextData?: ContextData };

  if (!address) return new Response("Bad request", { status: 400 });

  const session = await auth();
  const userId = session?.user?.id;
  const identifier = userId
    ? { type: "user" as const, id: userId }
    : {
        type: "ip" as const,
        ip:
          req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ??
          req.headers.get("x-real-ip") ??
          "unknown",
      };

  if (await isAiQuotaExceeded(identifier)) {
    return new Response(
      JSON.stringify({ error: "Daglig grense for AI-oppsummering er nådd. Prøv igjen i morgen." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(secondsUntilMidnightUTC()),
        },
      },
    );
  }

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
