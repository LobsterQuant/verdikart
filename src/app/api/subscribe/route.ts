import { NextRequest, NextResponse } from "next/server";

// POST /api/subscribe — captures email + optional address
// Forwards to Formspree for persistent storage (same account used for contact forms)
// Set FORMSPREE_SUBSCRIBE_ID env var in Vercel dashboard to activate
export async function POST(request: NextRequest) {
  try {
    const { email, address } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

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
      // No Formspree ID configured — log for now, still return 200 to user
      console.log(`[subscribe] email=${email} address=${address ?? "—"}`);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
