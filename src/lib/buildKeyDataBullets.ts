import type { PropertyReportSummary } from "@/lib/propertyReportSummary";

/**
 * Turns the server-aggregated PropertyReportSummary into 3–5 short bullets
 * for the always-visible top of the address summary card. Pure function so
 * it can be called from a server component without any fetching.
 *
 * Selection is opinionated: price, transit and crime are the load-bearing
 * signals for a buyer. Climate risk and high noise are surfaced only when
 * they are actually notable ("Høy", "Kvikkleire", >=65 dB). Schools fill
 * in if a slot is still free. Sections marked "Ingen data" are dropped.
 */

const UKJENT = "Ingen data";

function bulletPris(sqm: string, trend: string): string | null {
  const hasSqm = sqm !== UKJENT && sqm !== "Ikke relevant for næringsbygg";
  const hasTrend = trend !== UKJENT;

  // "~6.2 MNOK · 97 979 kr/m²"  or  "97 979 kr/m² i området"
  const sqmMatch = hasSqm ? sqm.match(/([\d\s]+)\s*kr\/m²/) : null;
  const sqmText = sqmMatch ? `${sqmMatch[1].trim()} kr/m²` : null;

  // "+3.2% siste år · Oslo kommune"
  const yoyMatch = hasTrend ? trend.match(/^([+-]?\d+(?:[.,]\d+)?)\s*%/) : null;
  const yoyPct = yoyMatch ? yoyMatch[1].replace(".", ",") : null;

  if (sqmText && yoyPct) return `Kvadratmeterpris ${sqmText} (${yoyPct} % siste år)`;
  if (sqmText) return `Kvadratmeterpris ${sqmText} i området`;
  if (yoyPct) return `Prisutvikling ${yoyPct} % siste år`;
  return null;
}

function bulletKollektiv(s: string): string | null {
  if (s === UKJENT) return null;
  // "34 min til Oslo S · via Nationaltheatret"
  const trip = s.match(/^(\d+)\s*min til (.+?)(?:\s*·|$)/);
  if (trip) return `${trip[1]} min til ${trip[2].trim()} med kollektiv`;
  // "Nationaltheatret · 180 m"
  const stop = s.match(/^(.+?)\s*·\s*(\d+)\s*m/);
  if (stop) return `Nærmeste holdeplass ${stop[1].trim()} (${stop[2]} m)`;
  return null;
}

function bulletKriminalitet(s: string): string | null {
  if (s === UKJENT) return null;
  // "Bydel Gamle Oslo · 28.1 per 1 000 · 15% over Oslo-snittet"
  //                                     ^^^^^^^^^^^^^^^^^^^^^^
  // "15% under snittet"
  const rel = s.split("·").map((p) => p.trim()).find((p) => /snittet/.test(p));
  if (rel) return `Kriminalitet ${rel.replace(/(\d)%/, "$1 %")}`;
  return null;
}

function bulletKlimarisiko(s: string): string | null {
  if (s === UKJENT) return null;
  // Only surface when actually notable — low flood risk on its own is noise.
  const parts: string[] = [];
  if (/Flom:\s*Høy/i.test(s)) parts.push("høy flomrisiko");
  if (/Kvikkleire/i.test(s)) parts.push("kvikkleiresone");
  if (parts.length === 0) return null;
  const body = parts.join(" og ");
  return `Området er registrert med ${body}`;
}

function bulletStoy(s: string): string | null {
  if (s === UKJENT || /ingen\s+støy/i.test(s)) return null;
  // "Vei 68 dB"
  const m = s.match(/^(\S+)\s+(\d+)\s*dB/);
  if (!m) return null;
  const db = parseInt(m[2], 10);
  if (db < 65) return null;
  const kindMap: Record<string, string> = { Vei: "veistøy", Fly: "flystøy", Bane: "togstøy" };
  const kind = kindMap[m[1]] ?? "støy";
  return `Forhøyet ${kind} målt til ${db} dB`;
}

function bulletSkoler(s: string): string | null {
  if (s === UKJENT) return null;
  // "Kampen skole · 412 m"
  const m = s.match(/^(.+?)\s*·\s*(\d+)\s*m/);
  if (!m) return null;
  return `Nærmeste skole ${m[1].trim()} (${m[2]} m unna)`;
}

export function getKeyDataBullets(summary: PropertyReportSummary): string[] {
  const bullets: (string | null)[] = [];

  // Core (always try, in this order)
  bullets.push(bulletPris(summary.verdiestimat, summary.prisstatistikk));
  bullets.push(bulletKollektiv(summary.kollektiv));
  bullets.push(bulletKriminalitet(summary.kriminalitet));

  // Notable-only (never included unless signal is strong)
  bullets.push(bulletKlimarisiko(summary.klimarisiko));
  bullets.push(bulletStoy(summary.stoy));

  // Filler to reach 3–5 bullets
  const filled = bullets.filter((b): b is string => !!b);
  if (filled.length < 5) {
    const skole = bulletSkoler(summary.skoler);
    if (skole) filled.push(skole);
  }

  return filled.slice(0, 5);
}
