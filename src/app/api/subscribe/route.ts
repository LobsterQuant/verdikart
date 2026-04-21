import { NextRequest, NextResponse } from "next/server";
import { subscribePostSchema } from "@/lib/validators/subscribe";
import { parseOrBadRequest } from "@/lib/validators/parse";

// POST /api/subscribe — captures email + optional address
// Forwards to Formspree for persistent storage (same account used for contact forms)
// Set FORMSPREE_SUBSCRIBE_ID env var in Vercel dashboard to activate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, error } = parseOrBadRequest(subscribePostSchema, body);
    if (error) return error;

    const { email, address } = data;

    const formspreeId = process.env.FORMSPREE_SUBSCRIBE_ID;

    if (formspreeId) {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          address: address ?? "ukjent",
          _subject: `Ny prisvarsling: ${address ?? email}`,
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        return NextResponse.json({ error: "Upstream failed" }, { status: 502 });
      }
    } else {
      console.error("[subscribe] FORMSPREE_SUBSCRIBE_ID env var is not configured");
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
