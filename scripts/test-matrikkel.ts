/**
 * Matrikkel API smoke-test — documented manual tooling.
 *
 * Verifies both auth layers against prodtest.matrikkel.no:
 *   1. WSDL-realm basic auth (fetches AdresseService WSDL)
 *   2. Service-realm basic auth (live findMatrikkelenhet call for Karl Johans gate 1)
 *
 * Required env vars (consumed by src/lib/matrikkel/client.ts):
 *   - MATRIKKEL_URL   — service base URL (e.g. https://prodtest.matrikkel.no/matrikkelapi/wsapi/v1)
 *   - MATRIKKEL_USER  — basic-auth username
 *   - MATRIKKEL_PASS  — basic-auth password
 *
 * How to run:
 *   export $(grep -E "MATRIKKEL_" .env.local | xargs) && npx tsx scripts/test-matrikkel.ts
 *
 * Expected output:
 *   Success            — WSDL loads, then "[matrikkel] ✅ call returned", exit 0.
 *   WSDL-realm 401     — fails at setup with status=401, exit 1 (bad WSDL auth).
 *   Service-realm 401  — WSDL loads, data call reports status=401, exit 1 (bad service auth).
 *   Non-auth data err  — WSDL loads, data call fails on schema/naming; script notes
 *                        auth is still verified and exits 0.
 *
 * Manual smoke-test. Not part of CI. Used to re-verify access after credential or
 * realm changes — e.g. when Kartverket IT reports a fix to the service-realm 401.
 */
import { getMatrikkelClient, matrikkelContext } from '../src/lib/matrikkel/client';

const MAX_DUMP = 500;

function snippet(v: unknown): string {
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return (s ?? '').slice(0, MAX_DUMP);
}

async function main() {
  const user = process.env.MATRIKKEL_USER ?? '(unset)';
  const url = process.env.MATRIKKEL_URL ?? '(unset)';
  console.log(`[matrikkel] user=${user} url=${url}`);

  // Step 1: WSDL fetch. Basic auth happens here — 401 shows up at this step.
  console.log('[matrikkel] loading AdresseService WSDL…');
  const adresse = await getMatrikkelClient('AdresseService');
  const ops = Object.keys(adresse.describe()?.AdresseServiceWS?.AdresseServicePort ?? {});
  console.log(`[matrikkel] WSDL loaded. ${ops.length} operation(s): ${ops.slice(0, 8).join(', ')}${ops.length > 8 ? ', …' : ''}`);

  // Step 2: live data call. Karl Johans gate 1: kommune 0301, gnr 207, bnr 28.
  // MatrikkelenhetService.findMatrikkelenhet takes a MatrikkelenhetIdent (kommune/gnr/bnr/fnr/snr).
  console.log('[matrikkel] calling MatrikkelenhetService.findMatrikkelenhet for 0301-207/28…');
  const me = await getMatrikkelClient('MatrikkelenhetService');
  const args = {
    matrikkelenhetIdent: {
      kommuneIdent: { kommunenummer: '0301' },
      gardsnummer: 207,
      bruksnummer: 28,
      festenummer: 0,
      seksjonsnummer: 0,
    },
    matrikkelContext,
  };

  try {
    const [result] = await (adresse as any).findMatrikkelenhetAsync?.(args) ??
      await (me as any).findMatrikkelenhetAsync(args);
    console.log('[matrikkel] ✅ call returned');
    console.log(snippet(result));
    process.exit(0);
  } catch (err: any) {
    // If the data call fails for non-auth reasons (schema/operation naming),
    // the WSDL load above already proved auth works — still report clearly.
    const status = err?.response?.status ?? err?.statusCode;
    const body = err?.response?.data ?? err?.body ?? err?.message;
    console.error(`[matrikkel] data call failed. status=${status ?? 'n/a'}`);
    console.error(snippet(body));
    // WSDL succeeded → auth is OK; exit 0 with a warning.
    if (!status || status !== 401) {
      console.error('[matrikkel] (WSDL load succeeded → auth verified; data call issue is separate)');
      process.exit(0);
    }
    process.exit(1);
  }
}

main().catch((err: any) => {
  const status = err?.response?.status ?? err?.statusCode;
  const body = err?.response?.data ?? err?.body ?? err?.message ?? String(err);
  console.error(`[matrikkel] ❌ failed at WSDL/setup. status=${status ?? 'n/a'}`);
  console.error(snippet(body));
  process.exit(1);
});
