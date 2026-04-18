import { describe, it, expect, vi } from "vitest";

// isRateLimited inspects process.env.KV_REST_API_URL at module-load time, so
// ensure KV is disabled in the test process → we exercise the in-memory path.
delete process.env.KV_REST_API_URL;

// Prevent the @vercel/kv import from throwing at module-load if credentials missing
vi.mock("@vercel/kv", () => ({ kv: { incr: vi.fn(), expire: vi.fn() } }));

import { isRateLimited } from "@/lib/rate-limit";

describe("isRateLimited (memory fallback)", () => {
  it("allows the first request for a new IP", async () => {
    const ip = `test-ip-${Date.now()}-1`;
    expect(await isRateLimited(ip, 5)).toBe(false);
  });

  it("allows up to the configured limit", async () => {
    const ip = `test-ip-${Date.now()}-2`;
    const limit = 3;

    for (let i = 0; i < limit; i++) {
      expect(await isRateLimited(ip, limit)).toBe(false);
    }
    // Next request should be rate-limited
    expect(await isRateLimited(ip, limit)).toBe(true);
  });

  it("isolates counts by IP", async () => {
    const ipA = `test-ip-${Date.now()}-A`;
    const ipB = `test-ip-${Date.now()}-B`;

    await isRateLimited(ipA, 1);
    await isRateLimited(ipA, 1);
    // ipA now exceeded, ipB still fresh
    expect(await isRateLimited(ipA, 1)).toBe(true);
    expect(await isRateLimited(ipB, 1)).toBe(false);
  });
});
